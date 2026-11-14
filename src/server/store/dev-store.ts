import { randomUUID } from 'node:crypto';

import { conflictError } from '@/server/errors';

import { createInitialDevStoreState, type DevStoreState } from './seed-data';
import type {
  AdminOrderQueryFilter,
  ChatMessageRecord,
  ChatSessionRecord,
  DataStore,
  DownloadGrantRecord,
  EventRecord,
  ExperimentAssignmentRecord,
  ExperimentRecord,
  OrderItemRecord,
  OrderRecord,
  ProductFileRecord,
  ProductQueryFilter,
  ProductRecord,
  ScenarioRecord,
  ScenarioRunRecord,
  UserRecord,
} from './types';

const globalForDevStore = globalThis as typeof globalThis & {
  __DSA_DEV_STORE__?: DevStoreState;
};

function getDevState(): DevStoreState {
  if (!globalForDevStore.__DSA_DEV_STORE__) {
    globalForDevStore.__DSA_DEV_STORE__ = createInitialDevStoreState();
  }
  return globalForDevStore.__DSA_DEV_STORE__;
}

function nowIso(): string {
  return new Date().toISOString();
}

export class InMemoryDevStore implements DataStore {
  readonly mode = 'dev_memory' as const;

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const normalized = email.trim().toLowerCase();
    return (
      getDevState().users.find(
        (u) => u.email.toLowerCase() === normalized && u.deleted_at === null
      ) ?? null
    );
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    return (
      getDevState().users.find((u) => u.id === id && u.deleted_at === null) ??
      null
    );
  }

  async createUser(input: {
    id?: string;
    email: string;
    password_hash?: string;
    full_name: string | null;
    role?: 'customer' | 'admin';
    shop_category?: string | null;
    is_simulated?: boolean;
  }): Promise<UserRecord> {
    const state = getDevState();
    const normalized = input.email.trim().toLowerCase();
    const exists = state.users.some(
      (u) => u.email.toLowerCase() === normalized && u.deleted_at === null
    );
    if (exists) {
      throw conflictError('Email này đã được đăng ký.', 'EMAIL_ALREADY_EXISTS');
    }

    const now = nowIso();
    const record: UserRecord = {
      id: input.id ?? randomUUID(),
      email: normalized,
      password_hash: input.password_hash,
      full_name: input.full_name,
      role: input.role ?? 'customer',
      shop_category: input.shop_category ?? null,
      is_simulated: input.is_simulated ?? false,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    };
    state.users.push(record);
    return record;
  }

  async listProducts(
    filter: ProductQueryFilter
  ): Promise<{ items: ProductRecord[]; total: number }> {
    const state = getDevState();
    let list = state.products.filter((p) => {
      if (p.deleted_at !== null) return false;
      if (!filter.includeInactive && !p.is_active) return false;
      if (filter.product_type && p.product_type !== filter.product_type) {
        return false;
      }
      if (filter.industry) {
        const needle = filter.industry.trim().toLowerCase();
        if (!p.industry.toLowerCase().includes(needle)) return false;
      }
      if (
        typeof filter.min_price === 'number' &&
        p.price_vnd < filter.min_price
      ) {
        return false;
      }
      if (
        typeof filter.max_price === 'number' &&
        p.price_vnd > filter.max_price
      ) {
        return false;
      }
      if (filter.q) {
        const q = filter.q.trim().toLowerCase();
        const haystack =
          `${p.name} ${p.short_description} ${p.industry} ${p.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (filter.sort === 'price_asc') return a.price_vnd - b.price_vnd;
      if (filter.sort === 'price_desc') return b.price_vnd - a.price_vnd;
      return b.created_at.localeCompare(a.created_at);
    });

    const total = list.length;
    const offset = (filter.page - 1) * filter.limit;
    const items = list.slice(offset, offset + filter.limit);
    return { items, total };
  }

  async findProductByIdOrSlug(
    idOrSlug: string,
    includeInactive = false
  ): Promise<ProductRecord | null> {
    return (
      getDevState().products.find((p) => {
        if (p.deleted_at !== null) return false;
        if (!includeInactive && !p.is_active) return false;
        return p.id === idOrSlug || p.slug === idOrSlug;
      }) ?? null
    );
  }

  async findProductsByIds(
    ids: string[],
    includeInactive = false
  ): Promise<ProductRecord[]> {
    const set = new Set(ids);
    return getDevState().products.filter(
      (p) =>
        p.deleted_at === null &&
        (includeInactive || p.is_active) &&
        set.has(p.id)
    );
  }

  async listAllActiveProducts(): Promise<ProductRecord[]> {
    return getDevState().products.filter(
      (p) => p.deleted_at === null && p.is_active
    );
  }

  async createProduct(input: {
    slug: string;
    name: string;
    short_description: string;
    description: string;
    product_type: ProductRecord['product_type'];
    industry: string;
    price_vnd: number;
    demo_url: string | null;
    thumbnail_url: string | null;
    source_type: ProductRecord['source_type'];
    license_note: string;
    specs: ProductRecord['specs'];
    is_active: boolean;
    is_simulated: boolean;
  }): Promise<ProductRecord> {
    const state = getDevState();
    const dup = state.products.some(
      (p) => p.slug === input.slug && p.deleted_at === null
    );
    if (dup) {
      throw conflictError('Slug sản phẩm đã tồn tại.');
    }
    const now = nowIso();
    const record: ProductRecord = {
      id: randomUUID(),
      ...input,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    };
    state.products.push(record);
    state.productFiles.push({
      id: randomUUID(),
      product_id: record.id,
      file_name: `${record.slug}-v1.0.0.json`,
      storage_bucket: 'product-deliverables',
      storage_path: `deliverables/${record.slug}/bundle-v1.0.0.json`,
      file_size_bytes: 16384,
      mime_type: 'application/json',
      version: '1.0.0',
      is_primary: true,
      created_at: now,
    });
    return record;
  }

  async updateProduct(
    id: string,
    patch: Partial<
      Omit<ProductRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
    >
  ): Promise<ProductRecord | null> {
    const state = getDevState();
    const idx = state.products.findIndex(
      (p) => p.id === id && p.deleted_at === null
    );
    if (idx === -1) return null;

    if (patch.slug) {
      const dup = state.products.some(
        (p) => p.id !== id && p.slug === patch.slug && p.deleted_at === null
      );
      if (dup) {
        throw conflictError('Slug sản phẩm đã tồn tại.');
      }
    }

    const updated: ProductRecord = {
      ...state.products[idx],
      ...patch,
      updated_at: nowIso(),
    };
    state.products[idx] = updated;
    return updated;
  }

  async findPrimaryProductFile(
    productId: string
  ): Promise<ProductFileRecord | null> {
    const files = getDevState().productFiles.filter(
      (f) => f.product_id === productId
    );
    return files.find((f) => f.is_primary) ?? files[0] ?? null;
  }

  async findProductFilesByProductIds(
    productIds: string[]
  ): Promise<Map<string, ProductFileRecord>> {
    const map = new Map<string, ProductFileRecord>();
    const set = new Set(productIds);
    for (const file of getDevState().productFiles) {
      if (!set.has(file.product_id)) continue;
      if (!map.has(file.product_id) || file.is_primary) {
        map.set(file.product_id, file);
      }
    }
    return map;
  }

  async createOrderWithItems(input: {
    order_code: string;
    user_id: string | null;
    assignment_id: string | null;
    visitor_id: string | null;
    payment_provider: OrderRecord['payment_provider'];
    total_vnd: number;
    is_simulated: boolean;
    items: Array<{
      product_id: string;
      product_name_snapshot: string;
      unit_price_vnd: number;
      quantity: number;
      line_total_vnd: number;
    }>;
  }): Promise<{ order: OrderRecord; items: OrderItemRecord[] }> {
    const state = getDevState();
    const now = nowIso();
    const order: OrderRecord = {
      id: randomUUID(),
      order_code: input.order_code,
      user_id: input.user_id,
      assignment_id: input.assignment_id,
      visitor_id: input.visitor_id,
      status: 'pending',
      payment_provider: input.payment_provider,
      payment_reference: null,
      total_vnd: input.total_vnd,
      paid_at: null,
      is_simulated: input.is_simulated,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    };
    state.orders.push(order);

    const items: OrderItemRecord[] = input.items.map((item) => ({
      id: randomUUID(),
      order_id: order.id,
      product_id: item.product_id,
      product_name_snapshot: item.product_name_snapshot,
      unit_price_vnd: item.unit_price_vnd,
      quantity: item.quantity,
      line_total_vnd: item.line_total_vnd,
      created_at: now,
    }));
    state.orderItems.push(...items);

    return { order, items };
  }

  private hydrateOrder(order: OrderRecord) {
    const state = getDevState();
    const items = state.orderItems.filter((i) => i.order_id === order.id);
    const download_grants = state.downloadGrants.filter(
      (g) => g.order_id === order.id && g.revoked_at === null
    );
    return { order, items, download_grants };
  }

  async findOrderById(id: string) {
    const order = getDevState().orders.find(
      (o) => o.id === id && o.deleted_at === null
    );
    if (!order) return null;
    return this.hydrateOrder(order);
  }

  async listOrdersByOwner(owner: {
    user_id?: string | null;
    assignment_id?: string | null;
    order_ids?: string[];
  }) {
    const orderIdSet = new Set(owner.order_ids ?? []);
    const list = getDevState()
      .orders.filter((o) => {
        if (o.deleted_at !== null) return false;
        if (owner.user_id && o.user_id === owner.user_id) return true;
        if (owner.assignment_id && o.assignment_id === owner.assignment_id)
          return true;
        if (orderIdSet.has(o.id)) return true;
        return false;
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return list.map((o) => this.hydrateOrder(o));
  }

  async listAdminOrders(filter: AdminOrderQueryFilter) {
    const list = getDevState()
      .orders.filter((o) => {
        if (o.deleted_at !== null) return false;
        if (!filter.include_simulated && o.is_simulated) return false;
        if (filter.status && o.status !== filter.status) return false;
        return true;
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at));

    const total = list.length;
    const offset = (filter.page - 1) * filter.limit;
    const items = list
      .slice(offset, offset + filter.limit)
      .map((o) => this.hydrateOrder(o));
    return { items, total };
  }

  async transitionPendingOrderPaymentStatus(input: {
    order_id: string;
    status: 'paid' | 'failed';
    payment_reference: string;
    paid_at: string | null;
  }): Promise<OrderRecord | null> {
    const state = getDevState();
    const idx = state.orders.findIndex((o) => o.id === input.order_id);
    if (idx === -1) {
      throw new Error('Order not found');
    }
    if (state.orders[idx].status !== 'pending') {
      return null;
    }
    const updated: OrderRecord = {
      ...state.orders[idx],
      status: input.status,
      payment_reference: input.payment_reference,
      paid_at: input.paid_at,
      updated_at: nowIso(),
    };
    state.orders[idx] = updated;
    return updated;
  }

  async createDownloadGrants(
    grants: Array<{
      order_id: string;
      product_id: string;
      product_file_id: string;
      user_id: string | null;
      token: string;
      max_downloads: number;
      expires_at: string;
    }>
  ): Promise<DownloadGrantRecord[]> {
    const state = getDevState();
    const now = nowIso();
    const created: DownloadGrantRecord[] = grants.map((g) => ({
      id: randomUUID(),
      order_id: g.order_id,
      product_id: g.product_id,
      product_file_id: g.product_file_id,
      user_id: g.user_id,
      token: g.token,
      max_downloads: g.max_downloads,
      download_count: 0,
      expires_at: g.expires_at,
      last_downloaded_at: null,
      revoked_at: null,
      created_at: now,
    }));
    state.downloadGrants.push(...created);
    return created;
  }

  async findDownloadGrantByToken(token: string) {
    const state = getDevState();
    const grant = state.downloadGrants.find(
      (g) => g.token === token && g.revoked_at === null
    );
    if (!grant) return null;
    const order = state.orders.find(
      (o) => o.id === grant.order_id && o.deleted_at === null
    );
    const product = state.products.find((p) => p.id === grant.product_id);
    const file = state.productFiles.find((f) => f.id === grant.product_file_id);
    if (!order || !product || !file) return null;
    return { grant, order, product, file };
  }

  async incrementDownloadGrantCount(
    grantId: string
  ): Promise<DownloadGrantRecord | null> {
    const state = getDevState();
    const idx = state.downloadGrants.findIndex((g) => g.id === grantId);
    if (idx === -1) return null;
    const current = state.downloadGrants[idx];
    if (current.download_count >= current.max_downloads) {
      return null;
    }
    const updated: DownloadGrantRecord = {
      ...current,
      download_count: current.download_count + 1,
      last_downloaded_at: nowIso(),
    };
    state.downloadGrants[idx] = updated;
    return updated;
  }

  async findActiveExperimentByCode(
    code: string
  ): Promise<ExperimentRecord | null> {
    return (
      getDevState().experiments.find((e) => e.code === code && e.is_active) ??
      null
    );
  }

  async findAssignmentById(
    id: string
  ): Promise<ExperimentAssignmentRecord | null> {
    return getDevState().assignments.find((a) => a.id === id) ?? null;
  }

  async findAssignmentByExperimentAndVisitor(
    experimentId: string,
    visitorId: string
  ): Promise<ExperimentAssignmentRecord | null> {
    return (
      getDevState().assignments.find(
        (a) => a.experiment_id === experimentId && a.visitor_id === visitorId
      ) ?? null
    );
  }

  async countAssignmentsByExperiment(experimentId: string): Promise<number> {
    return getDevState().assignments.filter(
      (a) => a.experiment_id === experimentId
    ).length;
  }

  async createAssignment(input: {
    experiment_id: string;
    user_id: string | null;
    visitor_id: string;
    participant_code: string;
    session_token_hash: string;
    variant: ExperimentAssignmentRecord['variant'];
    consent_given: boolean;
    consent_at: string;
    shop_profile: ExperimentAssignmentRecord['shop_profile'];
    is_simulated: boolean;
  }): Promise<ExperimentAssignmentRecord> {
    const now = nowIso();
    const record: ExperimentAssignmentRecord = {
      id: randomUUID(),
      experiment_id: input.experiment_id,
      user_id: input.user_id,
      visitor_id: input.visitor_id,
      participant_code: input.participant_code,
      session_token_hash: input.session_token_hash,
      variant: input.variant,
      consent_given: input.consent_given,
      consent_at: input.consent_at,
      shop_profile: input.shop_profile,
      is_simulated: input.is_simulated,
      created_at: now,
      updated_at: now,
    };
    getDevState().assignments.push(record);
    return record;
  }

  async listActiveScenarios(): Promise<ScenarioRecord[]> {
    return getDevState()
      .scenarios.filter((s) => s.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  async findScenarioById(id: string): Promise<ScenarioRecord | null> {
    return (
      getDevState().scenarios.find((s) => s.id === id && s.is_active) ?? null
    );
  }

  async listScenarioRunsByAssignment(
    assignmentId: string
  ): Promise<ScenarioRunRecord[]> {
    return getDevState()
      .scenarioRuns.filter((r) => r.assignment_id === assignmentId)
      .sort((a, b) => a.step_order - b.step_order);
  }

  async findScenarioRunById(id: string): Promise<ScenarioRunRecord | null> {
    return getDevState().scenarioRuns.find((r) => r.id === id) ?? null;
  }

  async createScenarioRun(input: {
    assignment_id: string;
    scenario_id: string;
    step_order: number;
    active_variant: ScenarioRunRecord['active_variant'];
    is_simulated: boolean;
  }): Promise<ScenarioRunRecord> {
    const now = nowIso();
    const record: ScenarioRunRecord = {
      id: randomUUID(),
      assignment_id: input.assignment_id,
      scenario_id: input.scenario_id,
      step_order: input.step_order,
      active_variant: input.active_variant,
      selected_product_id: null,
      confidence_score: null,
      is_correct: null,
      decision_note: null,
      started_at: now,
      completed_at: null,
      is_simulated: input.is_simulated,
      created_at: now,
    };
    getDevState().scenarioRuns.push(record);
    return record;
  }

  async completeScenarioRun(input: {
    run_id: string;
    selected_product_id: string;
    confidence_score: 1 | 2 | 3 | 4 | 5;
    is_correct: boolean;
    decision_note: string | null;
    completed_at: string;
  }): Promise<ScenarioRunRecord> {
    const state = getDevState();
    const idx = state.scenarioRuns.findIndex((r) => r.id === input.run_id);
    if (idx === -1) {
      throw new Error('ScenarioRun not found');
    }
    const updated: ScenarioRunRecord = {
      ...state.scenarioRuns[idx],
      selected_product_id: input.selected_product_id,
      confidence_score: input.confidence_score,
      is_correct: input.is_correct,
      decision_note: input.decision_note,
      completed_at: input.completed_at,
    };
    state.scenarioRuns[idx] = updated;
    return updated;
  }

  async findChatSessionById(id: string): Promise<ChatSessionRecord | null> {
    return (
      getDevState().chatSessions.find(
        (s) => s.id === id && s.deleted_at === null
      ) ?? null
    );
  }

  async listChatSessionsByAssignment(
    assignmentId: string,
    scenarioRunId?: string
  ): Promise<
    Array<{ session: ChatSessionRecord; messages: ChatMessageRecord[] }>
  > {
    const state = getDevState();
    const sessions = state.chatSessions
      .filter((s) => {
        if (s.deleted_at !== null || s.assignment_id !== assignmentId) {
          return false;
        }
        if (scenarioRunId && s.scenario_run_id !== scenarioRunId) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));

    return sessions.map((session) => ({
      session,
      messages: state.chatMessages
        .filter((m) => m.session_id === session.id && m.deleted_at === null)
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    }));
  }

  async createChatSession(input: {
    assignment_id: string;
    scenario_run_id: string | null;
    user_id: string | null;
    visitor_id: string;
    title: string | null;
    is_simulated: boolean;
  }): Promise<ChatSessionRecord> {
    const now = nowIso();
    const record: ChatSessionRecord = {
      id: randomUUID(),
      assignment_id: input.assignment_id,
      scenario_run_id: input.scenario_run_id,
      user_id: input.user_id,
      visitor_id: input.visitor_id,
      title: input.title,
      is_simulated: input.is_simulated,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    };
    getDevState().chatSessions.push(record);
    return record;
  }

  async createChatMessage(input: {
    session_id: string;
    role: ChatMessageRecord['role'];
    content: string;
    prompt_version: string | null;
    model_name: string | null;
    retrieved_product_ids: string[];
    suggested_product_ids: string[];
    latency_ms: number | null;
    tokens_used: number | null;
    cost_usd: number | null;
    is_simulated: boolean;
  }): Promise<ChatMessageRecord> {
    const state = getDevState();
    const now = nowIso();
    const record: ChatMessageRecord = {
      id: randomUUID(),
      session_id: input.session_id,
      role: input.role,
      content: input.content,
      prompt_version: input.prompt_version,
      model_name: input.model_name,
      retrieved_product_ids: input.retrieved_product_ids,
      suggested_product_ids: input.suggested_product_ids,
      latency_ms: input.latency_ms,
      tokens_used: input.tokens_used,
      cost_usd: input.cost_usd,
      is_simulated: input.is_simulated,
      deleted_at: null,
      created_at: now,
    };
    state.chatMessages.push(record);
    const sIdx = state.chatSessions.findIndex((s) => s.id === input.session_id);
    if (sIdx !== -1) {
      state.chatSessions[sIdx] = {
        ...state.chatSessions[sIdx],
        updated_at: now,
      };
    }
    return record;
  }

  async createEvent(input: {
    assignment_id: string;
    visitor_id: string;
    variant: EventRecord['variant'];
    event_name: EventRecord['event_name'];
    scenario_run_id: string | null;
    session_id: string | null;
    product_id: string | null;
    properties: Record<string, unknown>;
    is_simulated: boolean;
    created_at: string;
  }): Promise<EventRecord> {
    const record: EventRecord = {
      id: randomUUID(),
      ...input,
    };
    getDevState().events.push(record);
    return record;
  }

  async getDashboardRawData(includeSimulated: boolean) {
    const state = getDevState();
    const filterSim = <T extends { is_simulated: boolean }>(rows: T[]) =>
      includeSimulated ? rows : rows.filter((r) => !r.is_simulated);

    return {
      assignments: filterSim(state.assignments),
      scenarioRuns: filterSim(state.scenarioRuns),
      orders: filterSim(state.orders).filter((o) => o.deleted_at === null),
      assistantMessages: filterSim(state.chatMessages).filter(
        (m) => m.role === 'assistant' && m.deleted_at === null
      ),
      events: filterSim(state.events),
    };
  }
}
