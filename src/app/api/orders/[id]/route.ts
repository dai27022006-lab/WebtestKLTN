import { uuidSchema } from '@/schemas/common';
import {
  apiSuccess,
  apiValidationError,
  handleApiException,
} from '@/server/http';
import { getOrderByIdForActor } from '@/server/services/order.service';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const parsed = uuidSchema.safeParse(params.id);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const order = await getOrderByIdForActor(parsed.data);
    return apiSuccess(order, 200);
  } catch (err) {
    return handleApiException(err);
  }
}
