import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { z } from 'zod';

import { getWebhookSigningSecret } from '@/lib/db/env';
import type {
  createOrderSchema,
  mockPaymentWebhookSchema,
  sandboxPaySchema,
} from '@/schemas/order';
import {
  CART_COOKIE_NAME,
  clearCookie,
  GUEST_ORDERS_COOKIE_NAME,
  type GuestOrdersCookiePayload,
  readSignedCookie,
  writeSignedCookie,
} from '@/server/auth/cookies';
import {
  getCurrentUser,
  getExperimentCookieSession,
  getGuestOrdersCookieSession,
} from '@/server/auth/session';
import {
  conflictError,
  forbiddenError,
  notFoundError,
  validationError,
} from '@/server/errors';
import {
  type DownloadGrantRecord,
  getStore,
  type OrderItemRecord,
  type OrderRecord,
  type UserRecord,
} from '@/server/store';
import type {
  CreateOrderResponse,
  DownloadGrantDto,
  OrderDto,
  OrderItemDto,
  PaymentWebhookResponse,
} from '@/types/api';

type CreateOrderParsed = z.infer<typeof createOrderSchema>;
type MockWebhookParsed = z.infer<typeof mockPaymentWebhookSchema>;
type SandboxPayParsed = z.infer<typeof sandboxPaySchema>;

export function toOrderItemDto(item: OrderItemRecord): OrderItemDto {
  return {
    id: item.id,
    product_id: item.product_id,
    product_name_snapshot: item.product_name_snapshot,
    unit_price_vnd: item.unit_price_vnd,
    quantity: item.quantity,
    line_total_vnd: item.line_total_vnd,
  };
}

export function toDownloadGrantDto(grant: DownloadGrantRecord): DownloadGrantDto {
  return {
    id: grant.id,
    order_id: grant.order_id,
    product_id: grant.product_id,
    token: grant.token,
    download_url: `/api/downloads/${grant.token}`,
    max_downloads: grant.max_downloads,
    download_count: grant.download_count,
    expires_at: grant.expires_at,
  };
}

export function toOrderDto(params: {
  order: OrderRecord;
  items: OrderItemRecord[];
  download_grants?: DownloadGrantRecord[];
}): OrderDto {
  const grants =
    params.order.status === 'paid' && params.download_grants
      ? params.download_grants.map(toDownloadGrantDto)
      : undefined;

  return {
    id: params.order.id,
    order_code: params.order.order_code,
    user_id: params.order.user_id,
    assignment_id: params.order.assignment_id,
    status: params.order.status,
    payment_provider: params.order.payment_provider,
    payment_reference: params.order.payment_reference,
    total_vnd: params.order.total_vnd,
    paid_at: params.order.paid_at,
    is_simulated: params.order.is_simulated,
    items: params.items.map(toOrderItemDto),
    ...(grants ? { download_grants: grants } : {}),
    created_at: params.order.created_at,
  };
}

function generateOrderCode(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randPart = randomBytes(2).toString('hex').toUpperCase();
  return `ORD-${datePart}-${randPart}`;
}

export function signWebhookPayload(payload: {
  order_id: string;
  order_code: string;
  payment_provider: string;
  payment_reference: string;
  status: string;
  amount_vnd: number;
  timestamp: string;
}): string {
  const canonical = [
    payload.order_id,
    payload.order_code,
    payload.payment_provider,
    payload.payment_reference,
    payload.status,
    String(payload.amount_vnd),
    payload.timestamp,
  ].join(':');

  return createHmac('sha256', getWebhookSigningSecret())
    .update(canonical)
    .digest('hex');
}

export function verifyWebhookSignature(input: MockWebhookParsed): boolean {
  const expected = signWebhookPayload({
    order_id: input.order_id,
    order_code: input.order_code,
    payment_provider: input.payment_provider,
    payment_reference: input.payment_reference,
    status: input.status,
    amount_vnd: input.amount_vnd,
    timestamp: input.timestamp,
  });

  const a = Buffer.from(input.signature.trim().toLowerCase(), 'utf8');
  const b = Buffer.from(expected.toLowerCase(), 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createOrder(
  input: CreateOrderParsed
): Promise<CreateOrderResponse> {
  const store = getStore();
  const [user, expSession] = await Promise.all([
    getCurrentUser(),
    getExperimentCookieSession(),
  ]);

  if (
    input.assignment_id &&
    expSession &&
    expSession.assignment_id !== input.assignment_id
  ) {
    throw forbiddenError('Phiên thí nghiệm không khớp với cookie hiện tại.');
  }

  const assignmentId = input.assignment_id ?? expSession?.assignment_id ?? null;
  let assignmentSimulated = false;
  if (assignmentId) {
    const assignment = await store.findAssignmentById(assignmentId);
    if (!assignment) {
      throw notFoundError(
        'Không tìm thấy phiên thí nghiệm liên kết.',
        'ASSIGNMENT_NOT_FOUND'
      );
    }
    assignmentSimulated = assignment.is_simulated;
  }

  // Merge duplicate product_id entries deterministically
  const mergedItems = new Map<string, number>();
  for (const item of input.items) {
    const prev = mergedItems.get(item.product_id) ?? 0;
    mergedItems.set(item.product_id, Math.min(prev + item.quantity, 10));
  }

  const productIds = Array.from(mergedItems.keys());
  const products = await store.findProductsByIds(productIds, false);
  const productMap = new Map(products.map((p) => [p.id, p]));

  const orderItemsInput: Array<{
    product_id: string;
    product_name_snapshot: string;
    unit_price_vnd: number;
    quantity: number;
    line_total_vnd: number;
  }> = [];

  let totalVnd = 0;
  for (const [productId, quantity] of mergedItems.entries()) {
    const product = productMap.get(productId);
    if (!product) {
      throw notFoundError(
        'Một hoặc nhiều sản phẩm trong đơn hàng không còn tồn tại.',
        'PRODUCT_NOT_FOUND'
      );
    }
    const lineTotal = product.price_vnd * quantity;
    totalVnd += lineTotal;
    orderItemsInput.push({
      product_id: product.id,
      product_name_snapshot: product.name,
      unit_price_vnd: product.price_vnd,
      quantity,
      line_total_vnd: lineTotal,
    });
  }

  const visitorId = expSession?.visitor_id ?? input.visitor_id ?? null;
  const { order, items } = await store.createOrderWithItems({
    order_code: generateOrderCode(),
    user_id: user?.id ?? null,
    assignment_id: assignmentId,
    visitor_id: visitorId,
    payment_provider: input.payment_provider,
    total_vnd: totalVnd,
    is_simulated: input.is_simulated || assignmentSimulated,
    items: orderItemsInput,
  });

  const existingGuestCookie =
    await readSignedCookie<GuestOrdersCookiePayload>(GUEST_ORDERS_COOKIE_NAME);
  const nextGuestOrderIds = Array.from(
    new Set([...(existingGuestCookie?.order_ids ?? []), order.id])
  ).slice(-20);
  await writeSignedCookie<GuestOrdersCookiePayload>(
    GUEST_ORDERS_COOKIE_NAME,
    { order_ids: nextGuestOrderIds },
    60 * 60 * 24 * 14
  );

  return {
    order: toOrderDto({ order, items }),
    payment_intent: {
      provider: order.payment_provider,
      checkout_mode: 'mock_sandbox',
      order_id: order.id,
      order_code: order.order_code,
      amount_vnd: order.total_vnd,
      webhook_path: '/api/payments/webhook',
    },
  };
}

function assertOrderOwnership(
  order: OrderRecord,
  actor: {
    user: UserRecord | null;
    exp_assignment_id: string | null;
    guest_order_ids: string[];
  }
): void {
  if (actor.user?.role === 'admin') return;
  if (actor.user && order.user_id === actor.user.id) return;
  if (actor.exp_assignment_id && order.assignment_id === actor.exp_assignment_id)
    return;
  if (actor.guest_order_ids.includes(order.id)) return;

  throw forbiddenError('Bạn không có quyền xem hoặc thao tác trên đơn hàng này.');
}

export async function listOrdersForActor(): Promise<OrderDto[]> {
  const store = getStore();
  const [user, expSession, guestOrders] = await Promise.all([
    getCurrentUser(),
    getExperimentCookieSession(),
    getGuestOrdersCookieSession(),
  ]);

  const owner = {
    user_id: user?.id ?? null,
    assignment_id: expSession?.assignment_id ?? null,
    order_ids: guestOrders?.order_ids ?? [],
  };

  if (
    !owner.user_id &&
    !owner.assignment_id &&
    owner.order_ids.length === 0
  ) {
    return [];
  }

  const rows = await store.listOrdersByOwner(owner);
  return rows.map(toOrderDto);
}

export async function getOrderByIdForActor(orderId: string): Promise<OrderDto> {
  const store = getStore();
  const hydrated = await store.findOrderById(orderId);
  if (!hydrated) {
    throw notFoundError('Không tìm thấy đơn hàng.', 'ORDER_NOT_FOUND');
  }

  const [user, expSession, guestOrders] = await Promise.all([
    getCurrentUser(),
    getExperimentCookieSession(),
    getGuestOrdersCookieSession(),
  ]);

  assertOrderOwnership(hydrated.order, {
    user,
    exp_assignment_id: expSession?.assignment_id ?? null,
    guest_order_ids: guestOrders?.order_ids ?? [],
  });

  return toOrderDto(hydrated);
}

export async function processPaymentWebhook(
  input: MockWebhookParsed
): Promise<PaymentWebhookResponse> {
  if (!verifyWebhookSignature(input)) {
    throw forbiddenError(
      'Chữ ký webhook thanh toán không hợp lệ.',
      'INVALID_WEBHOOK_SIGNATURE'
    );
  }

  const store = getStore();
  const hydrated = await store.findOrderById(input.order_id);
  if (!hydrated) {
    throw notFoundError('Không tìm thấy đơn hàng.', 'ORDER_NOT_FOUND');
  }

  const { order, items, download_grants } = hydrated;
  if (order.order_code !== input.order_code) {
    throw validationError('Mã đơn hàng không khớp với hệ thống.');
  }

  if (order.total_vnd !== input.amount_vnd) {
    throw conflictError(
      'Số tiền thanh toán không khớp với tổng giá trị đơn hàng.',
      'ORDER_AMOUNT_MISMATCH'
    );
  }

  if (order.status === 'paid') {
    if (
      input.status === 'paid' &&
      order.payment_reference === input.payment_reference
    ) {
      return {
        order_id: order.id,
        order_code: order.order_code,
        status: order.status,
        paid_at: order.paid_at,
        download_grants: download_grants.map(toDownloadGrantDto),
      };
    }
    throw conflictError(
      'Đơn hàng đã được thanh toán trước đó.',
      'ORDER_ALREADY_PAID'
    );
  }

  if (order.status !== 'pending') {
    if (
      input.status === 'failed' &&
      order.status === 'failed' &&
      order.payment_reference === input.payment_reference
    ) {
      return {
        order_id: order.id,
        order_code: order.order_code,
        status: order.status,
        paid_at: null,
        download_grants: [],
      };
    }
    throw conflictError(
      'Đơn hàng không còn ở trạng thái chờ thanh toán.',
      'CONFLICT'
    );
  }

  if (input.status === 'failed') {
    const failedOrder = await store.transitionPendingOrderPaymentStatus({
      order_id: order.id,
      status: 'failed',
      payment_reference: input.payment_reference,
      paid_at: null,
    });
    if (!failedOrder) {
      const latest = await store.findOrderById(order.id);
      if (latest?.order.status === 'paid') {
        throw conflictError(
          'Đơn hàng đã được thanh toán trước đó.',
          'ORDER_ALREADY_PAID'
        );
      }
      return {
        order_id: latest?.order.id ?? order.id,
        order_code: latest?.order.order_code ?? order.order_code,
        status: latest?.order.status ?? order.status,
        paid_at: latest?.order.paid_at ?? null,
        download_grants: [],
      };
    }

    return {
      order_id: failedOrder.id,
      order_code: failedOrder.order_code,
      status: failedOrder.status,
      paid_at: null,
      download_grants: [],
    };
  }

  const paidAt = new Date().toISOString();
  const updatedOrder = await store.transitionPendingOrderPaymentStatus({
    order_id: order.id,
    status: 'paid',
    payment_reference: input.payment_reference,
    paid_at: paidAt,
  });

  if (!updatedOrder) {
    const latest = await store.findOrderById(order.id);
    if (
      latest?.order.status === 'paid' &&
      latest.order.payment_reference === input.payment_reference
    ) {
      return {
        order_id: latest.order.id,
        order_code: latest.order.order_code,
        status: latest.order.status,
        paid_at: latest.order.paid_at,
        download_grants: latest.download_grants.map(toDownloadGrantDto),
      };
    }
    throw conflictError(
      'Đơn hàng đã được thanh toán trước đó.',
      'ORDER_ALREADY_PAID'
    );
  }

  const productIds = items.map((i) => i.product_id);
  const fileMap = await store.findProductFilesByProductIds(productIds);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const grantsToCreate: Array<{
    order_id: string;
    product_id: string;
    product_file_id: string;
    user_id: string | null;
    token: string;
    max_downloads: number;
    expires_at: string;
  }> = [];

  for (const item of items) {
    const file = fileMap.get(item.product_id);
    if (!file) continue;
    grantsToCreate.push({
      order_id: order.id,
      product_id: item.product_id,
      product_file_id: file.id,
      user_id: order.user_id,
      token: `dl_${randomBytes(16).toString('hex')}`,
      max_downloads: 5,
      expires_at: expiresAt,
    });
  }

  const createdGrants = await store.createDownloadGrants(grantsToCreate);

  return {
    order_id: updatedOrder.id,
    order_code: updatedOrder.order_code,
    status: updatedOrder.status,
    paid_at: updatedOrder.paid_at,
    download_grants: createdGrants.map(toDownloadGrantDto),
  };
}

export async function sandboxPayOrder(
  orderId: string,
  input: SandboxPayParsed
): Promise<PaymentWebhookResponse> {
  const store = getStore();
  const hydrated = await store.findOrderById(orderId);
  if (!hydrated) {
    throw notFoundError('Không tìm thấy đơn hàng.', 'ORDER_NOT_FOUND');
  }

  const [user, expSession, guestOrders] = await Promise.all([
    getCurrentUser(),
    getExperimentCookieSession(),
    getGuestOrdersCookieSession(),
  ]);

  assertOrderOwnership(hydrated.order, {
    user,
    exp_assignment_id: expSession?.assignment_id ?? null,
    guest_order_ids: guestOrders?.order_ids ?? [],
  });

  const timestamp = new Date().toISOString();
  const paymentReference = `MOCK-TX-${randomBytes(4).toString('hex').toUpperCase()}`;
  const signature = signWebhookPayload({
    order_id: hydrated.order.id,
    order_code: hydrated.order.order_code,
    payment_provider: hydrated.order.payment_provider,
    payment_reference: paymentReference,
    status: input.outcome,
    amount_vnd: hydrated.order.total_vnd,
    timestamp,
  });

  const result = await processPaymentWebhook({
    order_id: hydrated.order.id,
    order_code: hydrated.order.order_code,
    payment_provider: hydrated.order.payment_provider,
    payment_reference: paymentReference,
    status: input.outcome,
    amount_vnd: hydrated.order.total_vnd,
    signature,
    timestamp,
  });

  if (input.outcome === 'paid') {
    await clearCookie(CART_COOKIE_NAME);
  }

  return result;
}
