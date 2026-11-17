import { isChatOnlyEvent } from '@/lib/tracking/events';
import type { TrackEventSchemaOutput } from '@/schemas/event';
import { getExperimentCookieSession } from '@/server/auth/session';
import {
  forbiddenError,
  notFoundError,
  unprocessableError,
} from '@/server/errors';
import { getStore } from '@/server/store';
import type { TrackEventResponse } from '@/types/api';

import {
  getTotalStepsForVariant,
  resolveActiveVariantForStep,
} from './experiment.service';

export async function recordTrackingEvent(
  input: TrackEventSchemaOutput
): Promise<TrackEventResponse> {
  const store = getStore();
  const assignment = await store.findAssignmentById(input.assignment_id);
  if (!assignment) {
    throw notFoundError(
      'Không tìm thấy phiên thí nghiệm cho sự kiện tracking.',
      'ASSIGNMENT_NOT_FOUND'
    );
  }

  if (!assignment.consent_given) {
    throw unprocessableError(
      'Bạn cần đồng ý tham gia thí nghiệm trước khi ghi nhận sự kiện.',
      'CONSENT_REQUIRED'
    );
  }

  if (assignment.visitor_id !== input.visitor_id) {
    throw forbiddenError('visitor_id không khớp với assignment_id.');
  }

  const expCookie = await getExperimentCookieSession();
  if (
    expCookie &&
    (expCookie.assignment_id !== assignment.id ||
      expCookie.visitor_id !== assignment.visitor_id)
  ) {
    throw forbiddenError('Phiên thí nghiệm không khớp với cookie hiện tại.');
  }

  let activeVariant;
  if (input.scenario_run_id) {
    const run = await store.findScenarioRunById(input.scenario_run_id);
    if (!run || run.assignment_id !== assignment.id) {
      throw notFoundError(
        'scenario_run_id không thuộc phiên thí nghiệm này.',
        'NOT_FOUND'
      );
    }
    activeVariant = run.active_variant;
  } else {
    const [runs, activeScenarios] = await Promise.all([
      store.listScenarioRunsByAssignment(assignment.id),
      store.listActiveScenarios(),
    ]);
    const openRun = runs.find((r) => r.completed_at === null);
    if (openRun) {
      activeVariant = openRun.active_variant;
    } else {
      const completedRuns = runs.filter((r) => r.completed_at !== null);
      const totalSteps = getTotalStepsForVariant(
        assignment.variant,
        activeScenarios.length
      );
      if (completedRuns.length >= totalSteps && completedRuns.length > 0) {
        activeVariant = completedRuns[completedRuns.length - 1].active_variant;
      } else {
        const nextStep = completedRuns.length + 1;
        activeVariant = resolveActiveVariantForStep(
          assignment.variant,
          nextStep
        );
      }
    }
  }

  if (input.variant !== activeVariant) {
    throw forbiddenError(
      'Biến thể sự kiện không khớp với trạng thái hiện tại ở máy chủ.',
      'VARIANT_MISMATCH'
    );
  }

  if (isChatOnlyEvent(input.event_name) && activeVariant !== 'chatbot_on') {
    throw forbiddenError(
      'Sự kiện trợ lý ảo bị chặn trong trạng thái chatbot_off.',
      'CHATBOT_DISABLED_FOR_VARIANT'
    );
  }

  const created = await store.createEvent({
    assignment_id: assignment.id,
    visitor_id: input.visitor_id,
    variant: activeVariant,
    event_name: input.event_name,
    scenario_run_id: input.scenario_run_id ?? null,
    session_id: input.session_id ?? null,
    product_id: input.product_id ?? null,
    properties: input.properties ?? {},
    is_simulated: input.is_simulated || assignment.is_simulated,
    created_at: input.created_at,
  });

  return {
    event_id: created.id,
    event_name: created.event_name,
    created_at: created.created_at,
  };
}
