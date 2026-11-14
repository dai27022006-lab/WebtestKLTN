import { requireUser, toUserProfileDto } from '@/server/auth/session';
import { apiSuccess, handleApiException } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireUser();
    return apiSuccess({ user: toUserProfileDto(user) }, 200);
  } catch (err) {
    return handleApiException(err);
  }
}
