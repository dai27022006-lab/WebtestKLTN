import { clearExperimentCookieSession } from '@/server/auth/session';
import { apiSuccess, handleApiException } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await clearExperimentCookieSession();
    const res = apiSuccess({ exited: true }, 200);
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (err) {
    return handleApiException(err);
  }
}
