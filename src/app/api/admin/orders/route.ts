import { adminOrderQuerySchema } from '@/schemas/order';
import { requireAdmin } from '@/server/auth/session';
import {
  apiSuccess,
  apiValidationError,
  handleApiException,
} from '@/server/http';
import { adminListOrders } from '@/server/services/admin.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const parsed = adminOrderQuerySchema.safeParse({
      status: searchParams.get('status') || undefined,
      include_simulated: searchParams.get('include_simulated') ?? undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    });
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const { items, meta } = await adminListOrders(parsed.data);
    return apiSuccess(items, 200, meta);
  } catch (err) {
    return handleApiException(err);
  }
}
