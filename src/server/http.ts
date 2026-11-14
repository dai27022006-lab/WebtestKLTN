import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';

import type { ApiError, ApiFieldErrors, ApiSuccess, PaginationMeta } from '@/types/api';

import { AppError } from './errors';

export function apiSuccess<T>(
  data: T,
  status = 200,
  meta?: PaginationMeta
): NextResponse<ApiSuccess<T>> {
  const body: ApiSuccess<T> = meta ? { ok: true, data, meta } : { ok: true, data };
  return NextResponse.json(body, { status });
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  fieldErrors?: ApiFieldErrors
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      ok: false,
      error: fieldErrors ? { code, message, fieldErrors } : { code, message },
    },
    { status }
  );
}

export function zodToFieldErrors(error: ZodError): ApiFieldErrors {
  const fieldErrors: ApiFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : '_root';
    if (!fieldErrors[key]) {
      fieldErrors[key] = [];
    }
    fieldErrors[key].push(issue.message);
  }
  return fieldErrors;
}

export function apiValidationError(
  error: ZodError,
  message = 'Dữ liệu đầu vào không hợp lệ.'
): NextResponse<ApiError> {
  return apiError('VALIDATION_ERROR', message, 400, zodToFieldErrors(error));
}

export async function parseJsonBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new AppError(
      'INVALID_JSON',
      'Dữ liệu gửi lên không đúng định dạng JSON.',
      400
    );
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return '127.0.0.1';
}

interface PostgresLikeError {
  code?: string;
  message?: string;
}

export function handleApiException(err: unknown): NextResponse<ApiError> {
  if (err instanceof AppError) {
    return apiError(err.code, err.message, err.statusCode, err.fieldErrors);
  }

  const pgErr = err as PostgresLikeError | null;
  if (pgErr && typeof pgErr === 'object' && typeof pgErr.code === 'string') {
    if (pgErr.code === '23505') {
      return apiError(
        'CONFLICT',
        'Dữ liệu bị trùng khóa duy nhất trong hệ thống.',
        409
      );
    }
    if (pgErr.code === '23503') {
      return apiError(
        'VALIDATION_ERROR',
        'Tham chiếu dữ liệu liên kết không tồn tại.',
        400
      );
    }
    if (pgErr.code === 'PGRST116') {
      return apiError('NOT_FOUND', 'Không tìm thấy bản ghi yêu cầu.', 404);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('[API_INTERNAL_ERROR]', err);
  }

  return apiError(
    'INTERNAL_ERROR',
    'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
    500
  );
}
