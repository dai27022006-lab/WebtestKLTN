import { apiSuccess, handleApiException } from '@/server/http';
import { logoutUser } from '@/server/services/auth.service';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = await logoutUser();
    return apiSuccess(result, 200);
  } catch (err) {
    return handleApiException(err);
  }
}
