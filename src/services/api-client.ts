import type { ApiResponse } from '@/types/api';

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeoutMs?: number;
}

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { body, timeoutMs = 15_000, headers, signal, ...rest } = options;

  const controller = new AbortController();
  const timer =
    timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : undefined;

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  try {
    const res = await fetch(path, {
      ...rest,
      credentials: 'same-origin',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    const payload = (await res.json().catch(() => null)) as ApiResponse<T> | null;
    if (!payload || typeof payload.ok !== 'boolean') {
      return {
        ok: false,
        error: {
          code: 'NETWORK_PARSE_ERROR',
          message: 'Không thể đọc phản hồi từ máy chủ.',
        },
      };
    }

    return payload;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        ok: false,
        error: {
          code: 'NETWORK_ABORTED',
          message: 'Yêu cầu đã bị hủy hoặc hết thời gian chờ.',
        },
      };
    }
    return {
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.',
      },
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
