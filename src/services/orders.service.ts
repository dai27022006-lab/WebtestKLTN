import type {
  ApiResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  DownloadAccessResponse,
  OrderDto,
  PaymentWebhookResponse,
  SandboxPayRequest,
} from '@/types/api';

import { apiRequest } from './api-client';

export function createOrder(
  input: CreateOrderRequest,
  signal?: AbortSignal
): Promise<ApiResponse<CreateOrderResponse>> {
  return apiRequest<CreateOrderResponse>('/api/orders', {
    method: 'POST',
    body: input,
    signal,
  });
}

export function listOrders(
  _visitorId?: string,
  signal?: AbortSignal
): Promise<ApiResponse<OrderDto[]>> {
  void _visitorId;
  return apiRequest<OrderDto[]>('/api/orders', {
    method: 'GET',
    signal,
  });
}

export function getOrderById(
  orderId: string,
  _visitorId?: string,
  signal?: AbortSignal
): Promise<ApiResponse<OrderDto>> {
  void _visitorId;
  return apiRequest<OrderDto>(`/api/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    signal,
  });
}

export function sandboxPayOrder(
  orderId: string,
  input: SandboxPayRequest = { outcome: 'paid' },
  _visitorId?: string,
  signal?: AbortSignal
): Promise<ApiResponse<PaymentWebhookResponse>> {
  void _visitorId;
  return apiRequest<PaymentWebhookResponse>(
    `/api/orders/${encodeURIComponent(orderId)}/sandbox-pay`,
    {
      method: 'POST',
      body: input,
      signal,
    }
  );
}

export function requestDownloadAccess(
  token: string,
  signal?: AbortSignal
): Promise<ApiResponse<DownloadAccessResponse>> {
  return apiRequest<DownloadAccessResponse>(
    `/api/downloads/${encodeURIComponent(token)}`,
    {
      method: 'GET',
      signal,
    }
  );
}
