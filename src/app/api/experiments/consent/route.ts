import { experimentConsentSchema } from '@/schemas/experiment';
import {
  apiSuccess,
  apiValidationError,
  handleApiException,
  parseJsonBody,
} from '@/server/http';
import { submitExperimentConsent } from '@/server/services/experiment.service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody(req);
    const parsed = experimentConsentSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const { assignment, isNew } = await submitExperimentConsent(parsed.data);
    return apiSuccess(assignment, isNew ? 201 : 200);
  } catch (err) {
    return handleApiException(err);
  }
}
