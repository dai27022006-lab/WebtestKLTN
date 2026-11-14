import { mockPaymentWebhookSchema } from '@/schemas/order';
import {
  apiSuccess,
  apiValidationError,
  handleApiException,
  parseJsonBody,
} from '@/server/http';
import { processPaymentWebhook } from '@/server/services/order.service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody(req);
    const parsed = mockPaymentWebhookSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await processPaymentWebhook(parsed.data);
    return apiSuccess(result, 200);
  } catch (err) {
    return handleApiException(err);
  }
}
