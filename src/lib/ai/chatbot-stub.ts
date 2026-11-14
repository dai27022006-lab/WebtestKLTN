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

function normalizeVietnamese(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function extractBudgetVnd(normalizedMsg: string): number | null {
  const millionMatch = normalizedMsg.match(
    /(\d+(?:[.,]\d+)?)\s*(?:trieu|tr\b)/
  );
  if (millionMatch) {
    const val = Number.parseFloat(millionMatch[1].replace(',', '.'));
    if (Number.isFinite(val)) return Math.round(val * 1_000_000);
  }

  const thousandMatch = normalizedMsg.match(/(\d{2,4})\s*(?:k|nghin|ngan)\b/);
  if (thousandMatch) {
    const val = Number.parseInt(thousandMatch[1], 10);
    if (Number.isFinite(val)) return val * 1_000;
  }

  const vndMatch = normalizedMsg.match(/(\d{3,8})\s*(?:d|vnd|dong)\b/);
  if (vndMatch) {
    const val = Number.parseInt(vndMatch[1], 10);
    if (Number.isFinite(val)) return val;
  }

  return null;
}

const OUT_OF_SCOPE_KEYWORDS = [
  'bat dong san',
  'chung khoan',
  'crypto',
  'phan mem ke toan erp',
  'sap erp',
  'app mobile ios',
  'android apk',
  'chay quang cao thue',
];

function scoreProduct(
  product: ProductRecord,
  normalizedMsg: string,
  budgetVnd: number | null,
  shopIndustryNormalized: string
): { score: number; matchedSignals: string[] } {
  let score = 0;
  const matchedSignals: string[] = [];

  const normIndustry = normalizeVietnamese(product.industry);
  const normName = normalizeVietnamese(product.name);
  const normDesc = normalizeVietnamese(
    `${product.short_description} ${product.description}`
  );
  const platforms = Array.isArray(product.specs.platforms)
    ? product.specs.platforms.map((p) => normalizeVietnamese(String(p)))
    : [];

  if (
    normIndustry !== 'da nganh' &&
    (normalizedMsg.includes(normIndustry) ||
      (shopIndustryNormalized &&
        shopIndustryNormalized.includes(normIndustry)))
  ) {
    score += 45;
    matchedSignals.push(`đúng ngành ${product.industry}`);
  } else if (normIndustry === 'da nganh') {
    score += 10;
  }

  if (
    (normalizedMsg.includes('my pham') ||
      normalizedMsg.includes('duong da') ||
      normalizedMsg.includes('skincare') ||
      normalizedMsg.includes('tri lieu')) &&
    normIndustry === 'my pham'
  ) {
    score += 35;
  }

  if (
    (normalizedMsg.includes('thoi trang') ||
      normalizedMsg.includes('quan ao') ||
      normalizedMsg.includes('lookbook') ||
      normalizedMsg.includes('bang size')) &&
    normIndustry === 'thoi trang'
  ) {
    score += 35;
  }

  if (
    (normalizedMsg.includes('f&b') ||
      normalizedMsg.includes('do an') ||
      normalizedMsg.includes('do uong') ||
      normalizedMsg.includes('quan') ||
      normalizedMsg.includes('menu') ||
      normalizedMsg.includes('qr')) &&
    normIndustry === 'f&b'
  ) {
    score += 35;
  }

  if (
    (normalizedMsg.includes('landing') ||
      normalizedMsg.includes('template') ||
      normalizedMsg.includes('trang ban hang') ||
      normalizedMsg.includes('web')) &&
    product.product_type === 'template'
  ) {
    score += 25;
    matchedSignals.push('đúng loại Template giao diện bán hàng');
  }

  if (
    (normalizedMsg.includes('prompt') ||
      normalizedMsg.includes('mo ta') ||
      normalizedMsg.includes('kich ban') ||
      normalizedMsg.includes('chot don') ||
      normalizedMsg.includes('video')) &&
    product.product_type === 'prompt_pack'
  ) {
    score += 25;
    matchedSignals.push('đúng loại Prompt Pack nội dung');
  }

  if (
    (normalizedMsg.includes('workflow') ||
      normalizedMsg.includes('tu dong') ||
      normalizedMsg.includes('ton kho') ||
      normalizedMsg.includes('google sheet') ||
      normalizedMsg.includes('dong bo')) &&
    product.product_type === 'workflow'
  ) {
    score += 30;
    matchedSignals.push('đúng loại Workflow tự động hóa');
  }

  for (const platform of platforms) {
    if (normalizedMsg.includes(platform)) {
      score += 12;
      matchedSignals.push(`tương thích ${platform}`);
    }
  }

  // Word overlap bonus
  const tokens = normalizedMsg.split(/[^a-z0-9]+/).filter((t) => t.length >= 3);
  let overlap = 0;
  for (const token of tokens) {
    if (normName.includes(token) || normDesc.includes(token)) {
      overlap += 1;
    }
  }
  score += Math.min(overlap * 4, 20);

  if (budgetVnd !== null) {
    if (product.price_vnd <= budgetVnd) {
      score += 15;
      matchedSignals.push('nằm trong ngân sách');
    } else {
      score -= 40;
    }
  }

  return { score, matchedSignals };
}

function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}đ`;
}

export function runChatbotStub(params: {
  message: string;
  catalogProducts: ProductRecord[];
  shopProfile?: ShopProfileInput;
}): ChatbotStubResult {
  const startedAt = Date.now();
  const normalizedMsg = normalizeVietnamese(params.message);
  const budgetVnd = extractBudgetVnd(normalizedMsg);
  const shopIndustry = params.shopProfile?.industry
    ? normalizeVietnamese(params.shopProfile.industry)
    : '';

  const isOutOfScope = OUT_OF_SCOPE_KEYWORDS.some((kw) =>
    normalizedMsg.includes(kw)
  );

  const activeCatalog = params.catalogProducts.filter(
    (p) => p.is_active && p.deleted_at === null
  );

  if (isOutOfScope || activeCatalog.length === 0) {
    return {
      reply:
        'Hiện chưa có thông tin trong danh mục phù hợp với yêu cầu ngoài phạm vi này. Danh mục hiện tại tập trung vào Template trang bán hàng, Prompt Pack nội dung và Workflow tự động hóa cho chủ shop nhỏ.',
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
        reply: `Hiện chưa có thông tin trong danh mục phù hợp với mức ngân sách ${formatVnd(budgetVnd)}. Gói có chi phí thấp nhất hiện có là ${formatVnd(cheapest)}.`,
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
        shopIndustry
      );
      return { product, score, matchedSignals };
    })
    .sort((a, b) => b.score - a.score || a.product.price_vnd - b.product.price_vnd);

  const retrievedCandidates = ranked.slice(0, 4).map((r) => r.product);
  const retrievedIds = retrievedCandidates.map((p) => p.id);

  const picked: Array<{ product: ProductRecord; reason: string }> = [];
  let runningTotal = 0;

  for (const item of ranked) {
    if (picked.length >= 2) break;
    if (item.score <= 0 && picked.length >= 1) break;
    if (
      budgetVnd !== null &&
      runningTotal + item.product.price_vnd > budgetVnd
    ) {
      continue;
    }

    const uniqueReasons = Array.from(new Set(item.matchedSignals));
    const reasonText =
      uniqueReasons.length > 0
        ? `Phù hợp vì ${uniqueReasons.slice(0, 3).join(', ')} (${formatVnd(item.product.price_vnd)}).`
        : `${item.product.short_description} (${formatVnd(item.product.price_vnd)}).`;

    picked.push({ product: item.product, reason: reasonText });
    runningTotal += item.product.price_vnd;
  }

  if (picked.length === 0) {
    return {
      reply:
        'Hiện chưa có thông tin trong danh mục khớp chính xác với tiêu chí ngân sách và nhu cầu bạn vừa nêu. Bạn có thể mô tả rõ hơn ngành hàng hoặc tăng ngân sách để mình lọc lại.',
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
      `${idx + 1}. **${item.product.name}** (${formatVnd(item.product.price_vnd)}) — ${item.reason}`
  );
  const budgetNote =
    budgetVnd !== null
      ? `Tổng chi phí ${formatVnd(runningTotal)} nằm gọn trong ngân sách ${formatVnd(budgetVnd)} của bạn.`
      : `Tổng chi phí dự kiến: ${formatVnd(runningTotal)}.`;

  return {
    reply: `Dựa trên danh mục sản phẩm hiện có, mình gợi ý bạn cân nhắc:\n${summaryLines.join('\n')}\n\n${budgetNote}`,
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
