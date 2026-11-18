import type { AppLocale } from './types';

export interface CommerceMessages {
  catalog: {
    eyebrow: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchBtn: string;
    typeAll: string;
    industryAll: string;
    anyBudget: string;
    underVnd: (label: string) => string;
    sortNewest: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    filterReset: string;
    showingRange: (shown: number, total: number) => string;
    addToCart: string;
    added: string;
    details: string;
    emptyTitle: string;
    emptyDesc: string;
    surveyReturnBanner: string;
    surveySelectTip: string;
    prevPage: string;
    nextPage: string;
    pageOf: (page: number, totalPages: number) => string;
  };
  productDetail: {
    homeCrumb: string;
    catalogCrumb: string;
    priceLabel: string;
    addToCart: string;
    addedToast: string;
    buyNow: string;
    surveyChooseThis: string;
    setupLabel: string;
    setupMinutes: (mins: number) => string;
    targetTeamLabel: string;
    platformsLabel: string;
    deliverablesHeading: string;
    guideHeading: string;
    licenseHeading: string;
    caseStudiesHeading: string;
    caseStudiesPilotTag: string;
    relatedHeading: string;
    notFoundTitle: string;
    notFoundDesc: string;
    backCatalog: string;
  };
  cart: {
    step1: string;
    step2: string;
    step3: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    clearAll: string;
    emptyTitle: string;
    emptyDesc: string;
    browseBtn: string;
    summaryHeading: string;
    subtotalLabel: string;
    totalItemsLabel: (count: number) => string;
    checkoutBtn: string;
    removeItem: string;
    recentOrdersTitle: string;
  };
  checkout: {
    eyebrow: string;
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyDesc: string;
    createOrderBtn: string;
    creatingBtn: string;
    orderCreatedTitle: (code: string) => string;
    sandboxHint: string;
    confirmPaidBtn: string;
    confirmFailedBtn: string;
    payingBtn: string;
    failedNotice: string;
    summaryTitle: string;
    goToOrders: string;
  };
  orders: {
    eyebrow: string;
    title: string;
    subtitle: string;
    sandboxNote: string;
    filterAll: string;
    filterPaid: string;
    filterPending: string;
    filterFailed: string;
    showingCount: (shown: number, total: number) => string;
    emptyAllTitle: string;
    emptyFilteredTitle: string;
    emptyAllDesc: string;
    emptyFilteredDesc: string;
    viewAllBtn: string;
    readyPackages: (count: number) => string;
    totalOrderValue: string;
    viewAndDownload: string;
    backToOrders: string;
    detailTitle: (code: string) => string;
    statusLabel: string;
    createdAtLabel: string;
    paidAtLabel: string;
    paymentMethodLabel: string;
    itemsTitle: string;
    downloadsTitle: string;
    downloadsUsed: (used: number, max: number) => string;
    expiresAt: string;
    downloadBtn: string;
    downloadingBtn: string;
    previewTitle: string;
    completePayTitle: string;
  };
  shopDashboard: {
    eyebrow: string;
    titleDefault: string;
    subtitleDefault: string;
    ordersTitle: string;
    ordersSubtitle: string;
    chooseMoreBtn: string;
    el1Eyebrow: string;
    el1Title: string;
    el1OrdersBadge: (paid: number, total: number) => string;
    el1RingPay: string;
    el1RingQuota: string;
    el1QuotaSub: (total: number) => string;
    el1None: string;
    el2Eyebrow: string;
    el2Title: string;
    el2PaidBadge: (count: number) => string;
    el2TotalPaid: string;
    el2AvgOrder: string;
    el2TotalItems: string;
    el2Pending: string;
    el2UnitPkg: string;
    el2UnitOrder: string;
    el3Eyebrow: string;
    el3Title: string;
    el4Eyebrow: string;
    el4Title: string;
    el5Eyebrow: string;
    el5Title: string;
    el5EmptyPrefix: string;
    el5EmptyLink: string;
    el5EmptySuffix: string;
    el5Downloaded: (used: number, max: number) => string;
    el5Ready: string;
  };
  auth: {
    accountEyebrow: string;
    roleAdmin: string;
    roleCustomer: string;
    industryPrefix: string;
    adminAreaBtn: string;
    ordersLibBtn: string;
    catalogBtn: string;
    welcomeBack: string;
    createTitle: string;
    loginDesc: string;
    registerDesc: string;
    tabLogin: string;
    tabRegister: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    emailLabel: string;
    passwordLabel: string;
    passwordStrength: string;
    shopCategoryLabel: string;
    shopCategoryPlaceholder: string;
    submitLogin: string;
    submitRegister: string;
    submitting: string;
    surveyBannerTitle: string;
    surveyBannerDesc: string;
    surveyBannerLink: string;
    demoTitle: string;
    demoDesc: string;
    demoCustomerTitle: string;
    demoCustomerBtn: string;
    demoAdminTitle: string;
    demoAdminBtn: string;
    demoPersonalNote: string;
    brandBadge: string;
    brandHeading: string;
    brandLead: string;
    brandBenefits: [string, string, string];
    caseTag: string;
    caseSub: string;
    caseQuote: string;
    caseFoot: string;
    caseLink: string;
  };
  experiment: {
    eyebrow: string;
    introTitle: string;
    introDesc: string;
    stepConsentHeading: string;
    consentLabel: string;
    consentError: string;
    industryLabel: string;
    teamSizeLabel: string;
    roleLabel: string;
    roleShopOwner: string;
    roleStudent: string;
    channelsLabel: string;
    startBtn: string;
    startingBtn: string;
    guidanceOn: string;
    guidanceOff: string;
    taskBadge: (step: number, total: number) => string;
    browseCatalog: string;
    openAdvisorBtn: string;
    decisionHeading: string;
    selectPackageLabel: string;
    selectPackagePlaceholder: string;
    confidenceLabel: string;
    likert: [string, string, string, string, string];
    noteLabel: string;
    notePlaceholder: string;
    submitDecision: string;
    submittingDecision: string;
    errNoProduct: string;
    errNoConfidence: string;
    nextBannerTitle: string;
    finishedEyebrow: string;
    finishedTitle: string;
    finishedDesc: string;
    participantCodeLabel: string;
    restartBtn: string;
    goStoreBtn: string;
  };
}

export const COMMERCE_MESSAGES: Record<AppLocale, CommerceMessages> = {
  vi: {
    catalog: {
      eyebrow: 'Danh mục giải pháp số',
      title: 'Tất cả Template, Prompt Pack & Workflow cho Shop nhỏ',
      subtitle:
        'Lọc nhanh theo loại sản phẩm, ngành hàng hoặc mức ngân sách dự kiến của bạn.',
      searchPlaceholder: 'Tìm mẫu web mỹ phẩm, lookbook, menu QR, Google Sheets...',
      searchBtn: 'Tìm kiếm',
      typeAll: 'Tất cả loại',
      industryAll: 'Tất cả ngành',
      anyBudget: 'Mọi mức giá',
      underVnd: (l) => `Dưới ${l}`,
      sortNewest: 'Mới nhất',
      sortPriceAsc: 'Giá tăng dần',
      sortPriceDesc: 'Giá giảm dần',
      filterReset: 'Xóa bộ lọc',
      showingRange: (s, t) => `Hiển thị ${s} / ${t} gói giải pháp`,
      addToCart: 'Thêm vào giỏ',
      added: 'Đã thêm',
      details: 'Xem chi tiết',
      emptyTitle: 'Không tìm thấy gói phù hợp bộ lọc',
      emptyDesc: 'Hãy thử bỏ bớt điều kiện lọc ngành hàng hoặc mở rộng mức ngân sách.',
      surveyReturnBanner:
        'Bạn đang trong nhiệm vụ đánh giá. Sau khi xem kỹ gói phù hợp, quay lại màn hình khảo sát để chốt lựa chọn.',
      surveySelectTip: 'Chốt gói này trong Khảo sát',
      prevPage: 'Trang trước',
      nextPage: 'Trang sau',
      pageOf: (p, t) => `Trang ${p}/${t}`,
    },
    productDetail: {
      homeCrumb: 'Trang chủ',
      catalogCrumb: 'Sản phẩm',
      priceLabel: 'Giá trọn gói (đặt thử nghiệm miễn phí)',
      addToCart: 'Thêm vào giỏ hàng',
      addedToast: 'Đã thêm vào giỏ!',
      buyNow: 'Thanh toán thử nghiệm ngay',
      surveyChooseThis: 'Chọn gói này cho nhiệm vụ hiện tại',
      setupLabel: 'Thời gian cài đặt',
      setupMinutes: (m) => `Khoảng ${m} phút`,
      targetTeamLabel: 'Quy mô phù hợp',
      platformsLabel: 'Kênh hỗ trợ',
      deliverablesHeading: 'Thành phần bàn giao trong gói',
      guideHeading: 'Hướng dẫn triển khai nhanh',
      licenseHeading: 'Thông tin Minh bạch Bản quyền',
      caseStudiesHeading: 'Trải nghiệm thực tế (Case Study mẫu)',
      caseStudiesPilotTag: 'Phản hồi từ đợt chạy thử nghiệm mẫu',
      relatedHeading: 'Giải pháp cùng ngành hàng',
      notFoundTitle: 'Không tìm thấy sản phẩm',
      notFoundDesc: 'Sản phẩm này có thể đã tạm ẩn hoặc đường dẫn không tồn tại.',
      backCatalog: 'Quay lại Danh mục',
    },
    cart: {
      step1: 'Giỏ hàng',
      step2: 'Xác nhận đơn thử nghiệm',
      step3: 'Nhận file ngay',
      eyebrow: 'Giỏ hàng của bạn',
      title: 'Kiểm tra các gói giải pháp đã chọn',
      subtitle:
        'Hệ thống đang chạy chế độ đặt hàng thử nghiệm (Sandbox) — kiểm tra tạo đơn và tải file mà không trừ tiền thật.',
      clearAll: 'Xóa toàn bộ giỏ',
      emptyTitle: 'Giỏ hàng hiện chưa có gói sản phẩm nào',
      emptyDesc:
        'Khám phá danh mục Template Website, Prompt Pack AI hoặc Workflow tự động để trải nghiệm quy trình nhận file.',
      browseBtn: 'Khám phá sản phẩm',
      summaryHeading: 'Tóm tắt đơn hàng',
      subtotalLabel: 'Tạm tính',
      totalItemsLabel: (n) => `${n} gói sản phẩm`,
      checkoutBtn: 'Tiếp tục xác nhận đơn',
      removeItem: 'Xóa',
      recentOrdersTitle: 'Đơn hàng gần đây trong phiên',
    },
    checkout: {
      eyebrow: 'Thanh toán thử nghiệm',
      title: 'Xác nhận đơn hàng & Mở kho link tải',
      subtitle:
        'Chế độ thử nghiệm không trừ tiền thật — xác nhận để mở khóa link tải tức thì (hạn 7 ngày, tối đa 5 lượt).',
      emptyTitle: 'Chưa có sản phẩm trong giỏ hàng',
      emptyDesc: 'Hãy thêm ít nhất 1 gói giải pháp vào giỏ trước khi xác nhận đơn.',
      createOrderBtn: 'Tạo đơn thử nghiệm',
      creatingBtn: 'Đang tạo đơn...',
      orderCreatedTitle: (code) => `Đã tạo đơn ${code}`,
      sandboxHint: 'Chọn kết quả mô phỏng cổng thanh toán bên dưới để kiểm tra luồng nhận file:',
      confirmPaidBtn: 'Xác nhận Đã thanh toán (Mở link tải)',
      confirmFailedBtn: 'Mô phỏng Thanh toán thất bại',
      payingBtn: 'Đang xử lý...',
      failedNotice:
        'Giao dịch thử nghiệm vừa mô phỏng trạng thái chưa thành công. Bạn có thể bấm xác nhận lại bất kỳ lúc nào.',
      summaryTitle: 'Chi tiết thanh toán',
      goToOrders: 'Mở Thư viện Đơn hàng',
    },
    orders: {
      eyebrow: 'Thư viện đơn hàng & Tải file',
      title: 'Lịch sử đơn hàng đã mua',
      subtitle:
        'Theo dõi các đơn hàng thử nghiệm và mở kho link tải an toàn (hạn 7 ngày, tối đa 5 lượt tải cho mỗi gói).',
      sandboxNote:
        'Hệ thống đang chạy chế độ đặt hàng thử nghiệm (Sandbox) — mọi đơn hàng đều phục vụ kiểm tra quy trình và nhận file ngay mà không bị trừ tiền thật.',
      filterAll: 'Tất cả',
      filterPaid: 'Đã thanh toán',
      filterPending: 'Chờ thanh toán',
      filterFailed: 'Thất bại',
      showingCount: (s, t) => `Hiển thị ${s} / ${t} đơn`,
      emptyAllTitle: 'Bạn chưa có đơn hàng nào trong phiên này',
      emptyFilteredTitle: 'Không có đơn hàng nào thuộc trạng thái đang chọn',
      emptyAllDesc:
        'Hãy chọn gói Template Website, Prompt Pack AI hoặc Workflow tự động và thử xác nhận đơn để nhận link tải file ngay.',
      emptyFilteredDesc: 'Bấm chọn Tất cả để xem toàn bộ lịch sử đơn hàng của bạn.',
      viewAllBtn: 'Xem tất cả đơn hàng',
      readyPackages: (n) => `${n} gói sẵn sàng tải`,
      totalOrderValue: 'Tổng giá trị đơn',
      viewAndDownload: 'Xem đơn & Tải file',
      backToOrders: 'Danh sách đơn hàng',
      detailTitle: (code) => `Đơn hàng ${code}`,
      statusLabel: 'Trạng thái',
      createdAtLabel: 'Ngày tạo đơn',
      paidAtLabel: 'Thời điểm xác nhận',
      paymentMethodLabel: 'Hình thức',
      itemsTitle: 'Danh sách gói trong đơn',
      downloadsTitle: 'Kho link tải tài nguyên (Hiệu lực 7 ngày)',
      downloadsUsed: (u, m) => `Đã tải ${u} / ${m} lượt`,
      expiresAt: 'Hết hạn lúc',
      downloadBtn: 'Tải file ngay',
      downloadingBtn: 'Đang chuẩn bị link...',
      previewTitle: 'Xem trước nội dung bàn giao',
      completePayTitle: 'Đơn hàng đang chờ xác nhận thanh toán thử nghiệm',
    },
    shopDashboard: {
      eyebrow: 'Tổng quan hoạt động shop (5 chỉ số)',
      titleDefault: 'Bảng Thống Kê Tài Khoản Shop',
      subtitleDefault:
        'Theo dõi tiến độ đơn hàng, tổng chi tiêu, cơ cấu gói số và lượt tải còn lại của bạn.',
      ordersTitle: 'Thống kê Đơn hàng & Gói số',
      ordersSubtitle:
        'Tổng hợp tỷ lệ hoàn tất, chi tiêu đã thanh toán, phân loại gói sở hữu và lượt tải còn lại của shop.',
      chooseMoreBtn: 'Chọn thêm gói mới',
      el1Eyebrow: 'Yếu tố 1 • Trạng thái Sở hữu',
      el1Title: 'Hoàn tất Đơn & Lượt tải',
      el1OrdersBadge: (p, t) => `${p}/${t} đơn`,
      el1RingPay: 'Tỉ lệ thanh toán',
      el1RingQuota: 'Lượt tải còn lại',
      el1QuotaSub: (q) => `/ ${q} lượt`,
      el1None: 'Chưa có',
      el2Eyebrow: 'Yếu tố 2 • Ngân sách Đầu tư Công cụ',
      el2Title: 'Tổng Chi tiêu & Quy mô Đơn',
      el2PaidBadge: (c) => `Đã chi trả ${c} đơn`,
      el2TotalPaid: 'Tổng giá trị đã thanh toán',
      el2AvgOrder: 'TB mỗi đơn',
      el2TotalItems: 'Tổng gói số',
      el2Pending: 'Đang chờ',
      el2UnitPkg: 'gói',
      el2UnitOrder: 'đơn',
      el3Eyebrow: 'Yếu tố 3 • Phân Bổ Danh Mục',
      el3Title: 'Loại Gói Đã Chọn',
      el4Eyebrow: 'Yếu tố 4 • Tần suất Giao dịch',
      el4Title: 'Đơn hàng Theo Ngày',
      el5Eyebrow: 'Yếu tố 5 • Tải Nhanh Gần Nhất',
      el5Title: 'Giao dịch & Hạn tải',
      el5EmptyPrefix: 'Chưa có đơn hàng nào. Chọn một gói tại',
      el5EmptyLink: 'Danh mục sản phẩm',
      el5EmptySuffix: 'để bắt đầu.',
      el5Downloaded: (u, m) => ` • Đã tải ${u}/${m}`,
      el5Ready: 'Sẵn sàng',
    },
    auth: {
      accountEyebrow: 'Không gian Tài khoản Chủ Shop',
      roleAdmin: 'Quản trị viên',
      roleCustomer: 'Chủ shop / Khách',
      industryPrefix: 'Ngành',
      adminAreaBtn: 'Khu vực Quản trị',
      ordersLibBtn: 'Thư viện đơn hàng',
      catalogBtn: 'Xem danh mục',
      welcomeBack: 'Chào mừng trở lại',
      createTitle: 'Tạo tài khoản DreamTeam',
      loginDesc:
        'Đăng nhập để quản lý thư viện đơn hàng đã mua hoặc mở khu vực quản trị cửa hàng.',
      registerDesc: 'Lưu lịch sử đơn tải file và thông tin ngành hàng của shop.',
      tabLogin: 'Đăng nhập',
      tabRegister: 'Đăng ký',
      fullNameLabel: 'Họ và tên / Tên shop',
      fullNamePlaceholder: 'Ví dụ: Tiệm Mỹ Phẩm An Nhiên',
      emailLabel: 'Email',
      passwordLabel: 'Mật khẩu',
      passwordStrength: 'Độ mạnh mật khẩu',
      shopCategoryLabel: 'Ngành hàng của shop (tùy chọn)',
      shopCategoryPlaceholder: 'Mỹ phẩm, Thời trang, F&B...',
      submitLogin: 'Đăng nhập',
      submitRegister: 'Tạo tài khoản',
      submitting: 'Đang xử lý...',
      surveyBannerTitle: 'Trải nghiệm mua sắm & khảo sát không cần tạo tài khoản',
      surveyBannerDesc:
        'Bạn có thể xem mẫu, thêm vào giỏ hoặc tham gia đánh giá trải nghiệm ngay mà không cần đăng ký.',
      surveyBannerLink: 'Tham gia khảo sát trải nghiệm →',
      demoTitle: 'Tài khoản dùng thử',
      demoDesc:
        'Hai tài khoản dưới đây dùng để trải nghiệm nhanh vai trò Khách hàng (Chủ shop) hoặc Quản trị viên:',
      demoCustomerTitle: 'Chủ shop dùng thử',
      demoCustomerBtn: 'Điền nhanh Khách',
      demoAdminTitle: 'Quản trị viên dùng thử',
      demoAdminBtn: 'Điền nhanh Admin',
      demoPersonalNote:
        'Nếu đăng ký mới tài khoản cá nhân, hãy dùng email thật hợp lệ để đồng bộ lịch sử tải file.',
      brandBadge: 'DreamTeam • Shop Nhỏ 1–3 Người',
      brandHeading: 'Mọi công cụ số tinh gọn cho chủ shop bán hàng đa kênh',
      brandLead:
        'Kết hợp Template Website chuẩn di động 375px, bộ Prompt Pack thực chiến và Trợ lý tư vấn chọn gói từ kho sản phẩm thực tế.',
      brandBenefits: [
        'Template & Prompt tối ưu sẵn cho Shopee, TikTok Shop, Facebook với hướng dẫn 15–30 phút',
        'Minh bạch bản quyền 3 cấp rõ ràng (Thiết kế gốc, Điều chỉnh có nguồn, Bản quyền hợp lệ)',
        'Đặt hàng thử nghiệm miễn phí và mở kho link tải riêng tư thời hạn 7 ngày tức thì',
      ],
      caseTag: 'Case Study mẫu thử nghiệm',
      caseSub: 'Từ đợt chạy thử nghiệm mẫu',
      caseQuote:
        '“Tiệm Dưỡng Da An Nhiên (shop mỹ phẩm 2 nhân sự) chọn mẫu Landing Page chuẩn 375px hiển thị rõ số công bố sản phẩm và bảng thành phần dịu nhẹ — hoàn thiện trong 25 phút.”',
      caseFoot: 'Từ đợt chạy thử nghiệm mẫu • Quy mô 2 người',
      caseLink: 'Xem gói Mỹ phẩm',
    },
    experiment: {
      eyebrow: 'Không gian Khảo sát Trải nghiệm',
      introTitle: 'Đánh giá trải nghiệm chọn gói giải pháp cho shop nhỏ',
      introDesc:
        'Bạn sẽ thực hiện lần lượt 2 tình huống chọn gói ngắn (mỗi tình huống 1–2 phút) để đội ngũ đánh giá hiệu quả hỗ trợ của giao diện.',
      stepConsentHeading: 'Bước 1: Đồng ý tham gia & Hồ sơ shop mẫu',
      consentLabel:
        'Tôi hiểu đây là khảo sát học thuật ẩn danh (không thu thập thông tin nhạy cảm cá nhân) và đồng ý tham gia.',
      consentError: 'Vui lòng đánh dấu đồng ý trước khi bắt đầu.',
      industryLabel: 'Ngành hàng bạn muốn đóng vai',
      teamSizeLabel: 'Số người vận hành shop',
      roleLabel: 'Vai trò tham gia',
      roleShopOwner: 'Chủ shop thực tế',
      roleStudent: 'Sinh viên / Người trải nghiệm đóng vai',
      channelsLabel: 'Kênh bán hàng quan tâm',
      startBtn: 'Bắt đầu nhiệm vụ đầu tiên',
      startingBtn: 'Đang khởi tạo...',
      guidanceOn:
        'Gợi ý: Ở nhiệm vụ này, bạn có thể bấm nút Trợ lý tư vấn ở góc dưới bên phải hoặc tự duyệt danh mục sản phẩm.',
      guidanceOff:
        'Hướng dẫn: Ở nhiệm vụ này, bạn hãy tự tìm kiếm, lọc và so sánh các gói trong danh mục sản phẩm để chọn giải pháp phù hợp nhất.',
      taskBadge: (s, t) => `Nhiệm vụ ${s}/${t}`,
      browseCatalog: 'Mở Danh mục để xem chi tiết',
      openAdvisorBtn: 'Mở Trợ lý tư vấn',
      decisionHeading: 'Chốt lựa chọn cho nhiệm vụ này',
      selectPackageLabel: 'Gói sản phẩm bạn chọn',
      selectPackagePlaceholder: '-- Chọn 1 gói giải pháp phù hợp --',
      confidenceLabel: 'Mức độ tự tin với lựa chọn này (1–5)',
      likert: ['Rất phân vân', 'Hơi phân vân', 'Trung bình', 'Khá tự tin', 'Rất tự tin'],
      noteLabel: 'Ghi chú ngắn (tùy chọn)',
      notePlaceholder: 'Lý do ngắn gọn bạn chọn gói này...',
      submitDecision: 'Hoàn tất nhiệm vụ',
      submittingDecision: 'Đang lưu kết quả...',
      errNoProduct: 'Vui lòng chọn 1 gói sản phẩm phù hợp với nhiệm vụ này.',
      errNoConfidence: 'Vui lòng chọn mức độ tự tin từ 1 đến 5.',
      nextBannerTitle: 'Đã ghi nhận nhiệm vụ vừa rồi — mời bạn tiếp tục nhiệm vụ tiếp theo!',
      finishedEyebrow: 'Hoàn thành',
      finishedTitle: 'Cảm ơn bạn đã hoàn tất khảo sát!',
      finishedDesc:
        'Phản hồi ẩn danh của bạn đã được ghi nhận an toàn để cải thiện trải nghiệm chọn gói số cho chủ shop nhỏ.',
      participantCodeLabel: 'Mã phiên đối chiếu',
      restartBtn: 'Thực hiện phiên mới',
      goStoreBtn: 'Quay lại Mặt tiền Cửa hàng',
    },
  },
  en: {
    catalog: {
      eyebrow: 'Digital Solutions Catalog',
      title: 'All Templates, Prompt Packs & Automation Workflows',
      subtitle:
        'Filter rapidly by kit format, shop niche, or maximum budget ceiling.',
      searchPlaceholder: 'Search skincare template, lookbook, QR menu, Sheets...',
      searchBtn: 'Search',
      typeAll: 'All Formats',
      industryAll: 'All Niches',
      anyBudget: 'Any Budget',
      underVnd: (l) => `Under ${l}`,
      sortNewest: 'Newest',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      filterReset: 'Clear Filters',
      showingRange: (s, t) => `Showing ${s} of ${t} kits`,
      addToCart: 'Add to Cart',
      added: 'Added',
      details: 'View Details',
      emptyTitle: 'No packages match your current filters',
      emptyDesc: 'Try broadening the budget cap or clearing the industry filter.',
      surveyReturnBanner:
        'Study task active: after reviewing suitable options here, return to submit your choice.',
      surveySelectTip: 'Pick this kit in Study',
      prevPage: 'Previous',
      nextPage: 'Next',
      pageOf: (p, t) => `Page ${p}/${t}`,
    },
    productDetail: {
      homeCrumb: 'Home',
      catalogCrumb: 'Catalog',
      priceLabel: 'Bundle Price (Free Sandbox Trial)',
      addToCart: 'Add to Cart',
      addedToast: 'Added to cart!',
      buyNow: 'Sandbox Checkout Now',
      surveyChooseThis: 'Select this kit for active task',
      setupLabel: 'Setup Time',
      setupMinutes: (m) => `Approx. ${m} min`,
      targetTeamLabel: 'Ideal Team Size',
      platformsLabel: 'Target Channels',
      deliverablesHeading: 'Included Deliverables',
      guideHeading: 'Quick Implementation Guide',
      licenseHeading: 'Transparent Licensing Notice',
      caseStudiesHeading: 'Real-World Pilot Case Studies',
      caseStudiesPilotTag: 'Pilot trial scenario feedback',
      relatedHeading: 'Similar Kits in This Niche',
      notFoundTitle: 'Package Not Found',
      notFoundDesc: 'This product may have been archived or the link is invalid.',
      backCatalog: 'Back to Catalog',
    },
    cart: {
      step1: 'Cart',
      step2: 'Sandbox Confirmation',
      step3: 'Instant Download',
      eyebrow: 'Your Shopping Cart',
      title: 'Review Selected Digital Packages',
      subtitle:
        'Sandbox ordering mode enabled — test full checkout and instant delivery with zero real charge.',
      clearAll: 'Clear Cart',
      emptyTitle: 'Your cart is currently empty',
      emptyDesc:
        'Browse Website Templates, AI Prompt Packs, and Automation Workflows to add kits to your cart.',
      browseBtn: 'Explore Catalog',
      summaryHeading: 'Order Summary',
      subtotalLabel: 'Subtotal',
      totalItemsLabel: (n) => `${n} digital items`,
      checkoutBtn: 'Proceed to Confirmation',
      removeItem: 'Remove',
      recentOrdersTitle: 'Recent Session Orders',
    },
    checkout: {
      eyebrow: 'Sandbox Checkout',
      title: 'Confirm Order & Unlock Download Library',
      subtitle:
        'Safe Sandbox mode with zero billing — confirm to issue 7-day private download links (max 5 downloads each).',
      emptyTitle: 'No items in your cart',
      emptyDesc: 'Add at least one kit before creating a sandbox order.',
      createOrderBtn: 'Create Sandbox Order',
      creatingBtn: 'Creating order...',
      orderCreatedTitle: (code) => `Order Created: ${code}`,
      sandboxHint: 'Choose a simulated payment outcome below to verify delivery:',
      confirmPaidBtn: 'Confirm Paid (Unlock Files)',
      confirmFailedBtn: 'Simulate Payment Failure',
      payingBtn: 'Processing...',
      failedNotice:
        'Payment simulation returned Failed status. You may retry payment confirmation anytime.',
      summaryTitle: 'Payment Summary',
      goToOrders: 'Open Orders Library',
    },
    orders: {
      eyebrow: 'Orders & Download Library',
      title: 'Purchase History & File Vault',
      subtitle:
        'Track sandbox orders and access private download links (7-day expiry, up to 5 downloads per kit).',
      sandboxNote:
        'Running in Sandbox Mode — all orders demonstrate checkout and instant file delivery without real charges.',
      filterAll: 'All',
      filterPaid: 'Paid',
      filterPending: 'Pending',
      filterFailed: 'Failed',
      showingCount: (s, t) => `Showing ${s} / ${t} orders`,
      emptyAllTitle: 'No orders placed in this session yet',
      emptyFilteredTitle: 'No orders match this status filter',
      emptyAllDesc:
        'Pick a Website Template, AI Prompt Pack, or Workflow and complete sandbox checkout to unlock instant downloads.',
      emptyFilteredDesc: 'Select "All" to display your entire order history.',
      viewAllBtn: 'Show All Orders',
      readyPackages: (n) => `${n} files ready`,
      totalOrderValue: 'Order Total',
      viewAndDownload: 'View & Download',
      backToOrders: 'All Orders',
      detailTitle: (code) => `Order ${code}`,
      statusLabel: 'Status',
      createdAtLabel: 'Created At',
      paidAtLabel: 'Confirmed At',
      paymentMethodLabel: 'Provider',
      itemsTitle: 'Purchased Packages',
      downloadsTitle: 'Private Download Vault (Valid 7 Days)',
      downloadsUsed: (u, m) => `Used ${u} / ${m} downloads`,
      expiresAt: 'Expires',
      downloadBtn: 'Download File',
      downloadingBtn: 'Preparing link...',
      previewTitle: 'Delivered File Content Preview',
      completePayTitle: 'Order awaiting sandbox confirmation',
    },
    shopDashboard: {
      eyebrow: 'Shop Account Overview (5 Metrics)',
      titleDefault: 'Shop Owner Statistics Dashboard',
      subtitleDefault:
        'Monitor order completion, total spend, package category mix, daily frequency, and download quota.',
      ordersTitle: 'Order & Kit Statistics',
      ordersSubtitle:
        'Real-time summary of completed orders, total investment, kit categories, and remaining downloads.',
      chooseMoreBtn: 'Browse More Kits',
      el1Eyebrow: 'Metric 1 • Ownership & Quota',
      el1Title: 'Completion & Downloads',
      el1OrdersBadge: (p, t) => `${p}/${t} orders`,
      el1RingPay: 'Completion Rate',
      el1RingQuota: 'Remaining Quota',
      el1QuotaSub: (q) => `/ ${q} left`,
      el1None: 'None yet',
      el2Eyebrow: 'Metric 2 • Digital Investment',
      el2Title: 'Total Spend & Scale',
      el2PaidBadge: (c) => `${c} paid orders`,
      el2TotalPaid: 'Total Paid Spend',
      el2AvgOrder: 'Avg. per Order',
      el2TotalItems: 'Total Kits',
      el2Pending: 'Pending',
      el2UnitPkg: 'kits',
      el2UnitOrder: 'orders',
      el3Eyebrow: 'Metric 3 • Category Split',
      el3Title: 'Kit Types Owned',
      el4Eyebrow: 'Metric 4 • Order Cadence',
      el4Title: 'Daily Order Activity',
      el5Eyebrow: 'Metric 5 • Recent Access',
      el5Title: 'Latest Orders & Quota',
      el5EmptyPrefix: 'No orders yet. Pick a kit from the',
      el5EmptyLink: 'Product Catalog',
      el5EmptySuffix: 'to get started.',
      el5Downloaded: (u, m) => ` • Used ${u}/${m}`,
      el5Ready: 'Ready',
    },
    auth: {
      accountEyebrow: 'Shop Owner Account Space',
      roleAdmin: 'Administrator',
      roleCustomer: 'Shop Owner / Customer',
      industryPrefix: 'Niche',
      adminAreaBtn: 'Admin Console',
      ordersLibBtn: 'Order Vault',
      catalogBtn: 'Catalog',
      welcomeBack: 'Welcome back',
      createTitle: 'Create DreamTeam Account',
      loginDesc: 'Sign in to track purchased digital packages or access store administration.',
      registerDesc: 'Save order history, download links, and shop category preferences.',
      tabLogin: 'Sign In',
      tabRegister: 'Register',
      fullNameLabel: 'Full Name / Shop Name',
      fullNamePlaceholder: 'e.g., Radiant Skincare Studio',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      passwordStrength: 'Password strength',
      shopCategoryLabel: 'Shop Industry (optional)',
      shopCategoryPlaceholder: 'Skincare, Fashion, F&B...',
      submitLogin: 'Sign In',
      submitRegister: 'Create Account',
      submitting: 'Processing...',
      surveyBannerTitle: 'Shop or join the study without signing up',
      surveyBannerDesc:
        'Guests can preview live templates, test checkout, or run study tasks directly.',
      surveyBannerLink: 'Open Usability Study →',
      demoTitle: 'Demo Accounts',
      demoDesc:
        'Use the quick-fill demo credentials below to explore Shop Owner or Admin dashboards:',
      demoCustomerTitle: 'Demo Shop Owner',
      demoCustomerBtn: 'Fill Shop Demo',
      demoAdminTitle: 'Demo Administrator',
      demoAdminBtn: 'Fill Admin Demo',
      demoPersonalNote:
        'To register a personal account, please enter a valid personal email address.',
      brandBadge: 'DreamTeam • 1–3 Person Shops',
      brandHeading: 'Every lean digital tool built for multi-channel sellers',
      brandLead:
        'Combine 375px mobile templates, policy-safe AI prompts, and real-time catalog recommendations.',
      brandBenefits: [
        '15–30 min setup guides tailored for TikTok Shop, Shopee & Instagram shops',
        '3-tier transparent licensing (Original, Attributed Adaptation, Commercial License)',
        'Risk-free sandbox ordering with instant 7-day private file delivery',
      ],
      caseTag: 'Pilot Case Study',
      caseSub: 'From pilot evaluation batch',
      caseQuote:
        '“A 2-person skincare brand adopted our 375px Landing Page with mild ingredient cards and disclosure badges—customizing and shipping cleanly in 25 minutes.”',
      caseFoot: 'Pilot test observation • 2-person team',
      caseLink: 'View Skincare Kits',
    },
    experiment: {
      eyebrow: 'Usability Study Space',
      introTitle: 'Digital Package Selection Experience Evaluation',
      introDesc:
        'Complete 2 short guided selection tasks (1–2 minutes each) to help evaluate storefront clarity and package matching support.',
      stepConsentHeading: 'Step 1: Study Consent & Shop Profile',
      consentLabel:
        'I understand this is an anonymized academic usability study (no personal PII collected) and agree to participate.',
      consentError: 'Please check the consent box before starting.',
      industryLabel: 'Shop niche you are representing',
      teamSizeLabel: 'Shop team size',
      roleLabel: 'Participant role',
      roleShopOwner: 'Actual shop owner',
      roleStudent: 'Student / Roleplay tester',
      channelsLabel: 'Primary sales channels',
      startBtn: 'Start First Task',
      startingBtn: 'Initializing...',
      guidanceOn:
        'Tip: During this task, feel free to open the AI Advisor button at the bottom right or browse the catalog directly.',
      guidanceOff:
        'Instructions: During this task, please search, filter, and compare catalog items directly to choose the best fit.',
      taskBadge: (s, t) => `Task ${s}/${t}`,
      browseCatalog: 'Open Catalog to Inspect Kits',
      openAdvisorBtn: 'Open AI Advisor',
      decisionHeading: 'Submit Your Final Choice for This Task',
      selectPackageLabel: 'Selected Digital Kit',
      selectPackagePlaceholder: '-- Select the most suitable kit --',
      confidenceLabel: 'Confidence level with this choice (1–5)',
      likert: ['Very unsure', 'Slightly unsure', 'Neutral', 'Confident', 'Very confident'],
      noteLabel: 'Brief rationale (optional)',
      notePlaceholder: 'Briefly note why this package fits best...',
      submitDecision: 'Submit Task Choice',
      submittingDecision: 'Saving response...',
      errNoProduct: 'Please choose one digital kit matching this task.',
      errNoConfidence: 'Please select a confidence score from 1 to 5.',
      nextBannerTitle: 'Response recorded — please continue with the next task!',
      finishedEyebrow: 'Completed',
      finishedTitle: 'Thank you for completing the usability study!',
      finishedDesc:
        'Your anonymous interaction metrics have been securely recorded to help improve kit selection for small shop teams.',
      participantCodeLabel: 'Reference Code',
      restartBtn: 'Start New Session',
      goStoreBtn: 'Return to Storefront',
    },
  },
  ru: {
    catalog: {
      eyebrow: 'Каталог цифровых решений',
      title: 'Все веб-шаблоны, AI-промпты и сценарии автоматизации',
      subtitle:
        'Быстрый фильтр по типу продукта, нише магазина и максимальному бюджету.',
      searchPlaceholder: 'Поиск шаблона косметики, lookbook, QR-меню, Google Таблиц...',
      searchBtn: 'Найти',
      typeAll: 'Все типы',
      industryAll: 'Все ниши',
      anyBudget: 'Любой бюджет',
      underVnd: (l) => `До ${l}`,
      sortNewest: 'Сначала новые',
      sortPriceAsc: 'Сначала дешевле',
      sortPriceDesc: 'Сначала дороже',
      filterReset: 'Сбросить',
      showingRange: (s, t) => `Показано ${s} из ${t} пакетов`,
      addToCart: 'В корзину',
      added: 'Добавлено',
      details: 'Подробнее',
      emptyTitle: 'Нет пакетов под выбранные фильтры',
      emptyDesc: 'Попробуйте увеличить бюджет или сбросить фильтр по нише.',
      surveyReturnBanner:
        'Идёт задача исследования: после изучения карточек вернитесь, чтобы зафиксировать выбор.',
      surveySelectTip: 'Выбрать в опросе',
      prevPage: 'Назад',
      nextPage: 'Вперёд',
      pageOf: (p, t) => `Стр. ${p}/${t}`,
    },
    productDetail: {
      homeCrumb: 'Главная',
      catalogCrumb: 'Каталог',
      priceLabel: 'Стоимость пакета (бесплатный Sandbox)',
      addToCart: 'Добавить в корзину',
      addedToast: 'В корзине!',
      buyNow: 'Оформить (Sandbox)',
      surveyChooseThis: 'Выбрать этот пакет для задачи',
      setupLabel: 'Время запуска',
      setupMinutes: (m) => `Около ${m} мин`,
      targetTeamLabel: 'Размер команды',
      platformsLabel: 'Каналы',
      deliverablesHeading: 'Что входит в комплект',
      guideHeading: 'Краткое руководство по запуску',
      licenseHeading: 'Прозрачность лицензии',
      caseStudiesHeading: 'Практические примеры (Пилотные кейсы)',
      caseStudiesPilotTag: 'Данные пилотного тестирования',
      relatedHeading: 'Похожие решения в нише',
      notFoundTitle: 'Продукт не найден',
      notFoundDesc: 'Пакет скрыт или ссылка устарела.',
      backCatalog: 'Вернуться в каталог',
    },
    cart: {
      step1: 'Корзина',
      step2: 'Подтверждение',
      step3: 'Файлы сразу',
      eyebrow: 'Ваша корзина',
      title: 'Проверка выбранных цифровых пакетов',
      subtitle:
        'Тестовый режим Sandbox — проверка заказа и выдачи файлов без списания реальных средств.',
      clearAll: 'Очистить корзину',
      emptyTitle: 'В корзине пока нет комплектов',
      emptyDesc:
        'Откройте каталог веб-шаблонов, наборов промптов или workflow для добавления.',
      browseBtn: 'Открыть каталог',
      summaryHeading: 'Итог заказа',
      subtotalLabel: 'Итого',
      totalItemsLabel: (n) => `${n} шт.`,
      checkoutBtn: 'Перейти к подтверждению',
      removeItem: 'Удалить',
      recentOrdersTitle: 'Недавние заказы сессии',
    },
    checkout: {
      eyebrow: 'Оформление Sandbox',
      title: 'Подтверждение заказа и открытие файлов',
      subtitle:
        'Тестовый режим без реальной оплаты — мгновенный выпуск ссылок на 7 дней (до 5 загрузок).',
      emptyTitle: 'Корзина пуста',
      emptyDesc: 'Добавьте хотя бы один комплект перед оформлением.',
      createOrderBtn: 'Создать тестовый заказ',
      creatingBtn: 'Создание...',
      orderCreatedTitle: (code) => `Заказ создан: ${code}`,
      sandboxHint: 'Выберите исход тестовой оплаты для проверки выдачи файлов:',
      confirmPaidBtn: 'Подтвердить оплату (Открыть файлы)',
      confirmFailedBtn: 'Симулировать ошибку оплаты',
      payingBtn: 'Обработка...',
      failedNotice: 'Симуляция вернула статус ошибки. Вы можете повторить подтверждение.',
      summaryTitle: 'Детали оплаты',
      goToOrders: 'Перейти к Заказам',
    },
    orders: {
      eyebrow: 'Заказы и библиотека файлов',
      title: 'История заказов',
      subtitle:
        'Отслеживайте заказы и скачивайте файлы по защищённым ссылкам (срок 7 дней, до 5 загрузок).',
      sandboxNote:
        'Активен тестовый режим Sandbox — заказы имитируют оплату и выдают файлы мгновенно без списания денег.',
      filterAll: 'Все',
      filterPaid: 'Оплачено',
      filterPending: 'Ожидают',
      filterFailed: 'Ошибки',
      showingCount: (s, t) => `Показано ${s} / ${t} заказов`,
      emptyAllTitle: 'В этой сессии заказов ещё нет',
      emptyFilteredTitle: 'Нет заказов по выбранному фильтру',
      emptyAllDesc:
        'Выберите шаблон, пак промптов или workflow и завершите тестовую оплату.',
      emptyFilteredDesc: 'Нажмите «Все», чтобы увидеть все заказы.',
      viewAllBtn: 'Показать все',
      readyPackages: (n) => `${n} файлов готово`,
      totalOrderValue: 'Сумма заказа',
      viewAndDownload: 'Открыть и скачать',
      backToOrders: 'К списку заказов',
      detailTitle: (code) => `Заказ ${code}`,
      statusLabel: 'Статус',
      createdAtLabel: 'Дата создания',
      paidAtLabel: 'Подтверждён',
      paymentMethodLabel: 'Способ',
      itemsTitle: 'Состав заказа',
      downloadsTitle: 'Приватные ссылки для скачивания (7 дней)',
      downloadsUsed: (u, m) => `Скачано ${u} / ${m}`,
      expiresAt: 'Истекает',
      downloadBtn: 'Скачать файл',
      downloadingBtn: 'Подготовка...',
      previewTitle: 'Предпросмотр содержимого пакета',
      completePayTitle: 'Заказ ожидает подтверждения Sandbox-оплаты',
    },
    shopDashboard: {
      eyebrow: 'Обзор аккаунта магазина (5 метрик)',
      titleDefault: 'Панель статистики владельца магазина',
      subtitleDefault:
        'Отслеживайте статус заказов, расходы, структуру пакетов и лимиты скачиваний.',
      ordersTitle: 'Статистика заказов и пакетов',
      ordersSubtitle:
        'Доля завершённых заказов, сумма покупок, типы пакетов и доступные загрузки.',
      chooseMoreBtn: 'Добавить пакеты',
      el1Eyebrow: 'Метрика 1 • Статус и квота',
      el1Title: 'Оплата и загрузки',
      el1OrdersBadge: (p, t) => `${p}/${t} зак.`,
      el1RingPay: 'Доля оплаченных',
      el1RingQuota: 'Остаток загрузок',
      el1QuotaSub: (q) => `из ${q}`,
      el1None: 'Пока нет',
      el2Eyebrow: 'Метрика 2 • Бюджет',
      el2Title: 'Расходы и масштаб',
      el2PaidBadge: (c) => `Оплачено: ${c}`,
      el2TotalPaid: 'Всего оплачено',
      el2AvgOrder: 'Средний чек',
      el2TotalItems: 'Всего пакетов',
      el2Pending: 'Ожидают',
      el2UnitPkg: 'шт.',
      el2UnitOrder: 'зак.',
      el3Eyebrow: 'Метрика 3 • Категории',
      el3Title: 'Типы пакетов',
      el4Eyebrow: 'Метрика 4 • Динамика',
      el4Title: 'Заказы по дням',
      el5Eyebrow: 'Метрика 5 • Доступ',
      el5Title: 'Последние заказы',
      el5EmptyPrefix: 'Заказов пока нет. Выберите пакет в',
      el5EmptyLink: 'Каталоге',
      el5EmptySuffix: '.',
      el5Downloaded: (u, m) => ` • Загрузок ${u}/${m}`,
      el5Ready: 'Готово',
    },
    auth: {
      accountEyebrow: 'Кабинет владельца магазина',
      roleAdmin: 'Администратор',
      roleCustomer: 'Владелец / Покупатель',
      industryPrefix: 'Ниша',
      adminAreaBtn: 'Админ-панель',
      ordersLibBtn: 'Библиотека заказов',
      catalogBtn: 'Каталог',
      welcomeBack: 'С возвращением',
      createTitle: 'Регистрация в DreamTeam',
      loginDesc: 'Войдите для управления заказами и файлами или входа в админ-кабинет.',
      registerDesc: 'Сохраняйте историю покупок и параметры ниши магазина.',
      tabLogin: 'Вход',
      tabRegister: 'Регистрация',
      fullNameLabel: 'Имя / Название магазина',
      fullNamePlaceholder: 'Например: Магазин косметики Lumière',
      emailLabel: 'Электронная почта',
      passwordLabel: 'Пароль',
      passwordStrength: 'Надёжность пароля',
      shopCategoryLabel: 'Ниша магазина (необязательно)',
      shopCategoryPlaceholder: 'Косметика, Одежда, F&B...',
      submitLogin: 'Войти',
      submitRegister: 'Создать аккаунт',
      submitting: 'Выполняется...',
      surveyBannerTitle: 'Покупайте или участвуйте в опросе без регистрации',
      surveyBannerDesc:
        'Гостям доступны живой предпросмотр, корзина, тестовые заказы и опрос.',
      surveyBannerLink: 'Перейти к опросу →',
      demoTitle: 'Демо-аккаунты',
      demoDesc:
        'Быстрое заполнение для проверки роли Покупателя или Администратора:',
      demoCustomerTitle: 'Демо-покупатель',
      demoCustomerBtn: 'Заполнить (Гость)',
      demoAdminTitle: 'Демо-администратор',
      demoAdminBtn: 'Заполнить (Админ)',
      demoPersonalNote:
        'Для личной регистрации используйте действующий личный email.',
      brandBadge: 'DreamTeam • Команды 1–3 чел.',
      brandHeading: 'Готовые цифровые инструменты для малых онлайн-магазинов',
      brandLead:
        'Мобильные шаблоны 375px, безопасные AI-промпты и умный подбор комплекта по реальному каталогу.',
      brandBenefits: [
        'Инструкции на 15–30 минут для TikTok Shop, Shopee и соцсетей',
        '3 уровня лицензий (Оригинал, Адаптация, Коммерческая лицензия)',
        'Безопасная тестовая оплата и доступ к скачиванию на 7 дней',
      ],
      caseTag: 'Пилотный кейс',
      caseSub: 'По результатам тестового сценария',
      caseQuote:
        '«Магазин косметики из 2 человек запустил мобильный лендинг 375px с корректным составом без запрещённых заявлений всего за 25 минут.»',
      caseFoot: 'Пилотный тест • Команда 2 человека',
      caseLink: 'Смотреть наборы косметики',
    },
    experiment: {
      eyebrow: 'Исследование UX-выбора',
      introTitle: 'Оценка удобства подбора цифрового пакета для малого магазина',
      introDesc:
        'Вы пройдёте 2 коротких сценария (по 1–2 минуты), чтобы оценить качество навигации и подсказок при выборе пакета.',
      stepConsentHeading: 'Шаг 1: Согласие и профиль сценария',
      consentLabel:
        'Я понимаю, что это анонимный учебный UX-тест без сбора персональных данных, и согласен участвовать.',
      consentError: 'Отметьте согласие перед началом.',
      industryLabel: 'Ниша вашего сценария',
      teamSizeLabel: 'Размер команды',
      roleLabel: 'Роль участника',
      roleShopOwner: 'Действующий владелец магазина',
      roleStudent: 'Студент / Ролевой тестировщик',
      channelsLabel: 'Ключевые каналы продаж',
      startBtn: 'Начать первую задачу',
      startingBtn: 'Запуск...',
      guidanceOn:
        'Подсказка: на этом шаге можно воспользоваться кнопкой AI-помощника в правом нижнем углу или просмотреть каталог самостоятельно.',
      guidanceOff:
        'Инструкция: на этом шаге используйте поиск и фильтры каталога самостоятельно для сравнения пакетов.',
      taskBadge: (s, t) => `Задача ${s}/${t}`,
      browseCatalog: 'Открыть каталог для сравнения',
      openAdvisorBtn: 'Открыть AI-помощник',
      decisionHeading: 'Зафиксировать выбор по текущей задаче',
      selectPackageLabel: 'Выбранный пакет',
      selectPackagePlaceholder: '-- Выберите подходящее решение --',
      confidenceLabel: 'Уверенность в выборе (1–5)',
      likert: ['Совсем не уверен', 'Сомневаюсь', 'Нейтрально', 'Уверен', 'Полностью уверен'],
      noteLabel: 'Краткий комментарий (необязательно)',
      notePlaceholder: 'Почему вы выбрали именно этот пакет...',
      submitDecision: 'Завершить задачу',
      submittingDecision: 'Сохранение...',
      errNoProduct: 'Выберите один пакет из списка.',
      errNoConfidence: 'Выберите уровень уверенности от 1 до 5.',
      nextBannerTitle: 'Ответ сохранён — переходите ко второй задаче!',
      finishedEyebrow: 'Готово',
      finishedTitle: 'Спасибо за участие в исследовании!',
      finishedDesc: 'Ваши анонимные ответы успешно записаны для анализа качества сервиса.',
      participantCodeLabel: 'Код сессии',
      restartBtn: 'Пройти заново',
      goStoreBtn: 'Вернуться на витрину',
    },
  },
  zh: {
    catalog: {
      eyebrow: '数字解决方案目录',
      title: '全部网站模板、AI 提示词包与自动化工作流',
      subtitle: '按产品形式、店铺所属行业或预算上限快速精确筛选。',
      searchPlaceholder: '搜索美妆落地页、穿搭画册、扫码菜单、Google 表格...',
      searchBtn: '搜索',
      typeAll: '全部类型',
      industryAll: '全部行业',
      anyBudget: '不限预算',
      underVnd: (l) => `${l} 以内`,
      sortNewest: '最新上线',
      sortPriceAsc: '价格由低到高',
      sortPriceDesc: '价格由高到低',
      filterReset: '清空筛选',
      showingRange: (s, t) => `当前显示 ${s} / ${t} 个方案`,
      addToCart: '加入购物车',
      added: '已加入',
      details: '查看详情',
      emptyTitle: '未找到符合当前筛选条件的套件',
      emptyDesc: '建议放宽预算限制或重置行业筛选条件重试。',
      surveyReturnBanner: '您正在进行选型任务：浏览对比后可返回体验页面提交最终选择。',
      surveySelectTip: '在评测中选择此套件',
      prevPage: '上一页',
      nextPage: '下一页',
      pageOf: (p, t) => `第 ${p} / ${t} 页`,
    },
    productDetail: {
      homeCrumb: '首页',
      catalogCrumb: '商品目录',
      priceLabel: '套件价格（支持免费沙盒体验）',
      addToCart: '加入购物车',
      addedToast: '已加入购物车！',
      buyNow: '立即沙盒结算体验',
      surveyChooseThis: '在当前任务中选择此方案',
      setupLabel: '预计上线耗时',
      setupMinutes: (m) => `约 ${m} 分钟`,
      targetTeamLabel: '适用团队规模',
      platformsLabel: '适配销售渠道',
      deliverablesHeading: '套餐交付物清单',
      guideHeading: '快速部署指南',
      licenseHeading: '版权透明度声明',
      caseStudiesHeading: '真实试点案例反馈',
      caseStudiesPilotTag: '内部试点运行实录',
      relatedHeading: '同行业推荐方案',
      notFoundTitle: '未找到该商品',
      notFoundDesc: '该套件可能已下架或访问链接有误。',
      backCatalog: '返回商品目录',
    },
    cart: {
      step1: '购物车',
      step2: '确认沙盒订单',
      step3: '立即获取文件',
      eyebrow: '我的购物车',
      title: '核对已选择的数字工具包',
      subtitle: '当前处于安全沙盒演示模式 — 零真实扣款即可走完下单并立即下载测试流程。',
      clearAll: '清空购物车',
      emptyTitle: '购物车暂未添加任何数字套件',
      emptyDesc: '前往浏览网站模板、AI 提示词包或自动化工作流并加入测试下单。',
      browseBtn: '去逛商品目录',
      summaryHeading: '订单金额汇总',
      subtotalLabel: '小计',
      totalItemsLabel: (n) => `共 ${n} 件套件`,
      checkoutBtn: '前往确认订单',
      removeItem: '移除',
      recentOrdersTitle: '当前会话近期订单',
    },
    checkout: {
      eyebrow: '沙盒测试结算',
      title: '确认订单并解锁 7 天下载链接',
      subtitle: '安全零扣款演示模式 — 确认支付后系统立即发放私密下载链接（限 7 天 5 次）。',
      emptyTitle: '购物车为空',
      emptyDesc: '请先添加至少 1 个数字套件再生成沙盒订单。',
      createOrderBtn: '生成沙盒订单',
      creatingBtn: '正在创建订单...',
      orderCreatedTitle: (code) => `已创建订单 ${code}`,
      sandboxHint: '请在下方选择模拟支付结果以测试文件交付逻辑：',
      confirmPaidBtn: '模拟支付成功（解锁下载）',
      confirmFailedBtn: '模拟支付失败',
      payingBtn: '正在处理...',
      failedNotice: '本次沙盒模拟返回支付未成功，您可以随时重新点击确认支付。',
      summaryTitle: '结算清单',
      goToOrders: '查看订单与下载中心',
    },
    orders: {
      eyebrow: '订单库与下载中心',
      title: '已购订单历史与文件下载',
      subtitle: '查看历史沙盒订单并通过加密链接安全下载资源（7 天内有效，限 5 次）。',
      sandboxNote:
        '当前处于沙盒（Sandbox）演示模式 — 所有订单均用于验证选型下单与资源发放流程，不发生真实扣款。',
      filterAll: '全部',
      filterPaid: '已支付',
      filterPending: '待支付',
      filterFailed: '失败/取消',
      showingCount: (s, t) => `显示 ${s} / ${t} 笔订单`,
      emptyAllTitle: '当前会话尚无任何订单记录',
      emptyFilteredTitle: '当前筛选状态下暂无符合条件的订单',
      emptyAllDesc: '选择任意网站模板、提示词包或工作流并完成沙盒下单即可获取下载凭证。',
      emptyFilteredDesc: '点击“全部”即可查看所有订单记录。',
      viewAllBtn: '查看全部订单',
      readyPackages: (n) => `${n} 个可下载文件`,
      totalOrderValue: '订单总金额',
      viewAndDownload: '查看与下载',
      backToOrders: '返回订单列表',
      detailTitle: (code) => `订单详情 ${code}`,
      statusLabel: '订单状态',
      createdAtLabel: '创建时间',
      paidAtLabel: '确认时间',
      paymentMethodLabel: '结算通道',
      itemsTitle: '已含套件明细',
      downloadsTitle: '私密资源下载链接（7 天有效）',
      downloadsUsed: (u, m) => `已下载 ${u} / ${m} 次`,
      expiresAt: '过期时间',
      downloadBtn: '立即下载文件',
      downloadingBtn: '正在生成链接...',
      previewTitle: '交付包内容预览',
      completePayTitle: '当前订单正等待沙盒支付确认',
    },
    shopDashboard: {
      eyebrow: '店铺账户 5 维度运营概览',
      titleDefault: '店主账户数据统计看板',
      subtitleDefault: '一目了然查看订单完成率、总投入、套件分类占比、日单趋势与剩余下载额度。',
      ordersTitle: '订单与套件数据统计',
      ordersSubtitle: '实时汇总已完成订单比例、累计支出金额、购买类别与剩余可下载次数。',
      chooseMoreBtn: '继续选购套件',
      el1Eyebrow: '指标 1 • 完成率与额度',
      el1Title: '订单完成与下载次数',
      el1OrdersBadge: (p, t) => `${p}/${t} 笔`,
      el1RingPay: '支付完成率',
      el1RingQuota: '剩余下载次',
      el1QuotaSub: (q) => `共 ${q} 次`,
      el1None: '暂无',
      el2Eyebrow: '指标 2 • 投入预算',
      el2Title: '累计支出与订单规模',
      el2PaidBadge: (c) => `已支付 ${c} 笔`,
      el2TotalPaid: '累计已付金额',
      el2AvgOrder: '平均客单价',
      el2TotalItems: '已购套件数',
      el2Pending: '待确认订单',
      el2UnitPkg: '套',
      el2UnitOrder: '笔',
      el3Eyebrow: '指标 3 • 品类结构',
      el3Title: '已购产品类别分布',
      el4Eyebrow: '指标 4 • 交易频率',
      el4Title: '近 7 日订单趋势',
      el5Eyebrow: '指标 5 • 快速访问',
      el5Title: '近期交易与下载状态',
      el5EmptyPrefix: '暂无订单，欢迎前往',
      el5EmptyLink: '商品目录',
      el5EmptySuffix: '挑选数字套件。',
      el5Downloaded: (u, m) => ` • 已下载 ${u}/${m}`,
      el5Ready: '可下载',
    },
    auth: {
      accountEyebrow: '店主专属账户空间',
      roleAdmin: '系统管理员',
      roleCustomer: '店主 / 普通会员',
      industryPrefix: '行业',
      adminAreaBtn: '进入管理后台',
      ordersLibBtn: '订单与下载库',
      catalogBtn: '浏览目录',
      welcomeBack: '欢迎回来',
      createTitle: '注册 DreamTeam 账户',
      loginDesc: '登录后即可管理已购数字资产库或进入管理员驾驶舱。',
      registerDesc: '保存订单记录、下载授权与店铺行业偏好。',
      tabLogin: '登录',
      tabRegister: '注册',
      fullNameLabel: '姓名 / 店铺名称',
      fullNamePlaceholder: '例如：安然天然护肤小店',
      emailLabel: '电子邮箱',
      passwordLabel: '登录密码',
      passwordStrength: '密码强度',
      shopCategoryLabel: '店铺主营行业（选填）',
      shopCategoryPlaceholder: '美妆护肤、时尚服饰、餐饮...',
      submitLogin: '立即登录',
      submitRegister: '创建账户',
      submitting: '正在处理...',
      surveyBannerTitle: '无需注册亦可自由体验购买与参与评测',
      surveyBannerDesc: '访客可直接预览模板、加购下单或体验选品问卷流程。',
      surveyBannerLink: '参加体验评测 →',
      demoTitle: '快速体验演示账号',
      demoDesc: '点击下方按钮可一键填入店主或管理员演示账号进行体验：',
      demoCustomerTitle: '店主演示账号',
      demoCustomerBtn: '填入店主号',
      demoAdminTitle: '管理员演示账号',
      demoAdminBtn: '填入管理员',
      demoPersonalNote: '如需注册个人独立账号，请填写有效的常用邮箱地址。',
      brandBadge: 'DreamTeam • 1–3人微型电商',
      brandHeading: '专为中小多渠道店主浓缩的轻量数字工具库',
      brandLead: '集 375px 手机端网页模板、零违禁提示词与实库推荐顾问于一体。',
      brandBenefits: [
        '针对 TikTok Shop、Shopee 优化，15–30 分钟即可改版上线',
        '3 级清晰透明版权声明（原创设计、开源改编、合规商用）',
        '安全零扣款沙盒下单，立即开通 7 天私密下载令牌',
      ],
      caseTag: '试点情景案例',
      caseSub: '源自内部试点模拟数据',
      caseQuote:
        '“2 人美妆团队选用 375px 护肤品落地页后，清晰展示备案号与温和配方区，25 分钟即完成配置上线。”',
      caseFoot: '试点模拟观察 • 2人团队',
      caseLink: '查看美妆套件',
    },
    experiment: {
      eyebrow: '选品体验评测空间',
      introTitle: '小微电商店主数字套件选型体验评测',
      introDesc: '您将依次完成 2 个短小情景选型任务（每项约 1–2 分钟），帮助团队优化界面引导与推荐体验。',
      stepConsentHeading: '第一步：参与知情同意与模拟店铺资料',
      consentLabel: '我了解本次为匿名学术体验评估（不收集个人敏感身份信息），并同意自愿参与。',
      consentError: '开始前请先勾选同意选项。',
      industryLabel: '本次模拟代表的店铺行业',
      teamSizeLabel: '店铺运营人数',
      roleLabel: '参与身份',
      roleShopOwner: '真实电商店主',
      roleStudent: '学生 / 情景模拟体验者',
      channelsLabel: '主要关注渠道',
      startBtn: '开始第一个任务',
      startingBtn: '正在初始化...',
      guidanceOn: '提示：在本任务中，您可以点击右下角智能选品顾问协助筛选，或直接浏览商品目录。',
      guidanceOff: '说明：在本任务中，请您直接利用商品目录的搜索和筛选功能对比并做出选型判断。',
      taskBadge: (s, t) => `任务 ${s}/${t}`,
      browseCatalog: '打开商品目录对比详情',
      openAdvisorBtn: '呼出智能顾问',
      decisionHeading: '提交本任务的最终选型决策',
      selectPackageLabel: '您选定的数字套件',
      selectPackagePlaceholder: '-- 请选择最匹配的套件 --',
      confidenceLabel: '您对该选择的把握度（1–5分）',
      likert: ['非常不确定', '略微犹豫', '一般', '比较有把握', '非常确定'],
      noteLabel: '简短理由备注（选填）',
      notePlaceholder: '简单记录选择该方案的原因...',
      submitDecision: '提交本任务结果',
      submittingDecision: '正在保存...',
      errNoProduct: '请从下拉列表中选择 1 个匹配的套件。',
      errNoConfidence: '请选择 1 到 5 分的把握度评分。',
      nextBannerTitle: '上一任务结果已记录，请继续完成下一个选型任务！',
      finishedEyebrow: '评测完成',
      finishedTitle: '感谢您完成全部体验评测任务！',
      finishedDesc: '您的匿名操作数据已安全记录，将用于持续改进微店主数字工具选购体验。',
      participantCodeLabel: '会话对账编号',
      restartBtn: '开启新一轮评测',
      goStoreBtn: '返回商店前台',
    },
  },
};
