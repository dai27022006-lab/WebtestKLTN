import { createHash, randomBytes, randomInt } from 'node:crypto';
import type { z } from 'zod';

import type { EventVariant, ExperimentVariant } from '@/lib/tracking/events';
import type {
  completeScenarioSchema,
  experimentConsentSchema,
} from '@/schemas/experiment';
import {
  EXPERIMENT_COOKIE_NAME,
  writeSignedCookie,
} from '@/server/auth/cookies';
import { getCurrentUser } from '@/server/auth/session';
import {
  conflictError,
  notFoundError,
  unprocessableError,
} from '@/server/errors';
import {
  type ExperimentAssignmentRecord,
  getStore,
  type ScenarioRecord,
} from '@/server/store';
import type {
  CompleteScenarioResponse,
  ExperimentAssignmentDto,
  ScenarioNextResponse,
  ScenarioPublicDto,
} from '@/types/api';

type ConsentParsed = z.infer<typeof experimentConsentSchema>;
type CompleteScenarioParsed = z.infer<typeof completeScenarioSchema>;

const EXPERIMENT_COOKIE_TTL_SECONDS = 60 * 60 * 24 * 14;

export function resolveActiveVariantForStep(
  assignmentVariant: ExperimentVariant,
  stepOrder: number
): EventVariant {
  if (assignmentVariant === 'chatbot_on') return 'chatbot_on';
  if (assignmentVariant === 'chatbot_off') return 'chatbot_off';

  const isOddStep = stepOrder % 2 === 1;
  if (assignmentVariant === 'abba_on_first') {
    return isOddStep ? 'chatbot_on' : 'chatbot_off';
  }
  return isOddStep ? 'chatbot_off' : 'chatbot_on';
}

function toScenarioPublicDto(scenario: ScenarioRecord): ScenarioPublicDto {
  return {
    id: scenario.id,
    code: scenario.code,
    title: scenario.title,
    prompt_text: scenario.prompt_text,
    industry: scenario.industry,
    budget_vnd: scenario.budget_vnd,
    difficulty: scenario.difficulty,
  };
}

function toAssignmentDto(
  assignment: ExperimentAssignmentRecord,
  activeVariant: EventVariant
): ExperimentAssignmentDto {
  return {
    assignment_id: assignment.id,
    experiment_id: assignment.experiment_id,
    participant_code: assignment.participant_code,
    variant: assignment.variant,
    active_variant: activeVariant,
    consent_given: assignment.consent_given,
    consent_at: assignment.consent_at,
    created_at: assignment.created_at,
  };
}

export async function submitExperimentConsent(input: ConsentParsed): Promise<{
  assignment: ExperimentAssignmentDto;
  isNew: boolean;
}> {
  const store = getStore();
  const experiment = await store.findActiveExperimentByCode(
    input.experiment_code
  );
  if (!experiment) {
    throw notFoundError(
      'Không tìm thấy chiến dịch thí nghiệm đang hoạt động.',
      'EXPERIMENT_NOT_FOUND'
    );
  }

  const existing = await store.findAssignmentByExperimentAndVisitor(
    experiment.id,
    input.visitor_id
  );

  if (existing) {
    const runs = await store.listScenarioRunsByAssignment(existing.id);
    const activeRun = runs.find((r) => r.completed_at === null);
    const activeVariant = activeRun
      ? activeRun.active_variant
      : resolveActiveVariantForStep(
          existing.variant,
          Math.max(1, runs.length)
        );

    await writeSignedCookie(
      EXPERIMENT_COOKIE_NAME,
      {
        assignment_id: existing.id,
        visitor_id: existing.visitor_id,
        participant_code: existing.participant_code,
      },
      EXPERIMENT_COOKIE_TTL_SECONDS
    );

    return {
      assignment: toAssignmentDto(existing, activeVariant),
      isNew: false,
    };
  }

  const user = await getCurrentUser();
  const existingCount = await store.countAssignmentsByExperiment(experiment.id);
  const seq = String(existingCount + 1).padStart(3, '0');
  const suffix = randomBytes(2).toString('hex').toUpperCase();
  const participantCode = `P-${seq}-${suffix}`;

  const pick = randomInt(0, 2);
  const assignedVariant: ExperimentVariant =
    experiment.design_type === 'within_subject_abba'
      ? pick === 0
        ? 'abba_on_first'
        : 'abba_off_first'
      : pick === 0
        ? 'chatbot_on'
        : 'chatbot_off';

  const sessionToken = randomBytes(24).toString('hex');
  const sessionTokenHash = createHash('sha256')
    .update(sessionToken)
    .digest('hex');

  const assignment = await store.createAssignment({
    experiment_id: experiment.id,
    user_id: user?.id ?? null,
    visitor_id: input.visitor_id,
    participant_code: participantCode,
    session_token_hash: sessionTokenHash,
    variant: assignedVariant,
    consent_given: true,
    consent_at: new Date().toISOString(),
    shop_profile: input.shop_profile ?? {},
    is_simulated: input.is_simulated,
  });

  await writeSignedCookie(
    EXPERIMENT_COOKIE_NAME,
    {
      assignment_id: assignment.id,
      visitor_id: assignment.visitor_id,
      participant_code: assignment.participant_code,
    },
    EXPERIMENT_COOKIE_TTL_SECONDS
  );

  const initialActiveVariant = resolveActiveVariantForStep(
    assignment.variant,
    1
  );

  return {
    assignment: toAssignmentDto(assignment, initialActiveVariant),
    isNew: true,
  };
}

function getTotalStepsForVariant(
  variant: ExperimentVariant,
  activeScenariosCount: number
): number {
  if (variant === 'abba_on_first' || variant === 'abba_off_first') {
    return Math.min(2, activeScenariosCount);
  }
  return Math.min(2, activeScenariosCount);
}

export async function getNextScenario(
  assignmentId: string
): Promise<ScenarioNextResponse> {
  const store = getStore();
  const assignment = await store.findAssignmentById(assignmentId);
  if (!assignment) {
    throw notFoundError(
      'Không tìm thấy phiên thí nghiệm.',
      'ASSIGNMENT_NOT_FOUND'
    );
  }
  if (!assignment.consent_given) {
    throw unprocessableError(
      'Bạn cần xác nhận đồng ý tham gia trước khi nhận thẻ kịch bản.',
      'CONSENT_REQUIRED'
    );
  }

  const [activeScenarios, runs] = await Promise.all([
    store.listActiveScenarios(),
    store.listScenarioRunsByAssignment(assignment.id),
  ]);

  const totalSteps = getTotalStepsForVariant(
    assignment.variant,
    activeScenarios.length
  );

  // Resume unfinished run if participant refreshes page
  const openRun = runs.find((r) => r.completed_at === null);
  if (openRun) {
    const scenario = activeScenarios.find((s) => s.id === openRun.scenario_id);
    if (scenario) {
      return {
        assignment_id: assignment.id,
        participant_code: assignment.participant_code,
        step_order: openRun.step_order,
        total_steps: totalSteps,
        active_variant: openRun.active_variant,
        scenario_run_id: openRun.id,
        scenario: toScenarioPublicDto(scenario),
        started_at: openRun.started_at,
        is_finished: false,
      };
    }
  }

  const completedRuns = runs.filter((r) => r.completed_at !== null);
  if (completedRuns.length >= totalSteps || totalSteps === 0) {
    const lastVariant =
      completedRuns[completedRuns.length - 1]?.active_variant ??
      resolveActiveVariantForStep(assignment.variant, 1);

    return {
      assignment_id: assignment.id,
      participant_code: assignment.participant_code,
      step_order: completedRuns.length,
      total_steps: totalSteps,
      active_variant: lastVariant,
      scenario_run_id: null,
      scenario: null,
      started_at: null,
      is_finished: true,
    };
  }

  const usedScenarioIds = new Set(runs.map((r) => r.scenario_id));
  const nextScenario = activeScenarios.find((s) => !usedScenarioIds.has(s.id));
  if (!nextScenario) {
    return {
      assignment_id: assignment.id,
      participant_code: assignment.participant_code,
      step_order: completedRuns.length,
      total_steps: totalSteps,
      active_variant: resolveActiveVariantForStep(
        assignment.variant,
        Math.max(1, completedRuns.length)
      ),
      scenario_run_id: null,
      scenario: null,
      started_at: null,
      is_finished: true,
    };
  }

  const nextStepOrder = completedRuns.length + 1;
  const activeVariant = resolveActiveVariantForStep(
    assignment.variant,
    nextStepOrder
  );

  const createdRun = await store.createScenarioRun({
    assignment_id: assignment.id,
    scenario_id: nextScenario.id,
    step_order: nextStepOrder,
    active_variant: activeVariant,
    is_simulated: assignment.is_simulated,
  });

  return {
    assignment_id: assignment.id,
    participant_code: assignment.participant_code,
    step_order: createdRun.step_order,
    total_steps: totalSteps,
    active_variant: createdRun.active_variant,
    scenario_run_id: createdRun.id,
    scenario: toScenarioPublicDto(nextScenario),
    started_at: createdRun.started_at,
    is_finished: false,
  };
}

export async function completeScenario(
  scenarioId: string,
  input: CompleteScenarioParsed
): Promise<CompleteScenarioResponse> {
  const store = getStore();

  const assignment = await store.findAssignmentById(input.assignment_id);
  if (!assignment) {
    throw notFoundError(
      'Không tìm thấy phiên thí nghiệm.',
      'ASSIGNMENT_NOT_FOUND'
    );
  }
  if (!assignment.consent_given) {
    throw unprocessableError(
      'Cần đồng ý điều khoản trước khi hoàn thành kịch bản.',
      'CONSENT_REQUIRED'
    );
  }

  const scenario = await store.findScenarioById(scenarioId);
  if (!scenario) {
    throw notFoundError('Không tìm thấy kịch bản.', 'SCENARIO_NOT_FOUND');
  }

  const run = await store.findScenarioRunById(input.scenario_run_id);
  if (
    !run ||
    run.assignment_id !== assignment.id ||
    run.scenario_id !== scenario.id
  ) {
    throw notFoundError(
      'Không tìm thấy lượt thực hiện kịch bản tương ứng.',
      'NOT_FOUND'
    );
  }

  if (run.completed_at !== null) {
    throw conflictError(
      'Thẻ kịch bản này đã được hoàn thành trước đó.',
      'SCENARIO_ALREADY_COMPLETED'
    );
  }

  const selectedProduct = await store.findProductByIdOrSlug(
    input.selected_product_id,
    false
  );
  if (!selectedProduct) {
    throw notFoundError(
      'Sản phẩm bạn chọn không tồn tại hoặc đã ngừng cung cấp.',
      'PRODUCT_NOT_FOUND'
    );
  }

  const isCorrect =
    selectedProduct.id === scenario.expected_product_id ||
    scenario.acceptable_product_ids.includes(selectedProduct.id);

  const completedAt = new Date().toISOString();
  const durationSeconds = Math.max(
    0,
    Math.round(
      (new Date(completedAt).getTime() - new Date(run.started_at).getTime()) /
        1000
    )
  );

  await store.completeScenarioRun({
    run_id: run.id,
    selected_product_id: selectedProduct.id,
    confidence_score: input.confidence_score as 1 | 2 | 3 | 4 | 5,
    is_correct: isCorrect,
    decision_note: input.decision_note ?? null,
    completed_at: completedAt,
  });

  const activeScenarios = await store.listActiveScenarios();
  const totalSteps = getTotalStepsForVariant(
    assignment.variant,
    activeScenarios.length
  );

  return {
    scenario_run_id: run.id,
    scenario_id: scenario.id,
    step_order: run.step_order,
    active_variant: run.active_variant,
    selected_product_id: selectedProduct.id,
    confidence_score: input.confidence_score as 1 | 2 | 3 | 4 | 5,
    duration_seconds: durationSeconds,
    completed_at: completedAt,
    has_next_scenario: run.step_order < totalSteps,
  };
}
