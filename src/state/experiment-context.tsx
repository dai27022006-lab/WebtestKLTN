'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { EventName, EventVariant } from '@/lib/tracking/events';
import {
  completeScenario,
  exitExperimentSession,
  getNextScenario,
  submitExperimentConsent,
  trackEventSafe,
} from '@/services';
import type {
  CompleteScenarioResponse,
  ExperimentAssignmentDto,
  ScenarioNextResponse,
  ShopProfileInput,
} from '@/types/api';

const VISITOR_STORAGE_KEY = 'dsa_visitor_id';
const ASSIGNMENT_STORAGE_KEY = 'dsa_assignment';

function createVisitorId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `vis_${crypto.randomUUID().replace(/-/g, '')}`;
  }
  return `vis_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function readStoredVisitorId(): string {
  if (typeof window === 'undefined') return '';
  const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);
  if (existing && existing.length >= 8) return existing;
  const fresh = createVisitorId();
  window.localStorage.setItem(VISITOR_STORAGE_KEY, fresh);
  return fresh;
}

function readStoredAssignment(): ExperimentAssignmentDto | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(ASSIGNMENT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ExperimentAssignmentDto;
  } catch {
    return null;
  }
}

function writeStoredAssignment(assignment: ExperimentAssignmentDto): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    ASSIGNMENT_STORAGE_KEY,
    JSON.stringify(assignment)
  );
}

export interface ExperimentContextValue {
  visitorId: string;
  assignment: ExperimentAssignmentDto | null;
  scenarioState: ScenarioNextResponse | null;
  activeVariant: EventVariant;
  isScenarioSynced: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  giveConsent: (
    shopProfile?: ShopProfileInput,
    experimentCode?: string
  ) => Promise<ExperimentAssignmentDto | null>;
  loadNextScenario: (assignmentIdOverride?: string) => Promise<ScenarioNextResponse | null>;
  submitScenarioDecision: (input: {
    selected_product_id: string;
    confidence_score: 1 | 2 | 3 | 4 | 5;
    decision_note?: string;
  }) => Promise<CompleteScenarioResponse | null>;
  track: (
    eventName: EventName,
    extra?: {
      product_id?: string | null;
      session_id?: string | null;
      properties?: Record<string, unknown>;
    }
  ) => Promise<void>;
  resetSession: () => void;
}

const ExperimentContext = createContext<ExperimentContextValue | null>(null);

export function ExperimentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [visitorId, setVisitorId] = useState<string>('');
  const [assignment, setAssignment] = useState<ExperimentAssignmentDto | null>(
    null
  );
  const [scenarioState, setScenarioState] =
    useState<ScenarioNextResponse | null>(null);
  const [isScenarioSynced, setIsScenarioSynced] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sessionVersionRef = useRef(0);

  useEffect(() => {
    let active = true;
    const mountSessionVersion = sessionVersionRef.current;
    void Promise.resolve().then(async () => {
      if (!active || mountSessionVersion !== sessionVersionRef.current) return;
      const vid = readStoredVisitorId();
      const storedAssignment = readStoredAssignment();
      setVisitorId(vid);
      if (!storedAssignment) {
        setIsScenarioSynced(true);
        return;
      }

      setAssignment(storedAssignment);
      try {
        const nextRes = await getNextScenario(storedAssignment.assignment_id);
        if (!active || mountSessionVersion !== sessionVersionRef.current) {
          return;
        }
        if (nextRes.ok) {
          setScenarioState(nextRes.data);
          const syncedAssignment: ExperimentAssignmentDto = {
            ...storedAssignment,
            active_variant: nextRes.data.active_variant,
          };
          setAssignment(syncedAssignment);
          writeStoredAssignment(syncedAssignment);
        }
      } finally {
        if (active && mountSessionVersion === sessionVersionRef.current) {
          setIsScenarioSynced(true);
        }
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const activeVariant: EventVariant = useMemo(() => {
    if (scenarioState?.active_variant) return scenarioState.active_variant;
    if (assignment?.active_variant) return assignment.active_variant;
    return 'chatbot_off';
  }, [assignment, scenarioState]);

  const loadNextScenario = useCallback(
    async (assignmentIdOverride?: string) => {
      const targetId = assignmentIdOverride ?? assignment?.assignment_id;
      if (!targetId) {
        setIsScenarioSynced(true);
        return null;
      }
      const callVersion = sessionVersionRef.current;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await getNextScenario(targetId);
        if (callVersion !== sessionVersionRef.current) {
          return null;
        }
        if (!res.ok) {
          setErrorMessage(res.error.message);
          return null;
        }
        setScenarioState(res.data);
        const currentAssignment =
          assignment && assignment.assignment_id === targetId
            ? assignment
            : readStoredAssignment();
        if (
          currentAssignment &&
          currentAssignment.assignment_id === targetId
        ) {
          const syncedAssignment: ExperimentAssignmentDto = {
            ...currentAssignment,
            active_variant: res.data.active_variant,
          };
          setAssignment(syncedAssignment);
          writeStoredAssignment(syncedAssignment);
        }
        return res.data;
      } finally {
        if (callVersion === sessionVersionRef.current) {
          setIsLoading(false);
          setIsScenarioSynced(true);
        }
      }
    },
    [assignment]
  );

  const giveConsent = useCallback(
    async (shopProfile?: ShopProfileInput, experimentCode?: string) => {
      const vid = visitorId || readStoredVisitorId();
      if (!visitorId && vid) setVisitorId(vid);

      const callVersion = sessionVersionRef.current;
      setIsLoading(true);
      setErrorMessage(null);
      const res = await submitExperimentConsent({
        visitor_id: vid,
        consent_given: true,
        shop_profile: shopProfile,
        experiment_code: experimentCode,
      });
      if (callVersion !== sessionVersionRef.current) {
        return null;
      }
      setIsLoading(false);

      if (!res.ok) {
        setErrorMessage(res.error.message);
        return null;
      }

      setIsScenarioSynced(false);
      setAssignment(res.data);
      writeStoredAssignment(res.data);

      const nextScenario = await loadNextScenario(res.data.assignment_id);
      return nextScenario
        ? { ...res.data, active_variant: nextScenario.active_variant }
        : res.data;
    },
    [visitorId, loadNextScenario]
  );

  const submitScenarioDecision = useCallback(
    async (input: {
      selected_product_id: string;
      confidence_score: 1 | 2 | 3 | 4 | 5;
      decision_note?: string;
    }) => {
      if (
        !assignment ||
        !scenarioState?.scenario ||
        !scenarioState.scenario_run_id
      ) {
        setErrorMessage('Chưa có thẻ kịch bản đang mở.');
        return null;
      }

      setIsLoading(true);
      setErrorMessage(null);
      const res = await completeScenario(scenarioState.scenario.id, {
        assignment_id: assignment.assignment_id,
        scenario_run_id: scenarioState.scenario_run_id,
        selected_product_id: input.selected_product_id,
        confidence_score: input.confidence_score,
        decision_note: input.decision_note,
      });
      setIsLoading(false);

      if (!res.ok) {
        setErrorMessage(res.error.message);
        return null;
      }

      await trackEventSafe({
        visitor_id: visitorId,
        assignment_id: assignment.assignment_id,
        variant: scenarioState.active_variant,
        event_name: 'scenario_completed',
        scenario_run_id: scenarioState.scenario_run_id,
        product_id: input.selected_product_id,
        properties: {
          confidence_score: input.confidence_score,
          duration_seconds: res.data.duration_seconds,
        },
      });

      await loadNextScenario(assignment.assignment_id);
      return res.data;
    },
    [assignment, scenarioState, visitorId, loadNextScenario]
  );

  const track = useCallback(
    async (
      eventName: EventName,
      extra?: {
        product_id?: string | null;
        session_id?: string | null;
        properties?: Record<string, unknown>;
      }
    ) => {
      if (!assignment || !visitorId) return;
      await trackEventSafe({
        visitor_id: visitorId,
        assignment_id: assignment.assignment_id,
        variant: activeVariant,
        event_name: eventName,
        scenario_run_id: scenarioState?.scenario_run_id ?? null,
        product_id: extra?.product_id ?? null,
        session_id: extra?.session_id ?? null,
        properties: extra?.properties,
      });
    },
    [assignment, visitorId, activeVariant, scenarioState]
  );

  const resetSession = useCallback(() => {
    sessionVersionRef.current += 1;
    setAssignment(null);
    setScenarioState(null);
    setIsScenarioSynced(true);
    setIsLoading(false);
    setErrorMessage(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ASSIGNMENT_STORAGE_KEY);
      const fresh = createVisitorId();
      window.localStorage.setItem(VISITOR_STORAGE_KEY, fresh);
      setVisitorId(fresh);
    }
    void exitExperimentSession().catch(() => undefined);
  }, []);

  const value = useMemo<ExperimentContextValue>(
    () => ({
      visitorId,
      assignment,
      scenarioState,
      activeVariant,
      isScenarioSynced,
      isLoading,
      errorMessage,
      giveConsent,
      loadNextScenario,
      submitScenarioDecision,
      track,
      resetSession,
    }),
    [
      visitorId,
      assignment,
      scenarioState,
      activeVariant,
      isScenarioSynced,
      isLoading,
      errorMessage,
      giveConsent,
      loadNextScenario,
      submitScenarioDecision,
      track,
      resetSession,
    ]
  );

  return (
    <ExperimentContext.Provider value={value}>
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperiment(): ExperimentContextValue {
  const ctx = useContext(ExperimentContext);
  if (!ctx) {
    throw new Error('useExperiment must be used within ExperimentProvider');
  }
  return ctx;
}
