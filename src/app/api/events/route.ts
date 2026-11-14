import { trackEventSchema } from '@/schemas/event';
import {
  apiSuccess,
  apiValidationError,
  handleApiException,
  parseJsonBody,
} from '@/server/http';
import { recordTrackingEvent } from '@/server/services/tracking.service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody(req);
    const parsed = trackEventSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await recordTrackingEvent(parsed.data);
    return apiSuccess(result, 201);
  } catch (err) {
    return handleApiException(err);
  }
}
