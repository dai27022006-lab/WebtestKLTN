import {
  type AppLocale,
  formatMoney,
  localizeProduct,
  translateIndustry,
  USD_EXCHANGE_RATE_VND,
} from '@/lib/i18n';
import type { ProductRecord } from '@/server/store';
import type { ShopProfileInput } from '@/types/api';

import { ADVISOR_PROMPT_VERSION } from './prompts/advisor-v1';

export interface ChatbotStubSuggestion {
  product_id: string;
  reason: string;
}

export interface ChatbotStubResult {
  reply: string;
  prompt_version: string;
  model_name: string;
  retrieved_product_ids: string[];
  suggested_products: ChatbotStubSuggestion[];
  missing_catalog_info: boolean;
  latency_ms: number;
  tokens_used: number;
  cost_usd: number;
}

const MULTILINGUAL_STOP_WORDS = new Set([
  // vi
  'minh', 'ban', 'shop', 'cua', 'cho', 'can', 'muon', 'tim', 'goi', 'san', 'pham',
  'ngan', 'sach', 'duoi', 'tren', 'tam', 'khoang', 'toi', 'da', 'voi', 'nhu',
  'nguoi', 'hang', 'nao', 'phu', 'hop', 'nhat', 'khong', 'duoc', 'mot', 'nhung',
  'cac', 'trong', 'ngoai', 'hoac', 'giup', 'tu', 'van',
  // en
  'the', 'for', 'and', 'with', 'need', 'want', 'find', 'looking', 'shop', 'store',
  'small', 'budget', 'under', 'below', 'around', 'best', 'package', 'digital',
  'please', 'help', 'recommend', 'what', 'which', 'how', 'can', 'you', 'our',
  // ru
  'для', 'или', 'под', 'без', 'при', 'что', 'как', 'какой', 'какие', 'нужен',
  'нужно', 'хочу', 'подобрать', 'пакет', 'бюджет', 'до', 'около', 'магазин',
  'магазина', 'небольшой', 'малый', 'помоги', 'подскажите', 'лучший', 'товар',
  // zh (spaced fragments if any)
  '需要', '想要', '预算', '推荐', '什么', '适合', '我们', '小店', '店铺', '方案',
]);

interface ChatStubCopy {
  outOfScope: string;
  budgetTooLow: (budget: string, cheapest: string) => string;
  noMatch: string;
  signalIndustry: (label: string) => string;
  signalMultiExact: string;
  signalMultiFlex: string;
  signalTemplate: string;
  signalPromptPack: string;
  signalWorkflow: string;
  signalPlatform: (platform: string) => string;
  signalWithinBudget: string;
  reasonWithSignals: (reasons: string, price: string) => string;
  reasonFallback: (desc: string, price: string) => string;
  replyLead: (lines: string, budgetNote: string) => string;
  budgetUnder: (total: string, budget: string) => string;
  budgetEstimated: (total: string) => string;
}

const CHAT_STUB_COPY: Record<AppLocale, ChatStubCopy> = {
  vi: {
    outOfScope:
      'Hiện chưa có thông tin trong danh mục phù hợp với yêu cầu ngoài phạm vi này. Danh mục hiện tại tập trung vào Template trang bán hàng, Prompt Pack nội dung và Workflow tự động hóa (n8n/Make + Google Sheets) cho chủ shop nhỏ.',
    budgetTooLow: (budget, cheapest) =>
      `Hiện chưa có thông tin trong danh mục phù hợp với mức ngân sách ${budget}. Gói có chi phí thấp nhất hiện có là ${cheapest}.`,
    noMatch:
      'Hiện chưa có thông tin trong danh mục khớp chính xác với tiêu chí ngân sách và nhu cầu bạn vừa nêu. Bạn có thể mô tả rõ hơn ngành hàng hoặc tăng ngân sách để mình lọc lại.',
    signalIndustry: (label) => `đúng ngành ${label}`,
    signalMultiExact: 'phù hợp bán đa ngành / đa kênh',
    signalMultiFlex: 'linh hoạt cho nhiều ngành hàng',
    signalTemplate: 'đúng loại Template website',
    signalPromptPack: 'đúng loại Prompt Pack nội dung',
    signalWorkflow: 'đúng loại Workflow tự động hóa',
    signalPlatform: (platform) => `tương thích ${platform}`,
    signalWithinBudget: 'nằm trong ngân sách',
    reasonWithSignals: (reasons, price) => `Phù hợp vì ${reasons} (${price}).`,
    reasonFallback: (desc, price) => `${desc} (${price}).`,
    replyLead: (lines, budgetNote) =>
      `Dựa trên danh mục sản phẩm hiện có, mình gợi ý bạn cân nhắc:\n${lines}\n\n${budgetNote}`,
    budgetUnder: (total, budget) =>
      `Tổng chi phí ${total} nằm gọn trong ngân sách ${budget} của bạn.`,
    budgetEstimated: (total) => `Tổng chi phí dự kiến: ${total}.`,
  },
  en: {
    outOfScope:
      'That request falls outside our current catalog scope. DreamTeam focuses on Website Landing Templates, AI Content Prompt Packs, and n8n/Make + Google Sheets Automation Workflows built for 1–3 person online shops.',
    budgetTooLow: (budget, cheapest) =>
      `No catalog packages match a budget of ${budget}. The lowest-priced package currently available starts at ${cheapest}.`,
    noMatch:
      'No package matches your exact combination of channel, niche, and budget yet. Share a bit more detail on your store category or adjust your budget so I can refine the recommendation.',
    signalIndustry: (label) => `matches ${label}`,
    signalMultiExact: 'fits multi-channel / general retail',
    signalMultiFlex: 'flexible across shop categories',
    signalTemplate: 'matches Website Template type',
    signalPromptPack: 'matches AI Prompt Pack type',
    signalWorkflow: 'matches Automation Workflow type',
    signalPlatform: (platform) => `compatible with ${platform}`,
    signalWithinBudget: 'within budget',
    reasonWithSignals: (reasons, price) => `Recommended because it ${reasons} (${price}).`,
    reasonFallback: (desc, price) => `${desc} (${price}).`,
    replyLead: (lines, budgetNote) =>
      `Based on our live catalog, here are the strongest matches for your shop:\n${lines}\n\n${budgetNote}`,
    budgetUnder: (total, budget) =>
      `Combined total ${total} fits comfortably within your ${budget} budget.`,
    budgetEstimated: (total) => `Estimated package total: ${total}.`,
  },
  ru: {
    outOfScope:
      'Этот запрос выходит за рамки текущего каталога. DreamTeam специализируется на готовых веб-шаблонах, наборах AI-промптов для контента и сценариях автоматизации (n8n/Make + Google Таблицы) для малых онлайн-магазинов (1–3 чел.).',
    budgetTooLow: (budget, cheapest) =>
      `В каталоге нет решений под бюджет ${budget}. Самый доступный пакет начинается от ${cheapest}.`,
    noMatch:
      'Точного совпадения по вашему бюджету и запросу пока не найдено. Уточните нишу магазина или ориентировочный бюджет — я подберу оптимальный вариант.',
    signalIndustry: (label) => `подходит под нишу «${label}»`,
    signalMultiExact: 'для мультиканальной торговли',
    signalMultiFlex: 'универсально для разных ниш',
    signalTemplate: 'формат «Веб-шаблон»',
    signalPromptPack: 'формат «Пак AI-промптов»',
    signalWorkflow: 'формат «Сценарий автоматизации»',
    signalPlatform: (platform) => `совместимо с ${platform}`,
    signalWithinBudget: 'вписывается в бюджет',
    reasonWithSignals: (reasons, price) => `Рекомендовано: ${reasons} (${price}).`,
    reasonFallback: (desc, price) => `${desc} (${price}).`,
    replyLead: (lines, budgetNote) =>
      `По текущему каталогу наиболее подходящие решения для вашего магазина:\n${lines}\n\n${budgetNote}`,
    budgetUnder: (total, budget) =>
      `Итоговая стоимость ${total} полностью укладывается в ваш бюджет ${budget}.`,
    budgetEstimated: (total) => `Ориентировочная стоимость: ${total}.`,
  },
  zh: {
    outOfScope:
      '该需求超出当前商品目录范围。DreamTeam 专注于为 1–3 人微型电商团队提供高转化网页模板、AI 内容提示词包以及 n8n/Make + Google Sheets 自动化工作流。',
    budgetTooLow: (budget, cheapest) =>
      `目录中暂无低于 ${budget} 的方案。当前最低价格的数字套件为 ${cheapest}。`,
    noMatch:
      '暂未找到完全符合当前预算与需求的方案。建议补充您的电商品类、销售渠道或调整预算范围以便重新筛选。',
    signalIndustry: (label) => `匹配「${label}」品类`,
    signalMultiExact: '适合多平台全品类卖家',
    signalMultiFlex: '多行业通用适配',
    signalTemplate: '符合「网站模板」类型',
    signalPromptPack: '符合「AI 提示词包」类型',
    signalWorkflow: '符合「自动化工作流」类型',
    signalPlatform: (platform) => `兼容 ${platform}`,
    signalWithinBudget: '在预算范围内',
    reasonWithSignals: (reasons, price) => `推荐理由：${reasons}（${price}）。`,
    reasonFallback: (desc, price) => `${desc}（${price}）。`,
    replyLead: (lines, budgetNote) =>
      `结合当前产品目录，为您精准筛选出最匹配的方案：\n${lines}\n\n${budgetNote}`,
    budgetUnder: (total, budget) =>
      `总计费用 ${total} 完全控制在您的预算 ${budget} 以内。`,
    budgetEstimated: (total) => `预计方案总价：${total}。`,
  },
};

export function normalizeVietnamese(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

export function extractBudgetVnd(normalizedMsg: string): number | null {
  if (
    /(?:mien phi|free 100%|0 dong|0d|0 vnd|\$0\b|0 usd|бесплатн|0 руб|免费)/i.test(
      normalizedMsg
    )
  ) {
    return 0;
  }

  const usdPrefixMatch = normalizedMsg.match(/\$\s*(\d+(?:[.,]\d+)?)/);
  if (usdPrefixMatch) {
    const val = Number.parseFloat(usdPrefixMatch[1].replace(',', '.'));
    if (Number.isFinite(val)) return Math.round(val * USD_EXCHANGE_RATE_VND);
  }

  const usdSuffixMatch = normalizedMsg.match(
    /(\d+(?:[.,]\d+)?)\s*(?:usd|dollars?)\b/i
  );
  if (usdSuffixMatch) {
    const val = Number.parseFloat(usdSuffixMatch[1].replace(',', '.'));
    if (Number.isFinite(val)) return Math.round(val * USD_EXCHANGE_RATE_VND);
  }

  const millionMatch = normalizedMsg.match(
    /(\d+(?:[.,]\d+)?)\s*(?:trieu|tr|million|млн)/i
  );
  if (millionMatch) {
    const val = Number.parseFloat(millionMatch[1].replace(',', '.'));
    if (Number.isFinite(val)) return Math.round(val * 1_000_000);
  }

  const wanMatch = normalizedMsg.match(/(\d+(?:[.,]\d+)?)\s*万/);
  if (wanMatch) {
    const val = Number.parseFloat(wanMatch[1].replace(',', '.'));
    if (Number.isFinite(val)) return Math.round(val * 10_000);
  }

  const thousandMatch = normalizedMsg.match(
    /(\d+(?:[.,]\d+)?)\s*(?:k|nghin|ngan|тыс\.?|千)/i
  );
  if (thousandMatch) {
    const val = Number.parseFloat(thousandMatch[1].replace(',', '.'));
    if (Number.isFinite(val)) return Math.round(val * 1_000);
  }

  const vndMatch = normalizedMsg.match(
    /(\d{1,3}(?:[.,]\d{3})+|\d+)\s*(?:d|vnd|dong|донг|越南盾|盾)\b/i
  );
  if (vndMatch) {
    const digits = vndMatch[1].replace(/[.,]/g, '');
    const val = Number.parseInt(digits, 10);
    if (Number.isFinite(val)) return val;
  }

  return null;
}

const OUT_OF_SCOPE_PATTERNS: RegExp[] = [
  /(?:bat dong san|chung khoan|crypto|tien ao|forex|ca cuoc|cho vay|real estate|cryptocurrency|недвижим|крипт|форекс|казино|房地产|加密货币|炒股|博彩)/i,
  /(?:phan mem ke toan|sap erp|he thong erp|ke toan thue|hoa don dien tu|accounting software|erp system|бухгалтерск|1с предприят|erp систем|财务软件|erp系统|电子发票)/i,
  /(?:app mobile|app di dong|ung dung di dong|ung dung ios|ung dung android|app ios|app android|android apk|react native|flutter|mobile app|ios app|android app|мобильное приложен|приложение для ios|移动app|手机应用|安卓app)/i,
  /(?:cho da nguoi ban|multi-vendor|marketplace nhieu nguoi ban|мультивендор|маркетплейс с продавцами|多商户商城)/i,
  /(?:chay quang cao thue|dich vu chay ads|ad agency management|ведение рекламы под ключ|代投广告)/i,
  /(?:may in bill|may quet ma vach|phan cung pos|may pos|pos hardware|barcode scanner|кассовое оборудован|сканер штрихкодов|收银硬件|扫码枪)/i,
  /(?:stripe quoc te|da tien te|100 tai khoan|tu dong dang video|cam ket 1000 don|cam ket ra don|hoan tien 100%)/i,
];

function hasMedicalPolicyViolation(normalizedMsg: string): boolean {
  const safePolicyContext =
    /(?:khong tri lieu|tranh .*tri lieu|khong cam ket tri lieu|khong vi pham|tranh tu cam|no medical|without medical claim|non-medical|без медицинских|无医疗)/i.test(
      normalizedMsg
    );
  if (safePolicyContext) {
    return false;
  }
  return /(?:ban thuoc|thuoc dac tri|thuoc ke don|phong kham|chua benh|tri lieu dut diem|cam ket tri|cam ket khoi|thuc pham chuc nang tri|prescription drug|cure disease|medical treatment|clinic diagnosis|лекарств.*рецепт|лечение болезн|клиника|лечит рак|处方药|包治百病|临床治疗|医疗宣称)/i.test(
    normalizedMsg
  );
}

function detectIndustrySignals(normalizedMsg: string): {
  cosmetics: boolean;
  fashion: boolean;
  fnb: boolean;
  multi: boolean;
} {
  return {
    cosmetics:
      /(?:my pham|duong da|skincare|serum|sua rua mat|kem chong nang|son moi|lam dep|beauty|cosmetic|cleanser|sunscreen|косметик|уход за кожей|сыворотк|бьюти|красот|护肤|美妆|化妆品|精华|洗面奶|防晒)/i.test(
        normalizedMsg
      ),
    fashion:
      /(?:thoi trang|quan ao|lookbook|bang size|chon size|phoi do|mix match|outfit|vay|ao|local brand|fashion|apparel|clothing|size guide|одежд|мод|размер|таблица размеров|лукбук|платье|куртк|服装|服饰|穿搭|尺码|衣橱|画册)/i.test(
        normalizedMsg
      ),
    fnb:
      /(?:f&b|do an|do uong|tra sua|ca phe|quan an|quan nuoc|tiem banh|banh ngot|tra chieu|an vat|bep nha lam|thuc don|menu|topping|ngot da|shopeefood|grabfood|dat mon|qua tang|coffee|cafe|bakery|beverage|food|drink|restaurant|кафе|кофе|еда|напитк|меню|топпинг|пекарн|выпечк|餐饮|茶饮|咖啡|奶茶|菜单|点单|加料|烘焙)/i.test(
        normalizedMsg
      ),
    multi:
      /(?:da nganh|da kenh|tong hop|bio link|tieu su|ton kho|nhieu nganh|ban le|multi[- ]?category|multi[- ]?channel|retail|inventory|мультиканаль|несколько площадок|склад|остатк|учет|全渠道|多品类|库存|多平台)/i.test(
        normalizedMsg
      ),
  };
}

function detectTypeSignals(normalizedMsg: string): {
  template: boolean;
  promptPack: boolean;
  workflow: boolean;
} {
  return {
    template:
      /(?:template|landing|trang ban hang|website|web|giao dien|lookbook|menu|bio link|cua hang mini|trang dat|storefront|лендинг|шаблон|сайт|витрин|веб|模板|落地页|网页|微店)/i.test(
        normalizedMsg
      ),
    promptPack:
      /(?:prompt|mo ta|caption|kich ban|video|review|inbox|tra loi khach|tin nhan|quick reply|tu van size|phoi do|copywriting|script|промпт|скрипт|описани|ответы клиентам|текст|шаблон сообщений|提示词|文案|话术|脚本|回复模板)/i.test(
        normalizedMsg
      ),
    workflow:
      /(?:workflow|tu dong|tu dong hoa|n8n|make|google sheet|sheets|telegram|ton kho|ghi don|dong bo|nhac lich|mua lai|chu ky|cskh|webhook|automation|sync|alert|автоматизац|таблиц|уведомлен|остатк|синхрониз|сценарий|自动化|工作流|同步|表格|提醒)/i.test(
        normalizedMsg
      ),
  };
}

function buildBigrams(tokens: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i += 1) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return bigrams;
}

function scoreProduct(
  product: ProductRecord,
  normalizedMsg: string,
  budgetVnd: number | null,
  shopIndustryNormalized: string,
  locale: AppLocale
): { score: number; matchedSignals: string[] } {
  const copy = CHAT_STUB_COPY[locale];
  let score = 0;
  const matchedSignals: string[] = [];

  const localized = localizeProduct(product, locale);
  const normIndustry = normalizeVietnamese(product.industry);
  const normName = `${normalizeVietnamese(product.name)} ${normalizeVietnamese(localized.name)}`;
  const deliverables = Array.isArray(product.specs.deliverables)
    ? product.specs.deliverables.map((d) => normalizeVietnamese(String(d)))
    : [];
  const normDesc = normalizeVietnamese(
    `${product.short_description} ${product.description} ${localized.short_description} ${localized.description ?? ''} ${deliverables.join(' ')}`
  );
  const platforms = Array.isArray(product.specs.platforms)
    ? product.specs.platforms.map((p) => normalizeVietnamese(String(p)))
    : [];

  const msgIndustry = detectIndustrySignals(normalizedMsg);
  const profileIndustry = detectIndustrySignals(shopIndustryNormalized);
  const hasCosmetics = msgIndustry.cosmetics || profileIndustry.cosmetics;
  const hasFashion = msgIndustry.fashion || profileIndustry.fashion;
  const hasFnb = msgIndustry.fnb || profileIndustry.fnb;
  const hasSpecificIndustry = hasCosmetics || hasFashion || hasFnb;

  const displayIndustry = translateIndustry(product.industry, locale);

  if (normIndustry === 'my pham') {
    if (hasCosmetics) {
      score += 48;
      matchedSignals.push(copy.signalIndustry(displayIndustry));
    } else if (hasSpecificIndustry) {
      score -= 35;
    }
  } else if (normIndustry === 'thoi trang') {
    if (hasFashion) {
      score += 48;
      matchedSignals.push(copy.signalIndustry(displayIndustry));
    } else if (hasSpecificIndustry) {
      score -= 35;
    }
  } else if (normIndustry === 'f&b') {
    if (hasFnb) {
      score += 48;
      matchedSignals.push(copy.signalIndustry(displayIndustry));
    } else if (hasSpecificIndustry) {
      score -= 35;
    }
  } else if (normIndustry === 'da nganh') {
    if (msgIndustry.multi) {
      score += 36;
      matchedSignals.push(copy.signalMultiExact);
    } else if (!hasSpecificIndustry) {
      score += 20;
      matchedSignals.push(copy.signalMultiFlex);
    } else {
      score += 6;
    }
  }

  const typeSignals = detectTypeSignals(normalizedMsg);
  if (product.product_type === 'template') {
    if (typeSignals.template) {
      score += 30;
      matchedSignals.push(copy.signalTemplate);
    } else if (typeSignals.workflow || typeSignals.promptPack) {
      score -= 10;
    }
  } else if (product.product_type === 'prompt_pack') {
    if (typeSignals.promptPack) {
      score += 32;
      matchedSignals.push(copy.signalPromptPack);
    } else if (typeSignals.workflow || typeSignals.template) {
      score -= 10;
    }
  } else if (product.product_type === 'workflow') {
    if (typeSignals.workflow) {
      score += 36;
      matchedSignals.push(copy.signalWorkflow);
    } else if (typeSignals.template || typeSignals.promptPack) {
      score -= 12;
    }
  }

  let platformBonus = 0;
  for (const platform of platforms) {
    if (platform && normalizedMsg.includes(platform)) {
      platformBonus += 10;
      matchedSignals.push(copy.signalPlatform(platform));
    }
  }
  score += Math.min(platformBonus, 24);

  const tokens = (normalizedMsg.match(/[\p{L}\p{N}]+/gu) ?? []).filter(
    (t) => t.length >= 2 && !MULTILINGUAL_STOP_WORDS.has(t)
  );
  const uniqueTokens = Array.from(new Set(tokens));

  let tokenHits = 0;
  for (const token of uniqueTokens) {
    if (normName.includes(token)) {
      tokenHits += 5;
    } else if (normDesc.includes(token)) {
      tokenHits += 3;
    }
  }
  score += Math.min(tokenHits, 30);

  const bigrams = buildBigrams(tokens);
  let bigramHits = 0;
  for (const bg of bigrams) {
    if (normName.includes(bg)) {
      bigramHits += 12;
    } else if (normDesc.includes(bg)) {
      bigramHits += 8;
    }
  }
  score += Math.min(bigramHits, 36);

  if (budgetVnd !== null) {
    if (product.price_vnd <= budgetVnd) {
      score += 12;
      matchedSignals.push(copy.signalWithinBudget);
    } else {
      score -= 200;
    }
  }

  return { score, matchedSignals };
}

export function runChatbotStub(params: {
  message: string;
  catalogProducts: ProductRecord[];
  shopProfile?: ShopProfileInput;
  locale?: AppLocale;
}): ChatbotStubResult {
  const startedAt = Date.now();
  const locale: AppLocale = params.locale ?? 'vi';
  const copy = CHAT_STUB_COPY[locale];

  const normalizedMsg = normalizeVietnamese(params.message);
  const budgetVnd = extractBudgetVnd(normalizedMsg);
  const shopIndustry = params.shopProfile?.industry
    ? normalizeVietnamese(params.shopProfile.industry)
    : '';

  const isOutOfScope =
    OUT_OF_SCOPE_PATTERNS.some((pattern) => pattern.test(normalizedMsg)) ||
    hasMedicalPolicyViolation(normalizedMsg);

  const activeCatalog = params.catalogProducts.filter(
    (p) => p.is_active && p.deleted_at === null
  );

  if (isOutOfScope || activeCatalog.length === 0) {
    return {
      reply: copy.outOfScope,
      prompt_version: ADVISOR_PROMPT_VERSION,
      model_name: 'stub-keyword-v1',
      retrieved_product_ids: [],
      suggested_products: [],
      missing_catalog_info: true,
      latency_ms: Math.max(1, Date.now() - startedAt),
      tokens_used: 0,
      cost_usd: 0,
    };
  }

  if (budgetVnd !== null) {
    const cheapest = Math.min(...activeCatalog.map((p) => p.price_vnd));
    if (budgetVnd < cheapest) {
      return {
        reply: copy.budgetTooLow(
          formatMoney(budgetVnd, locale),
          formatMoney(cheapest, locale)
        ),
        prompt_version: ADVISOR_PROMPT_VERSION,
        model_name: 'stub-keyword-v1',
        retrieved_product_ids: [],
        suggested_products: [],
        missing_catalog_info: true,
        latency_ms: Math.max(1, Date.now() - startedAt),
        tokens_used: 0,
        cost_usd: 0,
      };
    }
  }

  const ranked = activeCatalog
    .map((product) => {
      const { score, matchedSignals } = scoreProduct(
        product,
        normalizedMsg,
        budgetVnd,
        shopIndustry,
        locale
      );
      return { product, score, matchedSignals };
    })
    .sort((a, b) => b.score - a.score || a.product.price_vnd - b.product.price_vnd);

  const retrievedCandidates = ranked.slice(0, 4).map((r) => r.product);
  const retrievedIds = retrievedCandidates.map((p) => p.id);

  const wantsCombo =
    /(?:ket hop|ca hai|combo|tron bo|vua .* vua|ca .* lan|ca .* va|both|bundle|комбо|вместе|набор|оба|组合|搭配|一套|同时)/i.test(
      normalizedMsg
    );
  const minPrimaryScore = 24;
  const minSecondaryScore = 32;
  const maxSuggestions = wantsCombo ? 2 : 1;

  const picked: Array<{ product: ProductRecord; reason: string; displayName: string }> = [];
  let runningTotal = 0;

  for (const item of ranked) {
    if (picked.length >= maxSuggestions) break;
    const minScore = picked.length === 0 ? minPrimaryScore : minSecondaryScore;
    if (item.score < minScore) continue;
    if (
      budgetVnd !== null &&
      runningTotal + item.product.price_vnd > budgetVnd
    ) {
      continue;
    }

    const localized = localizeProduct(item.product, locale);
    const priceLabel = formatMoney(item.product.price_vnd, locale);
    const uniqueReasons = Array.from(new Set(item.matchedSignals));
    const reasonText =
      uniqueReasons.length > 0
        ? copy.reasonWithSignals(uniqueReasons.slice(0, 3).join(', '), priceLabel)
        : copy.reasonFallback(localized.short_description, priceLabel);

    picked.push({
      product: item.product,
      displayName: localized.name,
      reason: reasonText,
    });
    runningTotal += item.product.price_vnd;
  }

  if (picked.length === 0) {
    return {
      reply: copy.noMatch,
      prompt_version: ADVISOR_PROMPT_VERSION,
      model_name: 'stub-keyword-v1',
      retrieved_product_ids: retrievedIds,
      suggested_products: [],
      missing_catalog_info: true,
      latency_ms: Math.max(1, Date.now() - startedAt),
      tokens_used: 0,
      cost_usd: 0,
    };
  }

  const summaryLines = picked.map(
    (item, idx) =>
      `${idx + 1}. **${item.displayName}** (${formatMoney(item.product.price_vnd, locale)}) — ${item.reason}`
  );
  const budgetNote =
    budgetVnd !== null
      ? copy.budgetUnder(
          formatMoney(runningTotal, locale),
          formatMoney(budgetVnd, locale)
        )
      : copy.budgetEstimated(formatMoney(runningTotal, locale));

  return {
    reply: copy.replyLead(summaryLines.join('\n'), budgetNote),
    prompt_version: ADVISOR_PROMPT_VERSION,
    model_name: 'stub-keyword-v1',
    retrieved_product_ids: retrievedIds,
    suggested_products: picked.map((item) => ({
      product_id: item.product.id,
      reason: item.reason.slice(0, 290),
    })),
    missing_catalog_info: false,
    latency_ms: Math.max(1, Date.now() - startedAt),
    tokens_used: 0,
    cost_usd: 0,
  };
}
