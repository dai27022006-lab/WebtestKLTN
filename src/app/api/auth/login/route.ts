import { loginSchema } from '@/schemas/auth';
import {
  apiSuccess,
  apiValidationError,
  getClientIp,
  handleApiException,
  parseJsonBody,
} from '@/server/http';
import { enforceRateLimit } from '@/server/rate-limit';
import { loginUser } from '@/server/services/auth.service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    enforceRateLimit(`auth:login:${getClientIp(req)}`, 15, 60_000);
    const body = await parseJsonBody(req);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await loginUser(parsed.data);
    return apiSuccess(result, 200);
  } catch (err) {
    return handleApiException(err);
  }
}
