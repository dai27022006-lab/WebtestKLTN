import { registerSchema } from '@/schemas/auth';
import {
  apiSuccess,
  apiValidationError,
  getClientIp,
  handleApiException,
  parseJsonBody,
} from '@/server/http';
import { enforceRateLimit } from '@/server/rate-limit';
import { registerUser } from '@/server/services/auth.service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    enforceRateLimit(`auth:register:${getClientIp(req)}`, 10, 60_000);
    const body = await parseJsonBody(req);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await registerUser(parsed.data);
    return apiSuccess(result, 201);
  } catch (err) {
    return handleApiException(err);
  }
}
