import type {
  AddToCartRequest,
  ApiResponse,
  CartDto,
  RemoveFromCartRequest,
} from '@/types/api';

import { apiRequest } from './api-client';

export function getCart(signal?: AbortSignal): Promise<ApiResponse<CartDto>> {
  return apiRequest<CartDto>('/api/cart', {
    method: 'GET',
    signal,
  });
}

export function addToCart(
  input: AddToCartRequest,
  signal?: AbortSignal
): Promise<ApiResponse<CartDto>> {
  return apiRequest<CartDto>('/api/cart', {
    method: 'POST',
    body: input,
    signal,
  });
}

export function removeFromCart(
  input: RemoveFromCartRequest,
  signal?: AbortSignal
): Promise<ApiResponse<CartDto>> {
  return apiRequest<CartDto>('/api/cart', {
    method: 'DELETE',
    body: input,
    signal,
  });
}

export function clearCart(signal?: AbortSignal): Promise<ApiResponse<CartDto>> {
  return removeFromCart({ clear_all: true }, signal);
}
