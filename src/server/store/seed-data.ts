import { scryptSync } from 'node:crypto';

import catalogJson from '../../../data/catalog-v1.json';
import scenariosJson from '../../../data/scenarios-v1.json';
import type {
  ProductSourceType,
  ProductSpecs,
  ProductType,
  ScenarioDifficulty,
} from '@/types/api';

import type {
  ChatMessageRecord,
  ChatSessionRecord,
  EventRecord,
  ExperimentAssignmentRecord,
  ExperimentRecord,
  OrderItemRecord,
  OrderRecord,
  ProductFileRecord,
  ProductRecord,
  ScenarioRecord,
  ScenarioRunRecord,
  UserRecord,
} from './types';

export function hashPasswordLocal(password: string): string {
  const salt = 'dsa-dev-salt-v1';
  const derived = scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${derived}`;
}

export const DEV_IDS = {
  experiment: '0f8fad5b-d9cb-469f-a165-70867728950e',
  users: {
    admin: '10000000-0000-4000-8000-000000000001',
    demo: '10000000-0000-4000-8000-000000000002',
  },
  products: {
    cosmeticsLanding: '2c5a98b1-90c4-4f88-a2b3-1c4f9b012a10',
    cosmeticsPrompts: '7a9c11d2-54e3-4c99-8b10-0f2d3e4a5b6c',
    cosmeticsRetentionWorkflow: 'f6a7b8c9-1012-4112-8112-6c7d8e9f0a12',
    fashionLookbook: '3d6b22e3-11a4-4d88-9c21-2e3f4a5b6c7d',
    fashionLivestream: 'a1b2c3d4-1007-4107-8107-1c4f9b012a07',
    fashionPrompts: 'd4e5f6a7-1010-4110-8110-4a5b6c7d8e10',
    fnbMenuOrder: '4e7c33f4-22b5-4e99-ad32-3f4a5b6c7d8e',
    fnbBakeryCombo: 'b2c3d4e5-1008-4108-8108-2e3f4a5b6c08',
    fnbPrompts: 'e5f6a7b8-1011-4111-8111-5b6c7d8e9f11',
    multiBioStore: 'c3d4e5f6-1009-4109-8109-3f4a5b6c7d09',
    multiChannelPrompts: '5f8d44a5-33c6-4fa0-be43-4a5b6c7d8e9f',
    orderSyncWorkflow: '6a9e55b6-44d7-40b1-cf54-5b6c7d8e9f01',
  },
  scenarios: {
    sc01: '9f1e2d3c-4b5a-4678-8901-abcdef123456',
    sc02: '8e2d3c4b-5a6b-4789-9012-bcdef1234567',
    sc03: '7d3c4b5a-6b7c-4890-a123-cdef12345678',
    sc04: '6c4b5a6b-7c8d-4901-b234-def123456789',
  },
  simAssignment: 'd47a1f10-7d5b-4a77-9498-a76f9814d001',
  simOrder: '8c8c6f3e-3d1a-4b40-9d6a-7e94c8a61c11',
  simSession: '5b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e',
} as const;

export interface DevStoreState {
  users: UserRecord[];
  products: ProductRecord[];
  productFiles: ProductFileRecord[];
  experiments: ExperimentRecord[];
  assignments: ExperimentAssignmentRecord[];
  orders: OrderRecord[];
  orderItems: OrderItemRecord[];
  downloadGrants: Array<import('./types').DownloadGrantRecord>;
  scenarios: ScenarioRecord[];
  scenarioRuns: ScenarioRunRecord[];
  chatSessions: ChatSessionRecord[];
  chatMessages: ChatMessageRecord[];
  events: EventRecord[];
}

interface CatalogJsonProduct {
  id: string;
  file_id: string;
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
  deliverable_file: {
    file_name: string;
    storage_bucket: string;
    storage_path: string;
    file_size_bytes: number;
    mime_type: string;
    version: string;
  };
  is_active: boolean;
  is_simulated: boolean;
}

interface ScenariosJsonItem {
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
}

export function createInitialDevStoreState(): DevStoreState {
  const now = '2026-11-01T08:00:00.000Z';

  const users: UserRecord[] = [
    {
      id: DEV_IDS.users.admin,
      email: 'admin@digitalstore.local',
      password_hash: hashPasswordLocal('Admin1234!'),
      full_name: 'Quản trị viên (Demo)',
      role: 'admin',
      shop_category: null,
      is_simulated: true,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: DEV_IDS.users.demo,
      email: 'demo@digitalstore.local',
      password_hash: hashPasswordLocal('Demo1234!'),
      full_name: 'Chủ shop Mỹ Phẩm An Nhiên (Demo)',
      role: 'customer',
      shop_category: 'Mỹ phẩm',
      is_simulated: true,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    },
  ];

  const rawCatalog = catalogJson.products as CatalogJsonProduct[];
  const products: ProductRecord[] = rawCatalog.map((item, idx) => {
    const createdAt = new Date(
      Date.parse(now) + idx * 60_000
    ).toISOString();
    return {
      id: item.id,
      slug: item.slug,
      name: item.name,
      short_description: item.short_description,
      description: item.description,
      product_type: item.product_type,
      industry: item.industry,
      price_vnd: item.price_vnd,
      demo_url: item.demo_url,
      thumbnail_url: item.thumbnail_url,
      source_type: item.source_type,
      license_note: item.license_note,
      specs: item.specs,
      is_active: item.is_active,
      is_simulated: item.is_simulated,
      deleted_at: null,
      created_at: createdAt,
      updated_at: createdAt,
    };
  });

  const productFiles: ProductFileRecord[] = rawCatalog.map((item) => ({
    id: item.file_id,
    product_id: item.id,
    file_name: item.deliverable_file.file_name,
    storage_bucket: item.deliverable_file.storage_bucket,
    storage_path: item.deliverable_file.storage_path,
    file_size_bytes: item.deliverable_file.file_size_bytes,
    mime_type: item.deliverable_file.mime_type,
    version: item.deliverable_file.version,
    is_primary: true,
    created_at: now,
  }));

  const experiments: ExperimentRecord[] = [
    {
      id: DEV_IDS.experiment,
      code: 'exp_chatbot_advisor_v1',
      name: 'Thí nghiệm AB/BA Đánh giá Trợ lý Ảo Tư vấn Sản phẩm Số',
      design_type: 'within_subject_abba',
      description:
        'Thiết kế Within-subject đảo chéo giữa trạng thái có trợ lý ảo (chatbot_on) và tự duyệt danh mục (chatbot_off).',
      is_active: true,
      started_at: now,
      ended_at: null,
      created_at: now,
      updated_at: now,
    },
  ];

  const rawScenarios = scenariosJson.scenarios as ScenariosJsonItem[];
  const scenarios: ScenarioRecord[] = rawScenarios.map((item) => ({
    id: item.id,
    code: item.code,
    title: item.title,
    prompt_text: item.prompt_text,
    industry: item.industry,
    budget_vnd: item.budget_vnd,
    difficulty: item.difficulty,
    expected_product_id: item.expected_product_id,
    acceptable_product_ids: item.acceptable_product_ids,
    rubric_note: item.rubric_note,
    sort_order: item.sort_order,
    is_active: item.is_active,
    is_simulated: false,
    created_at: now,
    updated_at: now,
  }));

  // Simulated sample records (is_simulated = true) for immediate admin dashboard preview
  const assignments: ExperimentAssignmentRecord[] = [
    {
      id: DEV_IDS.simAssignment,
      experiment_id: DEV_IDS.experiment,
      user_id: DEV_IDS.users.demo,
      visitor_id: 'vis_sim_demo_participant_01',
      participant_code: 'P-SIM-001',
      session_token_hash: null,
      variant: 'abba_on_first',
      consent_given: true,
      consent_at: '2026-11-10T08:00:00.000Z',
      shop_profile: {
        industry: 'Mỹ phẩm',
        monthly_orders: '50-200',
        team_size: 2,
        channels: ['TikTok Shop', 'Shopee'],
        role_in_study: 'shop_owner',
      },
      is_simulated: true,
      created_at: '2026-11-10T08:00:00.000Z',
      updated_at: '2026-11-10T08:00:00.000Z',
    },
  ];

  const scenarioRuns: ScenarioRunRecord[] = [
    {
      id: '3e2b7a90-2b1c-4c88-b6a5-9901b2c3d4e5',
      assignment_id: DEV_IDS.simAssignment,
      scenario_id: DEV_IDS.scenarios.sc01,
      step_order: 1,
      active_variant: 'chatbot_on',
      selected_product_id: DEV_IDS.products.cosmeticsLanding,
      confidence_score: 5,
      is_correct: true,
      decision_note: 'Trợ lý gợi ý đúng mẫu trang mỹ phẩm.',
      started_at: '2026-11-10T08:01:00.000Z',
      completed_at: '2026-11-10T08:02:15.000Z',
      is_simulated: true,
      created_at: '2026-11-10T08:01:00.000Z',
    },
    {
      id: '4f3c8b01-3c2d-4d99-c7b6-0012c3d4e5f6',
      assignment_id: DEV_IDS.simAssignment,
      scenario_id: DEV_IDS.scenarios.sc02,
      step_order: 2,
      active_variant: 'chatbot_off',
      selected_product_id: DEV_IDS.products.fashionLookbook,
      confidence_score: 4,
      is_correct: true,
      decision_note: 'Tự tìm trong danh mục thời trang.',
      started_at: '2026-11-10T08:03:00.000Z',
      completed_at: '2026-11-10T08:05:30.000Z',
      is_simulated: true,
      created_at: '2026-11-10T08:03:00.000Z',
    },
  ];

  const orders: OrderRecord[] = [
    {
      id: DEV_IDS.simOrder,
      order_code: 'ORD-20261110-0001',
      user_id: DEV_IDS.users.demo,
      assignment_id: DEV_IDS.simAssignment,
      visitor_id: 'vis_sim_demo_participant_01',
      status: 'paid',
      payment_provider: 'mock_sandbox',
      payment_reference: 'MOCK-SIM-0001',
      total_vnd: 490000,
      paid_at: '2026-11-10T08:06:00.000Z',
      is_simulated: true,
      deleted_at: null,
      created_at: '2026-11-10T08:05:45.000Z',
      updated_at: '2026-11-10T08:06:00.000Z',
    },
  ];

  const orderItems: OrderItemRecord[] = [
    {
      id: '9a1b2c3d-4e5f-4061-8273-8495a6b7c8d9',
      order_id: DEV_IDS.simOrder,
      product_id: DEV_IDS.products.cosmeticsLanding,
      product_name_snapshot: 'Template Landing Page Mỹ Phẩm Chuẩn TikTok Shop',
      unit_price_vnd: 490000,
      quantity: 1,
      line_total_vnd: 490000,
      created_at: '2026-11-10T08:05:45.000Z',
    },
  ];

  const chatSessions: ChatSessionRecord[] = [
    {
      id: DEV_IDS.simSession,
      assignment_id: DEV_IDS.simAssignment,
      scenario_run_id: '3e2b7a90-2b1c-4c88-b6a5-9901b2c3d4e5',
      user_id: DEV_IDS.users.demo,
      visitor_id: 'vis_sim_demo_participant_01',
      title: 'Tư vấn gói mỹ phẩm TikTok Shop',
      is_simulated: true,
      deleted_at: null,
      created_at: '2026-11-10T08:01:10.000Z',
      updated_at: '2026-11-10T08:01:12.000Z',
    },
  ];

  const chatMessages: ChatMessageRecord[] = [
    {
      id: '11111111-2222-4333-8444-555555555555',
      session_id: DEV_IDS.simSession,
      role: 'user',
      content:
        'Shop mình bán mỹ phẩm trên TikTok Shop, ngân sách dưới 1 triệu, cần landing page.',
      prompt_version: null,
      model_name: null,
      retrieved_product_ids: [],
      suggested_product_ids: [],
      latency_ms: null,
      tokens_used: null,
      cost_usd: null,
      is_simulated: true,
      deleted_at: null,
      created_at: '2026-11-10T08:01:10.000Z',
    },
    {
      id: '66666666-7777-4888-9999-aaaaaaaaaaaa',
      session_id: DEV_IDS.simSession,
      role: 'assistant',
      content:
        'Với ngân sách dưới 1 triệu cho shop mỹ phẩm trên TikTok Shop, bạn có thể chọn Template Landing Page Mỹ Phẩm Chuẩn TikTok Shop (490.000đ).',
      prompt_version: 'v1',
      model_name: 'stub-keyword-v1',
      retrieved_product_ids: [
        DEV_IDS.products.cosmeticsLanding,
        DEV_IDS.products.cosmeticsPrompts,
      ],
      suggested_product_ids: [DEV_IDS.products.cosmeticsLanding],
      latency_ms: 18,
      tokens_used: 0,
      cost_usd: 0,
      is_simulated: true,
      deleted_at: null,
      created_at: '2026-11-10T08:01:12.000Z',
    },
  ];

  const events: EventRecord[] = [
    {
      id: '77777777-1111-4222-8333-444444444444',
      assignment_id: DEV_IDS.simAssignment,
      visitor_id: 'vis_sim_demo_participant_01',
      variant: 'chatbot_on',
      event_name: 'purchase',
      scenario_run_id: '3e2b7a90-2b1c-4c88-b6a5-9901b2c3d4e5',
      session_id: DEV_IDS.simSession,
      product_id: DEV_IDS.products.cosmeticsLanding,
      properties: { order_id: DEV_IDS.simOrder, amount_vnd: 490000 },
      is_simulated: true,
      created_at: '2026-11-10T08:06:00.000Z',
    },
  ];

  return {
    users,
    products,
    productFiles,
    experiments,
    assignments,
    orders,
    orderItems,
    downloadGrants: [],
    scenarios,
    scenarioRuns,
    chatSessions,
    chatMessages,
    events,
  };
}
