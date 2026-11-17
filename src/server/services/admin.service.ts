import type { z } from 'zod';

import type { EventVariant } from '@/lib/tracking/events';
import type { adminChatLogsQuerySchema } from '@/schemas/chat';
import type { adminExportQuerySchema } from '@/schemas/experiment';
import type { adminOrderQuerySchema } from '@/schemas/order';
import type {
  adminCreateProductSchema,
  adminUpdateProductSchema,
  productListQuerySchema,
} from '@/schemas/product';
import { notFoundError } from '@/server/errors';
import { getStore, type ProductRecord } from '@/server/store';
import type {
  AdminChatLogItemDto,
  AdminDashboardSummaryDto,
  AdminExportDataset,
  AdminExportEventRow,
  AdminExportJsonResponse,
  AdminExportRagLogRow,
  AdminExportRow,
  AdminExportScenarioRunRow,
  OrderDto,
  PaginationMeta,
  ProductDetailDto,
  SuggestedProductCardDto,
  VariantPerformanceSummary,
} from '@/types/api';

import { toOrderDto } from './order.service';
import { toProductDetailDto } from './product.service';

type ProductListQueryParsed = z.infer<typeof productListQuerySchema>;
type AdminCreateProductParsed = z.infer<typeof adminCreateProductSchema>;
type AdminUpdateProductParsed = z.infer<typeof adminUpdateProductSchema>;
type AdminOrderQueryParsed = z.infer<typeof adminOrderQuerySchema>;
type AdminChatLogsQueryParsed = z.infer<typeof adminChatLogsQuerySchema>;
type AdminExportQueryParsed = z.infer<typeof adminExportQuerySchema>;

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

function toAdminSuggestedCard(product: ProductRecord): SuggestedProductCardDto {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    product_type: product.product_type,
    industry: product.industry,
    price_vnd: product.price_vnd,
    thumbnail_url: product.thumbnail_url,
    reason: product.short_description,
  };
}

export async function adminListChatLogs(
  query: AdminChatLogsQueryParsed
): Promise<AdminChatLogItemDto[]> {
  const store = getStore();
  const entries = await store.listAdminChatLogs({
    include_simulated: query.include_simulated,
    limit: query.limit,
  });

  const productIds = Array.from(
    new Set(
      entries.flatMap((entry) =>
        entry.messages.flatMap((msg) => msg.suggested_product_ids)
      )
    )
  );
  const products =
    productIds.length > 0 ? await store.findProductsByIds(productIds, true) : [];
  const productMap = new Map(products.map((p) => [p.id, p]));

  return entries.map((entry) => ({
    session_id: entry.session.id,
    participant_code: entry.participant_code,
    title: entry.session.title,
    created_at: entry.session.created_at,
    is_simulated: entry.session.is_simulated,
    messages: entry.messages.map((msg) => {
      const suggestedProducts: SuggestedProductCardDto[] = [];
      for (const productId of msg.suggested_product_ids) {
        const product = productMap.get(productId);
        if (!product || product.deleted_at !== null) continue;
        suggestedProducts.push(toAdminSuggestedCard(product));
      }

      return {
        id: msg.id,
        role: msg.role,
        content: msg.content,
        model_name: msg.model_name,
        suggested_products: suggestedProducts,
        latency_ms: msg.latency_ms,
        tokens_used: msg.tokens_used,
        cost_usd: msg.cost_usd,
        created_at: msg.created_at,
      };
    }),
  }));
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

const PII_PROPERTY_KEYS = new Set([
  'email',
  'full_name',
  'password',
  'password_hash',
  'phone',
  'token',
  'session_token',
  'session_token_hash',
]);

function sanitizePropertiesForExport(
  props: Record<string, unknown>
): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (PII_PROPERTY_KEYS.has(key.toLowerCase())) {
      continue;
    }
    clean[key] = value;
  }
  return clean;
}

const CSV_COLUMNS_BY_DATASET: Record<AdminExportDataset, string[]> = {
  scenario_runs: [
    'scenario_run_id',
    'assignment_id',
    'participant_code',
    'visitor_id',
    'assignment_variant',
    'scenario_id',
    'scenario_code',
    'step_order',
    'active_variant',
    'selected_product_id',
    'is_correct',
    'confidence_score',
    'duration_seconds',
    'started_at',
    'completed_at',
    'role_in_study',
    'shop_industry',
    'is_simulated',
  ],
  events: [
    'event_id',
    'assignment_id',
    'participant_code',
    'visitor_id',
    'variant',
    'event_name',
    'scenario_run_id',
    'session_id',
    'product_id',
    'properties_json',
    'is_simulated',
    'created_at',
  ],
  rag_logs: [
    'message_id',
    'session_id',
    'assignment_id',
    'participant_code',
    'visitor_id',
    'scenario_run_id',
    'prompt_version',
    'model_name',
    'retrieved_count',
    'suggested_count',
    'retrieved_product_ids',
    'suggested_product_ids',
    'latency_ms',
    'tokens_used',
    'cost_usd',
    'is_simulated',
    'created_at',
  ],
};

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  let str = typeof value === 'string' ? value : String(value);
  if (
    typeof value === 'string' &&
    /^[=+\-@\t\r]/.test(str) &&
    !/^-?\d+(?:\.\d+)?$/.test(str)
  ) {
    str = `'${str}`;
  }

  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function serializeRowsToCsv(
  dataset: AdminExportDataset,
  rows: AdminExportRow[]
): string {
  const columns = CSV_COLUMNS_BY_DATASET[dataset];
  const headerLine = columns.join(',');
  const dataLines = rows.map((row) => {
    const record = row as unknown as Record<string, unknown>;
    return columns.map((col) => escapeCsvCell(record[col])).join(',');
  });
  return `\uFEFF${[headerLine, ...dataLines].join('\r\n')}\r\n`;
}

export async function exportAdminDataset(
  query: AdminExportQueryParsed
): Promise<{
  jsonPayload: AdminExportJsonResponse;
  csvContent: string;
  filename: string;
}> {
  const store = getStore();
  const raw = await store.getExportRawData(query.include_simulated);

  const assignmentMap = new Map(raw.assignments.map((a) => [a.id, a]));
  const scenarioMap = new Map(raw.scenarios.map((s) => [s.id, s]));
  const sessionMap = new Map(raw.chatSessions.map((s) => [s.id, s]));

  let rows: AdminExportRow[] = [];

  if (query.dataset === 'scenario_runs') {
    const scenarioRows: AdminExportScenarioRunRow[] = raw.scenarioRuns.map(
      (run) => {
        const assignment = assignmentMap.get(run.assignment_id);
        const scenario = scenarioMap.get(run.scenario_id);
        const durationSeconds =
          run.completed_at !== null
            ? Math.max(
                0,
                roundTo(
                  (new Date(run.completed_at).getTime() -
                    new Date(run.started_at).getTime()) /
                    1000,
                  2
                )
              )
            : null;

        return {
          scenario_run_id: run.id,
          assignment_id: run.assignment_id,
          participant_code: assignment?.participant_code ?? '',
          visitor_id: assignment?.visitor_id ?? '',
          assignment_variant: assignment?.variant ?? run.active_variant,
          scenario_id: run.scenario_id,
          scenario_code: scenario?.code ?? '',
          step_order: run.step_order,
          active_variant: run.active_variant,
          selected_product_id: run.selected_product_id,
          is_correct: run.is_correct,
          confidence_score: run.confidence_score,
          duration_seconds: durationSeconds,
          started_at: run.started_at,
          completed_at: run.completed_at,
          role_in_study: assignment?.shop_profile?.role_in_study ?? '',
          shop_industry: assignment?.shop_profile?.industry ?? '',
          is_simulated: run.is_simulated,
        };
      }
    );
    rows = scenarioRows;
  } else if (query.dataset === 'events') {
    const eventRows: AdminExportEventRow[] = raw.events.map((evt) => {
      const assignment = assignmentMap.get(evt.assignment_id);
      const cleanProps = sanitizePropertiesForExport(evt.properties ?? {});
      return {
        event_id: evt.id,
        assignment_id: evt.assignment_id,
        participant_code: assignment?.participant_code ?? '',
        visitor_id: evt.visitor_id,
        variant: evt.variant,
        event_name: evt.event_name,
        scenario_run_id: evt.scenario_run_id,
        session_id: evt.session_id,
        product_id: evt.product_id,
        properties_json: JSON.stringify(cleanProps),
        is_simulated: evt.is_simulated,
        created_at: evt.created_at,
      };
    });
    rows = eventRows;
  } else {
    const ragRows: AdminExportRagLogRow[] = raw.assistantMessages.map((msg) => {
      const session = sessionMap.get(msg.session_id);
      const assignment = session
        ? assignmentMap.get(session.assignment_id)
        : undefined;
      return {
        message_id: msg.id,
        session_id: msg.session_id,
        assignment_id: session?.assignment_id ?? '',
        participant_code: assignment?.participant_code ?? '',
        visitor_id: session?.visitor_id ?? '',
        scenario_run_id: session?.scenario_run_id ?? null,
        prompt_version: msg.prompt_version ?? '',
        model_name: msg.model_name ?? '',
        retrieved_count: msg.retrieved_product_ids.length,
        suggested_count: msg.suggested_product_ids.length,
        retrieved_product_ids: JSON.stringify(msg.retrieved_product_ids),
        suggested_product_ids: JSON.stringify(msg.suggested_product_ids),
        latency_ms: msg.latency_ms,
        tokens_used: msg.tokens_used,
        cost_usd: msg.cost_usd,
        is_simulated: msg.is_simulated,
        created_at: msg.created_at,
      };
    });
    rows = ragRows;
  }

  const exportedAt = new Date().toISOString();
  const dateTag = exportedAt.slice(0, 10);
  const simSuffix = query.include_simulated ? 'with-sim' : 'real-only';
  const filename = `dsa-${query.dataset}-${simSuffix}-${dateTag}.csv`;

  return {
    jsonPayload: {
      dataset: query.dataset,
      include_simulated: query.include_simulated,
      exported_at: exportedAt,
      total_rows: rows.length,
      rows,
    },
    csvContent: serializeRowsToCsv(query.dataset, rows),
    filename,
  };
}
