import { z } from 'zod';

import { nonEmptyTrimmedString } from './common';

export const registerSchema = z.object({
  email: z.email('Email không đúng định dạng.').trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự.')
    .max(72, 'Mật khẩu tối đa 72 ký tự.'),
  full_name: nonEmptyTrimmedString(100, 'Họ và tên'),
  shop_category: z.string().trim().max(80).optional(),
});

export const loginSchema = z.object({
  email: z.email('Email không đúng định dạng.').trim().toLowerCase(),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.').max(72),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
