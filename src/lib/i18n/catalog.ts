import type {
  OrderStatus,
  ProductSourceType,
  ProductType,
  ScenarioDifficulty,
} from '@/types/api';

import type { AppLocale } from './types';

export const PRODUCT_TYPE_BY_LOCALE: Record<AppLocale, Record<ProductType, string>> = {
  vi: {
    template: 'Template Website',
    prompt_pack: 'Prompt Pack',
    workflow: 'Workflow Tự Động',
  },
  en: {
    template: 'Website Template',
    prompt_pack: 'AI Prompt Pack',
    workflow: 'Automation Workflow',
  },
  ru: {
    template: 'Веб-шаблон',
    prompt_pack: 'Пак промптов AI',
    workflow: 'Автоматизация (Workflow)',
  },
  zh: {
    template: '网站模板',
    prompt_pack: 'AI 提示词包',
    workflow: '自动化工作流',
  },
};

export const SOURCE_TYPE_BY_LOCALE: Record<
  AppLocale,
  Record<
    ProductSourceType,
    { label: string; badgeTone: 'success' | 'info' | 'accent'; summary: string }
  >
> = {
  vi: {
    original: {
      label: 'Thiết kế gốc',
      badgeTone: 'success',
      summary: 'Nhóm đề tài tự thiết kế và biên soạn 100%, minh bạch bản quyền.',
    },
    adapted: {
      label: 'Điều chỉnh có nguồn',
      badgeTone: 'info',
      summary: 'Chuyển thể từ cấu trúc tham khảo mở, đã biên tập lại cho shop VN.',
    },
    licensed: {
      label: 'Bản quyền hợp lệ',
      badgeTone: 'accent',
      summary: 'Sử dụng theo giấy phép thương mại hợp lệ đi kèm hồ sơ.',
    },
  },
  en: {
    original: {
      label: 'Original Design',
      badgeTone: 'success',
      summary: '100% originally designed and authored in-house with transparent licensing.',
    },
    adapted: {
      label: 'Attributed Adaptation',
      badgeTone: 'info',
      summary: 'Adapted from open reference patterns and tailored for lean shop workflows.',
    },
    licensed: {
      label: 'Commercial License',
      badgeTone: 'accent',
      summary: 'Distributed under verified commercial usage rights included in the bundle.',
    },
  },
  ru: {
    original: {
      label: 'Оригинальный дизайн',
      badgeTone: 'success',
      summary: '100% собственная разработка команды с прозрачной лицензией.',
    },
    adapted: {
      label: 'Адаптация с источником',
      badgeTone: 'info',
      summary: 'Адаптировано на основе открытой архитектуры под задачи малых магазинов.',
    },
    licensed: {
      label: 'Коммерческая лицензия',
      badgeTone: 'accent',
      summary: 'Используется по подтвержденной коммерческой лицензии из комплекта.',
    },
  },
  zh: {
    original: {
      label: '原创设计',
      badgeTone: 'success',
      summary: '由团队 100% 独立设计与编写，版权信息完全透明。',
    },
    adapted: {
      label: '开源改编（已署名）',
      badgeTone: 'info',
      summary: '基于开放参考结构深度定制，更贴合小型电商店铺日常运营。',
    },
    licensed: {
      label: '合规商用授权',
      badgeTone: 'accent',
      summary: '附带清晰完整的商业使用许可证明文件。',
    },
  },
};

export const ORDER_STATUS_BY_LOCALE: Record<
  AppLocale,
  Record<OrderStatus, { label: string; tone: 'warning' | 'success' | 'danger' | 'info' }>
> = {
  vi: {
    pending: { label: 'Chờ thanh toán Sandbox', tone: 'warning' },
    paid: { label: 'Đã thanh toán (Sandbox)', tone: 'success' },
    failed: { label: 'Thanh toán thất bại', tone: 'danger' },
    cancelled: { label: 'Đã hủy', tone: 'info' },
    refunded: { label: 'Đã hoàn tiền', tone: 'info' },
  },
  en: {
    pending: { label: 'Pending Sandbox Payment', tone: 'warning' },
    paid: { label: 'Paid (Sandbox)', tone: 'success' },
    failed: { label: 'Payment Failed', tone: 'danger' },
    cancelled: { label: 'Cancelled', tone: 'info' },
    refunded: { label: 'Refunded', tone: 'info' },
  },
  ru: {
    pending: { label: 'Ожидает оплаты (Sandbox)', tone: 'warning' },
    paid: { label: 'Оплачено (Sandbox)', tone: 'success' },
    failed: { label: 'Ошибка оплаты', tone: 'danger' },
    cancelled: { label: 'Отменён', tone: 'info' },
    refunded: { label: 'Возвращён', tone: 'info' },
  },
  zh: {
    pending: { label: '待沙盒支付', tone: 'warning' },
    paid: { label: '已支付（沙盒）', tone: 'success' },
    failed: { label: '支付失败', tone: 'danger' },
    cancelled: { label: '已取消', tone: 'info' },
    refunded: { label: '已退款', tone: 'info' },
  },
};

export const DIFFICULTY_BY_LOCALE: Record<AppLocale, Record<ScenarioDifficulty, string>> = {
  vi: { easy: 'Cơ bản', medium: 'Trung bình', hard: 'Nâng cao' },
  en: { easy: 'Basic', medium: 'Intermediate', hard: 'Advanced' },
  ru: { easy: 'Базовый', medium: 'Средний', hard: 'Продвинутый' },
  zh: { easy: '基础', medium: '中等', hard: '进阶' },
};

const INDUSTRY_TRANS: Record<string, Record<AppLocale, string>> = {
  'Mỹ phẩm': { vi: 'Mỹ phẩm', en: 'Beauty & Skincare', ru: 'Косметика', zh: '美妆护肤' },
  'Thời trang': { vi: 'Thời trang', en: 'Fashion', ru: 'Одежда и мода', zh: '时尚服饰' },
  'F&B': { vi: 'F&B', en: 'Food & Beverage', ru: 'Еда и напитки (F&B)', zh: '餐饮美食 (F&B)' },
  'Đa ngành': { vi: 'Đa ngành', en: 'Multi-Category', ru: 'Мультикатегория', zh: '全品类电商' },
  'Đa ngành / Tổng hợp': {
    vi: 'Đa ngành / Tổng hợp',
    en: 'Multi-Channel / General',
    ru: 'Мультиканальный',
    zh: '全渠道综合',
  },
};

export function translateIndustry(rawIndustry: string, locale: AppLocale): string {
  if (locale === 'vi') return rawIndustry;
  const trimmed = rawIndustry.trim();
  if (INDUSTRY_TRANS[trimmed]) {
    return INDUSTRY_TRANS[trimmed][locale];
  }
  const lower = trimmed.toLowerCase();
  if (lower.includes('cosmetic') || lower.includes('my pham') || lower.includes('mỹ phẩm')) {
    return INDUSTRY_TRANS['Mỹ phẩm'][locale];
  }
  if (lower.includes('fashion') || lower.includes('thoi trang') || lower.includes('thời trang')) {
    return INDUSTRY_TRANS['Thời trang'][locale];
  }
  if (lower.includes('f&b') || lower.includes('food') || lower.includes('fnb')) {
    return INDUSTRY_TRANS['F&B'][locale];
  }
  if (lower.includes('multi') || lower.includes('đa')) {
    return INDUSTRY_TRANS['Đa ngành'][locale];
  }
  return rawIndustry;
}

export interface ProductTranslation {
  name: string;
  short_description: string;
  description?: string;
}

export const PRODUCT_CATALOG_TRANS: Record<
  string,
  Partial<Record<Exclude<AppLocale, 'vi'>, ProductTranslation>>
> = {
  'landing-page-my-pham-tiktok-shop': {
    en: {
      name: 'Skincare Landing Page Template for TikTok Shop',
      short_description:
        '375px mobile-first skincare storefront with gentle ingredient highlights and TikTok Shop / Shopee cart links.',
      description:
        'Complete HTML/CSS/JS landing page tailored for 1–3 person skincare brands. Includes non-medical compliant ingredient blocks, cosmetic disclosure ID badges, verified-routine layout, and fast mobile checkout CTAs.',
    },
    ru: {
      name: 'Лендинг для косметики под TikTok Shop (Mobile 375px)',
      short_description:
        'Мобильный шаблон страницы ухода за кожей под 375px с блоком состава и кнопками перехода в TikTok Shop / Shopee.',
      description:
        'Готовая HTML/CSS/JS-страница для мини-брендов косметики (1–3 чел.): таблицы состава без запрещённых медицинских обещаний, номера регистрации, акценты для мобильного трафика.',
    },
    zh: {
      name: '美妆护肤品 TikTok Shop 高转化落地页模板',
      short_description:
        '专为 375px 手机端优化的护肤落地页，清晰展示温和配方表并直连 TikTok Shop 与 Shopee 购物车。',
      description:
        '面向 1–3 人护肤小店的完整 HTML/CSS/JS 模板，含合规温和成分区、备案编号展示卡、手机端快速加购引导与详尽上线指南。',
    },
  },
  'prompt-pack-mo-ta-my-pham': {
    en: {
      name: 'Compliant Skincare Product Copy & Short Video Prompt Pack',
      short_description:
        '60 ad-safe AI prompts for skincare listings and 30-second TikTok scripts without policy violations.',
      description:
        'Curated library of 60 Notion & PDF prompts helping lean beauty shops draft soothing skincare descriptions, 30s short-video hooks, and polite DM replies that avoid banned medical-claim wording.',
    },
    ru: {
      name: 'Пак 60 AI-промптов для описаний косметики и видео 30 сек',
      short_description:
        '60 проверенных AI-промптов для карточек косметики и сценариев TikTok без нарушения правил модерации.',
      description:
        'Готовые шаблоны запросов в Notion и PDF для написания бережных описаний уходовых средств, коротких роликов и ответов клиентам без стоп-слов.',
    },
    zh: {
      name: '美妆护肤品合规商品文案与短视频提示词包（60条）',
      short_description:
        '60 组 AI 提示词，助您快速写出零违禁词的温和护肤详情页与 30 秒带货短视频脚本。',
      description:
        '提供 Notion 与 PDF 双格式，覆盖温和护肤品卖点提炼、短视频前三秒钩子与私信合规回复话术，彻底避开平台医疗宣称限流词。',
    },
  },
  'workflow-nhac-mua-lai-my-pham-zalo': {
    en: {
      name: 'Skincare Replenishment & CRM Reminder Workflow',
      short_description:
        'n8n/Make automation tracking 30–45 day refill cycles across Google Sheets, Telegram & messenger templates.',
      description:
        'Importable n8n & Make JSON workflow that calculates typical 30–45 day skincare bottle usage, alerts your team in Telegram, and prepares ready-to-send refill messages.',
    },
    ru: {
      name: 'Сценарий авто-напоминаний о повторной покупке косметики',
      short_description:
        'Автоматизация n8n/Make для контроля 30–45-дневного цикла повторных заказов через Google Таблицы и Telegram.',
      description:
        'Готовый JSON-сценарий для n8n/Make: отслеживает цикл окончания крема/сыворотки, присылает уведомление менеджеру и формирует шаблон заботливого сообщения клиенту.',
    },
    zh: {
      name: '护肤品复购周期自动提醒与客户跟进工作流',
      short_description:
        '支持 n8n/Make 的自动化流程，结合 Google Sheets 与 Telegram 在 30–45 天用量到期前提醒复购。',
      description:
        '一键导入 JSON 工作流，自动记录客户下单时间并计算护肤周期，到期自动通知店主并生成贴心回访消息模板。',
    },
  },
  'template-lookbook-thoi-trang-local': {
    en: {
      name: 'Local Fashion Lookbook & Visual Size-Chart Website Template',
      short_description:
        'Editorial apparel lookbook storefront with interactive height/weight size chart and quick reserve button.',
      description:
        'Built for indie fashion shops sharing drops from Instagram and Shopee: clean collection grid, clear visual sizing helper to cut return rates, and instant order reservation form.',
    },
    ru: {
      name: 'Веб-шаблон Lookbook и таблицы размеров для локального бренда одежды',
      short_description:
        'Витрина коллекции одежды с наглядной сеткой размеров и быстрой формой бронирования заказа.',
      description:
        'Адаптивный сайт для шоурумов и локальных брендов (1–3 чел.): галерея образов, подбор размера по росту/весу для снижения возвратов и мгновенная заявка.',
    },
    zh: {
      name: '小众潮牌服饰 Lookbook 穿搭画册与尺码指南模板',
      short_description:
        '专为小微服装店打造的画册风官网，内嵌直观身高体重尺码表与极速留单表单。',
      description:
        '适用于连接 Instagram 与 Shopee 店铺的服装独立站模板：高清系列展示墙、可视化尺码对照表（减少退换货）及一键快速订购。',
    },
  },
  'template-landing-livestream-thoi-trang': {
    en: {
      name: 'Fashion Flash Sale & Livestream Quick-Order Landing Template',
      short_description:
        'Fast SKU/color/size selection page engineered to capture orders cleanly during TikTok & Facebook livestreams.',
      description:
        'High-contrast mobile flash-sale layout allowing livestream viewers to pick item codes, sizes, and colors in seconds without waiting on crowded chat replies.',
    },
    ru: {
      name: 'Лендинг для стримов и Flash-распродаж одежды',
      short_description:
        'Страница быстрого сбора заказов по коду модели, цвету и размеру во время прямых эфиров TikTok/Facebook.',
      description:
        'Мобильный шаблон с таймером акции и быстрым выбором SKU прямо в эфире — клиенты оформляют бронь за 15 секунд без перегрузки чата.',
    },
    zh: {
      name: '服装直播闪购与按款号极速下单落地页模板',
      short_description:
        '专为 TikTok / Facebook 直播带货打造，观众手机端秒选款号、颜色与尺码快速锁单。',
      description:
        '高转化闪购界面，有效承接直播间涌入流量，避免评论区漏单，支持手机 375px 极速挑选颜色与尺码。',
    },
  },
  'prompt-pack-phoi-do-livestream-thoi-trang': {
    en: {
      name: 'Outfit Styling, Size Advice & Livestream Script Prompt Pack',
      short_description:
        '55 prompts covering mix-and-match styling by body shape, sizing guidance to reduce returns, and 60s live scripts.',
    },
    ru: {
      name: 'Пак 55 AI-промптов: стилизация, подбор размера и сценарии стримов',
      short_description:
        '55 промптов для подбора образов по типу фигуры, точного выбора размера (меньше возвратов) и ведения эфира 60 сек.',
    },
    zh: {
      name: '服装搭配建议、尺码推荐与直播话术提示词包（55条）',
      short_description:
        '55 组 AI 提示词，覆盖身形穿搭推荐、精准选码话术（降低退货率）与 60 秒直播节奏脚本。',
    },
  },
  'template-menu-dat-mon-fnb-mini': {
    en: {
      name: 'QR Electronic Menu & Quick Ordering Template for Cafés & F&B',
      short_description:
        'Scan-to-order mobile menu with sugar/ice/topping selectors and one-tap Zalo/Messenger order summary.',
    },
    ru: {
      name: 'QR-меню и быстрый заказ с модификаторами для мини-кафе (F&B)',
      short_description:
        'Мобильное электронное меню с выбором уровня сахара/льда и топпингов, отправкой заказа в один клик.',
    },
    zh: {
      name: '餐饮与茶饮小店扫码点单（QR 电子菜单）网页模板',
      short_description:
        '支持手机扫码浏览菜单、加减冰糖与加料选项，一键发送点单摘要至商家聊天窗口。',
    },
  },
  'template-dat-combo-tiem-banh-fnb': {
    en: {
      name: 'Bakery Combo & Gift-Box Scheduled Pre-Order Template',
      short_description:
        'Warm storefront template for pastry & tea combos with delivery time-slot picker and custom gift-card message.',
    },
    ru: {
      name: 'Шаблон предзаказа наборов для пекарен и подарочных боксов',
      short_description:
        'Страница заказа комбо-наборов и выпечки с выбором интервала доставки и полем текста для открытки.',
    },
    zh: {
      name: '烘焙甜品礼盒与下午茶套餐预约订购网页模板',
      short_description:
        '专为烘焙坊和手作美食店打造，支持预约配送时段与自定义祝福贺卡文案输入。',
    },
  },
  'prompt-pack-mo-ta-mon-fnb-review': {
    en: {
      name: 'F&B Dish Copywriting & 20s Drink Review Prompt Pack',
      short_description:
        '50 appetizing menu copy prompts for delivery apps, 20s barista reel scripts, and customer review reply templates.',
    },
    ru: {
      name: 'Пак 50 AI-промптов для меню F&B, роликов 20 сек и ответов на отзывы',
      short_description:
        '50 промптов для вкусных описаний блюд в доставке, коротких видео приготовления и вежливых ответов гостям.',
    },
    zh: {
      name: '餐饮菜品文案、20秒饮品拍摄脚本与评价回复提示词包（50条）',
      short_description:
        '50 组美食卖点文案提示词，覆盖外卖菜单优化、20 秒制作短视频脚本与门店好评/差评回复模板。',
    },
  },
  'template-bio-link-cua-hang-mini-da-kenh': {
    en: {
      name: 'Multi-Channel Bio Link & Mini Storefront Template',
      short_description:
        'Unified social-bio hub linking Shopee, TikTok Shop, messaging OA, and 8–12 hero products cleanly.',
    },
    ru: {
      name: 'Шаблон мультиссылки Bio-Link и мини-витрины магазина',
      short_description:
        'Единая страница для шапки профиля со ссылками на маркетплейсы, мессенджеры и 8–12 флагманскими товарами.',
    },
    zh: {
      name: '全渠道社交媒体主页 Bio-Link 与微型橱窗网页模板',
      short_description:
        '统一聚合 Shopee、TikTok Shop、私域客服入口与 8–12 款主推爆品的轻量级个人主页站点。',
    },
  },
  'prompt-pack-chot-don-da-kenh': {
    en: {
      name: 'Omnichannel DM Sales & Objection Handling Prompt Pack',
      short_description:
        '50 practical inbox reply scripts covering price objections, shipping questions, and gentle order confirmation.',
    },
    ru: {
      name: 'Пак 50 AI-промптов для продаж в переписке и закрытия заказов',
      short_description:
        '50 готовых сценариев ответов в директе: отработка возражений по цене и быстрое подтверждение заказа.',
    },
    zh: {
      name: '全渠道私信客服促单与议价应对提示词包（50条）',
      short_description:
        '50 组高效客服私信模板，轻松化解价格异议、物流疑问与高情商催付，提升忙碌店主的成交率。',
    },
  },
  'workflow-dong-bo-don-hang-google-sheet': {
    en: {
      name: 'Automated Order Logging & Low-Stock Alert Workflow',
      short_description:
        'Ready-to-import workflow syncing incoming orders to Google Sheets with instant Telegram/Zalo stock alerts.',
    },
    ru: {
      name: 'Workflow авто-учёта заказов в Google Таблицах и алертов остатков',
      short_description:
        'Готовый сценарий синхронизации новых заказов в Google Sheets с мгновенным уведомлением в Telegram за 1 минуту.',
    },
    zh: {
      name: '新订单自动汇总 Google 表格与低库存预警工作流',
      short_description:
        '一分钟导入即用：自动将各渠道新订单写入 Google Sheets 并在库存不足时即时推送 Telegram/聊天通知。',
    },
  },
};

export interface ScenarioTranslation {
  title: string;
  persona: string;
  channel: string;
  prompt_text: string;
}

export const SCENARIO_TRANS_BY_CODE: Record<
  string,
  Partial<Record<Exclude<AppLocale, 'vi'>, ScenarioTranslation>>
> = {
  'SC-01': {
    en: {
      title: 'Scenario 1: Skincare shop on TikTok Shop',
      persona: 'Skincare Shop Owner',
      channel: 'TikTok Shop • 2-person team',
      prompt_text:
        'You run a 2-person skincare shop on TikTok Shop with a budget under 1,000,000 VND (~$39). Choose the best package to launch a 375px mobile-friendly storefront displaying gentle ingredients while complying with ad rules (no medical cure claims).',
    },
    ru: {
      title: 'Сценарий 1: Магазин косметики в TikTok Shop',
      persona: 'Владелец магазина косметики',
      channel: 'TikTok Shop • Команда 2 чел.',
      prompt_text:
        'Вы ведёте небольшой магазин ухода за кожей (2 человека) в TikTok Shop с бюджетом до 1 000 000 VND (~$39). Выберите пакет, который лучше всего подходит для мобильного лендинга 375px с составом без медицинских обещаний.',
    },
    zh: {
      title: '场景 1：TikTok Shop 护肤品小店选型',
      persona: '护肤店主',
      channel: 'TikTok Shop • 2人团队',
      prompt_text:
        '您经营一家 2 人规模的 TikTok Shop 护肤小店，预算低于 1,000,000 越南盾（约 $39）。请挑选最适合打造 375px 手机端落地页、清晰展示温和成分且合规无医疗宣称的数字套件。',
    },
  },
  'SC-02': {
    en: {
      title: 'Scenario 2: Local fashion shop needing Lookbook & Size Guide',
      persona: 'Local Fashion Shop Owner',
      channel: 'Instagram & Shopee • 2-person team',
      prompt_text:
        'You manage a 2-person local apparel shop with a maximum budget of 700,000 VND (~$28). Pick the package that best builds a visual lookbook with an intuitive size-conversion table and quick reservation form for livestream shoppers.',
    },
    ru: {
      title: 'Сценарий 2: Локальный бренд одежды — Lookbook и таблица размеров',
      persona: 'Владелец магазина одежды',
      channel: 'Instagram & Shopee • 2 чел.',
      prompt_text:
        'Вы управляете локальным магазином одежды (2 человека), максимальный бюджет — 700 000 VND (~$28). Выберите решение для витрины lookbook с наглядной сеткой размеров и формой быстрого заказа со стримов.',
    },
    zh: {
      title: '场景 2：小众服装店穿搭画册与尺码表需求',
      persona: '独立服装店主',
      channel: 'Instagram & Shopee • 2人团队',
      prompt_text:
        '您管理一家 2 人服装小店，预算上限为 700,000 越南盾（约 $28）。请选出最能展示 Lookbook 系列、附带直观尺码换算表并支持直播观众快速留单的方案。',
    },
  },
  'SC-03': {
    en: {
      title: 'Scenario 3: Small Café & F&B QR ordering workflow',
      persona: 'Mini Café / Kitchen Owner',
      channel: 'Counter QR & Messaging • 2-person team',
      prompt_text:
        'You operate a cozy beverage & snack spot with 2 staff and a budget up to 600,000 VND (~$24). Choose the best digital package so dine-in and takeaway customers scan QR on mobile, customize toppings, and submit clean orders.',
    },
    ru: {
      title: 'Сценарий 3: Небольшое кафе (F&B) — QR-меню и заказ',
      persona: 'Владелец мини-кафе',
      channel: 'QR-код в зале и мессенджер • 2 чел.',
      prompt_text:
        'У вас небольшая кофейня (2 сотрудника) с бюджетом до 600 000 VND (~$24). Подберите оптимальный цифровой продукт, чтобы гости сканировали QR-меню с телефона и быстро отправляли заказ с топпингами.',
    },
    zh: {
      title: '场景 3：茶饮咖啡小店桌面扫码点单需求',
      persona: '小型茶饮店主',
      channel: '门店 QR 码与聊天下单 • 2人团队',
      prompt_text:
        '您经营一家 2 人茶饮小店，预算不超过 600,000 越南盾（约 $24）。请选择能让到店顾客扫码浏览菜单、自选加料并一键提交订单的最佳方案。',
    },
  },
  'SC-04': {
    en: {
      title: 'Scenario 4: Multi-channel peak-hour order automation',
      persona: 'Multi-Channel Busy Seller',
      channel: 'Shopee, TikTok & Facebook • 1–3 staff',
      prompt_text:
        'You sell across Shopee, TikTok, and Facebook during evening rushes and keep missing orders or stock alerts. With a budget up to 800,000 VND (~$31), choose the package that automates logging orders to Sheets & instant alerts.',
    },
    ru: {
      title: 'Сценарий 4: Автоматизация учёта заказов в пиковые часы',
      persona: 'Мультиканальный продавец',
      channel: 'Shopee, TikTok, Facebook • 1–3 чел.',
      prompt_text:
        'Вы продаёте сразу на нескольких площадках и в часы пик теряете заказы. При бюджете до 800 000 VND (~$31) выберите решение, автоматизирующее запись заказов в Google Таблицы и уведомления об остатках.',
    },
    zh: {
      title: '场景 4：全渠道高峰期订单自动同步与防漏单',
      persona: '全渠道忙碌店主',
      channel: 'Shopee、TikTok 与 Facebook • 1–3人',
      prompt_text:
        '您在多个电商渠道同时销售，晚间高峰常漏单且来不及核对库存。在 800,000 越南盾（约 $31）预算内，选择最能自动将订单写入表格并触发库存提醒的套件。',
    },
  },
};

export function localizeProduct<
  T extends { slug: string; name: string; short_description: string; description?: string },
>(item: T, locale: AppLocale): T {
  if (locale === 'vi') return item;
  const trans = PRODUCT_CATALOG_TRANS[item.slug]?.[locale];
  if (!trans) return item;
  return {
    ...item,
    name: trans.name,
    short_description: trans.short_description,
    ...(item.description !== undefined
      ? { description: trans.description ?? trans.short_description }
      : {}),
  };
}

export function localizeScenario<
  T extends {
    code: string;
    title: string;
    persona?: string;
    channel?: string;
    prompt_text: string;
  },
>(scenario: T, locale: AppLocale): T {
  if (locale === 'vi') return scenario;
  const trans = SCENARIO_TRANS_BY_CODE[scenario.code]?.[locale];
  if (!trans) return scenario;
  return {
    ...scenario,
    title: trans.title,
    prompt_text: trans.prompt_text,
    ...(scenario.persona !== undefined ? { persona: trans.persona } : {}),
    ...(scenario.channel !== undefined ? { channel: trans.channel } : {}),
  };
}
