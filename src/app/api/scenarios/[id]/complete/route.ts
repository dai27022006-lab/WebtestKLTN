import { uuidSchema } from '@/schemas/common';
import { completeScenarioSchema } from '@/schemas/experiment';
import {
  apiSuccess,
  apiValidationError,
  handleApiException,
  parseJsonBody,
} from '@/server/http';
import { completeScenario } from '@/server/services/experiment.service';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const idParsed = uuidSchema.safeParse(params.id);
    if (!idParsed.success) {
      return apiValidationError(idParsed.error);
    }

    const body = await parseJsonBody(req);
    const parsed = completeScenarioSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await completeScenario(idParsed.data, parsed.data);
    return apiSuccess(result, 200);
  } catch (err) {
    return handleApiException(err);
  }
}
