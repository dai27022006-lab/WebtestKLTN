import { scenarioNextQuerySchema } from '@/schemas/experiment';
import {
  apiSuccess,
  apiValidationError,
  handleApiException,
} from '@/server/http';
import { getNextScenario } from '@/server/services/experiment.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = scenarioNextQuerySchema.safeParse({
      assignment_id: searchParams.get('assignment_id') || '',
    });
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await getNextScenario(parsed.data.assignment_id);
    return apiSuccess(result, 200);
  } catch (err) {
    return handleApiException(err);
  }
}
