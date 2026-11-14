import { sendChatMessageSchema } from '@/schemas/chat';
import {
  apiSuccess,
  apiValidationError,
  getClientIp,
  handleApiException,
  parseJsonBody,
} from '@/server/http';
import { enforceRateLimit } from '@/server/rate-limit';
import { sendChatMessage } from '@/server/services/chat.service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    enforceRateLimit(`chat:send:${getClientIp(req)}`, 20, 60_000);
    const body = await parseJsonBody(req);
    const parsed = sendChatMessageSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await sendChatMessage(parsed.data);
    return apiSuccess(result, 200);
  } catch (err) {
    return handleApiException(err);
  }
}
