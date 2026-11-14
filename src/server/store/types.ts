import type { EventName, EventVariant, ExperimentVariant } from '@/lib/tracking/events';
import type {
  ChatRole,
  ExperimentDesignType,
  OrderStatus,
  PaymentProvider,
  ProductSourceType,
  ProductSpecs,
  ProductType,
  ScenarioDifficulty,
  ShopProfileInput,
  UserRole,
} from '@/types/api';

export interface UserRecord {
  id: string;
  email: string;
  password_hash?: string;
  full_name: string | null;
  role: UserRole;
  shop_category: string | null;
  is_simulated: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductRecord {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  product_type: ProductType;
  industry: string;
  price_vnd: number;
  demo_url: string | null;
  thumbnail_url: string | null;
  source_type: ProductSourceType;
  license_note: string;
  specs: ProductSpecs;
  is_active: boolean;
  is_simulated: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductFileRecord {
  id: string;
  product_id: string;
  file_name: string;
  storage_bucket: string;
  storage_path: string;
  file_size_bytes: number;
  mime_type: string;
  version: string;
  is_primary: boolean;
  created_at: string;
}

export interface ExperimentRecord {
  id: string;
  code: string;
  name: string;
  design_type: ExperimentDesignType;
  description: string | null;
  is_active: boolean;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExperimentAssignmentRecord {
  id: string;
  experiment_id: string;
  user_id: string | null;
  visitor_id: string;
  participant_code: string;
  session_token_hash: string | null;
  variant: ExperimentVariant;
  consent_given: boolean;
  consent_at: string | null;
  shop_profile: ShopProfileInput;
  is_simulated: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderRecord {
  id: string;
  order_code: string;
  user_id: string | null;
  assignment_id: string | null;
  visitor_id: string | null;
  status: OrderStatus;
  payment_provider: PaymentProvider;
  payment_reference: string | null;
  total_vnd: number;
  paid_at: string | null;
  is_simulated: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRecord {
  id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  unit_price_vnd: number;
  quantity: number;
  line_total_vnd: number;
  created_at: string;
}

export interface DownloadGrantRecord {
  id: string;
  order_id: string;
  product_id: string;
  product_file_id: string;
  user_id: string | null;
  token: string;
  max_downloads: number;
  download_count: number;
  expires_at: string;
  last_downloaded_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface ScenarioRecord {
  id: string;
  code: string;
  title: string;
  prompt_text: string;
  industry: string;
  budget_vnd: number;
  difficulty: ScenarioDifficulty;
  expected_product_id: string;
  acceptable_product_ids: string[];
  rubric_note: string | null;
  sort_order: number;
  is_active: boolean;
  is_simulated?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScenarioRunRecord {
  id: string;
  assignment_id: string;
  scenario_id: string;
  step_order: number;
  active_variant: EventVariant;
  selected_product_id: string | null;
  confidence_score: 1 | 2 | 3 | 4 | 5 | null;
  is_correct: boolean | null;
  decision_note: string | null;
  started_at: string;
  completed_at: string | null;
  is_simulated: boolean;
  created_at: string;
}

export interface ChatSessionRecord {
  id: string;
  assignment_id: string;
  scenario_run_id: string | null;
  user_id: string | null;
  visitor_id: string;
  title: string | null;
  is_simulated: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRecord {
  id: string;
  session_id: string;
  role: ChatRole;
  content: string;
  prompt_version: string | null;
  model_name: string | null;
  retrieved_product_ids: string[];
  suggested_product_ids: string[];
  latency_ms: number | null;
  tokens_used: number | null;
  cost_usd: number | null;
  is_simulated: boolean;
  deleted_at: string | null;
  created_at: string;
}

export interface EventRecord {
  id: string;
  assignment_id: string;
  visitor_id: string;
  variant: EventVariant;
  event_name: EventName;
  scenario_run_id: string | null;
  session_id: string | null;
  product_id: string | null;
  properties: Record<string, unknown>;
  is_simulated: boolean;
  created_at: string;
}

export interface ProductQueryFilter {
  q?: string;
  industry?: string;
  product_type?: ProductType;
  min_price?: number;
  max_price?: number;
  sort: 'price_asc' | 'price_desc' | 'newest';
  page: number;
  limit: number;
  includeInactive?: boolean;
}

export interface AdminOrderQueryFilter {
  status?: OrderStatus;
  include_simulated: boolean;
  page: number;
  limit: number;
}

export interface DataStore {
  readonly mode: 'dev_memory' | 'supabase';

  // Users
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  createUser(input: {
    id?: string;
    email: string;
    password_hash?: string;
    full_name: string | null;
    role?: UserRole;
    shop_category?: string | null;
    is_simulated?: boolean;
  }): Promise<UserRecord>;

  // Products & Files
  listProducts(
    filter: ProductQueryFilter
  ): Promise<{ items: ProductRecord[]; total: number }>;
  findProductByIdOrSlug(
    idOrSlug: string,
    includeInactive?: boolean
  ): Promise<ProductRecord | null>;
  findProductsByIds(
    ids: string[],
    includeInactive?: boolean
  ): Promise<ProductRecord[]>;
  listAllActiveProducts(): Promise<ProductRecord[]>;
  createProduct(input: {
    slug: string;
    name: string;
    short_description: string;
    description: string;
    product_type: ProductType;
    industry: string;
    price_vnd: number;
    demo_url: string | null;
    thumbnail_url: string | null;
    source_type: ProductSourceType;
    license_note: string;
    specs: ProductSpecs;
    is_active: boolean;
    is_simulated: boolean;
  }): Promise<ProductRecord>;
  updateProduct(
    id: string,
    patch: Partial<
      Omit<ProductRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
    >
  ): Promise<ProductRecord | null>;
  findPrimaryProductFile(productId: string): Promise<ProductFileRecord | null>;
  findProductFilesByProductIds(
    productIds: string[]
  ): Promise<Map<string, ProductFileRecord>>;

  // Orders & Downloads
  createOrderWithItems(input: {
    order_code: string;
    user_id: string | null;
    assignment_id: string | null;
    visitor_id: string | null;
    payment_provider: PaymentProvider;
    total_vnd: number;
    is_simulated: boolean;
    items: Array<{
      product_id: string;
      product_name_snapshot: string;
      unit_price_vnd: number;
      quantity: number;
      line_total_vnd: number;
    }>;
  }): Promise<{ order: OrderRecord; items: OrderItemRecord[] }>;
  findOrderById(id: string): Promise<{
    order: OrderRecord;
    items: OrderItemRecord[];
    download_grants: DownloadGrantRecord[];
  } | null>;
  listOrdersByOwner(owner: {
    user_id?: string | null;
    assignment_id?: string | null;
    order_ids?: string[];
  }): Promise<
    Array<{
      order: OrderRecord;
      items: OrderItemRecord[];
      download_grants: DownloadGrantRecord[];
    }>
  >;
  listAdminOrders(filter: AdminOrderQueryFilter): Promise<{
    items: Array<{
      order: OrderRecord;
      items: OrderItemRecord[];
      download_grants: DownloadGrantRecord[];
    }>;
    total: number;
  }>;
  transitionPendingOrderPaymentStatus(input: {
    order_id: string;
    status: 'paid' | 'failed';
    payment_reference: string;
    paid_at: string | null;
  }): Promise<OrderRecord | null>;
  createDownloadGrants(
    grants: Array<{
      order_id: string;
      product_id: string;
      product_file_id: string;
      user_id: string | null;
      token: string;
      max_downloads: number;
      expires_at: string;
    }>
  ): Promise<DownloadGrantRecord[]>;
  findDownloadGrantByToken(token: string): Promise<{
    grant: DownloadGrantRecord;
    order: OrderRecord;
    product: ProductRecord;
    file: ProductFileRecord;
  } | null>;
  incrementDownloadGrantCount(
    grantId: string
  ): Promise<DownloadGrantRecord | null>;

  // Experiments & Scenarios
  findActiveExperimentByCode(code: string): Promise<ExperimentRecord | null>;
  findAssignmentById(id: string): Promise<ExperimentAssignmentRecord | null>;
  findAssignmentByExperimentAndVisitor(
    experimentId: string,
    visitorId: string
  ): Promise<ExperimentAssignmentRecord | null>;
  countAssignmentsByExperiment(experimentId: string): Promise<number>;
  createAssignment(input: {
    experiment_id: string;
    user_id: string | null;
    visitor_id: string;
    participant_code: string;
    session_token_hash: string;
    variant: ExperimentVariant;
    consent_given: boolean;
    consent_at: string;
    shop_profile: ShopProfileInput;
    is_simulated: boolean;
  }): Promise<ExperimentAssignmentRecord>;
  listActiveScenarios(): Promise<ScenarioRecord[]>;
  findScenarioById(id: string): Promise<ScenarioRecord | null>;
  listScenarioRunsByAssignment(
    assignmentId: string
  ): Promise<ScenarioRunRecord[]>;
  findScenarioRunById(id: string): Promise<ScenarioRunRecord | null>;
  createScenarioRun(input: {
    assignment_id: string;
    scenario_id: string;
    step_order: number;
    active_variant: EventVariant;
    is_simulated: boolean;
  }): Promise<ScenarioRunRecord>;
  completeScenarioRun(input: {
    run_id: string;
    selected_product_id: string;
    confidence_score: 1 | 2 | 3 | 4 | 5;
    is_correct: boolean;
    decision_note: string | null;
    completed_at: string;
  }): Promise<ScenarioRunRecord>;

  // Chat
  findChatSessionById(id: string): Promise<ChatSessionRecord | null>;
  listChatSessionsByAssignment(
    assignmentId: string,
    scenarioRunId?: string
  ): Promise<
    Array<{ session: ChatSessionRecord; messages: ChatMessageRecord[] }>
  >;
  createChatSession(input: {
    assignment_id: string;
    scenario_run_id: string | null;
    user_id: string | null;
    visitor_id: string;
    title: string | null;
    is_simulated: boolean;
  }): Promise<ChatSessionRecord>;
  createChatMessage(input: {
    session_id: string;
    role: ChatRole;
    content: string;
    prompt_version: string | null;
    model_name: string | null;
    retrieved_product_ids: string[];
    suggested_product_ids: string[];
    latency_ms: number | null;
    tokens_used: number | null;
    cost_usd: number | null;
    is_simulated: boolean;
  }): Promise<ChatMessageRecord>;

  // Tracking & Dashboard Analytics
  createEvent(input: {
    assignment_id: string;
    visitor_id: string;
    variant: EventVariant;
    event_name: EventName;
    scenario_run_id: string | null;
    session_id: string | null;
    product_id: string | null;
    properties: Record<string, unknown>;
    is_simulated: boolean;
    created_at: string;
  }): Promise<EventRecord>;

  getDashboardRawData(includeSimulated: boolean): Promise<{
    assignments: ExperimentAssignmentRecord[];
    scenarioRuns: ScenarioRunRecord[];
    orders: OrderRecord[];
    assistantMessages: ChatMessageRecord[];
    events: EventRecord[];
  }>;
}
