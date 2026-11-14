import type {
  ApiResponse,
  ProductDetailDto,
  ProductListQuery,
  ProductSummaryDto,
} from '@/types/api';

import { apiRequest, buildQueryString } from './api-client';

export function listProducts(
  query: ProductListQuery = {},
  signal?: AbortSignal
): Promise<ApiResponse<ProductSummaryDto[]>> {
  const qs = buildQueryString({
    q: query.q,
    industry: query.industry,
    product_type: query.product_type,
    min_price: query.min_price,
    max_price: query.max_price,
    sort: query.sort,
    page: query.page,
    limit: query.limit,
  });

  return apiRequest<ProductSummaryDto[]>(`/api/products${qs}`, {
    method: 'GET',
    signal,
  });
}

export function getProductById(
  idOrSlug: string,
  signal?: AbortSignal
): Promise<ApiResponse<ProductDetailDto>> {
  return apiRequest<ProductDetailDto>(
    `/api/products/${encodeURIComponent(idOrSlug)}`,
    {
      method: 'GET',
      signal,
    }
  );
}
