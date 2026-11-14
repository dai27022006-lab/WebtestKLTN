import { uuidSchema } from '@/schemas/common';
import { sandboxPaySchema } from '@/schemas/order';
import {
  apiError,
  apiSuccess,
  apiValidationError,
  handleApiException,
} from '@/server/http';
import { sandboxPayOrder } from '@/server/services/order.service';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const idParsed = uuidSchema.safeParse(params.id);
    if (!idParsed.success) {
      return apiValidationError(idParsed.error);
    }

    const rawText = await req.text();
    let body: unknown = {};
    if (rawText.trim()) {
      try {
        body = JSON.parse(rawText);
      } catch {
        return apiError(
          'INVALID_JSON',
          'Dữ liệu gửi lên không đúng định dạng JSON.',
          400
        );
      }
    }

    const parsed = sandboxPaySchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await sandboxPayOrder(idParsed.data, parsed.data);
    return apiSuccess(result, 200);
  } catch (err) {
    return handleApiException(err);
  }
}
