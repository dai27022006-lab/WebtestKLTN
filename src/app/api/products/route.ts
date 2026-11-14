import { productListQuerySchema } from '@/schemas/product';
import {
  apiSuccess,
  apiValidationError,
  handleApiException,
} from '@/server/http';
import { listPublicProducts } from '@/server/services/product.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = {
      q: searchParams.get('q') || undefined,
      industry: searchParams.get('industry') || undefined,
      product_type: searchParams.get('product_type') || undefined,
      min_price: searchParams.get('min_price') || undefined,
      max_price: searchParams.get('max_price') || undefined,
      sort: searchParams.get('sort') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    const parsed = productListQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const { items, meta } = await listPublicProducts(parsed.data);
    return apiSuccess(items, 200, meta);
  } catch (err) {
    return handleApiException(err);
  }
}
