import type { AppLocale } from './types';

export interface ChromeMessages {
  common: {
    home: string;
    products: string;
    orders: string;
    faq: string;
    cart: string;
    account: string;
    explorePackages: string;
    solutions: string;
    admin: string;
    exit: string;
    logout: string;
    loading: string;
    refresh: string;
    close: string;
    back: string;
    all: string;
    retry: string;
    skipToContent: string;
    switchToDark: string;
    switchToLight: string;
    shortDark: string;
    shortLight: string;
    brandSubtitle: string;
    shopTinyBadge: string;
    noData: string;
  };
  language: {
    buttonAria: string;
    menuLabel: string;
    currentTag: string;
  };
  header: {
    navAria: string;
    mobileMenuOpen: string;
    mobileMenuClose: string;
    mobileNavAria: string;
    faqAndLicense: string;
    loginOrRegister: string;
    storeAdmin: string;
    accountPrefix: string;
    cartCountAria: (count: number) => string;
    expTitle: string;
    expStep: (order: number, total: number) => string;
    expPrep: string;
    expDone: string;
    expExit: string;
  };
  footer: {
    headingProducts: string;
    headingAccount: string;
    headingStandards: string;
    lead: string;
    pillMobile: string;
    pillLicense: string;
    pillInstant: string;
    allDigitalProducts: string;
    templatesLink: string;
    promptsLink: string;
    workflowsLink: string;
    ordersLink: string;
    faqLink: string;
    authLink: string;
    cartLink: string;
    surveyLink: string;
    adminLink: string;
    standard1: string;
    standard2: string;
    standard3: string;
    copyright: string;
    backToTop: string;
    scrollAria: (pct: number) => string;
  };
  scenarioBar: {
    ariaLabel: string;
    taskBadge: (step: number, total: number) => string;
    timerAria: (mmss: string) => string;
    viewBrief: string;
    submitChoice: string;
    exitSurvey: string;
    closeBrief: string;
    industry: string;
    maxBudget: string;
    difficulty: string;
    browseWithBar: string;
  };
  chat: {
    fabLabel: string;
    fabAria: string;
    drawerAria: string;
    title: string;
    subtitleSurvey: string;
    subtitleStorefront: string;
    closeAria: string;
    emptyTitle: string;
    emptyDesc: string;
    loadingHistory: string;
    thinking: string;
    suggestedHeading: string;
    viewDetail: string;
    inputPlaceholder: string;
    send: string;
    sending: string;
    quickPrompts: [string, string, string];
  };
  preview: {
    desktopBtn: string;
    mobileBtn: string;
    zoomBtn: string;
    openTabBtn: string;
    closeZoomAria: string;
    viewportDesktop: string;
    viewportMobile: string;
    fallbackEyebrow: string;
    deliverablesHeading: string;
    sourceSafeNote: string;
  };
}

export const CHROME_MESSAGES: Record<AppLocale, ChromeMessages> = {
  vi: {
    common: {
      home: 'Trang chủ',
      products: 'Sản phẩm',
      orders: 'Đơn hàng',
      faq: 'Hỏi đáp',
      cart: 'Giỏ hàng',
      account: 'Tài khoản',
      explorePackages: 'Khám phá gói số',
      solutions: 'Gói giải pháp',
      admin: 'Quản trị',
      exit: 'Thoát',
      logout: 'Đăng xuất',
      loading: 'Đang tải...',
      refresh: 'Làm mới',
      close: 'Đóng',
      back: 'Quay lại',
      all: 'Tất cả',
      retry: 'Thử tải lại',
      skipToContent: 'Chuyển thẳng tới nội dung chính',
      switchToDark: 'Chuyển sang giao diện Tối',
      switchToLight: 'Chuyển sang giao diện Sáng',
      shortDark: 'Tối',
      shortLight: 'Sáng',
      brandSubtitle: 'Công cụ số cho shop nhỏ',
      shopTinyBadge: 'Shop nhỏ 1–3 người',
      noData: 'Chưa có dữ liệu',
    },
    language: {
      buttonAria: 'Chọn ngôn ngữ hiển thị',
      menuLabel: 'Ngôn ngữ trang web',
      currentTag: 'Đang chọn',
    },
    header: {
      navAria: 'Điều hướng chính',
      mobileMenuOpen: 'Mở menu điều hướng',
      mobileMenuClose: 'Đóng menu',
      mobileNavAria: 'Menu di động',
      faqAndLicense: 'Hỏi đáp & Bản quyền',
      loginOrRegister: 'Đăng nhập / Đăng ký',
      storeAdmin: 'Quản trị cửa hàng',
      accountPrefix: 'Tài khoản',
      cartCountAria: (n) => `Giỏ hàng (${n} sản phẩm)`,
      expTitle: 'Khảo sát Trải nghiệm Chọn Gói',
      expStep: (o, t) => `Nhiệm vụ ${o}/${t}`,
      expPrep: 'Chuẩn bị khảo sát',
      expDone: 'Hoàn tất khảo sát',
      expExit: 'Thoát khảo sát',
    },
    footer: {
      headingProducts: 'Sản phẩm & Hỗ trợ',
      headingAccount: 'Tài khoản & Khảo sát',
      headingStandards: 'Tiêu chuẩn sản phẩm',
      lead: 'Cửa hàng Template Website, Prompt Pack AI và Workflow tự động tối ưu cho chủ shop 1–3 người kinh doanh trên Shopee, TikTok Shop và Facebook — dễ cài đặt, minh bạch bản quyền và nhận file tức thì.',
      pillMobile: 'Tối ưu Mobile 375px',
      pillLicense: 'Bản quyền minh bạch',
      pillInstant: 'Tải file tức thì',
      allDigitalProducts: 'Toàn bộ sản phẩm số',
      templatesLink: 'Template Website bán hàng',
      promptsLink: 'Prompt Pack viết bài & video',
      workflowsLink: 'Workflow tự động đồng bộ đơn',
      ordersLink: 'Tra cứu đơn hàng & Link tải',
      faqLink: 'Hỏi đáp & Bản quyền',
      authLink: 'Đăng nhập / Đăng ký',
      cartLink: 'Giỏ hàng của bạn',
      surveyLink: 'Tham gia khảo sát trải nghiệm',
      adminLink: 'Khu vực quản trị',
      standard1: 'Giao diện Sáng / Tối độ tương phản cao, bảo vệ mắt.',
      standard2: 'Xem thử trực tiếp trên khung Desktop 1280px & Mobile 375px.',
      standard3: 'Thanh toán thử nghiệm an toàn, nhận liên kết tải riêng trong 7 ngày.',
      copyright: '© 2026 DreamTeam — Kho giải pháp số cho chủ shop nhỏ.',
      backToTop: 'Về đầu trang',
      scrollAria: (pct) => `Cuộn về đầu trang (${pct}%)`,
    },
    scenarioBar: {
      ariaLabel: 'Nhiệm vụ trải nghiệm đang mở',
      taskBadge: (s, t) => `Nhiệm vụ ${s}/${t}`,
      timerAria: (mmss) => `Thời gian đã trôi qua ${mmss}`,
      viewBrief: 'Xem đề bài',
      submitChoice: 'Chốt lựa chọn',
      exitSurvey: 'Thoát khảo sát',
      closeBrief: 'Đóng đề bài',
      industry: 'Ngành',
      maxBudget: 'Ngân sách tối đa',
      difficulty: 'Mức độ',
      browseWithBar: 'Tiếp tục xem sản phẩm',
    },
    chat: {
      fabLabel: 'Trợ lý tư vấn',
      fabAria: 'Mở Trợ lý tư vấn chọn gói',
      drawerAria: 'Trợ lý tư vấn DreamTeam',
      title: 'Trợ lý Tư vấn Chọn Gói',
      subtitleSurvey: 'Gợi ý từ danh mục thực tế theo nhiệm vụ hiện tại',
      subtitleStorefront: 'Lọc theo ngành hàng, kênh bán & ngân sách của shop',
      closeAria: 'Đóng trợ lý tư vấn',
      emptyTitle: 'Chào bạn, shop bạn đang bán ngành gì?',
      emptyDesc:
        'Hãy cho mình biết ngành hàng (mỹ phẩm, thời trang, F&B, đa ngành), kênh bán (Shopee, TikTok, Facebook) và mức ngân sách dự kiến để mình gợi ý gói phù hợp nhất.',
      loadingHistory: 'Đang tải lịch sử hội thoại...',
      thinking: 'Trợ lý đang đối chiếu danh mục thực tế...',
      suggestedHeading: 'Gói phù hợp trong danh mục:',
      viewDetail: 'Xem chi tiết →',
      inputPlaceholder: 'Nhập nhu cầu, ngành hàng hoặc ngân sách của shop...',
      send: 'Gửi',
      sending: 'Đang gửi...',
      quickPrompts: [
        'Shop mỹ phẩm 2 người trên TikTok Shop, ngân sách dưới 1 triệu cần landing page.',
        'Mình bán thời trang local cần trang lookbook kèm bảng size dưới 700k.',
        'Cần gói prompt trả lời inbox và chốt đơn đa kênh chi phí thấp.',
      ],
    },
    preview: {
      desktopBtn: 'Desktop 1280px',
      mobileBtn: 'Mobile 375px',
      zoomBtn: 'Phóng to',
      openTabBtn: 'Mở tab mới',
      closeZoomAria: 'Đóng xem phóng to',
      viewportDesktop: 'Desktop 1280px',
      viewportMobile: 'Mobile 375px',
      fallbackEyebrow: 'Xem trước tài nguyên số',
      deliverablesHeading: 'Thành phần bàn giao trong gói',
      sourceSafeNote: 'Tài nguyên được biên soạn chuẩn cho shop nhỏ 1–3 người.',
    },
  },
  en: {
    common: {
      home: 'Home',
      products: 'Catalog',
      orders: 'Orders',
      faq: 'FAQ',
      cart: 'Cart',
      account: 'Account',
      explorePackages: 'Explore Kits',
      solutions: 'Solutions',
      admin: 'Admin',
      exit: 'Sign out',
      logout: 'Sign out',
      loading: 'Loading...',
      refresh: 'Refresh',
      close: 'Close',
      back: 'Back',
      all: 'All',
      retry: 'Try again',
      skipToContent: 'Skip to main content',
      switchToDark: 'Switch to Dark theme',
      switchToLight: 'Switch to Light theme',
      shortDark: 'Dark',
      shortLight: 'Light',
      brandSubtitle: 'Digital kits for lean shops',
      shopTinyBadge: '1–3 Person Teams',
      noData: 'No data yet',
    },
    language: {
      buttonAria: 'Select display language',
      menuLabel: 'Website language',
      currentTag: 'Active',
    },
    header: {
      navAria: 'Main navigation',
      mobileMenuOpen: 'Open navigation menu',
      mobileMenuClose: 'Close menu',
      mobileNavAria: 'Mobile menu',
      faqAndLicense: 'FAQ & Licensing',
      loginOrRegister: 'Sign in / Register',
      storeAdmin: 'Store Admin',
      accountPrefix: 'Account',
      cartCountAria: (n) => `Shopping cart (${n} items)`,
      expTitle: 'Product Selection Study',
      expStep: (o, t) => `Task ${o}/${t}`,
      expPrep: 'Preparing task',
      expDone: 'Study complete',
      expExit: 'Exit study',
    },
    footer: {
      headingProducts: 'Catalog & Support',
      headingAccount: 'Account & Study',
      headingStandards: 'Product Standards',
      lead: 'Curated Website Templates, AI Prompt Packs, and Automation Workflows designed for 1–3 person online shops—easy 15–30 min setup, transparent licensing, and instant file delivery.',
      pillMobile: 'Mobile 375px Ready',
      pillLicense: 'Clear Licensing',
      pillInstant: 'Instant Download',
      allDigitalProducts: 'All Digital Packages',
      templatesLink: 'Website Templates',
      promptsLink: 'AI Prompt Packs',
      workflowsLink: 'Automation Workflows',
      ordersLink: 'Orders & Downloads',
      faqLink: 'FAQ & Licensing',
      authLink: 'Sign in / Register',
      cartLink: 'Your Cart',
      surveyLink: 'Join Usability Study',
      adminLink: 'Admin Console',
      standard1: 'High-contrast Light & Dark themes for comfortable browsing.',
      standard2: 'Interactive Desktop 1280px ↔ Mobile 375px live HTML previews.',
      standard3: 'Risk-free sandbox checkout with private 7-day download links.',
      copyright: '© 2026 DreamTeam — Digital Kits for Small Shops.',
      backToTop: 'Back to top',
      scrollAria: (pct) => `Scroll to top (${pct}%)`,
    },
    scenarioBar: {
      ariaLabel: 'Active study task bar',
      taskBadge: (s, t) => `Task ${s}/${t}`,
      timerAria: (mmss) => `Elapsed time ${mmss}`,
      viewBrief: 'Task Brief',
      submitChoice: 'Submit Choice',
      exitSurvey: 'Exit Study',
      closeBrief: 'Close brief',
      industry: 'Industry',
      maxBudget: 'Max budget',
      difficulty: 'Difficulty',
      browseWithBar: 'Continue browsing',
    },
    chat: {
      fabLabel: 'AI Advisor',
      fabAria: 'Open package recommendation assistant',
      drawerAria: 'DreamTeam Package Advisor',
      title: 'Smart Package Advisor',
      subtitleSurvey: 'Grounded to real catalog for your current task',
      subtitleStorefront: 'Filter kits by your shop industry, channel & budget',
      closeAria: 'Close advisor drawer',
      emptyTitle: 'Hi! What does your online shop sell?',
      emptyDesc:
        'Share your niche (skincare, fashion, F&B, multi-channel), selling platforms, and target budget so I can match you with the right kit from our live catalog.',
      loadingHistory: 'Loading conversation history...',
      thinking: 'Matching your request against live catalog...',
      suggestedHeading: 'Recommended from catalog:',
      viewDetail: 'View details →',
      inputPlaceholder: 'Describe your niche, channels, or budget...',
      send: 'Send',
      sending: 'Sending...',
      quickPrompts: [
        'Skincare shop with 2 staff on TikTok Shop, budget under $39, need a landing page.',
        'Local fashion brand needing a lookbook with visual size guide under $28.',
        'Need low-cost AI prompts for answering customer DMs & closing orders.',
      ],
    },
    preview: {
      desktopBtn: 'Desktop 1280px',
      mobileBtn: 'Mobile 375px',
      zoomBtn: 'Expand',
      openTabBtn: 'New Tab',
      closeZoomAria: 'Close fullscreen preview',
      viewportDesktop: 'Desktop 1280px',
      viewportMobile: 'Mobile 375px',
      fallbackEyebrow: 'Digital Package Preview',
      deliverablesHeading: 'Included deliverables',
      sourceSafeNote: 'Packaged cleanly for 1–3 person online teams.',
    },
  },
  ru: {
    common: {
      home: 'Главная',
      products: 'Каталог',
      orders: 'Заказы',
      faq: 'Вопросы',
      cart: 'Корзина',
      account: 'Аккаунт',
      explorePackages: 'Выбрать пакет',
      solutions: 'Решения',
      admin: 'Админ',
      exit: 'Выйти',
      logout: 'Выйти',
      loading: 'Загрузка...',
      refresh: 'Обновить',
      close: 'Закрыть',
      back: 'Назад',
      all: 'Все',
      retry: 'Повторить',
      skipToContent: 'Перейти к основному содержанию',
      switchToDark: 'Переключить на тёмную тему',
      switchToLight: 'Переключить на светлую тему',
      shortDark: 'Тёмная',
      shortLight: 'Светлая',
      brandSubtitle: 'Цифровые наборы для малого бизнеса',
      shopTinyBadge: 'Команды 1–3 чел.',
      noData: 'Нет данных',
    },
    language: {
      buttonAria: 'Выбрать язык интерфейса',
      menuLabel: 'Язык сайта',
      currentTag: 'Выбран',
    },
    header: {
      navAria: 'Основная навигация',
      mobileMenuOpen: 'Открыть меню',
      mobileMenuClose: 'Закрыть меню',
      mobileNavAria: 'Мобильное меню',
      faqAndLicense: 'Вопросы и лицензии',
      loginOrRegister: 'Войти / Регистрация',
      storeAdmin: 'Панель администратора',
      accountPrefix: 'Профиль',
      cartCountAria: (n) => `Корзина (${n} товаров)`,
      expTitle: 'Исследование выбора пакетов',
      expStep: (o, t) => `Задача ${o}/${t}`,
      expPrep: 'Подготовка',
      expDone: 'Опрос завершён',
      expExit: 'Выйти из опроса',
    },
    footer: {
      headingProducts: 'Продукты и помощь',
      headingAccount: 'Аккаунт и опрос',
      headingStandards: 'Стандарты качества',
      lead: 'Магазин веб-шаблонов, AI-промптов и сценариев автоматизации для команд 1–3 человек на Shopee, TikTok Shop и в соцсетях — быстрая настройка и мгновенное скачивание.',
      pillMobile: 'Адаптив 375px',
      pillLicense: 'Чистые лицензии',
      pillInstant: 'Мгновенная выдача',
      allDigitalProducts: 'Все цифровые пакеты',
      templatesLink: 'Веб-шаблоны магазина',
      promptsLink: 'Наборы AI-промптов',
      workflowsLink: 'Сценарии автоматизации',
      ordersLink: 'Заказы и загрузки',
      faqLink: 'Вопросы и лицензии',
      authLink: 'Войти / Регистрация',
      cartLink: 'Ваша корзина',
      surveyLink: 'Пройти опрос UX',
      adminLink: 'Кабинет администратора',
      standard1: 'Светлая и тёмная темы с высоким контрастом.',
      standard2: 'Интерактивный предпросмотр Desktop 1280px ↔ Mobile 375px.',
      standard3: 'Безопасная тестовая оплата и доступ к файлам 7 дней.',
      copyright: '© 2026 DreamTeam — Цифровые инструменты для малых магазинов.',
      backToTop: 'Наверх',
      scrollAria: (pct) => `Наверх (${pct}%)`,
    },
    scenarioBar: {
      ariaLabel: 'Панель активной задачи опроса',
      taskBadge: (s, t) => `Задача ${s}/${t}`,
      timerAria: (mmss) => `Затраченное время ${mmss}`,
      viewBrief: 'Задание',
      submitChoice: 'Завершить выбор',
      exitSurvey: 'Выйти из опроса',
      closeBrief: 'Закрыть задание',
      industry: 'Ниша',
      maxBudget: 'Бюджет до',
      difficulty: 'Сложность',
      browseWithBar: 'Продолжить просмотр',
    },
    chat: {
      fabLabel: 'AI-помощник',
      fabAria: 'Открыть AI-помощник подбора пакета',
      drawerAria: 'Консультант DreamTeam',
      title: 'Умный подбор пакета',
      subtitleSurvey: 'Подбор по реальному каталогу для текущей задачи',
      subtitleStorefront: 'Подбор по нише магазина, каналам и бюджету',
      closeAria: 'Закрыть чат консультанта',
      emptyTitle: 'Здравствуйте! Что продаёт ваш магазин?',
      emptyDesc:
        'Укажите нишу (косметика, одежда, еда/кафе, мультибренд), каналы продаж и примерный бюджет — подберу точный вариант из каталога.',
      loadingHistory: 'Загрузка истории чата...',
      thinking: 'Анализирую каталог и подбираю решение...',
      suggestedHeading: 'Подходящие варианты:',
      viewDetail: 'Подробнее →',
      inputPlaceholder: 'Опишите нишу, каналы продаж или бюджет...',
      send: 'Отправить',
      sending: 'Отправка...',
      quickPrompts: [
        'Магазин косметики (2 чел.) в TikTok Shop, нужен лендинг до 1 млн VND.',
        'Бренд одежды: нужен lookbook с таблицей размеров до 700 тыс. VND.',
        'Нужны недорогие промпты для ответов клиентам в директ.',
      ],
    },
    preview: {
      desktopBtn: 'ПК 1280px',
      mobileBtn: 'Моб. 375px',
      zoomBtn: 'На весь экран',
      openTabBtn: 'Новая вкладка',
      closeZoomAria: 'Закрыть просмотр',
      viewportDesktop: 'ПК 1280px',
      viewportMobile: 'Моб. 375px',
      fallbackEyebrow: 'Предпросмотр комплекта',
      deliverablesHeading: 'Что входит в комплект',
      sourceSafeNote: 'Удобная структура для команд из 1–3 человек.',
    },
  },
  zh: {
    common: {
      home: '首页',
      products: '商品目录',
      orders: '我的订单',
      faq: '常见问题',
      cart: '购物车',
      account: '账户中心',
      explorePackages: '浏览数字套件',
      solutions: '全部方案',
      admin: '管理后台',
      exit: '退出',
      logout: '退出登录',
      loading: '加载中...',
      refresh: '刷新',
      close: '关闭',
      back: '返回',
      all: '全部',
      retry: '重试',
      skipToContent: '跳至正文内容',
      switchToDark: '切换为深色主题',
      switchToLight: '切换为浅色主题',
      shortDark: '深色',
      shortLight: '浅色',
      brandSubtitle: '中小电商数字化套件库',
      shopTinyBadge: '1–3 人精干小店',
      noData: '暂无数据',
    },
    language: {
      buttonAria: '选择界面语言',
      menuLabel: '网站显示语言',
      currentTag: '当前',
    },
    header: {
      navAria: '主导航',
      mobileMenuOpen: '打开导航菜单',
      mobileMenuClose: '关闭菜单',
      mobileNavAria: '移动端导航',
      faqAndLicense: '问答与版权说明',
      loginOrRegister: '登录 / 注册',
      storeAdmin: '管理后台',
      accountPrefix: '账户',
      cartCountAria: (n) => `购物车（共 ${n} 件）`,
      expTitle: '套件选型体验评测',
      expStep: (o, t) => `任务 ${o}/${t}`,
      expPrep: '准备开始',
      expDone: '评测已完成',
      expExit: '退出评测',
    },
    footer: {
      headingProducts: '产品与支持',
      headingAccount: '账户与体验评测',
      headingStandards: '品质标准',
      lead: '专为 Shopee、TikTok Shop 与社交电商 1–3 人小团队打造的网页模板、AI 提示词包与自动化工作流商城——开箱易用、版权清晰、支付后即时下载。',
      pillMobile: '375px 手机优先',
      pillLicense: '版权分级透明',
      pillInstant: '支付即时下载',
      allDigitalProducts: '全部数字商品',
      templatesLink: '高转化网页模板',
      promptsLink: 'AI 提示词工具包',
      workflowsLink: '自动化订单工作流',
      ordersLink: '订单与下载中心',
      faqLink: '常见问题与版权',
      authLink: '登录 / 注册账户',
      cartLink: '我的购物车',
      surveyLink: '参与体验问卷调查',
      adminLink: '管理员控制台',
      standard1: '支持高对比度浅色 / 深色双主题护眼浏览。',
      standard2: '内置桌面端 1280px ↔ 手机端 375px 实时 HTML 预览。',
      standard3: '沙盒测试下单零扣款，开通 7 天私密下载链接。',
      copyright: '© 2026 DreamTeam — 赋能微型电商店主的数字套件。',
      backToTop: '返回顶部',
      scrollAria: (pct) => `返回页面顶部 (${pct}%)`,
    },
    scenarioBar: {
      ariaLabel: '当前进行的体验任务栏',
      taskBadge: (s, t) => `任务 ${s}/${t}`,
      timerAria: (mmss) => `已用时 ${mmss}`,
      viewBrief: '查看要求',
      submitChoice: '确认选型',
      exitSurvey: '退出评测',
      closeBrief: '关闭要求',
      industry: '所属行业',
      maxBudget: '预算上限',
      difficulty: '任务难度',
      browseWithBar: '继续浏览目录',
    },
    chat: {
      fabLabel: '智能选品顾问',
      fabAria: '打开智能选品顾问抽屉',
      drawerAria: 'DreamTeam 智能选品顾问',
      title: 'AI 智能选品顾问',
      subtitleSurvey: '依据当前任务检索真实在线商品目录',
      subtitleStorefront: '按行业、销售渠道与预算为您精准配对套件',
      closeAria: '关闭选品顾问',
      emptyTitle: '您好！请问您的店铺主营什么品类？',
      emptyDesc:
        '请告诉我想经营的行业（美妆、服饰、餐饮、全品类）、常用销售渠道和大概预算，我将为您推荐目录内最匹配的方案。',
      loadingHistory: '正在加载对话记录...',
      thinking: '正在检索产品库并匹配最优方案...',
      suggestedHeading: '为您从目录匹配到以下方案：',
      viewDetail: '查看详情 →',
      inputPlaceholder: '输入店铺行业、渠道或预算需求...',
      send: '发送',
      sending: '发送中...',
      quickPrompts: [
        '2人护肤小店做 TikTok Shop，预算 100万以内想要落地页模板。',
        '独立服装店需要带可视化尺码表的 Lookbook 页面，70万以内。',
        '需要低成本的私信催单与回复客户 AI 提示词包。',
      ],
    },
    preview: {
      desktopBtn: '桌面 1280px',
      mobileBtn: '手机 375px',
      zoomBtn: '放大全屏',
      openTabBtn: '新标签打开',
      closeZoomAria: '关闭全屏预览',
      viewportDesktop: '桌面 1280px',
      viewportMobile: '手机 375px',
      fallbackEyebrow: '数字资源结构预览',
      deliverablesHeading: '套件交付清单',
      sourceSafeNote: '专为 1–3 人小微电商团队精简结构、快速上线。',
    },
  },
};
