import { uuidSchema } from '@/schemas/common';
import {
  adminCreateProductSchema,
  adminUpdateProductSchema,
  productListQuerySchema,
} from '@/schemas/product';
import { requireAdmin } from '@/server/auth/session';
import {
  apiError,
  apiSuccess,
  apiValidationError,
  handleApiException,
  parseJsonBody,
} from '@/server/http';
import {
  adminCreateProduct,
  adminListProducts,
  adminUpdateProduct,
} from '@/server/services/admin.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const parsed = productListQuerySchema.safeParse({
      q: searchParams.get('q') || undefined,
      industry: searchParams.get('industry') || undefined,
      product_type: searchParams.get('product_type') || undefined,
      min_price: searchParams.get('min_price') || undefined,
      max_price: searchParams.get('max_price') || undefined,
      sort: searchParams.get('sort') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    });
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const { items, meta } = await adminListProducts(parsed.data);
    return apiSuccess(items, 200, meta);
  } catch (err) {
    return handleApiException(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await parseJsonBody(req);
    const parsed = adminCreateProductSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const created = await adminCreateProduct(parsed.data);
    return apiSuccess(created, 201);
  } catch (err) {
    return handleApiException(err);
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = await parseJsonBody(req);
    const parsed = adminUpdateProductSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const { searchParams } = new URL(req.url);
    const targetId = parsed.data.id ?? searchParams.get('id') ?? '';
    const idCheck = uuidSchema.safeParse(targetId);
    if (!idCheck.success) {
      return apiError(
        'VALIDATION_ERROR',
        'Cần cung cấp UUID sản phẩm hợp lệ trong trường id hoặc query ?id=...',
        400
      );
    }

    const updated = await adminUpdateProduct(idCheck.data, parsed.data);
    return apiSuccess(updated, 200);
  } catch (err) {
    return handleApiException(err);
  }
}
