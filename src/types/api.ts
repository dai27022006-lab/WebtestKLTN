import type {
  EventName,
  EventVariant,
  ExperimentVariant,
  TrackEventInput,
} from '@/lib/tracking/events';

// =============================================================================
// 1. Standard API Response Envelope (Contract-First)
// =============================================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type ApiFieldErrors = Record<string, string[]>;

export interface ApiErrorBody {
  code: string;
  message: string;
  fieldErrors?: ApiFieldErrors;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  ok: false;
  error: ApiErrorBody;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// =============================================================================
// 2. Shared Domain Enums & Primitives
// =============================================================================

export type UserRole = 'customer' | 'admin';

export type ProductType = 'template' | 'prompt_pack' | 'workflow';

export type ProductSourceType = 'original' | 'adapted' | 'licensed';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type PaymentProvider = 'mock_sandbox' | 'payos';

export type ExperimentDesignType = 'within_subject_abba' | 'between_subject_ab';

export type ScenarioDifficulty = 'easy' | 'medium' | 'hard';

export type ChatRole = 'user' | 'assistant' | 'system';

// =============================================================================
// 3. Health Check (GET /api/health)
// =============================================================================

export interface HealthCheckData {
  status: 'ok' | 'degraded';
  timestamp: string;
  service: string;
  database?: 'connected' | 'error';
}

// =============================================================================
// 4. Auth & User Profile (/api/auth/*)
// =============================================================================

export interface UserProfileDto {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  shop_category: string | null;
  created_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  shop_category?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSessionResponse {
  user: UserProfileDto;
}

export interface LogoutResponse {
  logged_out: boolean;
}

// =============================================================================
// 5. Products (/api/products, /api/products/:id)
// =============================================================================

export interface ProductCaseStudy {
  shop_name: string;
  shop_type: string;
  rating: number;
  quote: string;
  outcome: string;
}

export interface ProductSpecs {
  target_shop_size?: string;
  platforms?: string[];
  deliverables?: string[];
  tech_stack?: string[];
  setup_time_minutes?: number;
  guide_summary?: string;
  case_studies?: ProductCaseStudy[];
  preview_highlights?: string[];
  [key: string]: unknown;
}

export interface ProductSummaryDto {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  product_type: ProductType;
  industry: string;
  price_vnd: number;
  thumbnail_url: string | null;
  source_type: ProductSourceType;
  license_note: string;
  is_active: boolean;
}

export interface ProductDetailDto extends ProductSummaryDto {
  description: string;
  demo_url: string | null;
  specs: ProductSpecs;
  has_downloadable_file: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductListQuery {
  q?: string;
  industry?: string;
  product_type?: ProductType;
  min_price?: number;
  max_price?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}

// =============================================================================
// 6. Cart (/api/cart)
// =============================================================================

export interface CartItemDto {
  product_id: string;
  slug: string;
  name: string;
  product_type: ProductType;
  price_vnd: number;
  quantity: number;
  line_total_vnd: number;
  thumbnail_url: string | null;
}

export interface CartDto {
  items: CartItemDto[];
  item_count: number;
  subtotal_vnd: number;
  updated_at: string;
}

export interface AddToCartRequest {
  product_id: string;
  quantity?: number;
}

export interface RemoveFromCartRequest {
  product_id?: string;
  clear_all?: boolean;
}

// =============================================================================
// 7. Orders, Mock Sandbox Webhook & Digital Downloads
// (/api/orders, /api/payments/webhook, /api/downloads/:token)
// =============================================================================

export interface CreateOrderItemInput {
  product_id: string;
  quantity: number;
}

export interface CreateOrderRequest {
  items: CreateOrderItemInput[];
  payment_provider?: PaymentProvider;
  assignment_id?: string;
  visitor_id?: string;
  is_simulated?: boolean;
}

export interface OrderItemDto {
  id: string;
  product_id: string;
  product_name_snapshot: string;
  unit_price_vnd: number;
  quantity: number;
  line_total_vnd: number;
}

export interface DownloadGrantDto {
  id: string;
  order_id: string;
  product_id: string;
  token: string;
  download_url: string;
  max_downloads: number;
  download_count: number;
  expires_at: string;
}

export interface OrderDto {
  id: string;
  order_code: string;
  user_id: string | null;
  assignment_id: string | null;
  status: OrderStatus;
  payment_provider: PaymentProvider;
  payment_reference: string | null;
  total_vnd: number;
  paid_at: string | null;
  is_simulated: boolean;
  items: OrderItemDto[];
  download_grants?: DownloadGrantDto[];
  created_at: string;
}

export interface MockPaymentIntentDto {
  provider: PaymentProvider;
  checkout_mode: 'mock_sandbox' | 'redirect';
  order_id: string;
  order_code: string;
  amount_vnd: number;
  webhook_path: '/api/payments/webhook';
}

export interface CreateOrderResponse {
  order: OrderDto;
  payment_intent: MockPaymentIntentDto;
}

export interface SandboxPayRequest {
  outcome?: 'paid' | 'failed';
}

export interface MockPaymentWebhookRequest {
  order_id: string;
  order_code: string;
  payment_provider: PaymentProvider;
  payment_reference: string;
  status: 'paid' | 'failed';
  amount_vnd: number;
  signature: string;
  timestamp: string;
}

export interface PaymentWebhookResponse {
  order_id: string;
  order_code: string;
  status: OrderStatus;
  paid_at: string | null;
  download_grants: DownloadGrantDto[];
}

export interface DownloadAccessResponse {
  download_url: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  expires_at: string;
  remaining_downloads: number;
}

// =============================================================================
// 8. Gemini RAG Chatbot (/api/chat, /api/chat/sessions)
// =============================================================================

export interface SuggestedProductCardDto {
  id: string;
  slug: string;
  name: string;
  product_type: ProductType;
  industry: string;
  price_vnd: number;
  thumbnail_url: string | null;
  reason: string;
}

export interface SendChatMessageRequest {
  session_id?: string;
  assignment_id?: string;
  visitor_id?: string;
  scenario_run_id?: string;
  message: string;
  is_simulated?: boolean;
}

export interface ChatMessageDto {
  id: string;
  session_id: string;
  role: ChatRole;
  content: string;
  prompt_version: string | null;
  model_name: string | null;
  retrieved_product_ids: string[];
  suggested_product_ids: string[];
  suggested_products: SuggestedProductCardDto[];
  latency_ms: number | null;
  tokens_used: number | null;
  cost_usd: number | null;
  created_at: string;
}

export interface SendChatMessageResponse {
  session_id: string;
  user_message: ChatMessageDto;
  assistant_message: ChatMessageDto;
}

export interface ChatSessionDto {
  id: string;
  assignment_id: string;
  scenario_run_id: string | null;
  visitor_id: string;
  title: string | null;
  is_simulated: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatSessionWithMessagesDto extends ChatSessionDto {
  messages: ChatMessageDto[];
}

export interface ChatSessionsResponse {
  sessions: ChatSessionWithMessagesDto[];
}

// =============================================================================
// 9. Behavioral Tracking (/api/events)
// =============================================================================

export type TrackEventRequest = TrackEventInput;

export interface TrackEventResponse {
  event_id: string;
  event_name: EventName;
  created_at: string;
}

// =============================================================================
// 10. F8 / F11 Experiment Consent & Task-Based Scenarios
// (/api/experiments/consent, /api/scenarios/next, /api/scenarios/:id/complete)
// =============================================================================

export interface ShopProfileInput {
  industry?: string;
  monthly_orders?: string;
  team_size?: number;
  channels?: string[];
  role_in_study?: 'shop_owner' | 'student_roleplay';
}

export interface ExperimentConsentRequest {
  experiment_code?: string;
  visitor_id: string;
  consent_given: boolean;
  shop_profile?: ShopProfileInput;
  is_simulated?: boolean;
}

export interface ExperimentAssignmentDto {
  assignment_id: string;
  experiment_id: string;
  participant_code: string;
  variant: ExperimentVariant;
  active_variant: EventVariant;
  consent_given: boolean;
  consent_at: string | null;
  created_at: string;
}

/**
 * Public scenario card sent to participants.
 * Deliberately omits expected_product_id, acceptable_product_ids, and rubric_note.
 */
export interface ScenarioPublicDto {
  id: string;
  code: string;
  title: string;
  prompt_text: string;
  industry: string;
  budget_vnd: number;
  difficulty: ScenarioDifficulty;
}

export interface ScenarioNextResponse {
  assignment_id: string;
  participant_code: string;
  step_order: number;
  total_steps: number;
  active_variant: EventVariant;
  scenario_run_id: string | null;
  scenario: ScenarioPublicDto | null;
  started_at: string | null;
  is_finished: boolean;
}

export interface ExperimentExitResponse {
  exited: boolean;
}

export interface CompleteScenarioRequest {
  assignment_id: string;
  scenario_run_id: string;
  selected_product_id: string;
  confidence_score: 1 | 2 | 3 | 4 | 5;
  decision_note?: string;
}

export interface CompleteScenarioResponse {
  scenario_run_id: string;
  scenario_id: string;
  step_order: number;
  active_variant: EventVariant;
  selected_product_id: string;
  confidence_score: 1 | 2 | 3 | 4 | 5;
  duration_seconds: number;
  completed_at: string;
  has_next_scenario: boolean;
}

// =============================================================================
// 11. Admin Endpoints (/api/admin/*)
// =============================================================================

export interface AdminCreateProductRequest {
  slug: string;
  name: string;
  short_description: string;
  description: string;
  product_type: ProductType;
  industry: string;
  price_vnd: number;
  demo_url?: string | null;
  thumbnail_url?: string | null;
  source_type: ProductSourceType;
  license_note: string;
  specs?: ProductSpecs;
  is_active?: boolean;
  is_simulated?: boolean;
}

export type AdminUpdateProductRequest = Partial<AdminCreateProductRequest> & {
  id?: string;
};

export interface AdminOrderListQuery {
  status?: OrderStatus;
  include_simulated?: boolean;
  page?: number;
  limit?: number;
}

export interface AdminChatLogQuery {
  include_simulated?: boolean;
  limit?: number;
}

export interface AdminChatLogMessageDto {
  id: string;
  role: ChatRole;
  content: string;
  prompt_version: string | null;
  model_name: string | null;
  retrieved_product_ids: string[];
  suggested_products: SuggestedProductCardDto[];
  latency_ms: number | null;
  tokens_used: number | null;
  cost_usd: number | null;
  created_at: string;
}

export interface AdminChatLogItemDto {
  session_id: string;
  participant_code: string;
  title: string | null;
  created_at: string;
  is_simulated: boolean;
  messages: AdminChatLogMessageDto[];
}

export interface VariantPerformanceSummary {
  variant: EventVariant;
  completed_runs: number;
  correct_runs: number;
  accuracy_rate: number;
  avg_duration_seconds: number;
  avg_confidence_score: number;
  sandbox_purchase_count: number;
}

export interface AdminDashboardSummaryDto {
  include_simulated: boolean;
  total_participants: number;
  consented_participants: number;
  total_completed_runs: number;
  variants: VariantPerformanceSummary[];
  rag_metrics: {
    total_assistant_messages: number;
    avg_latency_ms: number;
    p95_latency_ms: number;
    total_tokens_used: number;
    total_cost_usd: number;
    avg_cost_per_message_usd: number;
  };
  orders_summary: {
    total_orders: number;
    paid_orders: number;
    total_sandbox_value_vnd: number;
  };
}

export type AdminExportDataset = 'scenario_runs' | 'events' | 'rag_logs';

export type AdminExportFormat = 'csv' | 'json';

export interface AdminExportQuery {
  dataset: AdminExportDataset;
  format?: AdminExportFormat;
  include_simulated?: boolean;
}

export interface AdminExportScenarioRunRow {
  scenario_run_id: string;
  assignment_id: string;
  participant_code: string;
  visitor_id: string;
  assignment_variant: ExperimentVariant;
  scenario_id: string;
  scenario_code: string;
  step_order: number;
  active_variant: EventVariant;
  selected_product_id: string | null;
  is_correct: boolean | null;
  confidence_score: 1 | 2 | 3 | 4 | 5 | null;
  duration_seconds: number | null;
  started_at: string;
  completed_at: string | null;
  role_in_study: string;
  shop_industry: string;
  is_simulated: boolean;
}

export interface AdminExportEventRow {
  event_id: string;
  assignment_id: string;
  participant_code: string;
  visitor_id: string;
  variant: EventVariant;
  event_name: EventName;
  scenario_run_id: string | null;
  session_id: string | null;
  product_id: string | null;
  properties_json: string;
  is_simulated: boolean;
  created_at: string;
}

export interface AdminExportRagLogRow {
  message_id: string;
  session_id: string;
  assignment_id: string;
  participant_code: string;
  visitor_id: string;
  scenario_run_id: string | null;
  prompt_version: string;
  model_name: string;
  retrieved_count: number;
  suggested_count: number;
  retrieved_product_ids: string;
  suggested_product_ids: string;
  latency_ms: number | null;
  tokens_used: number | null;
  cost_usd: number | null;
  is_simulated: boolean;
  created_at: string;
}

export type AdminExportRow =
  | AdminExportScenarioRunRow
  | AdminExportEventRow
  | AdminExportRagLogRow;

export interface AdminExportJsonResponse {
  dataset: AdminExportDataset;
  include_simulated: boolean;
  exported_at: string;
  total_rows: number;
  rows: AdminExportRow[];
}
