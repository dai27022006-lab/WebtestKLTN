import { adminChatLogsQuerySchema } from '@/schemas/chat';
import { requireAdmin } from '@/server/auth/session';
import {
  apiSuccess,
  apiValidationError,
  handleApiException,
} from '@/server/http';
import { adminListChatLogs } from '@/server/services/admin.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const parsed = adminChatLogsQuerySchema.safeParse({
      include_simulated: searchParams.get('include_simulated') ?? undefined,
      limit: searchParams.get('limit') || undefined,
    });
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const logs = await adminListChatLogs(parsed.data);
    const res = apiSuccess(logs, 200);
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (err) {
    return handleApiException(err);
  }
}
