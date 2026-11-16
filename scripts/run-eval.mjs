import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');

// =============================================================================
// Synchronized Grounded Stub Logic (mirrors src/lib/ai/chatbot-stub.ts)
// =============================================================================

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

function normalizeVietnamese(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function extractBudgetVnd(normalizedMsg) {
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

const OUT_OF_SCOPE_PATTERNS = [
  /\b(?:bat dong san|chung khoan|crypto|tien ao|forex|ca cuoc|cho vay)\b/,
  /\b(?:phan mem ke toan|sap erp|he thong erp|ke toan thue|hoa don dien tu)\b/,
  /\b(?:app mobile|app di dong|ung dung di dong|ung dung ios|ung dung android|app ios|app android|android apk|react native|flutter)\b/,
  /\b(?:cho da nguoi ban|multi-vendor|marketplace nhieu nguoi ban)\b/,
  /\b(?:chay quang cao thue|dich vu chay ads)\b/,
  /\b(?:may in bill|may quet ma vach|phan cung pos|may pos)\b/,
  /\b(?:stripe quoc te|da tien te|da ngon ngu|5 ngon ngu)\b/,
  /\b(?:100 tai khoan|tu dong dang video|cam ket 1000 don|cam ket ra don|hoan tien 100%)\b/,
];

function hasMedicalPolicyViolation(normalizedMsg) {
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

function detectIndustrySignals(normalizedMsg) {
  return {
    cosmetics:
      /\b(?:my pham|duong da|skincare|serum|sua rua mat|kem chong nang|son moi|lam dep)\b/.test(
        normalizedMsg
      ),
    fashion:
      /\b(?:thoi trang|quan ao|lookbook|bang size|chon size|phoi do|mix match|outfit|vay|ao|local brand)\b/.test(
        normalizedMsg
      ),
    fnb: /\b(?:f&b|do an|do uong|tra sua|ca phe|quan an|quan nuoc|tiem banh|banh ngot|tra chieu|an vat|bep nha lam|thuc don|menu|topping|ngot da|shopeefood|grabfood|dat mon|qua tang)\b/.test(
      normalizedMsg
    ),
    multi:
      /\b(?:da nganh|da kenh|tong hop|bio link|tieu su|ton kho|nhieu nganh|ban le)\b/.test(
        normalizedMsg
      ),
  };
}

function detectTypeSignals(normalizedMsg) {
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

function buildBigrams(tokens) {
  const bigrams = [];
  for (let i = 0; i < tokens.length - 1; i += 1) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return bigrams;
}

function scoreProduct(product, normalizedMsg, budgetVnd, shopIndustryNormalized) {
  let score = 0;
  const matchedSignals = [];

  const normIndustry = normalizeVietnamese(product.industry);
  const normName = normalizeVietnamese(product.name);
  const deliverables = Array.isArray(product.specs?.deliverables)
    ? product.specs.deliverables.map((d) => normalizeVietnamese(String(d)))
    : [];
  const normDesc = normalizeVietnamese(
    `${product.short_description} ${product.description} ${deliverables.join(' ')}`
  );
  const platforms = Array.isArray(product.specs?.platforms)
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

function runStubMatcher({ message, activeCatalog, shopProfile }) {
  const startedPerf = performance.now();
  const normalizedMsg = normalizeVietnamese(message);
  const budgetVnd = extractBudgetVnd(normalizedMsg);
  const shopIndustry = shopProfile?.industry
    ? normalizeVietnamese(shopProfile.industry)
    : '';

  const isOutOfScope =
    OUT_OF_SCOPE_PATTERNS.some((pattern) => pattern.test(normalizedMsg)) ||
    hasMedicalPolicyViolation(normalizedMsg);

  if (isOutOfScope || activeCatalog.length === 0) {
    return {
      reply:
        'Hiện chưa có thông tin trong danh mục phù hợp với yêu cầu ngoài phạm vi này.',
      prompt_version: 'v1',
      model_name: 'stub-keyword-v1',
      retrieved_product_ids: [],
      raw_suggested_product_ids: [],
      suggested_product_ids: [],
      missing_catalog_info: true,
      latency_ms: Math.round((performance.now() - startedPerf) * 100) / 100,
      tokens_used: 0,
      cost_usd: 0,
    };
  }

  if (budgetVnd !== null) {
    const cheapest = Math.min(...activeCatalog.map((p) => p.price_vnd));
    if (budgetVnd < cheapest) {
      return {
        reply: `Hiện chưa có thông tin trong danh mục phù hợp với mức ngân sách ${budgetVnd}đ.`,
        prompt_version: 'v1',
        model_name: 'stub-keyword-v1',
        retrieved_product_ids: [],
        raw_suggested_product_ids: [],
        suggested_product_ids: [],
        missing_catalog_info: true,
        latency_ms: Math.round((performance.now() - startedPerf) * 100) / 100,
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

  const retrievedIds = ranked.slice(0, 4).map((r) => r.product.id);
  const wantsCombo =
    /\b(?:ket hop|ca hai|combo|tron bo|vua .* vua|ca .* lan|ca .* va)\b/.test(
      normalizedMsg
    );
  const minPrimaryScore = 24;
  const minSecondaryScore = 32;
  const maxSuggestions = wantsCombo ? 2 : 1;

  const picked = [];
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
    picked.push(item.product);
    runningTotal += item.product.price_vnd;
  }

  const rawSuggestedIds = picked.map((p) => p.id);
  const activeMap = new Map(activeCatalog.map((p) => [p.id, p]));
  const groundedSuggestedIds = rawSuggestedIds.filter((id) => activeMap.has(id));

  return {
    reply:
      groundedSuggestedIds.length > 0
        ? `Gợi ý ${groundedSuggestedIds.length} gói sản phẩm phù hợp.`
        : 'Hiện chưa có thông tin trong danh mục khớp chính xác.',
    prompt_version: 'v1',
    model_name: 'stub-keyword-v1',
    retrieved_product_ids: retrievedIds,
    raw_suggested_product_ids: rawSuggestedIds,
    suggested_product_ids: groundedSuggestedIds,
    missing_catalog_info: groundedSuggestedIds.length === 0,
    latency_ms: Math.round((performance.now() - startedPerf) * 100) / 100,
    tokens_used: 0,
    cost_usd: 0,
  };
}

// =============================================================================
// Optional Live Gemini Runner (--live)
// =============================================================================

function loadLocalEnvFallback() {
  const envLocalPath = resolve(ROOT_DIR, '.env.local');
  if (!existsSync(envLocalPath)) return;
  const raw = readFileSync(envLocalPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && !(key in process.env)) {
      process.env[key] = val;
    }
  }
}

async function createLiveGeminiRunner(activeCatalog) {
  loadLocalEnvFallback();
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'Thiếu GEMINI_API_KEY trong môi trường hoặc .env.local khi chạy chế độ --live.'
    );
  }

  const { GoogleGenAI, Type } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  const modelName =
    process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash';

  const systemPrompt = `
Bạn là Trợ lý Tư vấn Sản phẩm Số dành cho chủ shop nhỏ (1-3 người bán trên TikTok Shop, Shopee, Facebook, Zalo).
Nhiệm vụ của bạn là đọc hồ sơ ngữ cảnh và danh mục sản phẩm được cung cấp, sau đó gợi ý 1 đến 3 gói sản phẩm phù hợp nhất với ngành hàng, kênh bán và ngân sách của người dùng.

QUY TẮC BẮT BUỘC (STRICT GROUNDING):
1. Chỉ được gợi ý các product_id có mặt trong danh mục ĐƯỢC CUNG CẤP ở ngữ cảnh. Tuyệt đối không tự bịa product_id, giá bán hoặc tính năng không có trong mô tả.
2. Nếu không có sản phẩm nào phù hợp hoặc yêu cầu nằm ngoài danh mục (hoặc ngân sách bất khả thi), hãy trả lời trung thực rằng "hiện chưa có thông tin trong danh mục phù hợp với yêu cầu này", đặt missing_catalog_info = true và trả mảng suggested_products rỗng.
3. Giải thích ngắn gọn, dễ hiểu bằng tiếng Việt, nêu rõ tổng chi phí dự kiến và lý do chọn từng gói.
4. Trả về đúng cấu trúc JSON theo schema đã khai báo.
`.trim();

  const catalogContext = activeCatalog.map((p) => ({
    id: p.id,
    name: p.name,
    product_type: p.product_type,
    industry: p.industry,
    price_vnd: p.price_vnd,
    short_description: p.short_description,
    platforms: p.specs?.platforms ?? [],
    deliverables: p.specs?.deliverables ?? [],
  }));
  const activeMap = new Map(activeCatalog.map((p) => [p.id, p]));

  return async function runLiveCase({ message, shopProfile }) {
    const startedPerf = performance.now();
    const userPayload = JSON.stringify(
      {
        user_message: message,
        shop_profile: shopProfile ?? {},
        available_catalog: catalogContext,
      },
      null,
      2
    );

    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPayload,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseJsonSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            suggested_products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  product_id: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['product_id', 'reason'],
              },
            },
            missing_catalog_info: { type: Type.BOOLEAN },
          },
          required: ['reply', 'suggested_products', 'missing_catalog_info'],
        },
      },
    });

    const latencyMs =
      Math.round((performance.now() - startedPerf) * 100) / 100;
    const parsed = JSON.parse(response.text || '{}');
    const rawSuggestedIds = Array.isArray(parsed.suggested_products)
      ? parsed.suggested_products
          .map((item) => String(item.product_id || '').trim())
          .filter(Boolean)
      : [];

    // Strict Server-Side Grounding Check
    const groundedSuggestedIds = Array.from(
      new Set(rawSuggestedIds.filter((id) => activeMap.has(id)))
    );

    const usage = response.usageMetadata || {};
    const promptTokens = Number(usage.promptTokenCount ?? 0);
    const outputTokens = Number(usage.candidatesTokenCount ?? 0);
    const totalTokens = Number(
      usage.totalTokenCount ?? promptTokens + outputTokens
    );

    // Reference Flash pricing ($0.10 / 1M input, $0.40 / 1M output)
    const costUsd =
      Math.round(
        ((promptTokens * 0.1 + outputTokens * 0.4) / 1_000_000) * 1_000_000
      ) / 1_000_000;

    return {
      reply: String(parsed.reply || ''),
      prompt_version: 'v1',
      model_name: modelName,
      retrieved_product_ids: catalogContext.map((c) => c.id),
      raw_suggested_product_ids: rawSuggestedIds,
      suggested_product_ids: groundedSuggestedIds,
      missing_catalog_info:
        Boolean(parsed.missing_catalog_info) ||
        groundedSuggestedIds.length === 0,
      latency_ms: latencyMs,
      tokens_used: totalTokens,
      cost_usd: costUsd,
    };
  };
}

// =============================================================================
// Evaluation Metrics & Reporting
// =============================================================================

function parseArgs(argv) {
  const args = {
    live: false,
    outPrefix: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--live') {
      args.live = true;
    } else if (arg === '--out' && argv[i + 1]) {
      args.outPrefix = argv[i + 1];
      i += 1;
    }
  }
  if (!args.outPrefix) {
    args.outPrefix = args.live ? 'v1-live-gemini' : 'v1-stub-baseline';
  }
  return args;
}

function percentile(sortedNumbers, p) {
  if (sortedNumbers.length === 0) return 0;
  const idx = Math.min(
    sortedNumbers.length - 1,
    Math.max(0, Math.ceil(sortedNumbers.length * p) - 1)
  );
  return sortedNumbers[idx];
}

function round(value, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const catalogPath = resolve(ROOT_DIR, 'data/catalog-v1.json');
  const evalSetPath = resolve(ROOT_DIR, 'eval/eval-set-v1.json');

  const catalogJson = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const evalSetJson = JSON.parse(readFileSync(evalSetPath, 'utf8'));

  const activeCatalog = (catalogJson.products || []).filter(
    (p) => p.is_active !== false
  );
  const activeCatalogMap = new Map(activeCatalog.map((p) => [p.id, p]));
  const cases = evalSetJson.cases || [];

  if (cases.length === 0) {
    throw new Error('eval/eval-set-v1.json does not contain any cases.');
  }

  const runner = args.live
    ? await createLiveGeminiRunner(activeCatalog)
    : async (input) =>
        runStubMatcher({
          message: input.message,
          activeCatalog,
          shopProfile: input.shopProfile,
        });

  const results = [];

  for (const item of cases) {
    const output = await runner({
      message: item.question,
      shopProfile: item.shop_profile,
    });

    const rawHallucinatedIds = output.raw_suggested_product_ids.filter(
      (id) => !activeCatalogMap.has(id)
    );
    const postGroundingHallucinatedIds = output.suggested_product_ids.filter(
      (id) => !activeCatalogMap.has(id)
    );

    let isCorrect = false;
    let failureReason = null;

    if (item.expected_out_of_catalog) {
      if (
        output.missing_catalog_info &&
        output.suggested_product_ids.length === 0
      ) {
        isCorrect = true;
      } else {
        failureReason = `Câu bẫy ngoài danh mục nhưng bot gợi ý ${output.suggested_product_ids.join(', ')}`;
      }
    } else {
      const expectedSet = new Set(item.expected_product_ids || []);
      const matchedExpected = output.suggested_product_ids.filter((id) =>
        expectedSet.has(id)
      );
      const totalSuggestedPrice = output.suggested_product_ids.reduce(
        (sum, id) => sum + (activeCatalogMap.get(id)?.price_vnd ?? 0),
        0
      );
      const budgetOk =
        item.budget_vnd === null ||
        item.budget_vnd === undefined ||
        totalSuggestedPrice <= item.budget_vnd;

      if (output.missing_catalog_info || output.suggested_product_ids.length === 0) {
        failureReason = 'Bot từ chối sai (missing_catalog_info=true) cho câu hỏi trong danh mục';
      } else if (postGroundingHallucinatedIds.length > 0) {
        failureReason = `Phát hiện ID bịa không tồn tại trong DB: ${postGroundingHallucinatedIds.join(', ')}`;
      } else if (matchedExpected.length === 0) {
        failureReason = `Gợi ý [${output.suggested_product_ids.join(', ')}] không khớp expected [${item.expected_product_ids.join(', ')}]`;
      } else if (!budgetOk) {
        failureReason = `Tổng giá gợi ý ${totalSuggestedPrice}đ vượt ngân sách ${item.budget_vnd}đ`;
      } else {
        isCorrect = true;
      }
    }

    results.push({
      id: item.id,
      category: item.category,
      industry: item.industry,
      target_product_type: item.target_product_type,
      budget_vnd: item.budget_vnd,
      expected_out_of_catalog: item.expected_out_of_catalog,
      expected_product_ids: item.expected_product_ids,
      raw_suggested_product_ids: output.raw_suggested_product_ids,
      suggested_product_ids: output.suggested_product_ids,
      suggested_product_names: output.suggested_product_ids.map(
        (id) => activeCatalogMap.get(id)?.name ?? id
      ),
      missing_catalog_info: output.missing_catalog_info,
      raw_hallucinated_ids: rawHallucinatedIds,
      post_grounding_hallucinated_ids: postGroundingHallucinatedIds,
      is_correct: isCorrect,
      failure_reason: failureReason,
      latency_ms: output.latency_ms,
      tokens_used: output.tokens_used,
      cost_usd: output.cost_usd,
      model_name: output.model_name,
      prompt_version: output.prompt_version,
    });
  }

  const totalCases = results.length;
  const inCatalogResults = results.filter((r) => !r.expected_out_of_catalog);
  const trapResults = results.filter((r) => r.expected_out_of_catalog);

  const totalCorrect = results.filter((r) => r.is_correct).length;
  const inCatalogCorrect = inCatalogResults.filter((r) => r.is_correct).length;
  const trapCorrect = trapResults.filter((r) => r.is_correct).length;

  const queriesWithPostHallucination = results.filter(
    (r) => r.post_grounding_hallucinated_ids.length > 0
  ).length;
  const queriesWithRawHallucination = results.filter(
    (r) => r.raw_hallucinated_ids.length > 0
  ).length;
  const trapFalseSuggestions = trapResults.filter(
    (r) => r.suggested_product_ids.length > 0
  ).length;

  const latencies = results.map((r) => r.latency_ms).sort((a, b) => a - b);
  const avgLatencyMs = round(
    latencies.reduce((sum, v) => sum + v, 0) / totalCases,
    2
  );
  const p95LatencyMs = round(percentile(latencies, 0.95), 2);

  const totalTokens = results.reduce((sum, r) => sum + r.tokens_used, 0);
  const totalCostUsd = round(
    results.reduce((sum, r) => sum + r.cost_usd, 0),
    6
  );
  const avgCostUsd = round(totalCostUsd / totalCases, 6);

  const metrics = {
    accuracy: round(totalCorrect / totalCases, 4),
    in_catalog_accuracy: round(inCatalogCorrect / inCatalogResults.length, 4),
    trap_rejection_accuracy: round(trapCorrect / trapResults.length, 4),
    hallucination_rate: round(queriesWithPostHallucination / totalCases, 4),
    raw_llm_hallucination_rate: round(queriesWithRawHallucination / totalCases, 4),
    trap_false_suggestion_rate: round(trapFalseSuggestions / trapResults.length, 4),
    p95_latency_ms: p95LatencyMs,
    avg_latency_ms: avgLatencyMs,
    avg_cost_usd: avgCostUsd,
    total_cost_usd: totalCostUsd,
    total_tokens: totalTokens,
  };

  const summary = {
    eval_set_version: evalSetJson.version,
    catalog_version: catalogJson.version,
    mode: args.live ? 'live_gemini' : 'stub_baseline',
    model_name: results[0]?.model_name ?? 'stub-keyword-v1',
    prompt_version: results[0]?.prompt_version ?? 'v1',
    executed_at: new Date().toISOString(),
    counts: {
      total_cases: totalCases,
      correct_total: totalCorrect,
      in_catalog_total: inCatalogResults.length,
      in_catalog_correct: inCatalogCorrect,
      trap_total: trapResults.length,
      trap_correct: trapCorrect,
      queries_with_post_hallucination: queriesWithPostHallucination,
      queries_with_raw_hallucination: queriesWithRawHallucination,
      trap_false_suggestions: trapFalseSuggestions,
    },
    metrics,
    failures: results.filter((r) => !r.is_correct),
    results,
  };

  const outDir = resolve(ROOT_DIR, 'eval/results');
  mkdirSync(outDir, { recursive: true });

  const jsonPath = resolve(outDir, `${args.outPrefix}.json`);
  const mdPath = resolve(outDir, `${args.outPrefix}.md`);

  writeFileSync(jsonPath, JSON.stringify(summary, null, 2), 'utf8');

  const mdLines = [
    `# Báo cáo Đánh giá Chatbot F12 (${summary.mode})`,
    '',
    `- **Bộ Eval:** \`eval/eval-set-v1.json\` (${totalCases} câu: ${inCatalogResults.length} trong danh mục + ${trapResults.length} câu bẫy)`,
    `- **Danh mục đối chiếu:** \`data/catalog-v1.json\` (${activeCatalog.length} sản phẩm active)`,
    `- **Model / Prompt:** \`${summary.model_name}\` / \`${summary.prompt_version}\``,
    `- **Thời gian chạy:** \`${summary.executed_at}\``,
    '',
    '## 1. Bốn Chỉ số Bắt buộc (RULES.md Mục 13)',
    '',
    '| Chỉ số | Kết quả | Mục tiêu / Ghi chú |',
    '|---|---:|---|',
    `| **Accuracy (Tổng thể)** | **${(metrics.accuracy * 100).toFixed(2)}%** (${totalCorrect}/${totalCases}) | Trong danh mục: ${(metrics.in_catalog_accuracy * 100).toFixed(2)}% (${inCatalogCorrect}/${inCatalogResults.length}) • Chặn bẫy: ${(metrics.trap_rejection_accuracy * 100).toFixed(2)}% (${trapCorrect}/${trapResults.length}) |`,
    `| **Hallucination Rate (Post-Grounding)** | **${(metrics.hallucination_rate * 100).toFixed(2)}%** (${queriesWithPostHallucination}/${totalCases}) | Mục tiêu bắt buộc: \`0%\` (không ID ngoài DB) |`,
    `| **P95 Latency** | **${metrics.p95_latency_ms} ms** | Trung bình: ${metrics.avg_latency_ms} ms |`,
    `| **Avg Cost / Query & Total Tokens** | **$${metrics.avg_cost_usd.toFixed(6)}** / **${metrics.total_tokens} tokens** | Tổng chi phí toàn bộ ${totalCases} câu: $${metrics.total_cost_usd.toFixed(6)} |`,
    '',
    '## 2. Phân tích Bẫy Ngoài Danh Mục & Chi tiết Lỗi',
    '',
    `- **Tỷ lệ gợi ý nhầm trên câu bẫy (\`trap_false_suggestion_rate\`):** ${(metrics.trap_false_suggestion_rate * 100).toFixed(2)}% (${trapFalseSuggestions}/${trapResults.length})`,
    `- **Tỷ lệ hallucination thô trước kiểm tra DB (\`raw_llm_hallucination_rate\`):** ${(metrics.raw_llm_hallucination_rate * 100).toFixed(2)}%`,
    '',
  ];

  if (summary.failures.length === 0) {
    mdLines.push('Tất cả 60/60 câu hỏi đều vượt qua tiêu chí đánh giá (`0` lỗi).');
  } else {
    mdLines.push(`### Danh sách câu chưa đạt (${summary.failures.length} câu)`);
    mdLines.push('');
    mdLines.push('| Mã | Loại | Ngành | Lý do |');
    mdLines.push('|---|---|---|---|');
    for (const f of summary.failures) {
      mdLines.push(
        `| \`${f.id}\` | ${f.category} | ${f.industry} | ${f.failure_reason} |`
      );
    }
  }

  mdLines.push('');
  mdLines.push('## 3. Bảng Kết quả Đầy đủ 60 Câu');
  mdLines.push('');
  mdLines.push('| ID | Phân loại | Ngân sách | Kết quả | Gợi ý trả về | Latency (ms) |');
  mdLines.push('|---|---|---:|---|---|---:|');
  for (const r of results) {
    const status = r.is_correct ? 'PASS' : 'FAIL';
    const budgetText =
      r.budget_vnd !== null && r.budget_vnd !== undefined
        ? `${r.budget_vnd.toLocaleString('vi-VN')}đ`
        : '—';
    const suggestedText =
      r.suggested_product_names.length > 0
        ? r.suggested_product_names.join(' + ')
        : '*(Từ chối / Ngoài danh mục)*';
    mdLines.push(
      `| \`${r.id}\` | ${r.category} | ${budgetText} | **${status}** | ${suggestedText} | ${r.latency_ms} |`
    );
  }
  mdLines.push('');

  writeFileSync(mdPath, mdLines.join('\n'), 'utf8');

  console.log(`Eval completed [${summary.mode}]:`);
  console.log(
    `  Accuracy: ${(metrics.accuracy * 100).toFixed(2)}% (${totalCorrect}/${totalCases}) [In-catalog: ${inCatalogCorrect}/${inCatalogResults.length}, Trap: ${trapCorrect}/${trapResults.length}]`
  );
  console.log(
    `  Hallucination Rate: ${(metrics.hallucination_rate * 100).toFixed(2)}%`
  );
  console.log(
    `  P95 Latency: ${metrics.p95_latency_ms} ms (Avg: ${metrics.avg_latency_ms} ms)`
  );
  console.log(
    `  Avg Cost USD: $${metrics.avg_cost_usd.toFixed(6)} | Total Tokens: ${metrics.total_tokens}`
  );
  console.log(`  Reports written to:\n    - ${jsonPath}\n    - ${mdPath}`);
}

main().catch((err) => {
  console.error('[run-eval] Failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
