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

const VIETNAMESE_STOP_WORDS = new Set([
  'minh',
  'ban',
  'shop',
  'cua',
  'cho',
  'can',
  'muon',
  'tim',
  'goi',
  'san',
  'pham',
  'ngan',
  'sach',
  'duoi',
  'tren',
  'tam',
  'khoang',
  'toi',
  'da',
  'voi',
  'nhu',
  'nguoi',
  'hang',
  'nao',
  'phu',
  'hop',
  'nhat',
  'khong',
  'duoc',
  'mot',
  'nhung',
  'cac',
  'trong',
  'ngoai',
  'hoac',
  'giup',
  'tu',
  'van',
]);

export function normalizeVietnamese(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

export function extractBudgetVnd(normalizedMsg: string): number | null {
  if (/\b(?:mien phi|free 100%|0 dong|0d|0 vnd)\b/.test(normalizedMsg)) {
    return 0;
  }

  const millionMatch = normalizedMsg.match(
    /(\d+(?:[.,]\d+)?)\s*(?:trieu|tr)\b/
  );
  if (millionMatch) {
    const val = Number.parseFloat(millionMatch[1].replace(',', '.'));
    if (Number.isFinite(val)) return Math.round(val * 1_000_000);
  }

  const thousandMatch = normalizedMsg.match(
    /(\d+(?:[.,]\d+)?)\s*(?:k|nghin|ngan)\b/
  );
  if (thousandMatch) {
    const val = Number.parseFloat(thousandMatch[1].replace(',', '.'));
    if (Number.isFinite(val)) return Math.round(val * 1_000);
  }

  const vndMatch = normalizedMsg.match(
    /(\d{1,3}(?:[.,]\d{3})+|\d+)\s*(?:d|vnd|dong)\b/
  );
  if (vndMatch) {
    const digits = vndMatch[1].replace(/[.,]/g, '');
    const val = Number.parseInt(digits, 10);
    if (Number.isFinite(val)) return val;
  }

  return null;
}

const OUT_OF_SCOPE_PATTERNS: RegExp[] = [
  /\b(?:bat dong san|chung khoan|crypto|tien ao|forex|ca cuoc|cho vay)\b/,
  /\b(?:phan mem ke toan|sap erp|he thong erp|ke toan thue|hoa don dien tu)\b/,
  /\b(?:app mobile|app di dong|ung dung di dong|ung dung ios|ung dung android|app ios|app android|android apk|react native|flutter)\b/,
  /\b(?:cho da nguoi ban|multi-vendor|marketplace nhieu nguoi ban)\b/,
  /\b(?:chay quang cao thue|dich vu chay ads)\b/,
  /\b(?:may in bill|may quet ma vach|phan cung pos|may pos)\b/,
  /\b(?:stripe quoc te|da tien te|da ngon ngu|5 ngon ngu)\b/,
  /\b(?:100 tai khoan|tu dong dang video|cam ket 1000 don|cam ket ra don|hoan tien 100%)\b/,
];

function hasMedicalPolicyViolation(normalizedMsg: string): boolean {
  const safePolicyContext =
    /\b(?:khong tri lieu|tranh .*tri lieu|khong cam ket tri lieu|khong vi pham|tranh tu cam)\b/.test(
      normalizedMsg
    );
  if (safePolicyContext) {
    return false;
  }
  return /\b(?:ban thuoc|thuoc dac tri|thuoc ke don|phong kham|chua benh|tri lieu dut diem|cam ket tri|cam ket khoi|thuc pham chuc nang tri)\b/.test(
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
      /\b(?:my pham|duong da|skincare|serum|sua rua mat|kem chong nang|son moi|lam dep)\b/.test(
        normalizedMsg
      ),
    fashion:
      /\b(?:thoi trang|quan ao|lookbook|bang size|chon size|phoi do|mix match|outfit|vay|ao|local brand)\b/.test(
        normalizedMsg
      ),
    fnb:
      /\b(?:f&b|do an|do uong|tra sua|ca phe|quan an|quan nuoc|tiem banh|banh ngot|tra chieu|an vat|bep nha lam|thuc don|menu|topping|ngot da|shopeefood|grabfood|dat mon|qua tang)\b/.test(
        normalizedMsg
      ),
    multi:
      /\b(?:da nganh|da kenh|tong hop|bio link|tieu su|ton kho|nhieu nganh|ban le)\b/.test(
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
      /\b(?:template|landing|trang ban hang|website|web|giao dien|lookbook|menu|bio link|cua hang mini|trang dat)\b/.test(
        normalizedMsg
      ),
    promptPack:
      /\b(?:prompt|mo ta|caption|kich ban|video|review|inbox|tra loi khach|tin nhan|quick reply|tu van size|phoi do)\b/.test(
        normalizedMsg
      ),
    workflow:
      /\b(?:workflow|tu dong|tu dong hoa|n8n|make|google sheet|sheets|telegram|ton kho|ghi don|dong bo|nhac lich|mua lai|chu ky|cskh|webhook)\b/.test(
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
  shopIndustryNormalized: string
): { score: number; matchedSignals: string[] } {
  let score = 0;
  const matchedSignals: string[] = [];

  const normIndustry = normalizeVietnamese(product.industry);
  const normName = normalizeVietnamese(product.name);
  const deliverables = Array.isArray(product.specs.deliverables)
    ? product.specs.deliverables.map((d) => normalizeVietnamese(String(d)))
    : [];
  const normDesc = normalizeVietnamese(
    `${product.short_description} ${product.description} ${deliverables.join(' ')}`
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

  if (normIndustry === 'my pham') {
    if (hasCosmetics) {
      score += 48;
      matchedSignals.push(`đúng ngành ${product.industry}`);
    } else if (hasSpecificIndustry) {
      score -= 35;
    }
  } else if (normIndustry === 'thoi trang') {
    if (hasFashion) {
      score += 48;
      matchedSignals.push(`đúng ngành ${product.industry}`);
    } else if (hasSpecificIndustry) {
      score -= 35;
    }
  } else if (normIndustry === 'f&b') {
    if (hasFnb) {
      score += 48;
      matchedSignals.push(`đúng ngành ${product.industry}`);
    } else if (hasSpecificIndustry) {
      score -= 35;
    }
  } else if (normIndustry === 'da nganh') {
    if (msgIndustry.multi) {
      score += 36;
      matchedSignals.push('phù hợp bán đa ngành / đa kênh');
    } else if (!hasSpecificIndustry) {
      score += 20;
      matchedSignals.push('linh hoạt cho nhiều ngành hàng');
    } else {
      score += 6;
    }
  }

  const typeSignals = detectTypeSignals(normalizedMsg);
  if (product.product_type === 'template') {
    if (typeSignals.template) {
      score += 30;
      matchedSignals.push('đúng loại Template website');
    } else if (typeSignals.workflow || typeSignals.promptPack) {
      score -= 10;
    }
  } else if (product.product_type === 'prompt_pack') {
    if (typeSignals.promptPack) {
      score += 32;
      matchedSignals.push('đúng loại Prompt Pack nội dung');
    } else if (typeSignals.workflow || typeSignals.template) {
      score -= 10;
    }
  } else if (product.product_type === 'workflow') {
    if (typeSignals.workflow) {
      score += 36;
      matchedSignals.push('đúng loại Workflow tự động hóa');
    } else if (typeSignals.template || typeSignals.promptPack) {
      score -= 12;
    }
  }

  let platformBonus = 0;
  for (const platform of platforms) {
    if (platform && normalizedMsg.includes(platform)) {
      platformBonus += 10;
      matchedSignals.push(`tương thích ${platform}`);
    }
  }
  score += Math.min(platformBonus, 24);

  const tokens = normalizedMsg
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2 && !VIETNAMESE_STOP_WORDS.has(t));
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
      matchedSignals.push('nằm trong ngân sách');
    } else {
      score -= 200;
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

  const isOutOfScope =
    OUT_OF_SCOPE_PATTERNS.some((pattern) => pattern.test(normalizedMsg)) ||
    hasMedicalPolicyViolation(normalizedMsg);

  const activeCatalog = params.catalogProducts.filter(
    (p) => p.is_active && p.deleted_at === null
  );

  if (isOutOfScope || activeCatalog.length === 0) {
    return {
      reply:
        'Hiện chưa có thông tin trong danh mục phù hợp với yêu cầu ngoài phạm vi này. Danh mục hiện tại tập trung vào Template trang bán hàng, Prompt Pack nội dung và Workflow tự động hóa (n8n/Make + Google Sheets) cho chủ shop nhỏ.',
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

  const wantsCombo =
    /\b(?:ket hop|ca hai|combo|tron bo|vua .* vua|ca .* lan|ca .* va)\b/.test(
      normalizedMsg
    );
  const minPrimaryScore = 24;
  const minSecondaryScore = 32;
  const maxSuggestions = wantsCombo ? 2 : 1;

  const picked: Array<{ product: ProductRecord; reason: string }> = [];
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
