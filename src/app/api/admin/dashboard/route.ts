import { adminDashboardQuerySchema } from '@/schemas/experiment';
import { requireAdmin } from '@/server/auth/session';
import {
  apiSuccess,
  apiValidationError,
  handleApiException,
} from '@/server/http';
import { getAdminDashboardSummary } from '@/server/services/admin.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const parsed = adminDashboardQuerySchema.safeParse({
      include_simulated: searchParams.get('include_simulated') ?? undefined,
    });
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const summary = await getAdminDashboardSummary(
      parsed.data.include_simulated
    );
    return apiSuccess(summary, 200);
  } catch (err) {
    return handleApiException(err);
  }
}
