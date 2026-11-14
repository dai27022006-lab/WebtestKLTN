-- =============================================================================
-- Migration 001: Initial Schema, Indexes, pgvector (768d), and Row Level Security
-- Project: Digital Store Advisor (Do an Tot nghiep)
-- Source of truth: RULES.md (v3)
-- =============================================================================

-- 1. Extensions
create extension if not exists pgcrypto;
create extension if not exists vector;

-- 2. Shared trigger function to maintain updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- 3. Core Tables
-- =============================================================================

-- 3.1 Users (mirrors Supabase Auth user id for real users; allows simulated rows)
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  shop_category text,
  is_simulated boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- 3.2 Products (Digital deliverables with mandatory copyright metadata)
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text not null,
  description text not null,
  product_type text not null check (product_type in ('template', 'prompt_pack', 'workflow')),
  industry text not null,
  price_vnd integer not null check (price_vnd >= 0),
  demo_url text,
  thumbnail_url text,
  source_type text not null check (source_type in ('original', 'adapted', 'licensed')),
  license_note text not null,
  specs jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  is_simulated boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- 3.3 Product Files (Private deliverables in Supabase Storage / R2)
create table public.product_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  file_name text not null,
  storage_bucket text not null default 'product-deliverables',
  storage_path text not null,
  file_size_bytes bigint not null check (file_size_bytes >= 0),
  mime_type text not null default 'application/zip',
  version text not null default '1.0.0',
  is_primary boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3.4 Experiments & Assignments (F8 / F11)
create table public.experiments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  design_type text not null default 'within_subject_abba' check (
    design_type in ('within_subject_abba', 'between_subject_ab')
  ),
  description text,
  is_active boolean not null default true,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger experiments_set_updated_at
  before update on public.experiments
  for each row execute function public.set_updated_at();

create table public.experiment_assignments (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.experiments(id) on delete restrict,
  user_id uuid references public.users(id) on delete set null,
  visitor_id text not null,
  participant_code text not null unique,
  session_token_hash text,
  variant text not null check (
    variant in ('chatbot_on', 'chatbot_off', 'abba_on_first', 'abba_off_first')
  ),
  consent_given boolean not null default false,
  consent_at timestamptz,
  shop_profile jsonb not null default '{}'::jsonb,
  is_simulated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (experiment_id, visitor_id)
);

create trigger experiment_assignments_set_updated_at
  before update on public.experiment_assignments
  for each row execute function public.set_updated_at();

-- 3.5 Orders, Order Items & Download Grants (F5 / F6)
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  user_id uuid references public.users(id) on delete set null,
  assignment_id uuid references public.experiment_assignments(id) on delete set null,
  visitor_id text,
  status text not null default 'pending' check (
    status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')
  ),
  payment_provider text not null default 'mock_sandbox' check (
    payment_provider in ('mock_sandbox', 'payos')
  ),
  payment_reference text,
  total_vnd integer not null check (total_vnd >= 0),
  paid_at timestamptz,
  is_simulated boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name_snapshot text not null,
  unit_price_vnd integer not null check (unit_price_vnd >= 0),
  quantity integer not null default 1 check (quantity > 0),
  line_total_vnd integer not null check (line_total_vnd >= 0),
  created_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create table public.download_grants (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  product_file_id uuid not null references public.product_files(id) on delete restrict,
  user_id uuid references public.users(id) on delete set null,
  token text not null unique,
  max_downloads integer not null default 5 check (max_downloads > 0),
  download_count integer not null default 0 check (download_count >= 0),
  expires_at timestamptz not null,
  last_downloaded_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (download_count <= max_downloads)
);

-- 3.6 Task-Based Scenarios & Runs (F11)
create table public.scenarios (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  prompt_text text not null,
  industry text not null,
  budget_vnd integer not null check (budget_vnd >= 0),
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  expected_product_id uuid not null references public.products(id) on delete restrict,
  acceptable_product_ids uuid[] not null default '{}',
  rubric_note text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger scenarios_set_updated_at
  before update on public.scenarios
  for each row execute function public.set_updated_at();

create table public.scenario_runs (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.experiment_assignments(id) on delete restrict,
  scenario_id uuid not null references public.scenarios(id) on delete restrict,
  step_order integer not null check (step_order > 0),
  active_variant text not null check (active_variant in ('chatbot_on', 'chatbot_off')),
  selected_product_id uuid references public.products(id) on delete set null,
  confidence_score smallint check (confidence_score between 1 and 5),
  is_correct boolean,
  decision_note text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  is_simulated boolean not null default false,
  created_at timestamptz not null default now(),
  unique (assignment_id, scenario_id),
  unique (assignment_id, step_order)
);

-- 3.7 RAG Chat Sessions, Messages & Product Embeddings (F7)
create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.experiment_assignments(id) on delete restrict,
  scenario_run_id uuid references public.scenario_runs(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  visitor_id text not null,
  title text,
  is_simulated boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger chat_sessions_set_updated_at
  before update on public.chat_sessions
  for each row execute function public.set_updated_at();

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete restrict,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  prompt_version text,
  model_name text,
  retrieved_product_ids uuid[] not null default '{}',
  suggested_product_ids uuid[] not null default '{}',
  latency_ms integer check (latency_ms >= 0),
  tokens_used integer check (tokens_used >= 0),
  cost_usd numeric(10,6) check (cost_usd >= 0),
  is_simulated boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

-- Note: Gemini gemini-embedding-001 configured with outputDimensionality=768
-- to stay within pgvector HNSW's 2000-dimension limit while keeping high recall.
create table public.product_embeddings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  chunk_index integer not null default 0 check (chunk_index >= 0),
  content_text text not null,
  embedding vector(768) not null,
  embedding_model text not null default 'gemini-embedding-001',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, chunk_index)
);

create trigger product_embeddings_set_updated_at
  before update on public.product_embeddings
  for each row execute function public.set_updated_at();

-- 3.8 Behavioral Tracking Events (F10 — 14 canonical events in RULES.md Section 9)
create table public.events (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.experiment_assignments(id) on delete restrict,
  visitor_id text not null,
  variant text not null check (variant in ('chatbot_on', 'chatbot_off')),
  event_name text not null check (
    event_name in (
      'page_viewed',
      'product_viewed',
      'search_used',
      'filter_applied',
      'scenario_started',
      'scenario_completed',
      'chat_opened',
      'chat_message_sent',
      'product_suggested',
      'suggestion_clicked',
      'add_to_cart',
      'checkout_started',
      'purchase',
      'download_completed'
    )
  ),
  scenario_run_id uuid references public.scenario_runs(id) on delete set null,
  session_id uuid references public.chat_sessions(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  properties jsonb not null default '{}'::jsonb,
  is_simulated boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3.9 RFM Snapshots (Illustrative analytics on simulated data by default)
create table public.rfm_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_label text not null,
  user_id uuid references public.users(id) on delete set null,
  visitor_id text,
  recency_days integer not null check (recency_days >= 0),
  frequency_count integer not null check (frequency_count >= 0),
  monetary_vnd bigint not null check (monetary_vnd >= 0),
  r_score smallint not null check (r_score between 1 and 5),
  f_score smallint not null check (f_score between 1 and 5),
  m_score smallint not null check (m_score between 1 and 5),
  segment_name text not null,
  is_simulated boolean not null default true,
  computed_at timestamptz not null default now()
);

-- =============================================================================
-- 4. Indexes (Foreign Keys, Product Filters, Tracking Analytics, HNSW Vector)
-- =============================================================================

-- users
create index users_role_active_idx on public.users (role) where deleted_at is null;
create index users_is_simulated_idx on public.users (is_simulated);

-- products
create index products_catalog_filter_idx
  on public.products (product_type, industry, price_vnd)
  where is_active = true and deleted_at is null;
create index products_is_simulated_idx on public.products (is_simulated);

-- product_files
create index product_files_product_id_idx on public.product_files (product_id);

-- experiments
create index experiments_is_active_idx on public.experiments (is_active);

-- experiment_assignments
create index experiment_assignments_experiment_id_idx on public.experiment_assignments (experiment_id);
create index experiment_assignments_user_id_idx on public.experiment_assignments (user_id);
create index experiment_assignments_visitor_id_idx on public.experiment_assignments (visitor_id);
create index experiment_assignments_is_simulated_idx on public.experiment_assignments (is_simulated);

-- orders
create index orders_user_id_idx on public.orders (user_id);
create index orders_assignment_id_idx on public.orders (assignment_id);
create index orders_status_created_at_idx on public.orders (status, created_at desc) where deleted_at is null;
create index orders_is_simulated_idx on public.orders (is_simulated);

-- order_items
create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

-- download_grants
create index download_grants_order_id_idx on public.download_grants (order_id);
create index download_grants_product_id_idx on public.download_grants (product_id);
create index download_grants_product_file_id_idx on public.download_grants (product_file_id);
create index download_grants_user_id_idx on public.download_grants (user_id);
create index download_grants_active_expires_idx
  on public.download_grants (expires_at)
  where revoked_at is null;

-- scenarios
create index scenarios_expected_product_id_idx on public.scenarios (expected_product_id);
create index scenarios_active_sort_idx on public.scenarios (sort_order) where is_active = true;

-- scenario_runs
create index scenario_runs_assignment_id_idx on public.scenario_runs (assignment_id);
create index scenario_runs_scenario_id_idx on public.scenario_runs (scenario_id);
create index scenario_runs_selected_product_id_idx on public.scenario_runs (selected_product_id);
create index scenario_runs_is_simulated_idx on public.scenario_runs (is_simulated);

-- chat_sessions
create index chat_sessions_assignment_id_idx on public.chat_sessions (assignment_id);
create index chat_sessions_scenario_run_id_idx on public.chat_sessions (scenario_run_id);
create index chat_sessions_user_id_idx on public.chat_sessions (user_id);
create index chat_sessions_visitor_id_idx on public.chat_sessions (visitor_id);
create index chat_sessions_is_simulated_idx on public.chat_sessions (is_simulated);

-- chat_messages
create index chat_messages_session_created_idx on public.chat_messages (session_id, created_at);
create index chat_messages_prompt_version_idx on public.chat_messages (prompt_version);
create index chat_messages_is_simulated_idx on public.chat_messages (is_simulated);

-- product_embeddings (HNSW cosine index)
create index product_embeddings_product_id_idx on public.product_embeddings (product_id);
create index product_embeddings_embedding_hnsw_idx
  on public.product_embeddings
  using hnsw (embedding vector_cosine_ops);

-- events
create index events_name_created_at_idx on public.events (event_name, created_at desc);
create index events_assignment_variant_idx on public.events (assignment_id, variant);
create index events_scenario_run_id_idx on public.events (scenario_run_id);
create index events_session_id_idx on public.events (session_id);
create index events_product_id_idx on public.events (product_id);
create index events_visitor_created_at_idx on public.events (visitor_id, created_at desc);
create index events_is_simulated_idx on public.events (is_simulated);

-- rfm_snapshots
create index rfm_snapshots_user_id_idx on public.rfm_snapshots (user_id);
create index rfm_snapshots_label_segment_idx on public.rfm_snapshots (snapshot_label, segment_name);
create index rfm_snapshots_is_simulated_idx on public.rfm_snapshots (is_simulated);

-- =============================================================================
-- 5. Vector Similarity Search Helper (Server-side RAG Retrieval)
-- =============================================================================

create or replace function public.match_product_embeddings(
  query_embedding vector(768),
  match_threshold double precision default 0.55,
  match_count integer default 5
)
returns table (
  product_id uuid,
  chunk_index integer,
  content_text text,
  similarity double precision
)
language sql
stable
set search_path = public, extensions
as $$
  select
    pe.product_id,
    pe.chunk_index,
    pe.content_text,
    1 - (pe.embedding <=> query_embedding) as similarity
  from public.product_embeddings pe
  join public.products p on p.id = pe.product_id
  where p.is_active = true
    and p.deleted_at is null
    and 1 - (pe.embedding <=> query_embedding) >= match_threshold
  order by pe.embedding <=> query_embedding asc
  limit least(greatest(match_count, 1), 20);
$$;

revoke execute on function public.match_product_embeddings(vector(768), double precision, integer)
  from public, anon, authenticated;
grant execute on function public.match_product_embeddings(vector(768), double precision, integer)
  to service_role;

-- =============================================================================
-- 6. Row Level Security (RLS)
-- Note: Server Route Handlers use SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)
-- for tracking, experiment assignment, chat logging, and payment webhooks.
-- =============================================================================

alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.product_files enable row level security;
alter table public.experiments enable row level security;
alter table public.experiment_assignments enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.download_grants enable row level security;
alter table public.scenarios enable row level security;
alter table public.scenario_runs enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.product_embeddings enable row level security;
alter table public.events enable row level security;
alter table public.rfm_snapshots enable row level security;

-- Public read-only catalog & active scenarios
create policy products_public_select_active
  on public.products
  for select
  to anon, authenticated
  using (is_active = true and deleted_at is null);

create policy scenarios_public_select_active
  on public.scenarios
  for select
  to anon, authenticated
  using (is_active = true);

-- Authenticated user can read only their own profile, orders, order items, and download grants
create policy users_self_select
  on public.users
  for select
  to authenticated
  using ((select auth.uid()) = id and deleted_at is null);

create policy orders_self_select
  on public.orders
  for select
  to authenticated
  using ((select auth.uid()) = user_id and deleted_at is null);

create policy order_items_self_select
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = (select auth.uid())
        and o.deleted_at is null
    )
  );

create policy download_grants_self_select
  on public.download_grants
  for select
  to authenticated
  using ((select auth.uid()) = user_id and revoked_at is null);
