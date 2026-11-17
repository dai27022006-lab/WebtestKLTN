import { chatSessionsQuerySchema } from '@/schemas/chat';
import {
  apiSuccess,
  apiValidationError,
  handleApiException,
} from '@/server/http';
import { listChatSessions } from '@/server/services/chat.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = {
      assignment_id: searchParams.get('assignment_id') || undefined,
      visitor_id: searchParams.get('visitor_id') || undefined,
      scenario_run_id: searchParams.get('scenario_run_id') || undefined,
    };

    const parsed = chatSessionsQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await listChatSessions(parsed.data);
    return apiSuccess(result, 200);
  } catch (err) {
    return handleApiException(err);
  }
}
