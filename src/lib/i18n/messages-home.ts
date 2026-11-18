import type { AppLocale } from './types';

export interface HomeMessages {
  typewriterPrefix: string;
  typewriterWords: [string, string, string, string, string];
  heroBadge: string;
  heroTitleStart: string;
  heroTitleLead: string;
  heroDesc: string;
  ctaCatalog: string;
  ctaAskAdvisor: string;
  statLabels: {
    packages: string;
    industries: string;
    setup: string;
    priceFrom: string;
  };
  scrollCue: string;
  heroMockupTabs: {
    template: {
      label: string;
      highlightTitle: string;
      highlightMeta: string;
      chartTitle: string;
      kpis: [{ label: string; value: string }, { label: string; value: string }, { label: string; value: string }, { label: string; value: string }];
      advisorCopy: string;
      advisorTip: string;
    };
    prompt_pack: {
      label: string;
      highlightTitle: string;
      highlightMeta: string;
      chartTitle: string;
      kpis: [{ label: string; value: string }, { label: string; value: string }, { label: string; value: string }, { label: string; value: string }];
      advisorCopy: string;
      advisorTip: string;
    };
    workflow: {
      label: string;
      highlightTitle: string;
      highlightMeta: string;
      chartTitle: string;
      kpis: [{ label: string; value: string }, { label: string; value: string }, { label: string; value: string }, { label: string; value: string }];
      advisorCopy: string;
      advisorTip: string;
    };
    sidebarFooter1: string;
    sidebarFooter2: string;
    brandBadge: string;
    playTour: string;
    pauseTour: string;
    pauseLabel: string;
    resumeLabel: string;
  };
  categoriesEyebrow: string;
  categoriesHeading: string;
  categoriesCards: Array<{ title: string; cta: string }>;
  featuredEyebrow: string;
  featuredHeading: string;
  featuredTabs: Array<{ value: '' | 'template' | 'prompt_pack' | 'workflow'; label: string }>;
  featuredViewAll: string;
  featuredQuickAdd: string;
  featuredAdded: string;
  featuredDetail: string;
  benefitsEyebrow: string;
  benefitsHeading: string;
  benefitsLead: string;
  benefitsItems: Array<{ title: string; desc: string }>;
  standardsEyebrow: string;
  standardsHeading: string;
  standardsItems: string[];
  screensEyebrow: string;
  screensHeading: string;
  screensItems: Array<{
    category: string;
    title: string;
    desc: string;
    tags: [string, string];
  }>;
  pilotEyebrow: string;
  pilotHeading: string;
  pilotDisclaimer: string;
  pilotCases: Array<{
    code: string;
    persona: string;
    channel: string;
    budget: string;
    summary: string;
    ctaLabel: string;
  }>;
  faqEyebrow: string;
  faqHeading: string;
  faqItems: Array<{ q: string; a: string }>;
  ctaBandEyebrow: string;
  ctaBandHeading: string;
  ctaBandDesc: string;
  ctaBandPrimary: string;
  ctaBandSecondary: string;
}

export const HOME_MESSAGES: Record<AppLocale, HomeMessages> = {
  vi: {
    typewriterPrefix: 'Bán hàng nhanh hơn với',
    typewriterWords: [
      'Web Bán Hàng',
      'Prompt Chốt Đơn',
      'Workflow Tự Động',
      'Trang Lookbook',
      'Kịch Bản Bán Hàng',
    ],
    heroBadge: 'Kho giải pháp số cho shop nhỏ 1–3 người',
    heroTitleStart: 'Bộ công cụ sẵn sàng triển khai cho',
    heroTitleLead: 'chủ shop bán hàng đa kênh',
    heroDesc:
      'Chọn nhanh Template Website 375px, Prompt Pack AI viết bài không vướng từ cấm và Workflow gom đơn tự động — kèm Trợ lý tư vấn chọn gói đúng ngân sách trong vài phút.',
    ctaCatalog: 'Khám phá gói số',
    ctaAskAdvisor: 'Hỏi Trợ lý tư vấn',
    statLabels: {
      packages: 'Gói chuyên biệt',
      industries: 'Ngành chủ lực',
      setup: 'Cài đặt nhanh',
      priceFrom: 'Chỉ từ / gói',
    },
    scrollCue: 'Cuộn xuống khám phá bên dưới',
    heroMockupTabs: {
      template: {
        label: 'Giao diện Web',
        highlightTitle: 'Landing Page Mỹ Phẩm TikTok Shop',
        highlightMeta: 'Chuẩn Mobile 375px • Cài đặt ~30 phút',
        chartTitle: 'Tỷ lệ bấm mua trên di động',
        kpis: [
          { label: 'Danh mục', value: '6 mẫu' },
          { label: 'Cài đặt', value: '~30 phút' },
          { label: 'Tối ưu', value: '375px' },
          { label: 'Mức giá', value: '450k–650k' },
        ],
        advisorCopy: 'Phù hợp ngân sách & kênh bán TikTok Shop, Shopee.',
        advisorTip: 'Gợi ý nổi bật • 490.000đ',
      },
      prompt_pack: {
        label: 'Bộ Prompt AI',
        highlightTitle: '60 Prompt Kịch Bản & Mô Tả Chuẩn Sàn',
        highlightMeta: 'Tránh từ cấm • Notion + PDF tải ngay',
        chartTitle: 'Tốc độ lên bài bán hàng mỗi ngày',
        kpis: [
          { label: 'Danh mục', value: '4 bộ' },
          { label: 'Lên bài', value: '~15 phút' },
          { label: 'Thư viện', value: '60+ câu' },
          { label: 'Mức giá', value: '250k–350k' },
        ],
        advisorCopy: 'Soạn mô tả & kịch bản live đúng quy chuẩn sàn TMĐT.',
        advisorTip: 'Gợi ý nổi bật • 290.000đ',
      },
      workflow: {
        label: 'Luồng Tự Động',
        highlightTitle: 'Đồng Bộ Đơn Hàng Về Sheets & Zalo',
        highlightMeta: 'Nhập JSON 1 chạm • Cảnh báo tồn kho',
        chartTitle: 'Hiệu suất xử lý đơn đa kênh',
        kpis: [
          { label: 'Danh mục', value: '2 luồng' },
          { label: 'Nền tảng', value: 'n8n / Make' },
          { label: 'Kết nối', value: 'Sheets+Zalo' },
          { label: 'Mức giá', value: '640k–690k' },
        ],
        advisorCopy: 'Gom đơn Shopee, TikTok, Facebook tránh sót đơn giờ cao điểm.',
        advisorTip: 'Gợi ý nổi bật • 690.000đ',
      },
      sidebarFooter1: 'Trợ lý tư vấn',
      sidebarFooter2: 'Xem thử 375px',
      brandBadge: 'Bản quyền rõ',
      playTour: 'Chạy tự động',
      pauseTour: 'Tạm dừng',
      pauseLabel: 'Tạm dừng',
      resumeLabel: 'Phát tiếp',
    },
    categoriesEyebrow: 'Danh mục theo nhu cầu',
    categoriesHeading: 'Chọn nhanh theo nhóm giải pháp hoặc ngành hàng',
    categoriesCards: [
      { title: 'Template Website', cta: 'Xem mẫu web' },
      { title: 'Prompt Pack AI', cta: 'Xem bộ prompt' },
      { title: 'Workflow Tự Động', cta: 'Xem luồng mẫu' },
      { title: 'Shop Mỹ Phẩm', cta: 'Lọc ngành mỹ phẩm' },
      { title: 'Shop Thời Trang', cta: 'Lọc ngành thời trang' },
      { title: 'Gia Dụng & F&B', cta: 'Lọc F&B & Quán nhỏ' },
    ],
    featuredEyebrow: 'Kho gói nổi bật',
    featuredHeading: 'Các giải pháp chủ lực đang sẵn sàng triển khai',
    featuredTabs: [
      { value: '', label: 'Tất cả giải pháp' },
      { value: 'template', label: 'Template Website' },
      { value: 'prompt_pack', label: 'Prompt Pack' },
      { value: 'workflow', label: 'Workflow Tự Động' },
    ],
    featuredViewAll: 'Xem toàn bộ 12 sản phẩm →',
    featuredQuickAdd: 'Thêm giỏ',
    featuredAdded: 'Đã thêm',
    featuredDetail: 'Chi tiết',
    benefitsEyebrow: 'Vì sao shop 1–3 người chọn DreamTeam?',
    benefitsHeading: 'Tinh gọn từng thao tác để bán được hàng ngay',
    benefitsLead:
      'Mỗi gói đều tập trung vào điểm chạm tạo đơn hàng thật trên di động thay vì cấu hình kỹ thuật phức tạp.',
    benefitsItems: [
      {
        title: 'Tư vấn chọn gói theo ngân sách',
        desc: 'Trợ lý tư vấn lọc đúng gói theo ngành hàng, kênh bán và mức ngân sách dự kiến của shop.',
      },
      {
        title: 'Xem thử giao diện sống 1280px ↔ 375px',
        desc: 'Kiểm tra trực tiếp bố cục thật trên cả màn hình máy tính và điện thoại ngay tại trang sản phẩm.',
      },
      {
        title: 'Minh bạch bản quyền 3 cấp',
        desc: 'Mỗi gói đều ghi rõ phân loại thiết kế gốc, điều chỉnh có nguồn hoặc bản quyền hợp lệ.',
      },
      {
        title: 'Đặt hàng thử nghiệm không rủi ro',
        desc: 'Kiểm tra trọn vẹn quy trình giỏ hàng, tạo đơn và bàn giao file ở chế độ thử nghiệm miễn phí.',
      },
      {
        title: 'Nhận file tức thì qua link riêng',
        desc: 'Ngay khi đơn được xác nhận, hệ thống cấp liên kết tải riêng tư thời hạn 7 ngày và 5 lượt tải.',
      },
      {
        title: 'Hướng dẫn cài đặt 15–30 phút',
        desc: 'Kèm tài liệu từng bước ngắn gọn để chủ shop tự thay nội dung và đưa vào bán hàng ngay.',
      },
      {
        title: 'Tối ưu cho team 1–3 người',
        desc: 'Tinh gọn thao tác rườm rà, tập trung vào các nút bấm chốt đơn và mẫu nội dung hay dùng nhất.',
      },
      {
        title: 'Đồng bộ Shopee · TikTok · Facebook',
        desc: 'Bố cục và kịch bản bán hàng được viết sẵn theo thói quen mua hàng đa kênh của khách hàng.',
      },
    ],
    standardsEyebrow: 'Tiêu chuẩn chất lượng',
    standardsHeading: '12 cam kết trải nghiệm đồng bộ trên toàn hệ thống',
    standardsItems: [
      'Tốc độ tải tức thì',
      'Chuẩn Mobile 375px',
      'Giao diện Sáng & Tối',
      'Trợ lý Tư vấn AI',
      'Tìm kiếm theo nhu cầu',
      'Cấu trúc Sạch Chuẩn SEO',
      'Link tải bảo mật 7 ngày',
      'Bản quyền Minh bạch',
      'Cài đặt Nhanh 15 phút',
      'Dễ sửa Không Cần Code Sâu',
      'Tối ưu Đa kênh Bán hàng',
      'Thanh toán Thử nghiệm An toàn',
    ],
    screensEyebrow: 'Trải nghiệm trọn luồng',
    screensHeading: 'Xem trước các màn hình chính của cửa hàng số',
    screensItems: [
      {
        category: 'Danh mục sản phẩm',
        title: 'Tìm Kiếm & Lọc Theo Ngành',
        desc: 'Lọc nhanh theo loại sản phẩm số, ngành hàng, mức ngân sách và sắp xếp theo giá VND.',
        tags: ['Lọc đa chiều', 'Ngân sách rõ'],
      },
      {
        category: 'Chi tiết sản phẩm',
        title: 'Xem Thử 1280px ↔ 375px',
        desc: 'Tương tác trực tiếp với giao diện mẫu trên Desktop, Mobile 375px và đối chiếu thông tin bản quyền.',
        tags: ['Live HTML', 'Phóng to toàn khung'],
      },
      {
        category: 'Giỏ hàng',
        title: 'Quản Lý Gói Đã Chọn',
        desc: 'Cộng dồn chính xác tổng tiền VND theo từng gói sản phẩm trước khi chuyển qua bước xác nhận đơn.',
        tags: ['Tổng hợp tức thì', 'Dễ chỉnh sửa'],
      },
      {
        category: 'Thanh toán thử nghiệm',
        title: 'Xác Nhận Đơn Không Rủi Ro',
        desc: 'Kiểm chứng toàn bộ luồng đặt hàng 3 bước ở chế độ thử nghiệm miễn phí trước khi tải tài nguyên.',
        tags: ['Không thu tiền thật', 'Xác nhận 1 chạm'],
      },
      {
        category: 'Đơn hàng & Kho tải',
        title: 'Kho Link Tải File 7 Ngày',
        desc: 'Theo dõi lịch sử đơn đã tạo và tải trực tiếp gói tài nguyên với giới hạn 5 lượt trong 7 ngày.',
        tags: ['Link tải riêng', 'Hạn 7 ngày'],
      },
      {
        category: 'Tài khoản shop',
        title: 'Thống Kê Đơn & Quản Lý Gói',
        desc: 'Xem bảng thống kê 5 chỉ số chi tiêu, lượt tải còn lại và tra cứu gói đã mua bất cứ lúc nào.',
        tags: ['Thống kê 5 chỉ số', 'Bảo mật phiên'],
      },
    ],
    pilotEyebrow: 'Tình huống thực tế',
    pilotHeading: 'Phản hồi từ đợt chạy thử nghiệm mẫu',
    pilotDisclaimer:
      'Ghi nhận minh bạch từ các kịch bản thử nghiệm mẫu theo từng ngành hàng của chủ shop nhỏ — không bịa đặt số liệu đánh giá thương mại.',
    pilotCases: [
      {
        code: 'MP',
        persona: 'Chủ shop Mỹ phẩm dưỡng da',
        channel: 'TikTok Shop • Quy mô 2 người',
        budget: 'Ngân sách ≤ 1.000.000đ',
        summary:
          'Ưu tiên mẫu landing page chuẩn mobile 375px, hiển thị rõ số công bố sản phẩm và bảng thành phần dịu nhẹ để gắn link từ video ngắn mà không bị vướng từ cấm.',
        ctaLabel: 'Xem gói ngành Mỹ phẩm',
      },
      {
        code: 'TT',
        persona: 'Chủ shop Thời trang local',
        channel: 'Instagram & Shopee • 2 người',
        budget: 'Ngân sách ≤ 700.000đ',
        summary:
          'Cần trang trưng bày bộ sưu tập lookbook kèm bảng quy đổi size trực quan để gửi cho khách đang xem livestream, giúp giảm thời gian nhắn hỏi số đo.',
        ctaLabel: 'Xem gói ngành Thời trang',
      },
      {
        code: 'FB',
        persona: 'Quán đồ uống & Bếp nhỏ',
        channel: 'Quét QR tại quầy & Zalo • 2 người',
        budget: 'Ngân sách ≤ 600.000đ',
        summary:
          'Khách tại bàn quét mã QR xem thực đơn trên điện thoại, chọn mức đường đá và gửi tóm tắt đơn thẳng sang Zalo thay vì phải chờ nhắn hỏi từng món.',
        ctaLabel: 'Xem gói ngành F&B',
      },
      {
        code: 'ĐK',
        persona: 'Shop đa kênh giờ cao điểm',
        channel: 'Shopee, TikTok, Facebook • 1–3 người',
        budget: 'Ngân sách ≤ 700.000đ',
        summary:
          'Dùng bộ prompt trả lời tin nhắn nhanh kết hợp luồng tự động gom đơn về Google Sheets và báo tin Telegram để không bỏ sót đơn vào khung giờ cao điểm.',
        ctaLabel: 'Xem gói Đa ngành',
      },
    ],
    faqEyebrow: 'Giải đáp nhanh',
    faqHeading: 'Câu hỏi thường gặp về sản phẩm & bản quyền',
    faqItems: [
      {
        q: 'Sau khi tải gói sản phẩm về, shop nhỏ có thể dùng ngay như thế nào?',
        a: 'Mỗi gói đều đi kèm tài liệu hướng dẫn triển khai 15–30 phút. Với Template Website bạn chỉ cần thay logo, ảnh sản phẩm và link sàn; với Prompt Pack có sẵn mẫu trên Notion/PDF; với Workflow có file JSON nhập 1 chạm.',
      },
      {
        q: 'Thanh toán thử nghiệm (Sandbox) trên hệ thống có trừ tiền thật không?',
        a: 'Hoàn toàn không. Cửa hàng hiện đang bật chế độ thanh toán thử nghiệm để bạn tự kiểm tra trọn vẹn quy trình tạo đơn, xác nhận thanh toán và nhận link tải file mà không thu tiền thật.',
      },
      {
        q: 'Ý nghĩa 3 cấp bản quyền Thiết kế gốc, Điều chỉnh có nguồn và Bản quyền hợp lệ là gì?',
        a: 'Thiết kế gốc là gói do đội ngũ DreamTeam tự xây dựng 100%; Điều chỉnh có nguồn là mẫu tham khảo mở được tối ưu lại cho shop nhỏ; Bản quyền hợp lệ là tài nguyên có giấy phép thương mại rõ ràng.',
      },
      {
        q: 'Link tải file sau khi xác nhận đơn có hiệu lực bao lâu?',
        a: 'Mỗi gói trong đơn đã thanh toán đều được cấp mã token tải riêng tư có hạn 7 ngày và tối đa 5 lượt tải để đảm bảo an toàn tài nguyên số.',
      },
    ],
    ctaBandEyebrow: 'Bắt đầu chỉ trong 2 phút',
    ctaBandHeading: 'Tìm ngay bộ công cụ hợp ngành & ngân sách của shop',
    ctaBandDesc:
      'Xem thử trực tiếp giao diện mẫu trên Desktop & Mobile 375px hoặc nhắn Trợ lý tư vấn lọc giúp bạn trong danh mục thực tế.',
    ctaBandPrimary: 'Mở danh mục 12 gói số',
    ctaBandSecondary: 'Nhắn Trợ lý ngay',
  },
  en: {
    typewriterPrefix: 'Launch faster with',
    typewriterWords: [
      'Sales Websites',
      'Ad-Safe Prompts',
      'Order Workflows',
      'Lookbook Pages',
      'Live Scripts',
    ],
    heroBadge: 'Digital Kits for Lean 1–3 Person Shops',
    heroTitleStart: 'Ready-to-ship digital toolkits for',
    heroTitleLead: 'multi-channel small shop owners',
    heroDesc:
      'Pick 375px mobile-ready Website Templates, policy-safe AI Prompt Packs, and Automated Order Workflows—backed by a smart advisor matching your budget in minutes.',
    ctaCatalog: 'Explore Digital Kits',
    ctaAskAdvisor: 'Ask AI Advisor',
    statLabels: {
      packages: 'Curated Kits',
      industries: 'Key Niches',
      setup: 'Fast Setup',
      priceFrom: 'Starting From',
    },
    scrollCue: 'Scroll down to explore',
    heroMockupTabs: {
      template: {
        label: 'Web Templates',
        highlightTitle: 'Skincare TikTok Shop Landing Page',
        highlightMeta: 'Mobile 375px Ready • ~30 min setup',
        chartTitle: 'Mobile add-to-cart interaction rate',
        kpis: [
          { label: 'Templates', value: '6 kits' },
          { label: 'Setup', value: '~30 min' },
          { label: 'Viewport', value: '375px' },
          { label: 'Pricing', value: '~$18–26' },
        ],
        advisorCopy: 'Matched to skincare niche, budget & TikTok Shop funnel.',
        advisorTip: 'Top Pick • 490.000đ (~$19)',
      },
      prompt_pack: {
        label: 'AI Prompt Packs',
        highlightTitle: '60 Ad-Safe Product & Video Prompts',
        highlightMeta: 'Policy-Safe • Notion + PDF included',
        chartTitle: 'Daily content publishing speed',
        kpis: [
          { label: 'Libraries', value: '4 packs' },
          { label: 'Drafting', value: '~15 min' },
          { label: 'Prompts', value: '60+ lines' },
          { label: 'Pricing', value: '~$10–14' },
        ],
        advisorCopy: 'Write listings & 30s live scripts compliant with marketplace rules.',
        advisorTip: 'Top Pick • 290.000đ (~$11)',
      },
      workflow: {
        label: 'Auto Workflows',
        highlightTitle: 'Sync Orders to Sheets & Alerts',
        highlightMeta: '1-Click JSON Import • Low-Stock Pings',
        chartTitle: 'Multi-channel order handling efficiency',
        kpis: [
          { label: 'Workflows', value: '2 flows' },
          { label: 'Engines', value: 'n8n / Make' },
          { label: 'Targets', value: 'Sheets+Alert' },
          { label: 'Pricing', value: '~$25–27' },
        ],
        advisorCopy: 'Capture Shopee, TikTok & social rush-hour orders with zero drops.',
        advisorTip: 'Top Pick • 690.000đ (~$27)',
      },
      sidebarFooter1: 'AI Advisor',
      sidebarFooter2: '375px Preview',
      brandBadge: 'Clear License',
      playTour: 'Autoplay',
      pauseTour: 'Pause',
      pauseLabel: 'Pause',
      resumeLabel: 'Resume',
    },
    categoriesEyebrow: 'Browse by Format or Industry',
    categoriesHeading: 'Filter quickly by kit type or business vertical',
    categoriesCards: [
      { title: 'Website Templates', cta: 'Browse templates' },
      { title: 'AI Prompt Packs', cta: 'Browse prompts' },
      { title: 'Automation Workflows', cta: 'Browse workflows' },
      { title: 'Skincare Shops', cta: 'Filter Skincare' },
      { title: 'Fashion Brands', cta: 'Filter Fashion' },
      { title: 'Cafés & F&B', cta: 'Filter F&B' },
    ],
    featuredEyebrow: 'Featured Digital Kits',
    featuredHeading: 'Ready-to-deploy kits for lean retail teams',
    featuredTabs: [
      { value: '', label: 'All Solutions' },
      { value: 'template', label: 'Website Templates' },
      { value: 'prompt_pack', label: 'Prompt Packs' },
      { value: 'workflow', label: 'Workflows' },
    ],
    featuredViewAll: 'Browse all 12 kits →',
    featuredQuickAdd: 'Add to cart',
    featuredAdded: 'Added',
    featuredDetail: 'Details',
    benefitsEyebrow: 'Why 1–3 person teams pick DreamTeam',
    benefitsHeading: 'Trim complexity, focus on closing orders',
    benefitsLead:
      'Every package focuses on mobile conversion touchpoints rather than bloated enterprise configuration.',
    benefitsItems: [
      {
        title: 'Budget-Aware Package Matching',
        desc: 'The AI advisor narrows down kits by vertical, channel, and spending cap automatically.',
      },
      {
        title: 'Live 1280px ↔ 375px HTML Previews',
        desc: 'Interact directly with template layouts across Desktop and Mobile viewports before adding to cart.',
      },
      {
        title: '3-Tier License Transparency',
        desc: 'Every item explicitly declares Original Design, Attributed Adaptation, or Commercial License rights.',
      },
      {
        title: 'Risk-Free Sandbox Ordering',
        desc: 'Verify the entire cart, order confirmation, and instant file delivery flow with zero real charge.',
      },
      {
        title: 'Instant Private Download Links',
        desc: 'Paid orders issue private tokenized links valid for 7 days and up to 5 downloads per item.',
      },
      {
        title: '15–30 Minute Setup Guides',
        desc: 'Step-by-step plain-language instructions so non-technical owners can swap logos & ship fast.',
      },
      {
        title: 'Right-Sized for 1–3 Staff',
        desc: 'Zero unnecessary bloat—just conversion sections, reusable prompt cards, and lean automations.',
      },
      {
        title: 'Multi-Channel Marketplace Fit',
        desc: 'Crafted around real shopper habits on TikTok Shop, Shopee, Instagram, and direct messaging.',
      },
    ],
    standardsEyebrow: 'Platform Standards',
    standardsHeading: '12 Quality Guarantees Across Every Package',
    standardsItems: [
      'Fast First Load',
      'Mobile 375px First',
      'Light & Dark Themes',
      'AI Package Advisor',
      'Smart Filtering',
      'Clean SEO Markup',
      '7-Day Private Links',
      'Clear Licensing',
      '15-Min Setup Guide',
      'No Heavy Coding',
      'Multi-Channel Ready',
      'Safe Sandbox Checkout',
    ],
    screensEyebrow: 'End-to-End Walkthrough',
    screensHeading: 'Explore the core storefront experiences',
    screensItems: [
      {
        category: 'Product Catalog',
        title: 'Search & Filter by Niche',
        desc: 'Filter instantly by kit format, industry vertical, budget ceiling, and price sorting.',
        tags: ['Multi-Filter', 'Clear Pricing'],
      },
      {
        category: 'Product Detail',
        title: 'Live 1280px ↔ 375px Preview',
        desc: 'Switch Desktop and Mobile viewports live inside the page and inspect license details.',
        tags: ['Live HTML', 'Fullscreen Zoom'],
      },
      {
        category: 'Shopping Cart',
        title: 'Manage Selected Kits',
        desc: 'Real-time subtotal calculation before moving to order confirmation.',
        tags: ['Live Total', 'Easy Edit'],
      },
      {
        category: 'Sandbox Checkout',
        title: 'Risk-Free Order Confirmation',
        desc: 'Test the complete 3-step checkout workflow with zero real charges.',
        tags: ['Zero Charge', '1-Click Confirm'],
      },
      {
        category: 'Orders & Downloads',
        title: '7-Day Download Library',
        desc: 'Track order history and download delivered bundles up to 5 times within 7 days.',
        tags: ['Private Token', '7-Day Access'],
      },
      {
        category: 'Shop Account',
        title: '5-Metric Shop Dashboard',
        desc: 'Review spending, kit mix, remaining download quota, and recent transactions in one view.',
        tags: ['5-Factor Stats', 'Secure Session'],
      },
    ],
    pilotEyebrow: 'Pilot Use Cases',
    pilotHeading: 'Feedback from Pilot Trial Scenarios',
    pilotDisclaimer:
      'Transparent notes gathered from pilot test scenarios across lean shop verticals—zero fabricated commercial testimonials.',
    pilotCases: [
      {
        code: 'SK',
        persona: 'Skincare Brand Owner',
        channel: 'TikTok Shop • 2 staff',
        budget: 'Budget ≤ ~$39',
        summary:
          'Prioritized a 375px mobile landing page showcasing cosmetic registration IDs and mild ingredient cards compliant with ad moderation rules.',
        ctaLabel: 'Explore Skincare Kits',
      },
      {
        code: 'FA',
        persona: 'Indie Fashion Boutique',
        channel: 'Instagram & Shopee • 2 staff',
        budget: 'Budget ≤ ~$28',
        summary:
          'Needed a lookbook gallery paired with an intuitive size-conversion guide for livestream viewers to cut repetitive DM sizing questions.',
        ctaLabel: 'Explore Fashion Kits',
      },
      {
        code: 'FB',
        persona: 'Neighborhood Café & Bakery',
        channel: 'Tabletop QR & Chat • 2 staff',
        budget: 'Budget ≤ ~$24',
        summary:
          'Dine-in customers scan a tabletop QR code on mobile, select sweetness/ice options, and send a formatted order summary cleanly.',
        ctaLabel: 'Explore F&B Kits',
      },
      {
        code: 'MC',
        persona: 'Multi-Channel Peak Seller',
        channel: 'Shopee, TikTok, Social • 1–3 staff',
        budget: 'Budget ≤ ~$28',
        summary:
          'Combined quick inbox prompt templates with automated Google Sheets order logging and Telegram alerts to eliminate missed rush-hour sales.',
        ctaLabel: 'Explore Multi-Channel',
      },
    ],
    faqEyebrow: 'Quick Answers',
    faqHeading: 'Frequently Asked Questions & Licensing',
    faqItems: [
      {
        q: 'How fast can a small shop deploy a downloaded package?',
        a: 'Every kit comes with a 15–30 minute setup guide. Website Templates only need your logo, photos, and store links; Prompt Packs provide copy-ready Notion/PDF templates; Workflows import via 1-click JSON.',
      },
      {
        q: 'Does the Sandbox checkout charge real money?',
        a: 'Never. The store runs in safe Sandbox checkout mode so you can verify cart, order creation, and instant file downloads with zero real billing.',
      },
      {
        q: 'What do the 3 license levels mean?',
        a: 'Original Design is built 100% by our team; Attributed Adaptation reworks open reference structures for small shops; Commercial License bundles verified commercial-use resources.',
      },
      {
        q: 'How long do private download links stay active?',
        a: 'Each paid item receives a tokenized private link valid for 7 days and up to 5 downloads.',
      },
    ],
    ctaBandEyebrow: 'Get Started in 2 Minutes',
    ctaBandHeading: 'Find the right toolkit for your vertical & budget',
    ctaBandDesc:
      'Test live templates across Desktop & 375px Mobile or ask the AI Advisor to shortlist the best match from our catalog.',
    ctaBandPrimary: 'Browse All 12 Kits',
    ctaBandSecondary: 'Ask AI Advisor',
  },
  ru: {
    typewriterPrefix: 'Продавайте быстрее с',
    typewriterWords: [
      'Веб-шаблонами',
      'AI-промптами',
      'Авто-сценариями',
      'Страницами Lookbook',
      'Скриптами эфиров',
    ],
    heroBadge: 'Цифровые наборы для команд 1–3 человек',
    heroTitleStart: 'Готовые инструменты быстрого запуска для',
    heroTitleLead: 'малых мультиканальных магазинов',
    heroDesc:
      'Мобильные шаблоны 375px, проверенные AI-промпты без стоп-слов и сценарии авто-учёта заказов — со встроенным подбором пакета под ваш бюджет за пару минут.',
    ctaCatalog: 'Открыть каталог',
    ctaAskAdvisor: 'Спросить AI-помощника',
    statLabels: {
      packages: 'Готовых пакетов',
      industries: 'Ключевых ниш',
      setup: 'Быстрый запуск',
      priceFrom: 'Цена от',
    },
    scrollCue: 'Листайте вниз для обзора',
    heroMockupTabs: {
      template: {
        label: 'Веб-шаблоны',
        highlightTitle: 'Лендинг косметики для TikTok Shop',
        highlightMeta: 'Адаптив Mobile 375px • Настройка ~30 мин',
        chartTitle: 'Конверсия кликов с мобильных устройств',
        kpis: [
          { label: 'Каталог', value: '6 тем' },
          { label: 'Запуск', value: '~30 мин' },
          { label: 'Экран', value: '375px' },
          { label: 'Цена', value: '~$18–26' },
        ],
        advisorCopy: 'Оптимально под бюджет и трафик TikTok Shop / Shopee.',
        advisorTip: 'Рекомендация • 490.000đ (~$19)',
      },
      prompt_pack: {
        label: 'Пакеты AI-промптов',
        highlightTitle: '60 промптов для карточек и видео',
        highlightMeta: 'Без стоп-слов • Notion + PDF сразу',
        chartTitle: 'Скорость подготовки контента в день',
        kpis: [
          { label: 'Наборы', value: '4 пака' },
          { label: 'Подготовка', value: '~15 мин' },
          { label: 'База', value: '60+ фраз' },
          { label: 'Цена', value: '~$10–14' },
        ],
        advisorCopy: 'Описания товаров и сценарии эфиров по правилам площадок.',
        advisorTip: 'Рекомендация • 290.000đ (~$11)',
      },
      workflow: {
        label: 'Автоматизация',
        highlightTitle: 'Синхронизация заказов в Sheets и Alerts',
        highlightMeta: 'Импорт JSON в 1 клик • Контроль остатков',
        chartTitle: 'Эффективность обработки заказов',
        kpis: [
          { label: 'Потоки', value: '2 схемы' },
          { label: 'Движок', value: 'n8n / Make' },
          { label: 'Связка', value: 'Sheets+TG' },
          { label: 'Цена', value: '~$25–27' },
        ],
        advisorCopy: 'Сбор заказов с разных площадок без потерь в часы пик.',
        advisorTip: 'Рекомендация • 690.000đ (~$27)',
      },
      sidebarFooter1: 'AI-помощник',
      sidebarFooter2: 'Вид 375px',
      brandBadge: 'Чистая лицензия',
      playTour: 'Автопоказ',
      pauseTour: 'Пауза',
      pauseLabel: 'Пауза',
      resumeLabel: 'Далее',
    },
    categoriesEyebrow: 'Выбор по формату или нише',
    categoriesHeading: 'Быстрый фильтр по типу решения и отрасли',
    categoriesCards: [
      { title: 'Веб-шаблоны', cta: 'Смотреть шаблоны' },
      { title: 'Пакеты AI-промптов', cta: 'Смотреть промпты' },
      { title: 'Сценарии Workflow', cta: 'Смотреть потоки' },
      { title: 'Косметика', cta: 'Ниша косметики' },
      { title: 'Одежда', cta: 'Ниша одежды' },
      { title: 'Кафе и F&B', cta: 'Ниша F&B' },
    ],
    featuredEyebrow: 'Избранные комплекты',
    featuredHeading: 'Готовые решения для быстрого внедрения',
    featuredTabs: [
      { value: '', label: 'Все решения' },
      { value: 'template', label: 'Веб-шаблоны' },
      { value: 'prompt_pack', label: 'Промпты AI' },
      { value: 'workflow', label: 'Автоматизация' },
    ],
    featuredViewAll: 'Все 12 комплектов →',
    featuredQuickAdd: 'В корзину',
    featuredAdded: 'Добавлено',
    featuredDetail: 'Подробнее',
    benefitsEyebrow: 'Почему команды 1–3 человек выбирают DreamTeam?',
    benefitsHeading: 'Минимум настроек — максимум фокуса на продажах',
    benefitsLead:
      'Каждый пакет сфокусирован на мобильной конверсии без сложной корпоративной настройки.',
    benefitsItems: [
      {
        title: 'Подбор по нише и бюджету',
        desc: 'AI-помощник отфильтрует каталог с учётом вашей отрасли, каналов и лимита расходов.',
      },
      {
        title: 'Живой предпросмотр 1280px ↔ 375px',
        desc: 'Проверьте реальную вёрстку на ПК и смартфоне прямо на странице товара до покупки.',
      },
      {
        title: '3 уровня прозрачной лицензии',
        desc: 'Чёткая маркировка: оригинальный дизайн, адаптация с источником или коммерческая лицензия.',
      },
      {
        title: 'Тестовое оформление без риска',
        desc: 'Пройдите корзину, оплату и выдачу файлов в безопасном Sandbox-режиме без списания денег.',
      },
      {
        title: 'Мгновенная выдача файлов',
        desc: 'После подтверждения выдаётся персональная токен-ссылка на 7 дней (до 5 скачиваний).',
      },
      {
        title: 'Инструкция на 15–30 минут',
        desc: 'Понятное пошаговое руководство для быстрой замены логотипа, фото и ссылок.',
      },
      {
        title: 'Оптимизировано для 1–3 человек',
        desc: 'Никакого лишнего кода — только нужные блоки захвата заявок и шаблоны ответов.',
      },
      {
        title: 'Поддержка мультиканальности',
        desc: 'Продумано под сценарии покупок в TikTok Shop, Shopee, соцсетях и мессенджерах.',
      },
    ],
    standardsEyebrow: 'Стандарты платформы',
    standardsHeading: '12 гарантий качества в каждом решении',
    standardsItems: [
      'Мгновенная загрузка',
      'Стандарт Mobile 375px',
      'Светлая и тёмная темы',
      'AI-помощник подбора',
      'Умный поиск по нише',
      'Чистый SEO-код',
      'Ссылка защиты 7 дней',
      'Прозрачная лицензия',
      'Настройка за 15 мин',
      'Без сложного кода',
      'Мультиканальность',
      'Безопасный Sandbox',
    ],
    screensEyebrow: 'Обзор интерфейса',
    screensHeading: 'Ключевые экраны цифрового магазина',
    screensItems: [
      {
        category: 'Каталог товаров',
        title: 'Поиск и фильтр по нише',
        desc: 'Быстрый отбор по формату, отрасли, потолку бюджета и сортировке цен.',
        tags: ['Мульти-фильтр', 'Чёткая цена'],
      },
      {
        category: 'Карточка товара',
        title: 'Предпросмотр 1280px ↔ 375px',
        desc: 'Переключение экранов ПК и смартфона в реальном времени и проверка лицензии.',
        tags: ['Live HTML', 'На весь экран'],
      },
      {
        category: 'Корзина',
        title: 'Управление выбором',
        desc: 'Точный подсчёт стоимости комплектов перед переходом к оформлению.',
        tags: ['Итог сразу', 'Гибкое ред.'],
      },
      {
        category: 'Sandbox-оплата',
        title: 'Подтверждение без риска',
        desc: 'Проверка 3-шагового процесса заказа без реального списания средств.',
        tags: ['Без списаний', 'В 1 клик'],
      },
      {
        category: 'Заказы и файлы',
        title: 'Хранилище ссылок на 7 дней',
        desc: 'История заказов и прямое скачивание пакетов (до 5 загрузок в течение 7 дней).',
        tags: ['Личный токен', 'Доступ 7 дней'],
      },
      {
        category: 'Кабинет магазина',
        title: 'Панель 5 ключевых метрик',
        desc: 'Наглядная статистика трат, типов пакетов и оставшихся лимитов скачивания.',
        tags: ['5 метрик', 'Защита сессии'],
      },
    ],
    pilotEyebrow: 'Пилотные кейсы',
    pilotHeading: 'Отклики с тестовых сценариев',
    pilotDisclaimer:
      'Прозрачная сводка по пилотным учебным сценариям для малых магазинов — без вымышленных коммерческих отзывов.',
    pilotCases: [
      {
        code: 'КМ',
        persona: 'Магазин уходовой косметики',
        channel: 'TikTok Shop • 2 чел.',
        budget: 'Бюджет ≤ ~$39',
        summary:
          'Выбран мобильный лендинг 375px с указанием регистрационного кода и мягкого состава без запрещённых лечебных заявлений.',
        ctaLabel: 'Пакеты для косметики',
      },
      {
        code: 'ОД',
        persona: 'Локальный бренд одежды',
        channel: 'Instagram и Shopee • 2 чел.',
        budget: 'Бюджет ≤ ~$28',
        summary:
          'Витрина lookbook с визуальной сеткой размеров сократила поток однотипных вопросов о параметрах во время стримов.',
        ctaLabel: 'Пакеты для одежды',
      },
      {
        code: 'КФ',
        persona: 'Небольшое кафе и пекарня',
        channel: 'QR за столиком и чат • 2 чел.',
        budget: 'Бюджет ≤ ~$24',
        summary:
          'Гости сканируют QR-код с телефона, выбирают уровень сахара/льда и отправляют готовый чек заказа менеджеру.',
        ctaLabel: 'Пакеты для F&B',
      },
      {
        code: 'МК',
        persona: 'Продавец в пиковые часы',
        channel: 'Shopee, TikTok, соцсети • 1–3 чел.',
        budget: 'Бюджет ≤ ~$28',
        summary:
          'Связка быстрых скриптов ответов в директ с авто-записью заказов в Google Таблицы и уведомлениями в Telegram.',
        ctaLabel: 'Мультиканальные пакеты',
      },
    ],
    faqEyebrow: 'Частые вопросы',
    faqHeading: 'Ответы по внедрению и лицензиям',
    faqItems: [
      {
        q: 'Как быстро небольшой магазин сможет запустить купленный пакет?',
        a: 'В комплекте идёт краткая инструкция на 15–30 минут: для сайта достаточно заменить лого и фото, промпты сразу готовы в Notion/PDF, а workflow импортируется одним JSON-файлом.',
      },
      {
        q: 'Списывает ли тестовая оплата (Sandbox) реальные деньги?',
        a: 'Нет. Сайт работает в режиме безопасного тестирования, позволяя проверить весь цикл до скачивания файлов абсолютно бесплатно.',
      },
      {
        q: 'Что означают 3 уровня лицензии?',
        a: 'Оригинальный дизайн создан командой с нуля; Адаптация переработана из открытых шаблонов; Коммерческая лицензия включает подтверждённые права на коммерческое использование.',
      },
      {
        q: 'Сколько действует приватная ссылка на скачивание?',
        a: 'После оплаты токен-ссылка активна 7 дней и допускает до 5 скачиваний для каждого пакета.',
      },
    ],
    ctaBandEyebrow: 'Старт за 2 минуты',
    ctaBandHeading: 'Подберите набор под вашу нишу и бюджет',
    ctaBandDesc:
      'Протестируйте живой предпросмотр Desktop ↔ 375px или попросите AI-помощника отобрать лучший вариант.',
    ctaBandPrimary: 'Смотреть все 12 пакетов',
    ctaBandSecondary: 'Открыть AI-помощник',
  },
  zh: {
    typewriterPrefix: '用更少时间启动您的',
    typewriterWords: [
      '高转化独立站',
      '合规带货提示词',
      '订单自动化流程',
      '穿搭画册主页',
      '直播带货脚本',
    ],
    heroBadge: '专为 1–3 人小微电商打造的轻量数字工具库',
    heroTitleStart: '开箱即用的数字化套件，全面赋能',
    heroTitleLead: '多渠道电商小店主',
    heroDesc:
      '严选 375px 手机优先网页模板、零违禁词 AI 提示词包与订单自动同步工作流——内置智能选品顾问，几分钟内按预算为您精准匹配。',
    ctaCatalog: '浏览全部套件',
    ctaAskAdvisor: '咨询智能顾问',
    statLabels: {
      packages: '精选数字套件',
      industries: '核心垂直行业',
      setup: '极速部署指南',
      priceFrom: '起售价 / 套',
    },
    scrollCue: '向下滚动继续探索',
    heroMockupTabs: {
      template: {
        label: '网页模板',
        highlightTitle: '美妆护肤 TikTok Shop 落地页',
        highlightMeta: '375px 手机端优先 • 约30分钟上线',
        chartTitle: '移动端加购点击趋势',
        kpis: [
          { label: '模板数', value: '6 款' },
          { label: '部署耗时', value: '~30 分钟' },
          { label: '适配宽度', value: '375px' },
          { label: '价格区间', value: '~$18–26' },
        ],
        advisorCopy: '精准匹配护肤品预算及 TikTok Shop / Shopee 引流场景。',
        advisorTip: '优先推荐 • 490.000đ (~$19)',
      },
      prompt_pack: {
        label: 'AI 提示词包',
        highlightTitle: '60 组合规详情文案与短视频脚本',
        highlightMeta: '避开违禁词 • 含 Notion 与 PDF',
        chartTitle: '每日爆款内容产出效率',
        kpis: [
          { label: '提示词库', value: '4 套' },
          { label: '出稿速度', value: '~15 分钟' },
          { label: '词库规模', value: '60+ 组' },
          { label: '价格区间', value: '~$10–14' },
        ],
        advisorCopy: '轻松写出符合平台审核规范的商品描述与带货脚本。',
        advisorTip: '优先推荐 • 290.000đ (~$11)',
      },
      workflow: {
        label: '自动化工作流',
        highlightTitle: '订单自动同步表格与即时预警',
        highlightMeta: '一键导入 JSON • 低库存秒级通知',
        chartTitle: '全渠道高峰期履约效率',
        kpis: [
          { label: '自动化流', value: '2 套' },
          { label: '运行引擎', value: 'n8n / Make' },
          { label: '联动应用', value: '表格+提醒' },
          { label: '价格区间', value: '~$25–27' },
        ],
        advisorCopy: '自动汇集 Shopee、TikTok 与社交订单，高峰期绝不漏单。',
        advisorTip: '优先推荐 • 690.000đ (~$27)',
      },
      sidebarFooter1: '智能选品顾问',
      sidebarFooter2: '375px 预览',
      brandBadge: '版权清晰',
      playTour: '自动轮播',
      pauseTour: '暂停演示',
      pauseLabel: '暂停',
      resumeLabel: '继续',
    },
    categoriesEyebrow: '按方案形式或所属行业快速筛选',
    categoriesHeading: '直达适合您店铺的数字工具分类',
    categoriesCards: [
      { title: '网站模板', cta: '查看网页模板' },
      { title: 'AI 提示词包', cta: '查看提示词包' },
      { title: '自动化工作流', cta: '查看自动流程' },
      { title: '美妆护肤店', cta: '筛选美妆方案' },
      { title: '时尚服装店', cta: '筛选服饰方案' },
      { title: '餐饮与茶饮店', cta: '筛选餐饮方案' },
    ],
    featuredEyebrow: '精选热门方案',
    featuredHeading: '随时可直接落地的核心套件',
    featuredTabs: [
      { value: '', label: '全部方案' },
      { value: 'template', label: '网站模板' },
      { value: 'prompt_pack', label: '提示词包' },
      { value: 'workflow', label: '自动化流程' },
    ],
    featuredViewAll: '查看全部 12 款套件 →',
    featuredQuickAdd: '加入购物车',
    featuredAdded: '已加入',
    featuredDetail: '查看详情',
    benefitsEyebrow: '为什么 1–3 人小店都选 DreamTeam？',
    benefitsHeading: '省去繁琐配置，专注下单转化',
    benefitsLead:
      '每套方案都聚焦移动端成交细节，拒绝笨重难懂的企业级后台，让微店主轻松上手。',
    benefitsItems: [
      {
        title: '按预算与渠道智能选品',
        desc: '选品顾问依据所属行业、带货渠道与预算上限直接为您缩小筛选范围。',
      },
      {
        title: '1280px ↔ 375px 实时活体预览',
        desc: '下单前即可直接在商品页切换电脑与手机视图，所见即所得检查模板效果。',
      },
      {
        title: '3 级版权标识完全透明',
        desc: '清晰标注原创设计、开源署名改编或商业授权证明，放心用于店铺上线。',
      },
      {
        title: '零风险沙盒下单测试',
        desc: '全程免真实扣款验证加购、确认下单与即时获取文件下载链接的完整链路。',
      },
      {
        title: '支付后秒级私密链接交付',
        desc: '订单确认后立即生成独立加密下载凭证，有效期 7 天且支持最多 5 次下载。',
      },
      {
        title: '15–30 分钟保姆级上线指引',
        desc: '附带清晰分步手册，无需懂代码即可快速更换品牌 Logo、图片与店铺链接。',
      },
      {
        title: '为 1–3 人精简团队量身打造',
        desc: '去掉多余模块，浓缩最高频使用的下单引导区块、AI 话术卡片与自动化脚本。',
      },
      {
        title: '贴合主流多渠道电商习惯',
        desc: '全面适配 TikTok Shop、Shopee 及私域聊天的浏览动线与沟通场景。',
      },
    ],
    standardsEyebrow: '产品交付标准',
    standardsHeading: '全站贯彻的 12 项体验与工程规范',
    standardsItems: [
      '页面极速加载',
      '375px 手机优先',
      '浅色/深色高对比主题',
      'AI 智能选品顾问',
      '多维度需求检索',
      '干净语义 SEO 结构',
      '7 天安全下载凭证',
      '3 级透明版权档案',
      '15 分钟快速上线',
      '零深层编码负担',
      '多渠道带货适配',
      '安全零扣款沙盒测试',
    ],
    screensEyebrow: '全链路功能概览',
    screensHeading: '预览数字商店的 6 大核心体验页面',
    screensItems: [
      {
        category: '商品目录',
        title: '多维搜索与行业筛选',
        desc: '按套件类型、所属行业、预算上限与价格排序快速锁定目标方案。',
        tags: ['多维筛选', '预算清晰'],
      },
      {
        category: '商品详情',
        title: '1280px ↔ 375px 实时试看',
        desc: '直接互动预览真实 HTML 模板，支持全屏放大与核对版权分类。',
        tags: ['Live HTML', '全屏缩放'],
      },
      {
        category: '购物车',
        title: '清晰汇总已选套件',
        desc: '实时计算各套件总金额与约合美金参考，随时增减件数。',
        tags: ['实时总计', '便捷调整'],
      },
      {
        category: '沙盒结账',
        title: '3 步无风险确认订单',
        desc: '以沙盒模拟支付走完完整下单流程，不产生任何真实扣款。',
        tags: ['零扣款测试', '一键确认'],
      },
      {
        category: '订单与下载库',
        title: '7 天私密资源下载中心',
        desc: '集中管理历史订单状态与下载授权，每个套件享 7 天 5 次安全下载。',
        tags: ['独立令牌', '7天有效'],
      },
      {
        category: '店主账户',
        title: '5 维度经营统计看板',
        desc: '直观查看累计订单、支出汇总、套件占比、日趋势与剩余下载次数。',
        tags: ['5维数据看板', '会话保护'],
      },
    ],
    pilotEyebrow: '模拟试点情景反馈',
    pilotHeading: '各垂直行业试点运行实录',
    pilotDisclaimer:
      '基于项目内部多行业试点情景收集的真实反馈记录，绝不虚构虚假商业好评。',
    pilotCases: [
      {
        code: '美妆',
        persona: '护肤品小店店主',
        channel: 'TikTok Shop • 2人团队',
        budget: '预算 ≤ ~$39',
        summary:
          '优先选用 375px 手机端护肤落地页，清晰展示备案号与温和成分区，挂车短视频完全合规不被限流。',
        ctaLabel: '查看美妆套件',
      },
      {
        code: '服饰',
        persona: '小众潮牌店主',
        channel: 'Instagram 与 Shopee • 2人',
        budget: '预算 ≤ ~$28',
        summary:
          '使用穿搭画册结合直观尺码对照表，让直播观众自行核对尺码，大幅减少私信反复问尺码的客服耗时。',
        ctaLabel: '查看服饰套件',
      },
      {
        code: '餐饮',
        persona: '茶饮甜品小店',
        channel: '门店扫码与聊天下单 • 2人',
        budget: '预算 ≤ ~$24',
        summary:
          '顾客桌边扫码即可浏览手机菜单、勾选冰度糖度，一键发回格式整齐的点单摘要。',
        ctaLabel: '查看餐饮套件',
      },
      {
        code: '全渠',
        persona: '高峰期全渠道卖家',
        channel: 'Shopee、TikTok 与社交 • 1–3人',
        budget: '预算 ≤ ~$28',
        summary:
          '搭配私信促单提示词包与 Google 表格自动记单流程，再忙也能守住晚间高峰期的每一笔成交。',
        ctaLabel: '查看全渠道套件',
      },
    ],
    faqEyebrow: '常见问题',
    faqHeading: '关于使用方式、支付与版权的常见解答',
    faqItems: [
      {
        q: '小店下载套件后多久可以投入使用？',
        a: '每套资源均配有 15–30 分钟快速配置说明：网站模板只需更换 Logo 与图片；提示词包提供 Notion/PDF 即复制即用；工作流附带一键导入 JSON 文件。',
      },
      {
        q: '沙盒测试付款会扣取真实银行卡余额吗？',
        a: '完全不会。系统当前为全沙盒演练模式，让您零费用体验完整下单并测试下载交付流程。',
      },
      {
        q: '3 级版权分类具体代表什么？',
        a: '“原创设计”由团队 100% 自主创作；“开源改编（已署名）”基于开放结构深耕优化；“合规商用授权”附有明确的商业使用许可证明。',
      },
      {
        q: '支付后下载链接的有效期有多久？',
        a: '每件已支付商品都会获发独立私有令牌链接，7 天内有效且最多支持下载 5 次。',
      },
    ],
    ctaBandEyebrow: '2 分钟快速开启',
    ctaBandHeading: '立即为您的店铺筛选高匹配数字套件',
    ctaBandDesc:
      '支持在网页内直接试看 Desktop ↔ 375px 响应式效果，或随时向智能选品顾问提问匹配方案。',
    ctaBandPrimary: '进入 12 款套件目录',
    ctaBandSecondary: '立即咨询顾问',
  },
};
