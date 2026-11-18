import type { AppLocale } from './types';

export interface AdminMessages {
  shell: {
    topbarTitle: string;
    topbarSubtitle: string;
    sidebarSubtitle: string;
    adminBadge: string;
    navAria: string;
    navItems: Array<{ label: string; description: string }>;
    viewStorefront: string;
    openDrawerAria: string;
    closeDrawerAria: string;
    mobileMenuTitle: string;
    fallbackName: string;
    deniedTitle: string;
    deniedDescLoggedOut: string;
    deniedDescNotAdmin: string;
    deniedLoginBtn: string;
    deniedBackStoreBtn: string;
    checkingAuth: string;
  };
  analytics: {
    pillLive: string;
    pillSim: string;
    pillReal: string;
    heroTitle: string;
    heroDesc: string;
    refreshBtn: string;
    refreshingBtn: string;
    toggleRealOnly: string;
    toggleWithSim: string;
    simWarningTitle: string;
    simWarningDesc: string;
    kpiConsentTag: (pct: number) => string;
    kpiParticipants: string;
    kpiConsented: string;
    kpiSource: string;
    kpiSourceSim: string;
    kpiSourceReal: string;
    kpiCompletedRuns: string;
    kpiMethod: string;
    kpiOrdersTitle: string;
    kpiSandboxValue: string;
    kpiGateway: string;
    kpiAiTitle: string;
    kpiAvgCost: string;
    kpiTotalTokens: string;
    // 5 Visual Dashboard Elements
    dashEl1Eyebrow: string;
    dashEl1Title: string;
    dashEl1Delta: (d: string) => string;
    dashEl1RingAcc: string;
    dashEl1RingConsent: string;
    dashEl1ControlNote: string;
    dashEl2Eyebrow: string;
    dashEl2Title: string;
    dashEl2MetricAcc: string;
    dashEl2MetricDur: string;
    dashEl2MetricConf: string;
    dashEl2MetricBuy: string;
    dashEl2UnitOrder: string;
    dashEl3Eyebrow: string;
    dashEl3Title: string;
    funnelLabels: Record<string, string>;
    dashEl4Eyebrow: string;
    dashEl4Title: string;
    dashEl4LogsBtn: string;
    dashEl4ReplyRatio: (n: number) => string;
    dashEl4Grounding: (pct: number) => string;
    dashEl4TrendLabel: string;
    dashEl5Eyebrow: string;
    dashEl5Title: string;
    dashEl5Industries: string;
    dashEl5IndustriesEmpty: string;
    dashEl5OrdersLabel: (count: number, totalFormatted: string) => string;
    dashEl5DetailsLink: string;
    dashEl5Paid: string;
    dashEl5Pending: string;
    dashEl5Failed: string;
    dashEl5LatestOrder: string;
    compareTableTitle: string;
    compareTableUnit: string;
    colVariant: string;
    colCompleted: string;
    colCorrect: string;
    colAccuracy: string;
    colDuration: string;
    colConfidence: string;
    colPurchase: string;
    eventsTitle: string;
    eventsCoreSub: (n: number) => string;
    eventsChatSub: (n: number) => string;
    colEventName: string;
    colEventCount: string;
    colEventTrigger: string;
    unitEconTitle: string;
    unitEconBtn: string;
    ueTotalReplies: string;
    ueAvgLatency: string;
    ueP95Latency: string;
    ueTotalTokens: string;
    ueAvgCost: string;
    exportTitle: string;
    exportDesc: string;
    exportAnonymizedBadge: string;
    exportCsvBtn: string;
    exportJsonBtn: string;
    exportingJsonBtn: string;
    datasets: Array<{ title: string; description: string }>;
    recentOrdersTitle: string;
    openOrdersBtn: string;
    noOrders: string;
    colOrderCode: string;
    colOrderStatus: string;
    colOrderTotal: string;
    colOrderDataType: string;
    colOrderDate: string;
    colOrderOpen: string;
    dataSimLabel: string;
    dataRealLabel: string;
    viewBtn: string;
  };
  products: {
    title: string;
    subtitle: string;
    addBtn: string;
    searchPlaceholder: string;
    statusAll: string;
    statusActive: string;
    statusHidden: string;
    previewBtn: string;
    editBtn: string;
    toggleActiveBtn: string;
    toggleHideBtn: string;
    colProduct: string;
    colTypeIndustry: string;
    colPrice: string;
    colDemo: string;
    colStatus: string;
    colActions: string;
    statusOn: string;
    statusOff: string;
    modalCreateTitle: string;
    modalEditTitle: string;
    saveBtn: string;
    savingBtn: string;
    cancelBtn: string;
  };
  orders: {
    title: string;
    subtitle: string;
    statusAll: string;
    colCode: string;
    colStatus: string;
    colTotal: string;
    colItems: string;
    colType: string;
    colCreated: string;
    colDetail: string;
    drawerTitle: string;
  };
  chatLogs: {
    title: string;
    subtitle: string;
    modelAll: string;
    modelGemini: string;
    modelStub: string;
    suggAll: string;
    suggYes: string;
    suggNo: string;
    sessionsCount: (n: number) => string;
    selectSessionPrompt: string;
    groundingHeading: string;
    groundedBadge: (n: number) => string;
    noSuggestionsBadge: string;
    retrievedLabel: string;
    suggestedLabel: string;
  };
}

export const ADMIN_MESSAGES: Record<AppLocale, AdminMessages> = {
  vi: {
    shell: {
      topbarTitle: 'DreamTeam Admin • Quản trị hệ thống',
      topbarSubtitle: 'Không gian quản trị tách biệt hoàn toàn khỏi giao diện khách hàng',
      sidebarSubtitle: 'Buồng điều hành',
      adminBadge: 'Admin',
      navAria: 'Điều hướng khu vực quản trị',
      navItems: [
        { label: 'Phân tích chuyển đổi', description: 'KPI A/B, Phễu 14 sự kiện & Xuất dữ liệu' },
        { label: 'Quản lý sản phẩm', description: 'CRUD gói số, ảnh & gắn Live HTML Demo' },
        { label: 'Quản lý đơn hàng', description: 'Đơn Sandbox & Quyền tải file 7 ngày' },
        { label: 'Nhật ký Trợ lý AI', description: 'Kiểm định Grounding, Model & Chi phí' },
      ],
      viewStorefront: 'Xem Mặt tiền Cửa hàng',
      openDrawerAria: 'Mở menu quản trị',
      closeDrawerAria: 'Đóng menu quản trị',
      mobileMenuTitle: 'Điều hướng Quản trị',
      fallbackName: 'Quản trị viên',
      deniedTitle: 'Khu vực chỉ dành cho Quản trị viên',
      deniedDescLoggedOut:
        'Bạn cần đăng nhập bằng tài khoản Quản trị viên (role = admin) để xem số liệu và quản lý hệ thống.',
      deniedDescNotAdmin:
        'Tài khoản hiện tại không có quyền quản trị viên. Vui lòng đăng xuất hoặc chuyển sang tài khoản Admin.',
      deniedLoginBtn: 'Đăng nhập Admin tại /auth',
      deniedBackStoreBtn: 'Quay lại Mặt tiền Cửa hàng',
      checkingAuth: 'Đang kiểm tra quyền quản trị...',
    },
    analytics: {
      pillLive: 'Dữ liệu trực tiếp • Admin',
      pillSim: 'Đang gộp is_simulated = true',
      pillReal: 'Chỉ dữ liệu thật (is_simulated = false)',
      heroTitle: 'Bảng Điều Hành Phân Tích A/B & Kinh Tế RAG — DreamTeam',
      heroDesc:
        'Đối chứng trực tiếp hiệu quả nhánh chatbot_on so với chatbot_off, phễu 14 sự kiện và chi phí truy vấn AI.',
      refreshBtn: 'Làm mới dữ liệu',
      refreshingBtn: 'Đang tải...',
      toggleRealOnly: 'Chỉ dữ liệu thật (is_simulated = false)',
      toggleWithSim: 'Bao gồm dữ liệu mô phỏng',
      simWarningTitle: 'ĐANG HIỂN THỊ DỮ LIỆU MÔ PHỎNG (is_simulated = true)',
      simWarningDesc:
        'Tuyệt đối không dùng bộ số liệu mô phỏng này để kết luận báo cáo thí nghiệm đồ án tốt nghiệp.',
      kpiConsentTag: (p) => `${p}% Đồng ý`,
      kpiParticipants: 'Tổng người tham gia',
      kpiConsented: 'Đã đồng ý (Consent)',
      kpiSource: 'Nguồn dữ liệu',
      kpiSourceSim: 'Thật + Mẫu',
      kpiSourceReal: 'Thật 100%',
      kpiCompletedRuns: 'Lượt hoàn thành khảo sát',
      kpiMethod: 'Phương pháp',
      kpiOrdersTitle: 'Đơn hàng Sandbox (Paid)',
      kpiSandboxValue: 'Tổng giá trị ý định',
      kpiGateway: 'Cổng giả lập',
      kpiAiTitle: 'Chi phí & Độ trễ AI',
      kpiAvgCost: 'Cost / Query TB',
      kpiTotalTokens: 'Tổng tokens',
      dashEl1Eyebrow: 'Yếu tố 1 • Độ chính xác & Đồng thuận',
      dashEl1Title: 'Hiệu quả Trợ lý & Tỉ lệ Tham gia',
      dashEl1Delta: (d) => `Δ ${d} điểm %`,
      dashEl1RingAcc: 'Đúng (Có Trợ lý)',
      dashEl1RingConsent: 'Tỉ lệ Consent',
      dashEl1ControlNote: 'Đối chứng nhánh không trợ lý đạt',
      dashEl2Eyebrow: 'Yếu tố 2 • So sánh Hai Nhánh AB / BA',
      dashEl2Title: 'Tương quan chatbot_on vs chatbot_off',
      dashEl2MetricAcc: 'Tỉ lệ chọn đúng (%)',
      dashEl2MetricDur: 'Thời gian TB (giây)',
      dashEl2MetricConf: 'Độ tự tin (1–5)',
      dashEl2MetricBuy: 'Ý định mua Sandbox',
      dashEl2UnitOrder: 'đơn',
      dashEl3Eyebrow: 'Yếu tố 3 • Phễu Hành Vi Thật',
      dashEl3Title: 'Chuyển đổi 6 Chặng',
      funnelLabels: {
        consented: 'Đồng ý tham gia',
        product_viewed: 'Xem chi tiết gói',
        chat_sent: 'Hỏi Trợ lý tư vấn',
        add_to_cart: 'Thêm vào giỏ',
        checkout_started: 'Bắt đầu thanh toán',
        purchase: 'Hoàn tất đơn hàng',
      },
      dashEl4Eyebrow: 'Yếu tố 4 • Xu hướng & Kinh tế AI',
      dashEl4Title: 'Hoạt động 7 ngày & LLM Mix',
      dashEl4LogsBtn: 'Nhật ký AI',
      dashEl4ReplyRatio: (n) => `Tỉ lệ phản hồi (${n} lượt)`,
      dashEl4Grounding: (p) => `Grounding ${p}%`,
      dashEl4TrendLabel: 'Hoạt động theo ngày (Lượt xong + Chat + Đơn)',
      dashEl5Eyebrow: 'Yếu tố 5 • Phân Khúc & Giao Dịch',
      dashEl5Title: 'Ngành Shop & Trạng thái Đơn',
      dashEl5Industries: 'Ngành hàng tham gia khảo sát',
      dashEl5IndustriesEmpty: 'Chưa có dữ liệu hồ sơ ngành hàng từ phiên khảo sát.',
      dashEl5OrdersLabel: (c, v) => `Đơn Sandbox (${c}) • ${v}`,
      dashEl5DetailsLink: 'Chi tiết →',
      dashEl5Paid: 'Đã thanh toán',
      dashEl5Pending: 'Chờ thanh toán',
      dashEl5Failed: 'Thất bại / Hủy',
      dashEl5LatestOrder: 'Đơn mới nhất:',
      compareTableTitle: 'So sánh hiệu quả hai nhánh: chatbot_on vs chatbot_off',
      compareTableUnit: 'Đơn vị đo: scenario_runs',
      colVariant: 'Biến thể',
      colCompleted: 'Số lượt hoàn thành',
      colCorrect: 'Chọn đúng đáp án',
      colAccuracy: 'Tỉ lệ đúng',
      colDuration: 'Thời gian TB (giây)',
      colConfidence: 'Độ tự tin TB (1–5)',
      colPurchase: 'Ý định mua Sandbox',
      eventsTitle: 'Phễu 14 sự kiện chuẩn (Tracking Spec)',
      eventsCoreSub: (n) => `11 sự kiện chung cho cả hai nhóm (${n})`,
      eventsChatSub: (n) => `3 sự kiện chỉ phát sinh khi chatbot_on (${n})`,
      colEventName: 'Tên sự kiện',
      colEventCount: 'Số lần ghi nhận',
      colEventTrigger: 'Thời điểm kích hoạt',
      unitEconTitle: 'Unit Economics AI (RAG)',
      unitEconBtn: 'Xem Nhật ký AI',
      ueTotalReplies: 'Tổng lượt bot trả lời',
      ueAvgLatency: 'Độ trễ trung bình',
      ueP95Latency: 'Độ trễ P95',
      ueTotalTokens: 'Tổng Token đã dùng',
      ueAvgCost: 'Chi phí TB / tin nhắn',
      exportTitle: 'Xuất Dữ liệu Nghiên cứu Ẩn danh (CSV / JSON)',
      exportDesc: '0 PII — chỉ xuất participant_code, assignment_id, visitor_id.',
      exportAnonymizedBadge: '0 PII • Ẩn danh nghiên cứu',
      exportCsvBtn: 'Tải CSV',
      exportJsonBtn: 'Tải JSON',
      exportingJsonBtn: 'Đang xuất JSON...',
      datasets: [
        {
          title: 'Lượt chạy kịch bản A/B',
          description: 'Số liệu paired AB/BA phục vụ kiểm định McNemar và Wilcoxon signed-rank.',
        },
        {
          title: 'Nhật ký 14 sự kiện hành vi',
          description: 'Toàn bộ 14 sự kiện chuẩn kèm participant_code cho phễu chuyển đổi & K-Means.',
        },
        {
          title: 'Nhật ký Gemini RAG & Chi phí',
          description: 'Prompt version, model, số ID truy xuất, độ trễ (ms), tokens và chi phí.',
        },
      ],
      recentOrdersTitle: 'Đơn hàng Sandbox gần đây',
      openOrdersBtn: 'Mở Quản lý đơn hàng',
      noOrders: 'Chưa có đơn hàng nào khớp bộ lọc hiện tại.',
      colOrderCode: 'Mã đơn',
      colOrderStatus: 'Trạng thái',
      colOrderTotal: 'Tổng tiền',
      colOrderDataType: 'Loại dữ liệu',
      colOrderDate: 'Ngày tạo',
      colOrderOpen: 'Mở',
      dataSimLabel: 'Mô phỏng',
      dataRealLabel: 'Thật',
      viewBtn: 'Xem',
    },
    products: {
      title: 'Quản lý Danh mục Sản phẩm số',
      subtitle: 'Thêm mới, chỉnh sửa, ẩn/hiện gói số và kiểm tra nhanh Live HTML Preview.',
      addBtn: 'Thêm sản phẩm',
      searchPlaceholder: 'Tìm theo tên, slug hoặc ngành hàng...',
      statusAll: 'Tất cả',
      statusActive: 'Đang hiển thị',
      statusHidden: 'Đang ẩn',
      previewBtn: 'Xem thử',
      editBtn: 'Sửa',
      toggleActiveBtn: 'Bật lại',
      toggleHideBtn: 'Ẩn đi',
      colProduct: 'Sản phẩm',
      colTypeIndustry: 'Loại & Ngành',
      colPrice: 'Giá',
      colDemo: 'Live Demo',
      colStatus: 'Trạng thái',
      colActions: 'Thao tác',
      statusOn: 'Đang bán',
      statusOff: 'Đang ẩn',
      modalCreateTitle: 'Thêm Sản phẩm số Mới',
      modalEditTitle: 'Cập nhật Sản phẩm',
      saveBtn: 'Lưu thay đổi',
      savingBtn: 'Đang lưu...',
      cancelBtn: 'Hủy',
    },
    orders: {
      title: 'Quản lý Đơn hàng & Quyền Tải',
      subtitle: 'Theo dõi đơn thanh toán Sandbox, trạng thái link tải 7 ngày và lọc dữ liệu.',
      statusAll: 'Tất cả trạng thái',
      colCode: 'Mã đơn',
      colStatus: 'Trạng thái',
      colTotal: 'Tổng tiền',
      colItems: 'Số gói',
      colType: 'Dữ liệu',
      colCreated: 'Ngày tạo',
      colDetail: 'Chi tiết',
      drawerTitle: 'Chi tiết Đơn hàng & Link tải',
    },
    chatLogs: {
      title: 'Nhật ký Trợ lý AI & Grounding DB',
      subtitle: 'Theo dõi model_name (Gemini LLM vs Stub), retrieved_product_ids, độ trễ và chi phí (0 PII).',
      modelAll: 'Tất cả Model',
      modelGemini: 'Gemini LLM',
      modelStub: 'Stub/Fallback',
      suggAll: 'Tất cả phản hồi',
      suggYes: 'Có gợi ý sản phẩm',
      suggNo: 'Không gợi ý',
      sessionsCount: (n) => `${n} phiên hội thoại`,
      selectSessionPrompt: 'Chọn 1 phiên hội thoại ở danh sách bên trái để xem chi tiết.',
      groundingHeading: 'Kiểm định Grounding DB',
      groundedBadge: (n) => `Đã đối chiếu DB (${n} gói)`,
      noSuggestionsBadge: 'Không có sản phẩm gợi ý',
      retrievedLabel: 'retrieved_product_ids',
      suggestedLabel: 'suggested_products',
    },
  },
  en: {
    shell: {
      topbarTitle: 'DreamTeam Admin • System Console',
      topbarSubtitle: 'Isolated management workspace separated from customer storefront',
      sidebarSubtitle: 'Operations Console',
      adminBadge: 'Admin',
      navAria: 'Admin navigation',
      navItems: [
        { label: 'Conversion Analytics', description: 'A/B KPIs, 14-event funnel & dataset export' },
        { label: 'Product Catalog', description: 'Kit CRUD, WebP media & Live HTML Demo' },
        { label: 'Order Management', description: 'Sandbox orders & 7-day download tokens' },
        { label: 'AI Assistant Logs', description: 'Grounding verification, models & USD cost' },
      ],
      viewStorefront: 'Open Storefront',
      openDrawerAria: 'Open admin navigation',
      closeDrawerAria: 'Close admin navigation',
      mobileMenuTitle: 'Admin Navigation',
      fallbackName: 'Administrator',
      deniedTitle: 'Administrator Access Required',
      deniedDescLoggedOut:
        'Please sign in with an Administrator account (role = admin) to view telemetry and manage the store.',
      deniedDescNotAdmin:
        'Your current account does not have Administrator privileges. Switch accounts to continue.',
      deniedLoginBtn: 'Sign in as Admin at /auth',
      deniedBackStoreBtn: 'Return to Storefront',
      checkingAuth: 'Verifying administrator session...',
    },
    analytics: {
      pillLive: 'Live Telemetry • Admin',
      pillSim: 'Including is_simulated = true',
      pillReal: 'Real data only (is_simulated = false)',
      heroTitle: 'A/B Experiment & AI Economics Cockpit — DreamTeam',
      heroDesc:
        'Compare chatbot_on vs chatbot_off variant outcomes, the 14-event behavioral funnel, and per-query AI unit economics.',
      refreshBtn: 'Refresh Data',
      refreshingBtn: 'Loading...',
      toggleRealOnly: 'Real Data Only (is_simulated = false)',
      toggleWithSim: 'Include Simulated Data',
      simWarningTitle: 'DISPLAYING SIMULATED DATA (is_simulated = true)',
      simWarningDesc:
        'Do not use simulated sample runs for final empirical experiment conclusions.',
      kpiConsentTag: (p) => `${p}% Consent`,
      kpiParticipants: 'Total Participants',
      kpiConsented: 'Consented Sessions',
      kpiSource: 'Data Filter',
      kpiSourceSim: 'Real + Sample',
      kpiSourceReal: '100% Real',
      kpiCompletedRuns: 'Completed Study Runs',
      kpiMethod: 'Design',
      kpiOrdersTitle: 'Sandbox Orders (Paid)',
      kpiSandboxValue: 'Total Intent Value',
      kpiGateway: 'Gateway',
      kpiAiTitle: 'AI Cost & Latency',
      kpiAvgCost: 'Avg Cost / Reply',
      kpiTotalTokens: 'Total Tokens',
      dashEl1Eyebrow: 'Metric 1 • Accuracy & Consent',
      dashEl1Title: 'Advisor Lift & Participation',
      dashEl1Delta: (d) => `Δ ${d} pts`,
      dashEl1RingAcc: 'Correct (Advisor On)',
      dashEl1RingConsent: 'Consent Rate',
      dashEl1ControlNote: 'Control arm (advisor off) accuracy:',
      dashEl2Eyebrow: 'Metric 2 • AB / BA Comparison',
      dashEl2Title: 'chatbot_on vs chatbot_off Correlation',
      dashEl2MetricAcc: 'Selection Accuracy (%)',
      dashEl2MetricDur: 'Avg. Duration (sec)',
      dashEl2MetricConf: 'Confidence Score (1–5)',
      dashEl2MetricBuy: 'Sandbox Purchase Intent',
      dashEl2UnitOrder: 'orders',
      dashEl3Eyebrow: 'Metric 3 • Live Behavior Funnel',
      dashEl3Title: '6-Stage Conversion',
      funnelLabels: {
        consented: 'Study Consented',
        product_viewed: 'Viewed Kit Detail',
        chat_sent: 'Messaged AI Advisor',
        add_to_cart: 'Added to Cart',
        checkout_started: 'Started Checkout',
        purchase: 'Order Completed',
      },
      dashEl4Eyebrow: 'Metric 4 • 7-Day Trend & AI Mix',
      dashEl4Title: 'Daily Activity & LLM Share',
      dashEl4LogsBtn: 'AI Logs',
      dashEl4ReplyRatio: (n) => `Response ratio (${n} msgs)`,
      dashEl4Grounding: (p) => `Grounded ${p}%`,
      dashEl4TrendLabel: 'Daily volume (Runs + AI Replies + Orders)',
      dashEl5Eyebrow: 'Metric 5 • Segments & Orders',
      dashEl5Title: 'Shop Niches & Order Mix',
      dashEl5Industries: 'Participating Shop Verticals',
      dashEl5IndustriesEmpty: 'No shop industry profile records available yet.',
      dashEl5OrdersLabel: (c, v) => `Sandbox Orders (${c}) • ${v}`,
      dashEl5DetailsLink: 'View All →',
      dashEl5Paid: 'Paid',
      dashEl5Pending: 'Pending',
      dashEl5Failed: 'Failed / Cancelled',
      dashEl5LatestOrder: 'Latest order:',
      compareTableTitle: 'Variant Performance Matrix: chatbot_on vs chatbot_off',
      compareTableUnit: 'Unit: scenario_runs',
      colVariant: 'Variant',
      colCompleted: 'Completed',
      colCorrect: 'Correct Choice',
      colAccuracy: 'Accuracy',
      colDuration: 'Avg Time (s)',
      colConfidence: 'Avg Confidence',
      colPurchase: 'Sandbox Buys',
      eventsTitle: '14-Event Telemetry Funnel Matrix',
      eventsCoreSub: (n) => `11 Shared Events (${n})`,
      eventsChatSub: (n) => `3 Advisor-Only Events (${n})`,
      colEventName: 'Event Name',
      colEventCount: 'Fired Count',
      colEventTrigger: 'Trigger Moment',
      unitEconTitle: 'AI Unit Economics (RAG)',
      unitEconBtn: 'View AI Logs',
      ueTotalReplies: 'Total AI Replies',
      ueAvgLatency: 'Average Latency',
      ueP95Latency: 'P95 Latency',
      ueTotalTokens: 'Total Tokens Used',
      ueAvgCost: 'Avg Cost / Message',
      exportTitle: 'Anonymized Research Dataset Export (CSV / JSON)',
      exportDesc: '0 PII — exports only participant_code, assignment_id, visitor_id.',
      exportAnonymizedBadge: '0 PII • Anonymized',
      exportCsvBtn: 'Download CSV',
      exportJsonBtn: 'Download JSON',
      exportingJsonBtn: 'Exporting JSON...',
      datasets: [
        {
          title: 'A/B Scenario Runs',
          description: 'Paired AB/BA run data ready for McNemar and Wilcoxon statistical tests.',
        },
        {
          title: '14 Behavioral Events',
          description: 'Full event stream with participant codes for conversion funnel & K-Means clustering.',
        },
        {
          title: 'RAG & Cost Telemetry',
          description: 'Prompt versions, model names, retrieved/suggested IDs, latency (ms), tokens & USD cost.',
        },
      ],
      recentOrdersTitle: 'Recent Sandbox Orders',
      openOrdersBtn: 'Manage Orders',
      noOrders: 'No orders match the current filter.',
      colOrderCode: 'Order Code',
      colOrderStatus: 'Status',
      colOrderTotal: 'Total',
      colOrderDataType: 'Dataset',
      colOrderDate: 'Created At',
      colOrderOpen: 'Open',
      dataSimLabel: 'Simulated',
      dataRealLabel: 'Real',
      viewBtn: 'View',
    },
    products: {
      title: 'Digital Product Catalog Management',
      subtitle: 'Create, edit, toggle visibility, and verify Live HTML Previews directly inside Admin.',
      addBtn: 'Add Package',
      searchPlaceholder: 'Search by name, slug, or niche...',
      statusAll: 'All',
      statusActive: 'Active',
      statusHidden: 'Hidden',
      previewBtn: 'Preview',
      editBtn: 'Edit',
      toggleActiveBtn: 'Activate',
      toggleHideBtn: 'Hide',
      colProduct: 'Package',
      colTypeIndustry: 'Type & Niche',
      colPrice: 'Price',
      colDemo: 'Live Demo',
      colStatus: 'Status',
      colActions: 'Actions',
      statusOn: 'Active',
      statusOff: 'Hidden',
      modalCreateTitle: 'Create New Digital Package',
      modalEditTitle: 'Edit Package Details',
      saveBtn: 'Save Changes',
      savingBtn: 'Saving...',
      cancelBtn: 'Cancel',
    },
    orders: {
      title: 'Sandbox Orders & Download Access',
      subtitle: 'Monitor order outcomes, 7-day download tokens, and simulated vs real dataset flags.',
      statusAll: 'All Statuses',
      colCode: 'Order Code',
      colStatus: 'Status',
      colTotal: 'Amount',
      colItems: 'Items',
      colType: 'Source',
      colCreated: 'Created',
      colDetail: 'Detail',
      drawerTitle: 'Order & Download Grant Details',
    },
    chatLogs: {
      title: 'AI Advisor Logs & Grounding Audit',
      subtitle: 'Inspect model_name (Gemini LLM vs Stub), retrieved_product_ids, latency & USD cost (0 PII).',
      modelAll: 'All Models',
      modelGemini: 'Gemini LLM',
      modelStub: 'Stub/Fallback',
      suggAll: 'All Replies',
      suggYes: 'With Suggestions',
      suggNo: 'No Suggestions',
      sessionsCount: (n) => `${n} sessions`,
      selectSessionPrompt: 'Select a session on the left to inspect its full message trace.',
      groundingHeading: 'DB Grounding Verification',
      groundedBadge: (n) => `Verified DB (${n} kits)`,
      noSuggestionsBadge: 'No packages suggested',
      retrievedLabel: 'retrieved_product_ids',
      suggestedLabel: 'suggested_products',
    },
  },
  ru: {
    shell: {
      topbarTitle: 'DreamTeam Admin • Панель управления',
      topbarSubtitle: 'Изолированная административная зона, отделённая от клиентской витрины',
      sidebarSubtitle: 'Центр управления',
      adminBadge: 'Админ',
      navAria: 'Навигация админки',
      navItems: [
        { label: 'Аналитика конверсии', description: 'A/B метрики, воронка 14 событий и экспорт' },
        { label: 'Управление товарами', description: 'CRUD пакетов, медиа и Live HTML Demo' },
        { label: 'Управление заказами', description: 'Заказы Sandbox и токены загрузок' },
        { label: 'Журнал AI-помощника', description: 'Проверка Grounding, модели и стоимость' },
      ],
      viewStorefront: 'На витрину',
      openDrawerAria: 'Открыть меню админки',
      closeDrawerAria: 'Закрыть меню админки',
      mobileMenuTitle: 'Навигация админки',
      fallbackName: 'Администратор',
      deniedTitle: 'Требуются права администратора',
      deniedDescLoggedOut:
        'Войдите под учётной записью администратора (role = admin) для доступа к аналитике и управлению.',
      deniedDescNotAdmin:
        'Текущий аккаунт не обладает правами администратора. Смените профиль для продолжения.',
      deniedLoginBtn: 'Войти как Админ (/auth)',
      deniedBackStoreBtn: 'Вернуться на витрину',
      checkingAuth: 'Проверка прав доступа...',
    },
    analytics: {
      pillLive: 'Живая телеметрия • Админ',
      pillSim: 'Включая is_simulated = true',
      pillReal: 'Только реальные (is_simulated = false)',
      heroTitle: 'Центр аналитики A/B и экономики RAG — DreamTeam',
      heroDesc:
        'Прямое сравнение веток chatbot_on и chatbot_off, воронка 14 событий и юнит-экономика AI-запросов.',
      refreshBtn: 'Обновить',
      refreshingBtn: 'Загрузка...',
      toggleRealOnly: 'Только реальные данные',
      toggleWithSim: 'Включить симуляции',
      simWarningTitle: 'ПОКАЗАНЫ СИМУЛИРОВАННЫЕ ДАННЫЕ (is_simulated = true)',
      simWarningDesc:
        'Не используйте симулированные записи в итоговых выводах эксперимента.',
      kpiConsentTag: (p) => `${p}% Согласие`,
      kpiParticipants: 'Всего участников',
      kpiConsented: 'Дали согласие',
      kpiSource: 'Выборка',
      kpiSourceSim: 'Реальные + Тест',
      kpiSourceReal: '100% Реальные',
      kpiCompletedRuns: 'Завершено задач',
      kpiMethod: 'Метод',
      kpiOrdersTitle: 'Заказы Sandbox (Paid)',
      kpiSandboxValue: 'Общая сумма',
      kpiGateway: 'Шлюз',
      kpiAiTitle: 'Расходы и задержка AI',
      kpiAvgCost: 'Цена / ответ',
      kpiTotalTokens: 'Всего токенов',
      dashEl1Eyebrow: 'Фактор 1 • Точность и согласие',
      dashEl1Title: 'Эффект помощника и вовлечённость',
      dashEl1Delta: (d) => `Δ ${d} п.п.`,
      dashEl1RingAcc: 'Верно (С AI)',
      dashEl1RingConsent: 'Доля согласия',
      dashEl1ControlNote: 'Контрольная ветка без AI:',
      dashEl2Eyebrow: 'Фактор 2 • Сравнение AB / BA',
      dashEl2Title: 'Сопоставление chatbot_on и chatbot_off',
      dashEl2MetricAcc: 'Точность выбора (%)',
      dashEl2MetricDur: 'Среднее время (сек)',
      dashEl2MetricConf: 'Уверенность (1–5)',
      dashEl2MetricBuy: 'Покупки Sandbox',
      dashEl2UnitOrder: 'зак.',
      dashEl3Eyebrow: 'Фактор 3 • Реальная воронка',
      dashEl3Title: 'Конверсия 6 этапов',
      funnelLabels: {
        consented: 'Дали согласие',
        product_viewed: 'Просмотр пакета',
        chat_sent: 'Запрос к AI',
        add_to_cart: 'В корзину',
        checkout_started: 'Начало оплаты',
        purchase: 'Оплата завершена',
      },
      dashEl4Eyebrow: 'Фактор 4 • Динамика и модели AI',
      dashEl4Title: 'Активность 7 дней и LLM Mix',
      dashEl4LogsBtn: 'Журнал AI',
      dashEl4ReplyRatio: (n) => `Доля ответов (${n})`,
      dashEl4Grounding: (p) => `Grounding ${p}%`,
      dashEl4TrendLabel: 'Активность по дням (Задачи + Чат + Заказы)',
      dashEl5Eyebrow: 'Фактор 5 • Ниши и статусы',
      dashEl5Title: 'Сегменты и Заказы',
      dashEl5Industries: 'Ниши участников опроса',
      dashEl5IndustriesEmpty: 'Данных по нишам пока нет.',
      dashEl5OrdersLabel: (c, v) => `Заказы Sandbox (${c}) • ${v}`,
      dashEl5DetailsLink: 'Подробнее →',
      dashEl5Paid: 'Оплачены',
      dashEl5Pending: 'Ожидают',
      dashEl5Failed: 'Ошибки / Отмена',
      dashEl5LatestOrder: 'Последний:',
      compareTableTitle: 'Сравнение веток: chatbot_on vs chatbot_off',
      compareTableUnit: 'Источник: scenario_runs',
      colVariant: 'Ветка',
      colCompleted: 'Завершено',
      colCorrect: 'Верно',
      colAccuracy: 'Точность',
      colDuration: 'Время ср.',
      colConfidence: 'Уверенность',
      colPurchase: 'Покупки',
      eventsTitle: 'Матрица 14 событий воронки',
      eventsCoreSub: (n) => `11 общих событий (${n})`,
      eventsChatSub: (n) => `3 события только при chatbot_on (${n})`,
      colEventName: 'Событие',
      colEventCount: 'Срабатываний',
      colEventTrigger: 'Триггер',
      unitEconTitle: 'Экономика AI (RAG)',
      unitEconBtn: 'Журнал AI',
      ueTotalReplies: 'Всего ответов AI',
      ueAvgLatency: 'Средняя задержка',
      ueP95Latency: 'Задержка P95',
      ueTotalTokens: 'Всего токенов',
      ueAvgCost: 'Цена за сообщение',
      exportTitle: 'Экспорт анонимных данных (CSV / JSON)',
      exportDesc: '0 PII — выгрузка без email и имён, только обезличенные коды.',
      exportAnonymizedBadge: '0 PII • Анонимно',
      exportCsvBtn: 'Скачать CSV',
      exportJsonBtn: 'Скачать JSON',
      exportingJsonBtn: 'Экспорт JSON...',
      datasets: [
        { title: 'Прогоны A/B сценариев', description: 'Парные данные AB/BA для тестов McNemar и Wilcoxon.' },
        { title: '14 поведенческих событий', description: 'События для воронки и кластеризации K-Means.' },
        { title: 'Логи RAG и расходы', description: 'Версии промптов, модели, задержка, токены и стоимость.' },
      ],
      recentOrdersTitle: 'Недавние заказы Sandbox',
      openOrdersBtn: 'Все заказы',
      noOrders: 'Заказы под фильтр отсутствуют.',
      colOrderCode: 'Код заказа',
      colOrderStatus: 'Статус',
      colOrderTotal: 'Сумма',
      colOrderDataType: 'Тип',
      colOrderDate: 'Дата',
      colOrderOpen: 'Открыть',
      dataSimLabel: 'Симуляция',
      dataRealLabel: 'Реальный',
      viewBtn: 'Открыть',
    },
    products: {
      title: 'Управление каталогом цифровых продуктов',
      subtitle: 'Добавление, редактирование, показ/скрытие и проверка Live HTML Preview.',
      addBtn: 'Добавить пакет',
      searchPlaceholder: 'Поиск по названию, slug или нише...',
      statusAll: 'Все',
      statusActive: 'Активные',
      statusHidden: 'Скрытые',
      previewBtn: 'Просмотр',
      editBtn: 'Изменить',
      toggleActiveBtn: 'Включить',
      toggleHideBtn: 'Скрыть',
      colProduct: 'Продукт',
      colTypeIndustry: 'Тип и ниша',
      colPrice: 'Цена',
      colDemo: 'Live Demo',
      colStatus: 'Статус',
      colActions: 'Действия',
      statusOn: 'Активен',
      statusOff: 'Скрыт',
      modalCreateTitle: 'Новый цифровой продукт',
      modalEditTitle: 'Редактировать продукт',
      saveBtn: 'Сохранить',
      savingBtn: 'Сохранение...',
      cancelBtn: 'Отмена',
    },
    orders: {
      title: 'Управление заказами и загрузками',
      subtitle: 'Мониторинг Sandbox-заказов и статуса 7-дневных ссылок выдачи файлов.',
      statusAll: 'Все статусы',
      colCode: 'Код',
      colStatus: 'Статус',
      colTotal: 'Сумма',
      colItems: 'Позиций',
      colType: 'Данные',
      colCreated: 'Создан',
      colDetail: 'Детали',
      drawerTitle: 'Карточка заказа и доступов',
    },
    chatLogs: {
      title: 'Журнал AI-помощника и Grounding DB',
      subtitle: 'Мониторинг model_name (Gemini vs Stub), retrieved_product_ids, задержки и цены (0 PII).',
      modelAll: 'Все модели',
      modelGemini: 'Gemini LLM',
      modelStub: 'Stub/Fallback',
      suggAll: 'Все ответы',
      suggYes: 'С рекомендациями',
      suggNo: 'Без рекомендаций',
      sessionsCount: (n) => `${n} диалогов`,
      selectSessionPrompt: 'Выберите диалог слева для просмотра подробностей.',
      groundingHeading: 'Проверка Grounding DB',
      groundedBadge: (n) => `Сверено с БД (${n})`,
      noSuggestionsBadge: 'Без рекомендаций',
      retrievedLabel: 'retrieved_product_ids',
      suggestedLabel: 'suggested_products',
    },
  },
  zh: {
    shell: {
      topbarTitle: 'DreamTeam Admin • 运营管理驾驶舱',
      topbarSubtitle: '与顾客前台完全隔离的后台分析与管理空间',
      sidebarSubtitle: '运营控制台',
      adminBadge: '管理员',
      navAria: '管理后台导航',
      navItems: [
        { label: '转化与实验分析', description: 'A/B 指标、14 项漏斗与匿名数据导出' },
        { label: '数字商品管理', description: '商品增删改、配图与实时 HTML 预览' },
        { label: '订单与下载管理', description: '沙盒订单与 7 天文件下载权限' },
        { label: 'AI 顾问日志审计', description: '数据库对齐检测、模型占比与费用' },
      ],
      viewStorefront: '访问商店前台',
      openDrawerAria: '打开管理菜单',
      closeDrawerAria: '关闭管理菜单',
      mobileMenuTitle: '管理导航菜单',
      fallbackName: '管理员',
      deniedTitle: '仅限系统管理员访问',
      deniedDescLoggedOut: '请使用管理员账号（role = admin）登录后查看统计报表与管理商店。',
      deniedDescNotAdmin: '当前登录账号不具备管理员权限，请切换管理员账号继续访问。',
      deniedLoginBtn: '前往 /auth 登录管理员',
      deniedBackStoreBtn: '返回商店前台',
      checkingAuth: '正在校验管理员权限...',
    },
    analytics: {
      pillLive: '实时遥测 • 管理员',
      pillSim: '包含模拟数据 (is_simulated = true)',
      pillReal: '仅限真实数据 (is_simulated = false)',
      heroTitle: 'A/B 对比实验与 AI RAG 经济分析驾驶舱 — DreamTeam',
      heroDesc: '直观对比 chatbot_on 与 chatbot_off 实验效果、14 项用户行为漏斗及单次 AI 推理成本。',
      refreshBtn: '刷新数据',
      refreshingBtn: '加载中...',
      toggleRealOnly: '仅显示真实数据',
      toggleWithSim: '包含模拟数据',
      simWarningTitle: '当前包含模拟数据 (is_simulated = true)',
      simWarningDesc: '请勿将模拟样本数据直接用于毕业论文或正式实验结论。',
      kpiConsentTag: (p) => `${p}% 同意`,
      kpiParticipants: '累计参与人数',
      kpiConsented: '已同意知情 (Consent)',
      kpiSource: '数据来源',
      kpiSourceSim: '真实 + 模拟',
      kpiSourceReal: '100% 真实',
      kpiCompletedRuns: '已完成评测轮次',
      kpiMethod: '实验设计',
      kpiOrdersTitle: '沙盒订单 (Paid)',
      kpiSandboxValue: '意向交易总额',
      kpiGateway: '模拟通道',
      kpiAiTitle: 'AI 费用与延迟',
      kpiAvgCost: '平均单次成本',
      kpiTotalTokens: '累计 Tokens',
      dashEl1Eyebrow: '要素 1 • 准确率与参与率',
      dashEl1Title: '智能助手增益与知情同意率',
      dashEl1Delta: (d) => `Δ ${d} 百分点`,
      dashEl1RingAcc: '准确率（启用助手）',
      dashEl1RingConsent: '同意参与率',
      dashEl1ControlNote: '未启用助手对照组准确率：',
      dashEl2Eyebrow: '要素 2 • AB / BA 对照柱状图',
      dashEl2Title: 'chatbot_on 与 chatbot_off 核心对比',
      dashEl2MetricAcc: '选型准确率 (%)',
      dashEl2MetricDur: '平均耗时 (秒)',
      dashEl2MetricConf: '决策把握度 (1–5)',
      dashEl2MetricBuy: '沙盒下单意向',
      dashEl2UnitOrder: '笔',
      dashEl3Eyebrow: '要素 3 • 真实行为漏斗',
      dashEl3Title: '6 阶段转化链路',
      funnelLabels: {
        consented: '同意参与',
        product_viewed: '查看商品详情',
        chat_sent: '咨询 AI 顾问',
        add_to_cart: '加入购物车',
        checkout_started: '发起结算',
        purchase: '完成订单',
      },
      dashEl4Eyebrow: '要素 4 • 7 日趋势与模型占比',
      dashEl4Title: '近期活跃趋势与 LLM 构成',
      dashEl4LogsBtn: 'AI 日志',
      dashEl4ReplyRatio: (n) => `回复分布（共 ${n} 条）`,
      dashEl4Grounding: (p) => `实库对齐 ${p}%`,
      dashEl4TrendLabel: '每日活动量（任务完成 + 对话 + 订单）',
      dashEl5Eyebrow: '要素 5 • 行业与订单状态',
      dashEl5Title: '店铺行业与订单构成',
      dashEl5Industries: '参与评测的店铺行业分布',
      dashEl5IndustriesEmpty: '暂无行业画像数据。',
      dashEl5OrdersLabel: (c, v) => `沙盒订单 (${c}) • ${v}`,
      dashEl5DetailsLink: '详情 →',
      dashEl5Paid: '已支付',
      dashEl5Pending: '待支付',
      dashEl5Failed: '失败 / 取消',
      dashEl5LatestOrder: '最新订单：',
      compareTableTitle: '两组实验详细对照表：chatbot_on vs chatbot_off',
      compareTableUnit: '统计单位：scenario_runs',
      colVariant: '实验分组',
      colCompleted: '完成轮次',
      colCorrect: '选对次数',
      colAccuracy: '准确率',
      colDuration: '平均耗时(秒)',
      colConfidence: '平均把握度',
      colPurchase: '沙盒下单',
      eventsTitle: '14 项标准化行为埋点矩阵',
      eventsCoreSub: (n) => `11 项全量通用事件 (${n})`,
      eventsChatSub: (n) => `3 项仅启用助手时触发事件 (${n})`,
      colEventName: '事件标识',
      colEventCount: '累计触发',
      colEventTrigger: '触发时机说明',
      unitEconTitle: 'AI 单元经济效益 (RAG)',
      unitEconBtn: '查看 AI 日志',
      ueTotalReplies: 'AI 累计回复条数',
      ueAvgLatency: '平均响应延迟',
      ueP95Latency: 'P95 延迟',
      ueTotalTokens: '总消耗 Token',
      ueAvgCost: '单条回复均价',
      exportTitle: '匿名学术数据集导出 (CSV / JSON)',
      exportDesc: '零个人隐私泄露 — 仅包含 participant_code、assignment_id、visitor_id。',
      exportAnonymizedBadge: '0 PII • 学术匿名导出',
      exportCsvBtn: '导出 CSV',
      exportJsonBtn: '导出 JSON',
      exportingJsonBtn: '正在导出 JSON...',
      datasets: [
        { title: 'A/B 实验答题明细', description: '成对 AB/BA 实验数据，可直接导入 McNemar 与 Wilcoxon 统计检验。' },
        { title: '14 项行为事件流水', description: '完整前端埋点流水，支持漏斗分析与 K-Means 用户分群。' },
        { title: 'Gemini RAG 与耗费日志', description: '提示词版本、模型名称、召回商品 ID、延迟与美元成本明细。' },
      ],
      recentOrdersTitle: '近期沙盒订单',
      openOrdersBtn: '前往订单管理',
      noOrders: '当前筛选条件下暂无订单。',
      colOrderCode: '订单号',
      colOrderStatus: '状态',
      colOrderTotal: '总金额',
      colOrderDataType: '类型',
      colOrderDate: '创建时间',
      colOrderOpen: '操作',
      dataSimLabel: '模拟',
      dataRealLabel: '真实',
      viewBtn: '查看',
    },
    products: {
      title: '数字商品目录与预览管理',
      subtitle: '支持新建、编辑、上下架套件并直接在后台预览 Live HTML 效果。',
      addBtn: '新增商品',
      searchPlaceholder: '搜索商品名、Slug 或行业...',
      statusAll: '全部',
      statusActive: '已上架',
      statusHidden: '已隐藏',
      previewBtn: '预览效果',
      editBtn: '编辑',
      toggleActiveBtn: '上架',
      toggleHideBtn: '下架',
      colProduct: '数字套件',
      colTypeIndustry: '类别与行业',
      colPrice: '价格',
      colDemo: '在线演示',
      colStatus: '状态',
      colActions: '操作',
      statusOn: '售卖中',
      statusOff: '已下架',
      modalCreateTitle: '新增数字套件',
      modalEditTitle: '编辑数字套件',
      saveBtn: '保存更改',
      savingBtn: '保存中...',
      cancelBtn: '取消',
    },
    orders: {
      title: '沙盒订单与文件授权管理',
      subtitle: '查看所有测试订单支付状态与 7 天资源下载凭证详情。',
      statusAll: '全部状态',
      colCode: '订单编号',
      colStatus: '状态',
      colTotal: '金额',
      colItems: '件数',
      colType: '数据源',
      colCreated: '下单时间',
      colDetail: '操作',
      drawerTitle: '订单详情与下载凭证',
    },
    chatLogs: {
      title: 'AI 智能顾问对话日志与实库校验',
      subtitle: '审计 model_name (Gemini vs Stub)、召回商品 ID、延迟及成本（0 PII 匿名）。',
      modelAll: '全部模型',
      modelGemini: 'Gemini LLM',
      modelStub: 'Stub/Fallback',
      suggAll: '全部回复',
      suggYes: '含商品推荐',
      suggNo: '无推荐商品',
      sessionsCount: (n) => `共 ${n} 段会话`,
      selectSessionPrompt: '请在左侧列表选择一段会话查看完整对话链路。',
      groundingHeading: '数据库实库校验 (Grounding DB)',
      groundedBadge: (n) => `已核验入库 (${n} 个商品)`,
      noSuggestionsBadge: '本次未附带推荐卡片',
      retrievedLabel: 'retrieved_product_ids',
      suggestedLabel: 'suggested_products',
    },
  },
};
