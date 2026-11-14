import type { ApiFieldErrors } from '@/types/api';

export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly fieldErrors?: ApiFieldErrors;

  constructor(
    code: string,
    message: string,
    statusCode = 400,
    fieldErrors?: ApiFieldErrors
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}

export function validationError(
  message: string,
  fieldErrors?: ApiFieldErrors
): AppError {
  return new AppError('VALIDATION_ERROR', message, 400, fieldErrors);
}

export function unauthorizedError(
  message = 'Bạn cần đăng nhập để thực hiện thao tác này.',
  code = 'UNAUTHORIZED'
): AppError {
  return new AppError(code, message, 401);
}

export function forbiddenError(
  message = 'Bạn không có quyền truy cập tài nguyên này.',
  code = 'FORBIDDEN'
): AppError {
  return new AppError(code, message, 403);
}

export function notFoundError(
  message = 'Không tìm thấy tài nguyên yêu cầu.',
  code = 'NOT_FOUND'
): AppError {
  return new AppError(code, message, 404);
}

export function conflictError(
  message: string,
  code = 'CONFLICT'
): AppError {
  return new AppError(code, message, 409);
}

export function unprocessableError(
  message: string,
  code = 'UNPROCESSABLE_ENTITY'
): AppError {
  return new AppError(code, message, 422);
}

export function rateLimitError(
  message = 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.'
): AppError {
  return new AppError('RATE_LIMIT_EXCEEDED', message, 429);
}
