import { productIdParamSchema } from '@/schemas/product';
import {
  apiSuccess,
  apiValidationError,
  handleApiException,
} from '@/server/http';
import { getPublicProductDetail } from '@/server/services/product.service';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const parsed = productIdParamSchema.safeParse(params);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const product = await getPublicProductDetail(parsed.data.id);
    return apiSuccess(product, 200);
  } catch (err) {
    return handleApiException(err);
  }
}
