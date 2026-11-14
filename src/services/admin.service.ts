import type {
  AdminCreateProductRequest,
  AdminDashboardSummaryDto,
  AdminOrderListQuery,
  AdminUpdateProductRequest,
  ApiResponse,
  OrderDto,
  ProductDetailDto,
  ProductListQuery,
} from '@/types/api';

import { apiRequest, buildQueryString } from './api-client';

export function adminListProducts(
  query: ProductListQuery = {},
  signal?: AbortSignal
): Promise<ApiResponse<ProductDetailDto[]>> {
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
  return apiRequest<ProductDetailDto[]>(`/api/admin/products${qs}`, {
    method: 'GET',
    signal,
  });
}

export function adminCreateProduct(
  input: AdminCreateProductRequest,
  signal?: AbortSignal
): Promise<ApiResponse<ProductDetailDto>> {
  return apiRequest<ProductDetailDto>('/api/admin/products', {
    method: 'POST',
    body: input,
    signal,
  });
}

export function adminUpdateProduct(
  input: AdminUpdateProductRequest,
  signal?: AbortSignal
): Promise<ApiResponse<ProductDetailDto>> {
  return apiRequest<ProductDetailDto>('/api/admin/products', {
    method: 'PATCH',
    body: input,
    signal,
  });
}

export function adminListOrders(
  query: AdminOrderListQuery = {},
  signal?: AbortSignal
): Promise<ApiResponse<OrderDto[]>> {
  const qs = buildQueryString({
    status: query.status,
    include_simulated: query.include_simulated,
    page: query.page,
    limit: query.limit,
  });
  return apiRequest<OrderDto[]>(`/api/admin/orders${qs}`, {
    method: 'GET',
    signal,
  });
}

export function adminGetDashboard(
  includeSimulated = false,
  signal?: AbortSignal
): Promise<ApiResponse<AdminDashboardSummaryDto>> {
  const qs = buildQueryString({ include_simulated: includeSimulated });
  return apiRequest<AdminDashboardSummaryDto>(`/api/admin/dashboard${qs}`, {
    method: 'GET',
    signal,
  });
}
