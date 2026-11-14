import { createOrderSchema } from '@/schemas/order';
import {
  apiSuccess,
  apiValidationError,
  handleApiException,
  parseJsonBody,
} from '@/server/http';
import {
  createOrder,
  listOrdersForActor,
} from '@/server/services/order.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await listOrdersForActor();
    return apiSuccess(orders, 200);
  } catch (err) {
    return handleApiException(err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody(req);
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await createOrder(parsed.data);
    return apiSuccess(result, 201);
  } catch (err) {
    return handleApiException(err);
  }
}
