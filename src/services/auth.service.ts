import type {
  ApiResponse,
  AuthSessionResponse,
  LoginRequest,
  LogoutResponse,
  RegisterRequest,
} from '@/types/api';

import { apiRequest } from './api-client';

export function register(
  input: RegisterRequest,
  signal?: AbortSignal
): Promise<ApiResponse<AuthSessionResponse>> {
  return apiRequest<AuthSessionResponse>('/api/auth/register', {
    method: 'POST',
    body: input,
    signal,
  });
}

export function login(
  input: LoginRequest,
  signal?: AbortSignal
): Promise<ApiResponse<AuthSessionResponse>> {
  return apiRequest<AuthSessionResponse>('/api/auth/login', {
    method: 'POST',
    body: input,
    signal,
  });
}

export function logout(
  signal?: AbortSignal
): Promise<ApiResponse<LogoutResponse>> {
  return apiRequest<LogoutResponse>('/api/auth/logout', {
    method: 'POST',
    signal,
  });
}

export function getMe(
  signal?: AbortSignal
): Promise<ApiResponse<AuthSessionResponse>> {
  return apiRequest<AuthSessionResponse>('/api/auth/me', {
    method: 'GET',
    signal,
  });
}
