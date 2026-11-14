import type { z } from 'zod';

import { runChatbotStub } from '@/lib/ai/chatbot-stub';
import type { EventVariant } from '@/lib/tracking/events';
import type {
  chatSessionsQuerySchema,
  sendChatMessageSchema,
} from '@/schemas/chat';
import {
  getCurrentUser,
  getExperimentCookieSession,
} from '@/server/auth/session';
import {
  forbiddenError,
  notFoundError,
  unprocessableError,
} from '@/server/errors';
import {
  type ChatMessageRecord,
  getStore,
  type ProductRecord,
} from '@/server/store';
import type {
  ChatMessageDto,
  ChatSessionsResponse,
  ChatSessionWithMessagesDto,
  SendChatMessageResponse,
  SuggestedProductCardDto,
} from '@/types/api';

import { resolveActiveVariantForStep } from './experiment.service';

type SendChatParsed = z.infer<typeof sendChatMessageSchema>;
type ChatSessionsQueryParsed = z.infer<typeof chatSessionsQuerySchema>;

function toSuggestedProductCard(
  product: ProductRecord,
  reason = ''
): SuggestedProductCardDto {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    product_type: product.product_type,
    industry: product.industry,
    price_vnd: product.price_vnd,
    thumbnail_url: product.thumbnail_url,
    reason: reason || product.short_description,
  };
}

function toChatMessageDto(
  record: ChatMessageRecord,
  productMap: Map<string, ProductRecord>,
  reasonMap?: Map<string, string>
): ChatMessageDto {
  const suggestedProducts: SuggestedProductCardDto[] = [];
  for (const productId of record.suggested_product_ids) {
    const product = productMap.get(productId);
    if (!product || !product.is_active || product.deleted_at !== null) {
      continue;
    }
    suggestedProducts.push(
      toSuggestedProductCard(product, reasonMap?.get(productId))
    );
  }

  return {
    id: record.id,
    session_id: record.session_id,
    role: record.role,
    content: record.content,
    prompt_version: record.prompt_version,
    model_name: record.model_name,
    retrieved_product_ids: record.retrieved_product_ids,
    suggested_product_ids: suggestedProducts.map((p) => p.id),
    suggested_products: suggestedProducts,
    latency_ms: record.latency_ms,
    tokens_used: record.tokens_used,
    cost_usd: record.cost_usd,
    created_at: record.created_at,
  };
}

async function resolveCurrentVariant(params: {
  assignmentId: string;
  assignmentVariant:
    | 'chatbot_on'
    | 'chatbot_off'
    | 'abba_on_first'
    | 'abba_off_first';
  scenarioRunId?: string;
}): Promise<EventVariant> {
  const store = getStore();
  if (params.scenarioRunId) {
    const run = await store.findScenarioRunById(params.scenarioRunId);
    if (!run || run.assignment_id !== params.assignmentId) {
      throw notFoundError(
        'Không tìm thấy lượt kịch bản tương ứng.',
        'NOT_FOUND'
      );
    }
    return run.active_variant;
  }

  const runs = await store.listScenarioRunsByAssignment(params.assignmentId);
  const openRun = runs.find((r) => r.completed_at === null);
  if (openRun) {
    return openRun.active_variant;
  }

  const nextStep = runs.filter((r) => r.completed_at !== null).length + 1;
  return resolveActiveVariantForStep(params.assignmentVariant, nextStep);
}

export async function sendChatMessage(
  input: SendChatParsed
): Promise<SendChatMessageResponse> {
  const store = getStore();
  const assignment = await store.findAssignmentById(input.assignment_id);
  if (!assignment) {
    throw notFoundError(
      'Không tìm thấy phiên thí nghiệm.',
      'ASSIGNMENT_NOT_FOUND'
    );
  }

  if (assignment.visitor_id !== input.visitor_id) {
    throw forbiddenError('Thông tin visitor_id không khớp với phiên thí nghiệm.');
  }

  const expCookie = await getExperimentCookieSession();
  if (
    expCookie &&
    (expCookie.assignment_id !== assignment.id ||
      expCookie.visitor_id !== assignment.visitor_id)
  ) {
    throw forbiddenError('Phiên thí nghiệm không khớp với cookie hiện tại.');
  }

  if (!assignment.consent_given) {
    throw unprocessableError(
      'Bạn cần đồng ý điều khoản thí nghiệm trước khi sử dụng trợ lý ảo.',
      'CONSENT_REQUIRED'
    );
  }

  const activeVariant = await resolveCurrentVariant({
    assignmentId: assignment.id,
    assignmentVariant: assignment.variant,
    scenarioRunId: input.scenario_run_id,
  });

  if (activeVariant !== 'chatbot_on') {
    throw forbiddenError(
      'Trợ lý ảo không khả dụng trong lượt nhiệm vụ hiện tại (chatbot_off).',
      'CHATBOT_DISABLED_FOR_VARIANT'
    );
  }

  const user = await getCurrentUser();

  let session = input.session_id
    ? await store.findChatSessionById(input.session_id)
    : null;
  if (input.session_id && !session) {
    throw notFoundError('Không tìm thấy phiên hội thoại.', 'NOT_FOUND');
  }
  if (session && session.assignment_id !== assignment.id) {
    throw forbiddenError('Bạn không có quyền truy cập phiên hội thoại này.');
  }

  if (!session) {
    session = await store.createChatSession({
      assignment_id: assignment.id,
      scenario_run_id: input.scenario_run_id ?? null,
      user_id: user?.id ?? assignment.user_id,
      visitor_id: input.visitor_id,
      title: input.message.slice(0, 60),
      is_simulated: input.is_simulated || assignment.is_simulated,
    });
  }

  const isSim = input.is_simulated || assignment.is_simulated;

  const userMsgRecord = await store.createChatMessage({
    session_id: session.id,
    role: 'user',
    content: input.message,
    prompt_version: null,
    model_name: null,
    retrieved_product_ids: [],
    suggested_product_ids: [],
    latency_ms: null,
    tokens_used: null,
    cost_usd: null,
    is_simulated: isSim,
  });

  const activeCatalog = await store.listAllActiveProducts();
  const catalogMap = new Map(activeCatalog.map((p) => [p.id, p]));

  const stubResult = runChatbotStub({
    message: input.message,
    catalogProducts: activeCatalog,
    shopProfile: assignment.shop_profile,
  });

  // Strict Server-Side Grounding: verify every product ID exists & is active in DB
  const groundedReasonMap = new Map<string, string>();
  const groundedSuggestedIds: string[] = [];
  for (const suggestion of stubResult.suggested_products) {
    const product = catalogMap.get(suggestion.product_id);
    if (!product || !product.is_active || product.deleted_at !== null) {
      continue;
    }
    if (!groundedReasonMap.has(product.id)) {
      groundedReasonMap.set(product.id, suggestion.reason);
      groundedSuggestedIds.push(product.id);
    }
  }

  const groundedRetrievedIds = stubResult.retrieved_product_ids.filter((id) =>
    catalogMap.has(id)
  );

  const assistantMsgRecord = await store.createChatMessage({
    session_id: session.id,
    role: 'assistant',
    content: stubResult.reply,
    prompt_version: stubResult.prompt_version,
    model_name: stubResult.model_name,
    retrieved_product_ids: groundedRetrievedIds,
    suggested_product_ids: groundedSuggestedIds,
    latency_ms: stubResult.latency_ms,
    tokens_used: stubResult.tokens_used,
    cost_usd: stubResult.cost_usd,
    is_simulated: isSim,
  });

  return {
    session_id: session.id,
    user_message: toChatMessageDto(userMsgRecord, catalogMap),
    assistant_message: toChatMessageDto(
      assistantMsgRecord,
      catalogMap,
      groundedReasonMap
    ),
  };
}

export async function listChatSessions(
  query: ChatSessionsQueryParsed
): Promise<ChatSessionsResponse> {
  const store = getStore();
  const assignment = await store.findAssignmentById(query.assignment_id);
  if (!assignment) {
    throw notFoundError(
      'Không tìm thấy phiên thí nghiệm.',
      'ASSIGNMENT_NOT_FOUND'
    );
  }

  const [user, expCookie] = await Promise.all([
    getCurrentUser(),
    getExperimentCookieSession(),
  ]);

  if (query.visitor_id && assignment.visitor_id !== query.visitor_id) {
    throw forbiddenError('Bạn không có quyền xem lịch sử hội thoại này.');
  }

  const isAdmin = user?.role === 'admin';
  const isOwnerUser = Boolean(
    user && assignment.user_id && assignment.user_id === user.id
  );
  const isOwnerCookie = Boolean(
    expCookie &&
      expCookie.assignment_id === assignment.id &&
      expCookie.visitor_id === assignment.visitor_id
  );

  if (!isAdmin && !isOwnerUser && !isOwnerCookie) {
    throw forbiddenError('Bạn không có quyền xem lịch sử hội thoại này.');
  }

  const [sessionsWithMessages, activeCatalog] = await Promise.all([
    store.listChatSessionsByAssignment(
      assignment.id,
      query.scenario_run_id
    ),
    store.listAllActiveProducts(),
  ]);

  const catalogMap = new Map(activeCatalog.map((p) => [p.id, p]));

  const sessions: ChatSessionWithMessagesDto[] = sessionsWithMessages.map(
    ({ session, messages }) => ({
      id: session.id,
      assignment_id: session.assignment_id,
      scenario_run_id: session.scenario_run_id,
      visitor_id: session.visitor_id,
      title: session.title,
      is_simulated: session.is_simulated,
      created_at: session.created_at,
      updated_at: session.updated_at,
      messages: messages.map((m) => toChatMessageDto(m, catalogMap)),
    })
  );

  return { sessions };
}
