import type { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseAdminClient } from '@/lib/db/supabase-admin';
import { AppError, conflictError } from '@/server/errors';

import type {
  AdminChatLogRawEntry,
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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

function escapeIlike(value: string): string {
  return value.replace(/[%_\\]/g, (ch) => `\\${ch}`);
}

function assertData<T>(
  result: { data: T | null; error: { code?: string; message: string } | null },
  context: string
): T {
  if (result.error) {
    if (result.error.code === '23505') {
      throw conflictError('Dữ liệu đã tồn tại trong hệ thống.');
    }
    throw new AppError(
      'INTERNAL_ERROR',
      `Lỗi truy vấn dữ liệu (${context}).`,
      500
    );
  }
  if (result.data === null) {
    throw new AppError(
      'INTERNAL_ERROR',
      `Không nhận được dữ liệu từ cơ sở dữ liệu (${context}).`,
      500
    );
  }
  return result.data;
}

export class SupabaseDataStore implements DataStore {
  readonly mode = 'supabase' as const;

  private get client(): SupabaseClient {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new AppError(
        'INTERNAL_ERROR',
        'Supabase admin client chưa được cấu hình.',
        500
      );
    }
    return admin;
  }

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .is('deleted_at', null)
      .maybeSingle();
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể đọc thông tin người dùng.', 500);
    }
    return data as UserRecord | null;
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể đọc thông tin người dùng.', 500);
    }
    return data as UserRecord | null;
  }

  async createUser(input: {
    id?: string;
    email: string;
    full_name: string | null;
    role?: 'customer' | 'admin';
    shop_category?: string | null;
    is_simulated?: boolean;
  }): Promise<UserRecord> {
    const res = await this.client
      .from('users')
      .insert({
        ...(input.id ? { id: input.id } : {}),
        email: input.email.trim().toLowerCase(),
        full_name: input.full_name,
        role: input.role ?? 'customer',
        shop_category: input.shop_category ?? null,
        is_simulated: input.is_simulated ?? false,
      })
      .select('*')
      .single();
    return assertData(res, 'createUser') as UserRecord;
  }

  async listProducts(
    filter: ProductQueryFilter
  ): Promise<{ items: ProductRecord[]; total: number }> {
    let query = this.client
      .from('products')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (!filter.includeInactive) {
      query = query.eq('is_active', true);
    }
    if (filter.product_type) {
      query = query.eq('product_type', filter.product_type);
    }
    if (filter.industry) {
      query = query.ilike('industry', `%${escapeIlike(filter.industry.trim())}%`);
    }
    if (typeof filter.min_price === 'number') {
      query = query.gte('price_vnd', filter.min_price);
    }
    if (typeof filter.max_price === 'number') {
      query = query.lte('price_vnd', filter.max_price);
    }
    if (filter.q) {
      const needle = `%${escapeIlike(filter.q.trim())}%`;
      query = query.or(
        `name.ilike.${needle},short_description.ilike.${needle},industry.ilike.${needle}`
      );
    }

    if (filter.sort === 'price_asc') {
      query = query.order('price_vnd', { ascending: true });
    } else if (filter.sort === 'price_desc') {
      query = query.order('price_vnd', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const from = (filter.page - 1) * filter.limit;
    const to = from + filter.limit - 1;
    const { data, count, error } = await query.range(from, to);
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể tải danh sách sản phẩm.', 500);
    }

    return {
      items: (data ?? []) as ProductRecord[],
      total: count ?? 0,
    };
  }

  async findProductByIdOrSlug(
    idOrSlug: string,
    includeInactive = false
  ): Promise<ProductRecord | null> {
    let query = this.client
      .from('products')
      .select('*')
      .is('deleted_at', null);

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    query = isUuid(idOrSlug)
      ? query.eq('id', idOrSlug)
      : query.eq('slug', idOrSlug);

    const { data, error } = await query.maybeSingle();
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể đọc chi tiết sản phẩm.', 500);
    }
    return data as ProductRecord | null;
  }

  async findProductsByIds(
    ids: string[],
    includeInactive = false
  ): Promise<ProductRecord[]> {
    if (ids.length === 0) return [];
    let query = this.client
      .from('products')
      .select('*')
      .in('id', ids)
      .is('deleted_at', null);
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query;
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể tải sản phẩm.', 500);
    }
    return (data ?? []) as ProductRecord[];
  }

  async listAllActiveProducts(): Promise<ProductRecord[]> {
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể tải danh mục sản phẩm.', 500);
    }
    return (data ?? []) as ProductRecord[];
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
    const res = await this.client
      .from('products')
      .insert(input)
      .select('*')
      .single();
    const created = assertData(res, 'createProduct') as ProductRecord;

    const fileRes = await this.client
      .from('product_files')
      .insert({
        product_id: created.id,
        file_name: `${created.slug}-v1.0.0.json`,
        storage_bucket: 'product-deliverables',
        storage_path: `deliverables/${created.slug}/bundle-v1.0.0.json`,
        file_size_bytes: 16384,
        mime_type: 'application/json',
        version: '1.0.0',
        is_primary: true,
      })
      .select('*')
      .single();

    if (fileRes.error || !fileRes.data) {
      await this.client
        .from('products')
        .delete()
        .eq('id', created.id)
        .then(() => undefined, () => undefined);
    }
    assertData(fileRes, 'createProductFile');

    return created;
  }

  async updateProduct(
    id: string,
    patch: Partial<
      Omit<ProductRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
    >
  ): Promise<ProductRecord | null> {
    const { data, error } = await this.client
      .from('products')
      .update(patch)
      .eq('id', id)
      .is('deleted_at', null)
      .select('*')
      .maybeSingle();
    if (error) {
      if (error.code === '23505') {
        throw conflictError('Slug sản phẩm đã tồn tại.');
      }
      throw new AppError('INTERNAL_ERROR', 'Không thể cập nhật sản phẩm.', 500);
    }
    return data as ProductRecord | null;
  }

  async findPrimaryProductFile(
    productId: string
  ): Promise<ProductFileRecord | null> {
    const { data, error } = await this.client
      .from('product_files')
      .select('*')
      .eq('product_id', productId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể đọc thông tin file sản phẩm.', 500);
    }
    return data as ProductFileRecord | null;
  }

  async findProductFilesByProductIds(
    productIds: string[]
  ): Promise<Map<string, ProductFileRecord>> {
    const map = new Map<string, ProductFileRecord>();
    if (productIds.length === 0) return map;
    const { data, error } = await this.client
      .from('product_files')
      .select('*')
      .in('product_id', productIds);
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể đọc danh sách file sản phẩm.', 500);
    }
    for (const file of (data ?? []) as ProductFileRecord[]) {
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
    const orderRes = await this.client
      .from('orders')
      .insert({
        order_code: input.order_code,
        user_id: input.user_id,
        assignment_id: input.assignment_id,
        visitor_id: input.visitor_id,
        status: 'pending',
        payment_provider: input.payment_provider,
        total_vnd: input.total_vnd,
        is_simulated: input.is_simulated,
      })
      .select('*')
      .single();
    const order = assertData(orderRes, 'createOrder') as OrderRecord;

    const itemRows = input.items.map((item) => ({
      order_id: order.id,
      ...item,
    }));
    const itemsRes = await this.client
      .from('order_items')
      .insert(itemRows)
      .select('*');
    if (itemsRes.error || !itemsRes.data) {
      await this.client
        .from('orders')
        .delete()
        .eq('id', order.id)
        .then(() => undefined, () => undefined);
    }
    const items = assertData(itemsRes, 'createOrderItems') as OrderItemRecord[];

    return { order, items };
  }

  private async hydrateOrders(orders: OrderRecord[]) {
    if (orders.length === 0) return [];
    const orderIds = orders.map((o) => o.id);

    const [itemsRes, grantsRes] = await Promise.all([
      this.client.from('order_items').select('*').in('order_id', orderIds),
      this.client
        .from('download_grants')
        .select('*')
        .in('order_id', orderIds)
        .is('revoked_at', null),
    ]);

    const allItems = (itemsRes.data ?? []) as OrderItemRecord[];
    const allGrants = (grantsRes.data ?? []) as DownloadGrantRecord[];

    return orders.map((order) => ({
      order,
      items: allItems.filter((i) => i.order_id === order.id),
      download_grants: allGrants.filter((g) => g.order_id === order.id),
    }));
  }

  async findOrderById(id: string) {
    const { data, error } = await this.client
      .from('orders')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể tải đơn hàng.', 500);
    }
    if (!data) return null;
    const hydrated = await this.hydrateOrders([data as OrderRecord]);
    return hydrated[0] ?? null;
  }

  async listOrdersByOwner(owner: {
    user_id?: string | null;
    assignment_id?: string | null;
    order_ids?: string[];
  }) {
    const filters: string[] = [];
    if (owner.user_id) filters.push(`user_id.eq.${owner.user_id}`);
    if (owner.assignment_id)
      filters.push(`assignment_id.eq.${owner.assignment_id}`);
    if (owner.order_ids && owner.order_ids.length > 0) {
      filters.push(`id.in.(${owner.order_ids.join(',')})`);
    }
    if (filters.length === 0) return [];

    const { data, error } = await this.client
      .from('orders')
      .select('*')
      .is('deleted_at', null)
      .or(filters.join(','))
      .order('created_at', { ascending: false });
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể tải danh sách đơn hàng.', 500);
    }
    return this.hydrateOrders((data ?? []) as OrderRecord[]);
  }

  async listAdminOrders(filter: AdminOrderQueryFilter) {
    let query = this.client
      .from('orders')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (!filter.include_simulated) {
      query = query.eq('is_simulated', false);
    }
    if (filter.status) {
      query = query.eq('status', filter.status);
    }

    const from = (filter.page - 1) * filter.limit;
    const to = from + filter.limit - 1;
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể tải đơn hàng quản trị.', 500);
    }

    const items = await this.hydrateOrders((data ?? []) as OrderRecord[]);
    return { items, total: count ?? 0 };
  }

  async transitionPendingOrderPaymentStatus(input: {
    order_id: string;
    status: 'paid' | 'failed';
    payment_reference: string;
    paid_at: string | null;
  }): Promise<OrderRecord | null> {
    const { data, error } = await this.client
      .from('orders')
      .update({
        status: input.status,
        payment_reference: input.payment_reference,
        paid_at: input.paid_at,
      })
      .eq('id', input.order_id)
      .eq('status', 'pending')
      .select('*')
      .maybeSingle();

    if (error) {
      throw new AppError(
        'INTERNAL_ERROR',
        'Không thể cập nhật trạng thái thanh toán đơn hàng.',
        500
      );
    }

    return data as OrderRecord | null;
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
    if (grants.length === 0) return [];
    const res = await this.client
      .from('download_grants')
      .insert(grants)
      .select('*');
    return assertData(res, 'createDownloadGrants') as DownloadGrantRecord[];
  }

  async findDownloadGrantByToken(token: string) {
    const { data: grant, error } = await this.client
      .from('download_grants')
      .select('*')
      .eq('token', token)
      .is('revoked_at', null)
      .maybeSingle();

    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể kiểm tra token tải file.', 500);
    }
    if (!grant) return null;

    const grantRow = grant as DownloadGrantRecord;
    const [orderRes, productRes, fileRes] = await Promise.all([
      this.client
        .from('orders')
        .select('*')
        .eq('id', grantRow.order_id)
        .is('deleted_at', null)
        .maybeSingle(),
      this.client
        .from('products')
        .select('*')
        .eq('id', grantRow.product_id)
        .maybeSingle(),
      this.client
        .from('product_files')
        .select('*')
        .eq('id', grantRow.product_file_id)
        .maybeSingle(),
    ]);

    if (!orderRes.data || !productRes.data || !fileRes.data) {
      return null;
    }

    return {
      grant: grantRow,
      order: orderRes.data as OrderRecord,
      product: productRes.data as ProductRecord,
      file: fileRes.data as ProductFileRecord,
    };
  }

  async incrementDownloadGrantCount(
    grantId: string
  ): Promise<DownloadGrantRecord | null> {
    const { data: current } = await this.client
      .from('download_grants')
      .select('*')
      .eq('id', grantId)
      .maybeSingle();
    if (!current) return null;
    const row = current as DownloadGrantRecord;
    if (row.download_count >= row.max_downloads) return null;

    const { data, error } = await this.client
      .from('download_grants')
      .update({
        download_count: row.download_count + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq('id', grantId)
      .eq('download_count', row.download_count)
      .select('*')
      .maybeSingle();
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể cập nhật lượt tải.', 500);
    }
    return data as DownloadGrantRecord | null;
  }

  async findActiveExperimentByCode(
    code: string
  ): Promise<ExperimentRecord | null> {
    const { data, error } = await this.client
      .from('experiments')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .maybeSingle();
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể đọc cấu hình thí nghiệm.', 500);
    }
    return data as ExperimentRecord | null;
  }

  async findAssignmentById(
    id: string
  ): Promise<ExperimentAssignmentRecord | null> {
    const { data, error } = await this.client
      .from('experiment_assignments')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể đọc phiên thí nghiệm.', 500);
    }
    return data as ExperimentAssignmentRecord | null;
  }

  async findAssignmentByExperimentAndVisitor(
    experimentId: string,
    visitorId: string
  ): Promise<ExperimentAssignmentRecord | null> {
    const { data, error } = await this.client
      .from('experiment_assignments')
      .select('*')
      .eq('experiment_id', experimentId)
      .eq('visitor_id', visitorId)
      .maybeSingle();
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể kiểm tra phiên thí nghiệm.', 500);
    }
    return data as ExperimentAssignmentRecord | null;
  }

  async countAssignmentsByExperiment(experimentId: string): Promise<number> {
    const { count, error } = await this.client
      .from('experiment_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('experiment_id', experimentId);
    if (error) {
      return 0;
    }
    return count ?? 0;
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
    const res = await this.client
      .from('experiment_assignments')
      .insert(input)
      .select('*')
      .single();
    return assertData(res, 'createAssignment') as ExperimentAssignmentRecord;
  }

  async listActiveScenarios(): Promise<ScenarioRecord[]> {
    const { data, error } = await this.client
      .from('scenarios')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể tải danh sách kịch bản.', 500);
    }
    return (data ?? []) as ScenarioRecord[];
  }

  async findScenarioById(id: string): Promise<ScenarioRecord | null> {
    const { data, error } = await this.client
      .from('scenarios')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể đọc kịch bản.', 500);
    }
    return data as ScenarioRecord | null;
  }

  async listScenarioRunsByAssignment(
    assignmentId: string
  ): Promise<ScenarioRunRecord[]> {
    const { data, error } = await this.client
      .from('scenario_runs')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('step_order', { ascending: true });
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể đọc tiến trình kịch bản.', 500);
    }
    return (data ?? []) as ScenarioRunRecord[];
  }

  async findScenarioRunById(id: string): Promise<ScenarioRunRecord | null> {
    const { data, error } = await this.client
      .from('scenario_runs')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể đọc lượt kịch bản.', 500);
    }
    return data as ScenarioRunRecord | null;
  }

  async createScenarioRun(input: {
    assignment_id: string;
    scenario_id: string;
    step_order: number;
    active_variant: ScenarioRunRecord['active_variant'];
    is_simulated: boolean;
  }): Promise<ScenarioRunRecord> {
    const res = await this.client
      .from('scenario_runs')
      .insert(input)
      .select('*')
      .single();
    return assertData(res, 'createScenarioRun') as ScenarioRunRecord;
  }

  async completeScenarioRun(input: {
    run_id: string;
    selected_product_id: string;
    confidence_score: 1 | 2 | 3 | 4 | 5;
    is_correct: boolean;
    decision_note: string | null;
    completed_at: string;
  }): Promise<ScenarioRunRecord> {
    const res = await this.client
      .from('scenario_runs')
      .update({
        selected_product_id: input.selected_product_id,
        confidence_score: input.confidence_score,
        is_correct: input.is_correct,
        decision_note: input.decision_note,
        completed_at: input.completed_at,
      })
      .eq('id', input.run_id)
      .select('*')
      .single();
    return assertData(res, 'completeScenarioRun') as ScenarioRunRecord;
  }

  async findChatSessionById(id: string): Promise<ChatSessionRecord | null> {
    const { data, error } = await this.client
      .from('chat_sessions')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể đọc phiên chat.', 500);
    }
    return data as ChatSessionRecord | null;
  }

  async listChatSessionsByAssignment(
    assignmentId: string,
    scenarioRunId?: string
  ): Promise<
    Array<{ session: ChatSessionRecord; messages: ChatMessageRecord[] }>
  > {
    let query = this.client
      .from('chat_sessions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (scenarioRunId) {
      query = query.eq('scenario_run_id', scenarioRunId);
    }

    const { data: sessionsData, error } = await query;
    if (error) {
      throw new AppError('INTERNAL_ERROR', 'Không thể đọc lịch sử chat.', 500);
    }

    const sessions = (sessionsData ?? []) as ChatSessionRecord[];
    if (sessions.length === 0) return [];

    const sessionIds = sessions.map((s) => s.id);
    const { data: messagesData, error: msgError } = await this.client
      .from('chat_messages')
      .select('*')
      .in('session_id', sessionIds)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    if (msgError) {
      throw new AppError('INTERNAL_ERROR', 'Không thể đọc tin nhắn chat.', 500);
    }

    const messages = (messagesData ?? []) as ChatMessageRecord[];
    return sessions.map((session) => ({
      session,
      messages: messages
        .filter((m) => m.session_id === session.id)
        .map((m) => ({
          ...m,
          cost_usd: m.cost_usd !== null ? Number(m.cost_usd) : null,
        })),
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
    const res = await this.client
      .from('chat_sessions')
      .insert(input)
      .select('*')
      .single();
    return assertData(res, 'createChatSession') as ChatSessionRecord;
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
    const res = await this.client
      .from('chat_messages')
      .insert(input)
      .select('*')
      .single();
    const row = assertData(res, 'createChatMessage') as ChatMessageRecord;
    await this.client
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', input.session_id);
    return {
      ...row,
      cost_usd: row.cost_usd !== null ? Number(row.cost_usd) : null,
    };
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
    const res = await this.client
      .from('events')
      .insert(input)
      .select('*')
      .single();
    return assertData(res, 'createEvent') as EventRecord;
  }

  async listAdminChatLogs(params: {
    include_simulated: boolean;
    limit?: number;
  }): Promise<AdminChatLogRawEntry[]> {
    const safeLimit = Math.min(Math.max(params.limit ?? 30, 1), 100);
    let sessionsQ = this.client
      .from('chat_sessions')
      .select('*')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(safeLimit);

    if (!params.include_simulated) {
      sessionsQ = sessionsQ.eq('is_simulated', false);
    }

    const { data: sessionsData, error: sessionsError } = await sessionsQ;
    if (sessionsError) {
      throw new AppError(
        'INTERNAL_ERROR',
        'Không thể tải danh sách phiên hội thoại.',
        500
      );
    }

    const sessions = (sessionsData ?? []) as ChatSessionRecord[];
    if (sessions.length === 0) return [];

    const sessionIds = sessions.map((s) => s.id);
    const assignmentIds = Array.from(
      new Set(sessions.map((s) => s.assignment_id).filter(Boolean))
    );

    let msgsQ = this.client
      .from('chat_messages')
      .select('*')
      .in('session_id', sessionIds)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (!params.include_simulated) {
      msgsQ = msgsQ.eq('is_simulated', false);
    }

    const assignPromise =
      assignmentIds.length > 0
        ? this.client
            .from('experiment_assignments')
            .select('id, participant_code')
            .in('id', assignmentIds)
        : Promise.resolve({ data: [], error: null });

    const [msgsRes, assignRes] = await Promise.all([msgsQ, assignPromise]);
    if (msgsRes.error || assignRes.error) {
      throw new AppError(
        'INTERNAL_ERROR',
        'Không thể tải chi tiết nhật ký hội thoại chatbot.',
        500
      );
    }

    const participantByAssignment = new Map<string, string>();
    for (const row of (assignRes.data ?? []) as Array<{
      id: string;
      participant_code: string;
    }>) {
      participantByAssignment.set(row.id, row.participant_code);
    }

    const messagesBySession = new Map<string, ChatMessageRecord[]>();
    for (const msg of (msgsRes.data ?? []) as ChatMessageRecord[]) {
      const normalized: ChatMessageRecord = {
        ...msg,
        cost_usd: msg.cost_usd !== null ? Number(msg.cost_usd) : null,
      };
      const list = messagesBySession.get(msg.session_id);
      if (list) {
        list.push(normalized);
      } else {
        messagesBySession.set(msg.session_id, [normalized]);
      }
    }

    return sessions.map((session) => ({
      session,
      participant_code:
        participantByAssignment.get(session.assignment_id) ?? 'GUEST',
      messages: messagesBySession.get(session.id) ?? [],
    }));
  }

  async getDashboardRawData(includeSimulated: boolean) {
    let assignQ = this.client.from('experiment_assignments').select('*');
    let runsQ = this.client.from('scenario_runs').select('*');
    let ordersQ = this.client.from('orders').select('*').is('deleted_at', null);
    let msgsQ = this.client
      .from('chat_messages')
      .select('*')
      .eq('role', 'assistant')
      .is('deleted_at', null);
    let eventsQ = this.client.from('events').select('*');

    if (!includeSimulated) {
      assignQ = assignQ.eq('is_simulated', false);
      runsQ = runsQ.eq('is_simulated', false);
      ordersQ = ordersQ.eq('is_simulated', false);
      msgsQ = msgsQ.eq('is_simulated', false);
      eventsQ = eventsQ.eq('is_simulated', false);
    }

    const [assignRes, runsRes, ordersRes, msgsRes, eventsRes] =
      await Promise.all([assignQ, runsQ, ordersQ, msgsQ, eventsQ]);

    return {
      assignments: (assignRes.data ?? []) as ExperimentAssignmentRecord[],
      scenarioRuns: (runsRes.data ?? []) as ScenarioRunRecord[],
      orders: (ordersRes.data ?? []) as OrderRecord[],
      assistantMessages: ((msgsRes.data ?? []) as ChatMessageRecord[]).map(
        (m) => ({
          ...m,
          cost_usd: m.cost_usd !== null ? Number(m.cost_usd) : null,
        })
      ),
      events: (eventsRes.data ?? []) as EventRecord[],
    };
  }

  async getExportRawData(includeSimulated: boolean) {
    let assignQ = this.client.from('experiment_assignments').select('*');
    const scenariosQ = this.client
      .from('scenarios')
      .select('*')
      .order('sort_order', { ascending: true });
    let runsQ = this.client
      .from('scenario_runs')
      .select('*')
      .order('created_at', { ascending: true });
    let sessionsQ = this.client
      .from('chat_sessions')
      .select('*')
      .is('deleted_at', null);
    let msgsQ = this.client
      .from('chat_messages')
      .select('*')
      .eq('role', 'assistant')
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    let eventsQ = this.client
      .from('events')
      .select('*')
      .order('created_at', { ascending: true });

    if (!includeSimulated) {
      assignQ = assignQ.eq('is_simulated', false);
      runsQ = runsQ.eq('is_simulated', false);
      sessionsQ = sessionsQ.eq('is_simulated', false);
      msgsQ = msgsQ.eq('is_simulated', false);
      eventsQ = eventsQ.eq('is_simulated', false);
    }

    const [
      assignRes,
      scenariosRes,
      runsRes,
      sessionsRes,
      msgsRes,
      eventsRes,
    ] = await Promise.all([
      assignQ,
      scenariosQ,
      runsQ,
      sessionsQ,
      msgsQ,
      eventsQ,
    ]);

    const firstError =
      assignRes.error ??
      scenariosRes.error ??
      runsRes.error ??
      sessionsRes.error ??
      msgsRes.error ??
      eventsRes.error;
    if (firstError) {
      throw new AppError(
        'INTERNAL_ERROR',
        'Không thể trích xuất dữ liệu phân tích từ cơ sở dữ liệu.',
        500
      );
    }

    return {
      assignments: (assignRes.data ?? []) as ExperimentAssignmentRecord[],
      scenarios: (scenariosRes.data ?? []) as ScenarioRecord[],
      scenarioRuns: (runsRes.data ?? []) as ScenarioRunRecord[],
      chatSessions: (sessionsRes.data ?? []) as ChatSessionRecord[],
      assistantMessages: ((msgsRes.data ?? []) as ChatMessageRecord[]).map(
        (m) => ({
          ...m,
          cost_usd: m.cost_usd !== null ? Number(m.cost_usd) : null,
        })
      ),
      events: (eventsRes.data ?? []) as EventRecord[],
    };
  }
}
