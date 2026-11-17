import { z } from 'zod';

import {
  nonEmptyTrimmedString,
  paginationQuerySchema,
  uuidSchema,
} from './common';

export const productTypeSchema = z.enum([
  'template',
  'prompt_pack',
  'workflow',
]);

export const productSourceTypeSchema = z.enum([
  'original',
  'adapted',
  'licensed',
]);

export const productSortSchema = z.enum(['price_asc', 'price_desc', 'newest']);

export const productCaseStudySchema = z.object({
  shop_name: nonEmptyTrimmedString(100, 'Tên shop'),
  shop_type: nonEmptyTrimmedString(100, 'Loại hình shop'),
  rating: z.number().min(1).max(5),
  quote: nonEmptyTrimmedString(500, 'Nhận xét'),
  outcome: nonEmptyTrimmedString(200, 'Kết quả thực tế'),
});

export const productSpecsSchema = z
  .object({
    target_shop_size: z.string().trim().max(100).optional(),
    platforms: z.array(z.string().trim().max(60)).max(20).optional(),
    deliverables: z.array(z.string().trim().max(200)).max(30).optional(),
    tech_stack: z.array(z.string().trim().max(60)).max(20).optional(),
    setup_time_minutes: z.number().int().min(0).max(10000).optional(),
    guide_summary: z.string().trim().max(1000).optional(),
    case_studies: z.array(productCaseStudySchema).max(10).optional(),
    preview_highlights: z.array(z.string().trim().max(200)).max(12).optional(),
  })
  .catchall(z.unknown());

export const productListQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().max(120).optional(),
  industry: z.string().trim().max(80).optional(),
  product_type: productTypeSchema.optional(),
  min_price: z.coerce.number().int().min(0).optional(),
  max_price: z.coerce.number().int().min(0).optional(),
  sort: productSortSchema.default('newest'),
});

export const productIdParamSchema = z.object({
  id: z.string().trim().min(1).max(120),
});

const relativeOrHttpUrlSchema = (fieldLabel: string) =>
  z.string().trim().refine(
    (value) =>
      (value.startsWith('/') && !value.startsWith('//')) ||
      (/^https?:\/\//i.test(value) && z.url().safeParse(value).success),
    `${fieldLabel} phải là đường dẫn nội bộ (/...) hoặc URL http(s) hợp lệ.`,
  );

export const adminCreateProductSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, 'Slug tối thiểu 3 ký tự.')
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang.'),
  name: nonEmptyTrimmedString(160, 'Tên sản phẩm'),
  short_description: nonEmptyTrimmedString(300, 'Mô tả ngắn'),
  description: nonEmptyTrimmedString(8000, 'Mô tả chi tiết'),
  product_type: productTypeSchema,
  industry: nonEmptyTrimmedString(80, 'Ngành hàng'),
  price_vnd: z.number().int().min(0, 'Giá không được âm.').max(100_000_000),
  demo_url: relativeOrHttpUrlSchema('demo_url').nullable().optional(),
  thumbnail_url: relativeOrHttpUrlSchema('thumbnail_url')
    .nullable()
    .optional(),
  source_type: productSourceTypeSchema,
  license_note: nonEmptyTrimmedString(500, 'Ghi chú bản quyền'),
  specs: productSpecsSchema.default({}),
  is_active: z.boolean().default(true),
  is_simulated: z.boolean().default(false),
});

export const adminUpdateProductSchema = adminCreateProductSchema
  .partial()
  .extend({
    id: uuidSchema.optional(),
  });

export type ProductListQueryInput = z.input<typeof productListQuerySchema>;
export type AdminCreateProductInput = z.input<typeof adminCreateProductSchema>;
export type AdminUpdateProductInput = z.input<typeof adminUpdateProductSchema>;
