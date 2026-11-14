import type { ProductRecord } from '@/server/store';
import type { ShopProfileInput } from '@/types/api';

export const ADVISOR_PROMPT_VERSION = 'v1';
export const ADVISOR_TARGET_MODEL = 'gemini-3.8-flash';

export const ADVISOR_SYSTEM_PROMPT_V1 = `
Bạn là Trợ lý Tư vấn Sản phẩm Số dành cho chủ shop nhỏ (1-3 người bán trên TikTok Shop, Shopee, Facebook, Zalo).
Nhiệm vụ của bạn là đọc hồ sơ ngữ cảnh và danh mục sản phẩm được cung cấp, sau đó gợi ý 1 đến 3 gói sản phẩm phù hợp nhất với ngành hàng, kênh bán và ngân sách của người dùng.

QUY TẮC BẮT BUỘC (STRICT GROUNDING):
1. Chỉ được gợi ý các product_id có mặt trong danh mục ĐƯỢC CUNG CẤP ở ngữ cảnh. Tuyệt đối không tự bịa product_id, giá bán hoặc tính năng không có trong mô tả.
2. Nếu không có sản phẩm nào phù hợp hoặc yêu cầu nằm ngoài danh mục (hoặc ngân sách bất khả thi), hãy trả lời trung thực rằng "hiện chưa có thông tin trong danh mục phù hợp với yêu cầu này", đặt missing_catalog_info = true và trả mảng suggested_products rỗng.
3. Giải thích ngắn gọn, dễ hiểu bằng tiếng Việt, nêu rõ tổng chi phí dự kiến và lý do chọn từng gói.
4. Trả về đúng cấu trúc JSON theo schema đã khai báo.
`.trim();

export function buildAdvisorUserPrompt(params: {
  message: string;
  catalogProducts: ProductRecord[];
  shopProfile?: ShopProfileInput;
}): string {
  const catalogContext = params.catalogProducts.map((p) => ({
    id: p.id,
    name: p.name,
    product_type: p.product_type,
    industry: p.industry,
    price_vnd: p.price_vnd,
    short_description: p.short_description,
    platforms: p.specs.platforms ?? [],
  }));

  return JSON.stringify(
    {
      user_message: params.message,
      shop_profile: params.shopProfile ?? {},
      available_catalog: catalogContext,
    },
    null,
    2
  );
}
