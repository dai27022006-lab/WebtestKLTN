import { z } from 'zod';

export const uuidSchema = z.uuid('Giá trị phải là UUID hợp lệ.');

export const nonEmptyTrimmedString = (maxLength: number, fieldLabel: string) =>
  z
    .string()
    .trim()
    .min(1, `${fieldLabel} không được để trống.`)
    .max(maxLength, `${fieldLabel} tối đa ${maxLength} ký tự.`);

export const isoDatetimeSchema = z.iso.datetime({
  offset: true,
  error: 'Thời gian phải đúng định dạng ISO 8601.',
});

export const visitorIdSchema = z
  .string()
  .trim()
  .min(8, 'visitor_id không hợp lệ.')
  .max(128, 'visitor_id quá dài.');

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const booleanFlagQuerySchema = z.preprocess((value) => {
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return value;
}, z.boolean());
