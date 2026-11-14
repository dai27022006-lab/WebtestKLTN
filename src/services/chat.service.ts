import type {
  ApiResponse,
  ChatSessionsResponse,
  SendChatMessageRequest,
  SendChatMessageResponse,
} from '@/types/api';

import { apiRequest, buildQueryString } from './api-client';

export function sendChatMessage(
  input: SendChatMessageRequest,
  signal?: AbortSignal
): Promise<ApiResponse<SendChatMessageResponse>> {
  return apiRequest<SendChatMessageResponse>('/api/chat', {
    method: 'POST',
    body: input,
    signal,
  });
}

export function getChatSessions(
  params: {
    assignment_id: string;
    visitor_id?: string;
    scenario_run_id?: string;
  },
  signal?: AbortSignal
): Promise<ApiResponse<ChatSessionsResponse>> {
  const qs = buildQueryString(params);
  return apiRequest<ChatSessionsResponse>(`/api/chat/sessions${qs}`, {
    method: 'GET',
    signal,
  });
}
