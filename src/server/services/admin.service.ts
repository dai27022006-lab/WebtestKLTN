import type { z } from 'zod';

import type { EventVariant } from '@/lib/tracking/events';
import type { adminOrderQuerySchema } from '@/schemas/order';
import type {
  adminCreateProductSchema,
  adminUpdateProductSchema,
  productListQuerySchema,
} from '@/schemas/product';
import { notFoundError } from '@/server/errors';
import { getStore } from '@/server/store';
import type {
  AdminDashboardSummaryDto,
  OrderDto,
  PaginationMeta,
  ProductDetailDto,
  VariantPerformanceSummary,
} from '@/types/api';

import { toOrderDto } from './order.service';
import { toProductDetailDto } from './product.service';

type ProductListQueryParsed = z.infer<typeof productListQuerySchema>;
type AdminCreateProductParsed = z.infer<typeof adminCreateProductSchema>;
type AdminUpdateProductParsed = z.infer<typeof adminUpdateProductSchema>;
type AdminOrderQueryParsed = z.infer<typeof adminOrderQuerySchema>;

export async function adminListProducts(
  query: ProductListQueryParsed
): Promise<{ items: ProductDetailDto[]; meta: PaginationMeta }> {
  const store = getStore();
  const { items, total } = await store.listProducts({
    q: query.q,
    industry: query.industry,
    product_type: query.product_type,
    min_price: query.min_price,
    max_price: query.max_price,
    sort: query.sort,
    page: query.page,
    limit: query.limit,
    includeInactive: true,
  });

  const fileMap = await store.findProductFilesByProductIds(
    items.map((p) => p.id)
  );

  return {
    items: items.map((p) => toProductDetailDto(p, fileMap.has(p.id))),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function adminCreateProduct(
  input: AdminCreateProductParsed
): Promise<ProductDetailDto> {
  const store = getStore();
  const created = await store.createProduct({
    slug: input.slug,
    name: input.name,
    short_description: input.short_description,
    description: input.description,
    product_type: input.product_type,
    industry: input.industry,
    price_vnd: input.price_vnd,
    demo_url: input.demo_url ?? null,
    thumbnail_url: input.thumbnail_url ?? null,
    source_type: input.source_type,
    license_note: input.license_note,
    specs: input.specs ?? {},
    is_active: input.is_active,
    is_simulated: input.is_simulated,
  });

  const file = await store.findPrimaryProductFile(created.id);
  return toProductDetailDto(created, Boolean(file));
}

export async function adminUpdateProduct(
  id: string,
  input: AdminUpdateProductParsed
): Promise<ProductDetailDto> {
  const store = getStore();
  const patch: Record<string, unknown> = {};

  if (input.slug !== undefined) patch.slug = input.slug;
  if (input.name !== undefined) patch.name = input.name;
  if (input.short_description !== undefined)
    patch.short_description = input.short_description;
  if (input.description !== undefined) patch.description = input.description;
  if (input.product_type !== undefined) patch.product_type = input.product_type;
  if (input.industry !== undefined) patch.industry = input.industry;
  if (input.price_vnd !== undefined) patch.price_vnd = input.price_vnd;
  if (input.demo_url !== undefined) patch.demo_url = input.demo_url;
  if (input.thumbnail_url !== undefined)
    patch.thumbnail_url = input.thumbnail_url;
  if (input.source_type !== undefined) patch.source_type = input.source_type;
  if (input.license_note !== undefined) patch.license_note = input.license_note;
  if (input.specs !== undefined) patch.specs = input.specs;
  if (input.is_active !== undefined) patch.is_active = input.is_active;
  if (input.is_simulated !== undefined) patch.is_simulated = input.is_simulated;

  const updated = await store.updateProduct(id, patch);
  if (!updated) {
    throw notFoundError('Không tìm thấy sản phẩm.', 'PRODUCT_NOT_FOUND');
  }

  const file = await store.findPrimaryProductFile(updated.id);
  return toProductDetailDto(updated, Boolean(file));
}

export async function adminListOrders(
  query: AdminOrderQueryParsed
): Promise<{ items: OrderDto[]; meta: PaginationMeta }> {
  const store = getStore();
  const { items, total } = await store.listAdminOrders({
    status: query.status,
    include_simulated: query.include_simulated,
    page: query.page,
    limit: query.limit,
  });

  return {
    items: items.map(toOrderDto),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export async function getAdminDashboardSummary(
  includeSimulated: boolean
): Promise<AdminDashboardSummaryDto> {
  const store = getStore();
  const raw = await store.getDashboardRawData(includeSimulated);

  const completedRuns = raw.scenarioRuns.filter((r) => r.completed_at !== null);
  const purchaseEvents = raw.events.filter((e) => e.event_name === 'purchase');

  const variants: VariantPerformanceSummary[] = (
    ['chatbot_on', 'chatbot_off'] as EventVariant[]
  ).map((variant) => {
    const runs = completedRuns.filter((r) => r.active_variant === variant);
    const correctRuns = runs.filter((r) => r.is_correct === true).length;

    const durations = runs.map((r) => {
      const start = new Date(r.started_at).getTime();
      const end = new Date(r.completed_at!).getTime();
      return Math.max(0, (end - start) / 1000);
    });
    const avgDuration =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;

    const confidences = runs
      .map((r) => r.confidence_score)
      .filter((c): c is 1 | 2 | 3 | 4 | 5 => typeof c === 'number');
    const avgConfidence =
      confidences.length > 0
        ? confidences.reduce((a, b) => a + b, 0) / confidences.length
        : 0;

    const sandboxPurchaseCount = purchaseEvents.filter(
      (e) => e.variant === variant
    ).length;

    return {
      variant,
      completed_runs: runs.length,
      correct_runs: correctRuns,
      accuracy_rate:
        runs.length > 0 ? roundTo(correctRuns / runs.length, 4) : 0,
      avg_duration_seconds: roundTo(avgDuration, 2),
      avg_confidence_score: roundTo(avgConfidence, 2),
      sandbox_purchase_count: sandboxPurchaseCount,
    };
  });

  const latencies = raw.assistantMessages
    .map((m) => m.latency_ms)
    .filter((v): v is number => typeof v === 'number' && v >= 0)
    .sort((a, b) => a - b);

  const avgLatency =
    latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;
  const p95Index =
    latencies.length > 0
      ? Math.min(latencies.length - 1, Math.ceil(latencies.length * 0.95) - 1)
      : 0;
  const p95Latency = latencies.length > 0 ? latencies[p95Index] : 0;

  const totalTokens = raw.assistantMessages.reduce(
    (sum, m) => sum + (m.tokens_used ?? 0),
    0
  );
  const totalCost = raw.assistantMessages.reduce(
    (sum, m) => sum + (m.cost_usd ?? 0),
    0
  );

  const paidOrders = raw.orders.filter((o) => o.status === 'paid');
  const totalSandboxValue = paidOrders.reduce(
    (sum, o) => sum + o.total_vnd,
    0
  );

  return {
    include_simulated: includeSimulated,
    total_participants: raw.assignments.length,
    consented_participants: raw.assignments.filter((a) => a.consent_given)
      .length,
    total_completed_runs: completedRuns.length,
    variants,
    rag_metrics: {
      total_assistant_messages: raw.assistantMessages.length,
      avg_latency_ms: roundTo(avgLatency, 2),
      p95_latency_ms: roundTo(p95Latency, 2),
      total_tokens_used: totalTokens,
      total_cost_usd: roundTo(totalCost, 6),
      avg_cost_per_message_usd:
        raw.assistantMessages.length > 0
          ? roundTo(totalCost / raw.assistantMessages.length, 6)
          : 0,
    },
    orders_summary: {
      total_orders: raw.orders.length,
      paid_orders: paidOrders.length,
      total_sandbox_value_vnd: totalSandboxValue,
    },
  };
}
