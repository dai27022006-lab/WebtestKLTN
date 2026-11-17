import type {
  ApiResponse,
  CompleteScenarioRequest,
  CompleteScenarioResponse,
  ExperimentAssignmentDto,
  ExperimentConsentRequest,
  ExperimentExitResponse,
  ScenarioNextResponse,
} from '@/types/api';

import { apiRequest, buildQueryString } from './api-client';

export function submitExperimentConsent(
  input: ExperimentConsentRequest,
  signal?: AbortSignal
): Promise<ApiResponse<ExperimentAssignmentDto>> {
  return apiRequest<ExperimentAssignmentDto>('/api/experiments/consent', {
    method: 'POST',
    body: input,
    signal,
  });
}

export function getNextScenario(
  assignmentId: string,
  signal?: AbortSignal
): Promise<ApiResponse<ScenarioNextResponse>> {
  const qs = buildQueryString({ assignment_id: assignmentId });
  return apiRequest<ScenarioNextResponse>(`/api/scenarios/next${qs}`, {
    method: 'GET',
    signal,
  });
}

export function completeScenario(
  scenarioId: string,
  input: CompleteScenarioRequest,
  signal?: AbortSignal
): Promise<ApiResponse<CompleteScenarioResponse>> {
  return apiRequest<CompleteScenarioResponse>(
    `/api/scenarios/${encodeURIComponent(scenarioId)}/complete`,
    {
      method: 'POST',
      body: input,
      signal,
    }
  );
}

export function exitExperimentSession(
  signal?: AbortSignal
): Promise<ApiResponse<ExperimentExitResponse>> {
  return apiRequest<ExperimentExitResponse>('/api/experiments/exit', {
    method: 'POST',
    keepalive: true,
    signal,
  });
}
