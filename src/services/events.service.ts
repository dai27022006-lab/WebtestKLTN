import {
  type EventName,
  type EventVariant,
  isChatOnlyEvent,
  type TrackEventInput,
} from '@/lib/tracking/events';
import type { ApiResponse, TrackEventResponse } from '@/types/api';

import { apiRequest } from './api-client';

declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export function trackEvent(
  input: TrackEventInput,
  signal?: AbortSignal
): Promise<ApiResponse<TrackEventResponse>> {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', input.event_name, {
      assignment_id: input.assignment_id,
      variant: input.variant,
      scenario_run_id: input.scenario_run_id ?? undefined,
      product_id: input.product_id ?? undefined,
    });
  }

  return apiRequest<TrackEventResponse>('/api/events', {
    method: 'POST',
    body: input,
    signal,
  });
}

export async function trackEventSafe(params: {
  visitor_id: string;
  assignment_id: string;
  variant: EventVariant;
  event_name: EventName;
  scenario_run_id?: string | null;
  session_id?: string | null;
  product_id?: string | null;
  properties?: Record<string, unknown>;
  is_simulated?: boolean;
}): Promise<void> {
  if (!params.visitor_id || !params.assignment_id) return;
  if (isChatOnlyEvent(params.event_name) && params.variant !== 'chatbot_on') {
    return;
  }

  await trackEvent({
    ...params,
    created_at: new Date().toISOString(),
  }).catch(() => undefined);
}
