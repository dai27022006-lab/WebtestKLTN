import { scryptSync } from 'node:crypto';

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
    fashionLookbook: '3d6b22e3-11a4-4d88-9c21-2e3f4a5b6c7d',
    fnbMenuOrder: '4e7c33f4-22b5-4e99-ad32-3f4a5b6c7d8e',
    multiChannelPrompts: '5f8d44a5-33c6-4fa0-be43-4a5b6c7d8e9f',
    orderSyncWorkflow: '6a9e55b6-44d7-40b1-cf54-5b6c7d8e9f01',
  },
  scenarios: {
    sc01: '9f1e2d3c-4b5a-4678-8901-abcdef123456',
    sc02: '8e2d3c4b-5a6b-4789-9012-bcdef1234567',
    sc03: '7d3c4b5a-6b7c-4890-a123-cdef12345678',
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

  const products: ProductRecord[] = [
    {
      id: DEV_IDS.products.cosmeticsLanding,
      slug: 'landing-page-my-pham-tiktok-shop',
      name: 'Template Landing Page Mỹ Phẩm Chuẩn TikTok Shop',
      short_description:
        'Mẫu landing page bán mỹ phẩm dưỡng da tối ưu mobile 375px, gắn giỏ hàng TikTok Shop & Shopee.',
      description:
        'Gói template Next.js + HTML/CSS do nhóm tự thiết kế dành riêng cho shop mỹ phẩm 1–3 nhân sự. Tập trung trình bày bảng thành phần dịu nhẹ, chứng nhận công bố sản phẩm, CTA chốt đơn nhanh qua TikTok Shop/Shopee và tuân thủ chính sách quảng cáo không cam kết trị liệu.',
      product_type: 'template',
      industry: 'Mỹ phẩm',
      price_vnd: 490000,
      demo_url: '/products/landing-page-my-pham-tiktok-shop',
      thumbnail_url: null,
      source_type: 'original',
      license_note:
        'Sản phẩm gốc do nhóm nghiên cứu tự thiết kế 100%, cấp quyền sử dụng thương mại cho 1 shop.',
      specs: {
        target_shop_size: '1-3 người',
        platforms: ['TikTok Shop', 'Shopee', 'Facebook'],
        deliverables: [
          'Source code template responsive 375px - 1440px',
          'Bảng nội dung chuẩn chính sách mỹ phẩm',
          'Hướng dẫn triển khai trong 30 phút',
        ],
        tech_stack: ['HTML5', 'CSS3', 'Next.js'],
        setup_time_minutes: 30,
        guide_summary: 'Thay logo, bảng giá và link sản phẩm TikTok Shop để chạy ngay.',
      },
      is_active: true,
      is_simulated: true,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: DEV_IDS.products.cosmeticsPrompts,
      slug: 'prompt-pack-mo-ta-my-pham',
      name: 'Prompt Pack Mô Tả & Kịch Bản Video Mỹ Phẩm',
      short_description:
        '60 prompt AI viết mô tả sản phẩm dưỡng da, kịch bản TikTok 30s không vi phạm từ cấm.',
      description:
        'Bộ 60 prompt tối ưu cho chủ shop mỹ phẩm viết mô tả chuẩn SEO Shopee/TikTok Shop, trả lời bình luận khách hỏi về loại da và dựng kịch bản video ngắn tránh các từ ngữ cam kết điều trị y khoa.',
      product_type: 'prompt_pack',
      industry: 'Mỹ phẩm',
      price_vnd: 290000,
      demo_url: null,
      thumbnail_url: null,
      source_type: 'original',
      license_note:
        'Bộ prompt biên soạn gốc bởi nhóm nội dung, dùng không giới hạn cho các kênh của 1 shop.',
      specs: {
        target_shop_size: '1-3 người',
        platforms: ['TikTok Shop', 'Shopee', 'Facebook'],
        deliverables: [
          '60 prompt phân loại theo tình huống bán hàng',
          'Checklist từ khóa bị hạn chế trên sàn TMĐT',
        ],
        setup_time_minutes: 15,
        guide_summary: 'Điền tên sản phẩm và tệp khách vào khung mẫu để tạo mô tả chuẩn.',
      },
      is_active: true,
      is_simulated: true,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: DEV_IDS.products.fashionLookbook,
      slug: 'template-lookbook-thoi-trang-local',
      name: 'Template Lookbook Thời Trang Shop Nhỏ',
      short_description:
        'Giao diện trưng bày bộ sưu tập quần áo kèm bảng size trực quan và nút đặt hàng nhanh.',
      description:
        'Thiết kế dành cho shop thời trang nữ/unisex bán trên Instagram, Facebook và Shopee. Hỗ trợ hiển thị ảnh lookbook theo mùa, bảng quy đổi size rõ ràng trên điện thoại và form giữ đơn nhanh cho khách xem live.',
      product_type: 'template',
      industry: 'Thời trang',
      price_vnd: 590000,
      demo_url: '/products/template-lookbook-thoi-trang-local',
      thumbnail_url: null,
      source_type: 'original',
      license_note:
        'Mã nguồn thiết kế gốc bởi nhóm tác giả, hỗ trợ tùy biến màu sắc theo nhận diện shop.',
      specs: {
        target_shop_size: '1-5 người',
        platforms: ['Instagram', 'Facebook', 'Shopee'],
        deliverables: [
          'Template Lookbook + Bảng size responsive',
          'Bộ banner kích thước chuẩn mạng xã hội',
        ],
        tech_stack: ['HTML5', 'CSS3', 'TypeScript'],
        setup_time_minutes: 40,
      },
      is_active: true,
      is_simulated: true,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: DEV_IDS.products.fnbMenuOrder,
      slug: 'template-menu-dat-mon-fnb-mini',
      name: 'Template Menu & Đặt Món Nhanh Quán F&B Nhỏ',
      short_description:
        'Trang menu điện tử quét QR, chọn topping và gửi đơn chốt nhanh qua Zalo/Messenger.',
      description:
        'Giải pháp gọn nhẹ cho quán đồ uống, tiệm bánh online hoặc bếp nhà làm quy mô 1–3 người. Khách hàng chọn món, ghi chú độ ngọt/đá trên điện thoại và gửi tóm tắt đơn thẳng về kênh chat của chủ quán.',
      product_type: 'template',
      industry: 'F&B',
      price_vnd: 450000,
      demo_url: '/products/template-menu-dat-mon-fnb-mini',
      thumbnail_url: null,
      source_type: 'adapted',
      license_note:
        'Chuyển thể và tối ưu lại từ cấu trúc giao diện mở nội bộ, cấp phép sử dụng cho 1 chi nhánh.',
      specs: {
        target_shop_size: '1-3 người',
        platforms: ['Zalo', 'Facebook', 'QR tại quán'],
        deliverables: [
          'Trang Menu tương tác + giỏ hàng mini',
          'File QR code mẫu đặt tại quầy',
        ],
        tech_stack: ['HTML5', 'CSS3', 'JavaScript'],
        setup_time_minutes: 25,
      },
      is_active: true,
      is_simulated: true,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: DEV_IDS.products.multiChannelPrompts,
      slug: 'prompt-pack-chot-don-da-kenh',
      name: 'Prompt Pack Chăm Sóc Khách & Chốt Đơn Đa Kênh',
      short_description:
        '50 kịch bản phản hồi inbox, xử lý từ chối giá và nhắc đơn hoàn thành cho chủ shop bận rộn.',
      description:
        'Phù hợp cho mọi ngành hàng bán lẻ trên Shopee, TikTok Shop và Facebook. Giúp chủ shop soạn nhanh mẫu trả lời đồng nhất về phí ship, đổi trả, giữ chân khách cũ mà vẫn giữ giọng văn thân thiện tự nhiên.',
      product_type: 'prompt_pack',
      industry: 'Đa ngành',
      price_vnd: 250000,
      demo_url: null,
      thumbnail_url: null,
      source_type: 'original',
      license_note:
        'Tài liệu biên soạn gốc bởi nhóm đề tài, kèm file Notion và PDF tải về.',
      specs: {
        target_shop_size: '1-3 người',
        platforms: ['Shopee', 'TikTok Shop', 'Facebook', 'Zalo'],
        deliverables: [
          '50 mẫu prompt trả lời khách theo ngữ cảnh',
          'Bảng mẫu tin nhắn nhanh (Quick Reply)',
        ],
        setup_time_minutes: 10,
      },
      is_active: true,
      is_simulated: true,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: DEV_IDS.products.orderSyncWorkflow,
      slug: 'workflow-dong-bo-don-hang-google-sheet',
      name: 'Workflow Tự Động Ghi Đơn & Cảnh Báo Tồn Kho',
      short_description:
        'Luồng tự động hóa đồng bộ đơn mới về Google Sheets và gửi thông báo Telegram/Zalo trong 1 phút.',
      description:
        'Mẫu workflow n8n/Make đơn giản cho shop nhỏ không cần phần mềm ERP cồng kềnh. Tự động ghi nhận đơn hàng mới vào Google Sheets, tính doanh thu ngày và nhắn tin cảnh báo khi sản phẩm sắp hết hàng.',
      product_type: 'workflow',
      industry: 'Đa ngành',
      price_vnd: 690000,
      demo_url: null,
      thumbnail_url: null,
      source_type: 'original',
      license_note:
        'Template workflow JSON do nhóm tự xây dựng, kèm video hướng dẫn từng bước.',
      specs: {
        target_shop_size: '1-5 người',
        platforms: ['Google Sheets', 'Telegram', 'Webhook'],
        deliverables: [
          'File JSON workflow nhập 1 chạm',
          'Mẫu Google Sheets quản lý đơn & tồn kho',
        ],
        tech_stack: ['n8n / Make', 'Google Sheets'],
        setup_time_minutes: 45,
      },
      is_active: true,
      is_simulated: true,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    },
  ];

  const productFiles: ProductFileRecord[] = products.map((product) => ({
    id: product.id.replace(/^.{8}/, 'f0000000'),
    product_id: product.id,
    file_name: `${product.slug}-v1.0.0.json`,
    storage_bucket: 'product-deliverables',
    storage_path: `deliverables/${product.slug}/bundle-v1.0.0.json`,
    file_size_bytes: 24576,
    mime_type: 'application/json',
    version: '1.0.0',
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

  const scenarios: ScenarioRecord[] = [
    {
      id: DEV_IDS.scenarios.sc01,
      code: 'SC-01',
      title: 'Kịch bản 1: Shop mỹ phẩm dưỡng da trên TikTok Shop',
      prompt_text:
        'Bạn đang vận hành shop mỹ phẩm 2 người trên TikTok Shop, ngân sách dưới 1.000.000đ. Hãy chọn gói sản phẩm phù hợp nhất để làm trang bán hàng tối ưu điện thoại và tuân thủ chính sách không cam kết trị liệu.',
      industry: 'Mỹ phẩm',
      budget_vnd: 1000000,
      difficulty: 'medium',
      expected_product_id: DEV_IDS.products.cosmeticsLanding,
      acceptable_product_ids: [DEV_IDS.products.cosmeticsPrompts],
      rubric_note:
        'Đáp án chuẩn là Template Landing Page Mỹ Phẩm (490k); chấp nhận Prompt Pack Mỹ Phẩm (290k) nếu giải thích rõ.',
      sort_order: 1,
      is_active: true,
      is_simulated: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: DEV_IDS.scenarios.sc02,
      code: 'SC-02',
      title: 'Kịch bản 2: Shop thời trang cần trang Lookbook & bảng size',
      prompt_text:
        'Bạn quản lý shop thời trang local 2 người, ngân sách tối đa 700.000đ. Bạn cần một trang giới thiệu bộ sưu tập kèm bảng quy đổi size trực quan cho khách xem từ Instagram và Shopee.',
      industry: 'Thời trang',
      budget_vnd: 700000,
      difficulty: 'medium',
      expected_product_id: DEV_IDS.products.fashionLookbook,
      acceptable_product_ids: [DEV_IDS.products.multiChannelPrompts],
      rubric_note:
        'Đáp án chuẩn là Template Lookbook Thời Trang (590k), phù hợp ngân sách 700k.',
      sort_order: 2,
      is_active: true,
      is_simulated: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: DEV_IDS.scenarios.sc03,
      code: 'SC-03',
      title: 'Kịch bản 3: Quán đồ uống nhỏ cần menu QR đặt món nhanh',
      prompt_text:
        'Quán đồ uống của bạn có 2 nhân sự, ngân sách dưới 600.000đ, muốn khách quét mã QR để xem menu và gửi đơn nhanh qua Zalo thay vì nhắn tin hỏi từng món.',
      industry: 'F&B',
      budget_vnd: 600000,
      difficulty: 'easy',
      expected_product_id: DEV_IDS.products.fnbMenuOrder,
      acceptable_product_ids: [],
      rubric_note: 'Đáp án chuẩn là Template Menu & Đặt Món Nhanh F&B (450k).',
      sort_order: 3,
      is_active: true,
      is_simulated: true,
      created_at: now,
      updated_at: now,
    },
  ];

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
