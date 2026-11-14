import type { z } from 'zod';

import type { productListQuerySchema } from '@/schemas/product';
import { notFoundError } from '@/server/errors';
import { getStore, type ProductRecord } from '@/server/store';
import type {
  PaginationMeta,
  ProductDetailDto,
  ProductSummaryDto,
} from '@/types/api';

type ProductListQueryParsed = z.infer<typeof productListQuerySchema>;

export function toProductSummaryDto(p: ProductRecord): ProductSummaryDto {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    short_description: p.short_description,
    product_type: p.product_type,
    industry: p.industry,
    price_vnd: p.price_vnd,
    thumbnail_url: p.thumbnail_url,
    source_type: p.source_type,
    license_note: p.license_note,
    is_active: p.is_active,
  };
}

export function toProductDetailDto(
  p: ProductRecord,
  hasDownloadableFile: boolean
): ProductDetailDto {
  return {
    ...toProductSummaryDto(p),
    description: p.description,
    demo_url: p.demo_url,
    specs: p.specs ?? {},
    has_downloadable_file: hasDownloadableFile,
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

export async function listPublicProducts(query: ProductListQueryParsed): Promise<{
  items: ProductSummaryDto[];
  meta: PaginationMeta;
}> {
  const store = getStore();
  const { items, total } = await store.listProducts({
    q: query.q,
    industry: query.industry,
    product_type: query.product_type,
    min_price: query.min_price,
    max_price: query.max_price,
    sort: query.sort,
    page: query.page,
    limit: query.limit,
    includeInactive: false,
  });

  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  return {
    items: items.map(toProductSummaryDto),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
    },
  };
}

export async function getPublicProductDetail(
  idOrSlug: string
): Promise<ProductDetailDto> {
  const store = getStore();
  const product = await store.findProductByIdOrSlug(idOrSlug, false);
  if (!product) {
    throw notFoundError('Không tìm thấy sản phẩm.', 'PRODUCT_NOT_FOUND');
  }

  const file = await store.findPrimaryProductFile(product.id);
  return toProductDetailDto(product, Boolean(file));
}
