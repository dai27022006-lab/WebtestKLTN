import { z } from 'zod';

import {
  booleanFlagQuerySchema,
  isoDatetimeSchema,
  nonEmptyTrimmedString,
  paginationQuerySchema,
  uuidSchema,
  visitorIdSchema,
} from './common';

export const orderStatusSchema = z.enum([
  'pending',
  'paid',
  'failed',
  'cancelled',
  'refunded',
]);

export const paymentProviderSchema = z.enum(['mock_sandbox', 'payos']);

export const addToCartSchema = z.object({
  product_id: uuidSchema,
  quantity: z.number().int().min(1).max(10).default(1),
});

export const removeFromCartSchema = z
  .object({
    product_id: uuidSchema.optional(),
    clear_all: z.boolean().optional(),
  })
  .refine((data) => Boolean(data.product_id) || data.clear_all === true, {
    message: 'Cần cung cấp product_id hoặc clear_all = true.',
  });

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: uuidSchema,
        quantity: z.number().int().min(1).max(10),
      })
    )
    .min(1, 'Đơn hàng phải có ít nhất 1 sản phẩm.')
    .max(20),
  payment_provider: paymentProviderSchema.default('mock_sandbox'),
  assignment_id: uuidSchema.optional(),
  visitor_id: visitorIdSchema.optional(),
  is_simulated: z.boolean().default(false),
});

export const mockPaymentWebhookSchema = z.object({
  order_id: uuidSchema,
  order_code: nonEmptyTrimmedString(64, 'Mã đơn hàng'),
  payment_provider: paymentProviderSchema,
  payment_reference: nonEmptyTrimmedString(120, 'Mã tham chiếu thanh toán'),
  status: z.enum(['paid', 'failed']),
  amount_vnd: z.number().int().min(0),
  signature: nonEmptyTrimmedString(256, 'Chữ ký webhook'),
  timestamp: isoDatetimeSchema,
});

export const downloadTokenParamSchema = z.object({
  token: z
    .string()
    .trim()
    .min(16, 'Token tải file không hợp lệ.')
    .max(256),
});

export const adminOrderQuerySchema = paginationQuerySchema.extend({
  status: orderStatusSchema.optional(),
  include_simulated: booleanFlagQuerySchema.default(false),
});

export const sandboxPaySchema = z.object({
  outcome: z.enum(['paid', 'failed']).default('paid'),
});

export type AddToCartInput = z.input<typeof addToCartSchema>;
export type RemoveFromCartInput = z.input<typeof removeFromCartSchema>;
export type CreateOrderInput = z.input<typeof createOrderSchema>;
export type MockPaymentWebhookInput = z.infer<typeof mockPaymentWebhookSchema>;
export type SandboxPayInput = z.input<typeof sandboxPaySchema>;
