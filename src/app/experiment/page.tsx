'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import {
  ArrowRight,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Sparkles,
  Timer,
} from '@/components/icons/DreamIcons';
import { useLocale } from '@/components/providers/LocaleProvider';
import {
  formatDurationMmSs,
} from '@/components/shared/formatters';
import { useElapsedTimer } from '@/motion/useElapsedTimer';
import { listProducts } from '@/services';
import { useExperiment } from '@/state';
import type { CompleteScenarioResponse, ProductSummaryDto } from '@/types/api';

const LIKERT_OPTIONS: Array<{ score: 1 | 2 | 3 | 4 | 5; label: string }> = [
  { score: 1, label: 'Rất phân vân' },
  { score: 2, label: 'Hơi phân vân' },
  { score: 3, label: 'Trung bình' },
  { score: 4, label: 'Khá tự tin' },
  { score: 5, label: 'Rất tự tin' },
];

const CHANNELS_LIST = ['TikTok Shop', 'Shopee', 'Facebook', 'Zalo'];

function ExperimentWorkspace() {
  const {
    commerce,
    chrome,
    formatPrice,
    getProductCopy,
    getProductTypeLabel,
    getDifficultyLabel,
    getIndustryLabel,
    getScenarioCopy,
  } = useLocale();
  const ex = commerce.experiment;
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get('selected_product_id') ?? '';

  const {
    assignment,
    scenarioState,
    activeVariant,
    isLoading,
    errorMessage,
    giveConsent,
    submitScenarioDecision,
    track,
    resetSession,
  } = useExperiment();

  const [consentChecked, setConsentChecked] = useState(false);
  const [consentTouched, setConsentTouched] = useState(false);
  const [industry, setIndustry] = useState('Mỹ phẩm');
  const [teamSize, setTeamSize] = useState('2');
  const [roleInStudy, setRoleInStudy] = useState<
    'shop_owner' | 'student_roleplay'
  >('shop_owner');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    'TikTok Shop',
    'Shopee',
  ]);

  const [products, setProducts] = useState<ProductSummaryDto[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [confidenceScore, setConfidenceScore] = useState<
    1 | 2 | 3 | 4 | 5 | null
  >(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [completedStepBanner, setCompletedStepBanner] =
    useState<CompleteScenarioResponse | null>(null);

  const startedTrackedRef = useRef<string | null>(null);

  const activeScenarioRunId = scenarioState?.scenario_run_id ?? null;
  const elapsedSeconds = useElapsedTimer(
    scenarioState && !scenarioState.is_finished
      ? scenarioState.started_at
      : null
  );

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    void listProducts({ limit: 50 }, controller.signal).then((res) => {
      if (active && res.ok) {
        setProducts(res.data);
      }
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!preselectedId) return;
    const timer = setTimeout(() => {
      setSelectedProductId(preselectedId);
    }, 0);
    return () => clearTimeout(timer);
  }, [preselectedId]);

  useEffect(() => {
    if (!assignment || !activeScenarioRunId || scenarioState?.is_finished) {
      return;
    }
    if (startedTrackedRef.current === activeScenarioRunId) return;
    startedTrackedRef.current = activeScenarioRunId;

    void track('scenario_started', {
      properties: {
        step_order: scenarioState?.step_order,
        scenario_code: scenarioState?.scenario?.code,
      },
    });
  }, [assignment, activeScenarioRunId, scenarioState, track]);

  const handleExitSurvey = () => {
    resetSession();
    router.push('/');
  };

  const toggleChannel = (channel: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((item) => item !== channel)
        : [...prev, channel]
    );
  };

  const handleConsentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConsentTouched(true);
    if (!consentChecked) return;

    await giveConsent({
      industry,
      team_size: Number(teamSize) || 2,
      channels: selectedChannels,
      role_in_study: roleInStudy,
    });
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!selectedProductId) {
      setLocalError('Vui lòng chọn 1 gói sản phẩm phù hợp với nhiệm vụ này.');
      return;
    }
    if (!confidenceScore) {
      setLocalError('Vui lòng chọn mức độ tự tin từ 1 đến 5.');
      return;
    }

    const result = await submitScenarioDecision({
      selected_product_id: selectedProductId,
      confidence_score: confidenceScore,
      decision_note: decisionNote.trim() || undefined,
    });

    if (result) {
      setSelectedProductId('');
      setConfidenceScore(null);
      setDecisionNote('');
      if (result.has_next_scenario) {
        setCompletedStepBanner(result);
      } else {
        setCompletedStepBanner(null);
      }
    }
  };

  // Phase 1: Consent screen (Zero variant / code leak)
  if (!assignment || !assignment.consent_given) {
    return (
      <section className="section section--compact">
        <div className="container experiment-shell">
          <div className="dg-exec-banner dg-dark-band">
            <div className="dg-exec-banner-grid" aria-hidden="true" />
            <div className="dg-exec-banner-content">
              <div className="dg-exec-pills">
                <span className="dg-exec-pill">
                  <span className="dg-dot" />
                  <span>{ex.eyebrow}</span>
                </span>
              </div>
              <h1 style={{ color: '#ffffff', margin: '8px 0 6px' }}>
                {ex.introTitle}
              </h1>
              <p
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0,
                  maxWidth: '60ch',
                }}
              >
                {ex.introDesc}
              </p>
            </div>
          </div>

          <div
            className="surface-card dg-panel"
            style={{ display: 'grid', gap: '20px' }}
          >
            <div className="callout callout--info">
              <strong
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <ShieldCheck size={16} />
                <span>{ex.stepConsentHeading}</span>
              </strong>
              <span>{ex.introDesc}</span>
            </div>

            <form
              onSubmit={(e) => void handleConsentSubmit(e)}
              style={{ display: 'grid', gap: '18px' }}
              noValidate
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '14px',
                }}
              >
                <div className="field">
                  <label htmlFor="exp-industry" className="field__label">
                    {ex.industryLabel}
                  </label>
                  <select
                    id="exp-industry"
                    className="select"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    <option value="Mỹ phẩm">{getIndustryLabel('Mỹ phẩm')}</option>
                    <option value="Thời trang">{getIndustryLabel('Thời trang')}</option>
                    <option value="F&B">{getIndustryLabel('F&B')}</option>
                    <option value="Đa ngành">{getIndustryLabel('Đa ngành')}</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="exp-team-size" className="field__label">
                    {ex.teamSizeLabel}
                  </label>
                  <select
                    id="exp-team-size"
                    className="select"
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="5">4–5</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="exp-role" className="field__label">
                    {ex.roleLabel}
                  </label>
                  <select
                    id="exp-role"
                    className="select"
                    value={roleInStudy}
                    onChange={(e) =>
                      setRoleInStudy(
                        e.target.value as 'shop_owner' | 'student_roleplay'
                      )
                    }
                  >
                    <option value="shop_owner">{ex.roleShopOwner}</option>
                    <option value="student_roleplay">{ex.roleStudent}</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <span className="field__label">{ex.channelsLabel}</span>
                <div className="chip-row">
                  {CHANNELS_LIST.map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      className="chip"
                      aria-pressed={selectedChannels.includes(ch)}
                      onClick={() => toggleChannel(ch)}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    cursor: 'pointer',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => {
                      setConsentChecked(e.target.checked);
                      setConsentTouched(true);
                    }}
                    style={{ width: '20px', height: '20px', marginTop: '2px' }}
                  />
                  <span className="type-body-sm" style={{ color: 'var(--ink)' }}>
                    {ex.consentLabel}
                  </span>
                </label>
                {consentTouched && !consentChecked && (
                  <span
                    role="alert"
                    style={{
                      fontSize: 'var(--text-caption)',
                      color: 'var(--status-danger)',
                    }}
                  >
                    {ex.consentError}
                  </span>
                )}
              </div>

              {errorMessage && (
                <div className="callout callout--danger" role="alert">
                  {errorMessage}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  alignItems: 'center',
                }}
              >
                <button
                  type="submit"
                  className="dg-btn-purchase"
                  style={{ flex: '1 1 260px', justifyContent: 'center', minHeight: '50px' }}
                  disabled={isLoading}
                >
                  <span>
                    {isLoading ? ex.startingBtn : ex.startBtn}
                  </span>
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={handleExitSurvey}
                >
                  {chrome.header.expExit}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    );
  }

  // Phase 4 (Finished): Debrief & Completion Card (participant_code shown ONLY here)
  if (scenarioState?.is_finished) {
    return (
      <section className="section section--compact">
        <div className="container experiment-shell">
          <div
            className="surface-card dg-panel"
            style={{ display: 'grid', gap: '20px' }}
          >
            <span className="badge badge--success" style={{ width: 'fit-content' }}>
              <CheckCircle2 size={14} />
              <span>{ex.finishedEyebrow}</span>
            </span>
            <h1 className="type-h1" style={{ margin: 0 }}>
              {ex.finishedTitle}
            </h1>
            <p className="type-body" style={{ margin: 0 }}>
              {ex.finishedDesc}
            </p>

            <div className="callout callout--info">
              <strong>
                {ex.taskBadge(scenarioState.step_order, scenarioState.total_steps)}
              </strong>
              <span>
                {ex.participantCodeLabel}:{' '}
                <strong className="type-mono">
                  {assignment.participant_code}
                </strong>
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <Link href="/products" className="dg-btn-purchase">
                <span>{ex.goStoreBtn}</span>
                <ArrowRight size={15} />
              </Link>
              <Link href="/" className="btn btn--secondary">
                {chrome.common.home}
              </Link>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleExitSurvey}
              >
                {ex.restartBtn}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Intermediate transition screen after completing step 1 (Anti-bias: neutral transition)
  if (completedStepBanner && scenarioState?.scenario) {
    const isAssist = scenarioState.active_variant === 'chatbot_on';
    return (
      <section className="section section--compact">
        <div className="container experiment-shell">
          <div
            className="surface-card dg-panel"
            style={{ display: 'grid', gap: '20px' }}
          >
            <span className="badge badge--success" style={{ width: 'fit-content' }}>
              <CheckCircle2 size={14} />
              <span>
                {ex.taskBadge(
                  completedStepBanner.step_order,
                  scenarioState.total_steps
                )}{' '}
                • {formatDurationMmSs(completedStepBanner.duration_seconds)}
              </span>
            </span>
            <h1 className="type-h2" style={{ margin: 0 }}>
              {ex.taskBadge(scenarioState.step_order, scenarioState.total_steps)}
            </h1>
            <p className="type-body" style={{ margin: 0 }}>
              {isAssist ? ex.guidanceOn : ex.guidanceOff}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <button
                type="button"
                className="dg-btn-purchase"
                onClick={() => setCompletedStepBanner(null)}
              >
                <span>{ex.nextBannerTitle}</span>
                <ArrowRight size={15} />
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleExitSurvey}
              >
                {chrome.header.expExit}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const rawScenario = scenarioState?.scenario;
  const scenario = rawScenario ? getScenarioCopy(rawScenario) : null;
  const selectedProductObj = products.find((p) => p.id === selectedProductId);
  const localizedSelectedObj = selectedProductObj
    ? getProductCopy(selectedProductObj)
    : null;

  return (
    <section className="section section--compact">
      <div className="container experiment-shell">
        {/* Natural Task Guidance Banner (Zero bias / zero control-group leak) */}
        <div className="callout callout--info">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div>
              <strong
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Layers size={15} />
                <span>{ex.eyebrow}</span>
              </strong>
              <div
                className="type-body-sm"
                style={{ color: 'inherit', marginTop: '4px' }}
              >
                {activeVariant === 'chatbot_on' ? ex.guidanceOn : ex.guidanceOff}
              </div>
            </div>

            {activeVariant === 'chatbot_on' && (
              <button
                type="button"
                className="dg-btn-purchase dg-btn-sm"
                onClick={() => window.dispatchEvent(new Event('dsa:open-chat'))}
              >
                <Sparkles size={14} />
                <span>{ex.openAdvisorBtn}</span>
              </button>
            )}
          </div>
        </div>

        {/* Phase 2: Task Card & Live Tabular Timer (Zero scenario.code or P-code) */}
        {scenario ? (
          <div
            className="surface-card dg-panel"
            style={{ display: 'grid', gap: '16px' }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div className="chip-row">
                <span className="badge badge--accent">
                  {ex.taskBadge(
                    scenarioState?.step_order ?? 1,
                    scenarioState?.total_steps ?? 2
                  )}
                </span>
                <span className="badge">
                  {chrome.scenarioBar.difficulty}:{' '}
                  {getDifficultyLabel(scenario.difficulty)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  className="badge badge--accent type-timer"
                  style={{ fontSize: '0.95rem', paddingInline: '12px' }}
                >
                  <Timer size={14} />
                  <span>{formatDurationMmSs(elapsedSeconds)}</span>
                </span>
              </div>
            </div>

            <h1 className="type-h2" style={{ margin: 0 }}>
              {scenario.title}
            </h1>
            <p className="type-body" style={{ margin: 0 }}>
              {scenario.prompt_text}
            </p>

            <div className="chip-row">
              <span className="badge">
                {chrome.scenarioBar.industry}: {getIndustryLabel(scenario.industry)}
              </span>
              <span className="badge type-mono">
                {chrome.scenarioBar.maxBudget}: {formatPrice(scenario.budget_vnd)}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                paddingTop: '8px',
              }}
            >
              <Link href="/products" className="btn btn--secondary">
                <span>{ex.browseCatalog}</span>
                <ArrowRight size={15} />
              </Link>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleExitSurvey}
              >
                {chrome.header.expExit}
              </button>
            </div>
          </div>
        ) : (
          <div className="surface-card dg-panel">
            <p className="type-body-sm" style={{ margin: 0 }}>
              {chrome.common.loading}
            </p>
          </div>
        )}

        {/* Phase 3: Select Product & Likert 1-5 Decision Form */}
        {scenario && (
          <form
            className="surface-card dg-panel"
            onSubmit={(e) => void handleCompleteSubmit(e)}
            style={{ display: 'grid', gap: '20px' }}
          >
            <div>
              <span className="type-eyebrow">{ex.eyebrow}</span>
              <h2 className="type-h3" style={{ margin: '4px 0 0' }}>
                {ex.decisionHeading}
              </h2>
            </div>

            <div className="field">
              <label htmlFor="exp-product-select" className="field__label">
                {ex.selectPackageLabel}
              </label>
              <select
                id="exp-product-select"
                className="select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                <option value="">{ex.selectPackagePlaceholder}</option>
                {products.map((p) => {
                  const pCopy = getProductCopy(p);
                  return (
                    <option key={p.id} value={p.id}>
                      [{getProductTypeLabel(p.product_type)}] {pCopy.name} —{' '}
                      {formatPrice(p.price_vnd)}
                    </option>
                  );
                })}
              </select>

              {localizedSelectedObj && selectedProductObj && (
                <div className="callout" style={{ marginTop: '8px' }}>
                  <strong>{localizedSelectedObj.name}</strong>
                  <span className="type-body-sm">
                    {localizedSelectedObj.short_description} •{' '}
                    <strong
                      className="type-price"
                      style={{ color: 'var(--accent)' }}
                    >
                      {formatPrice(selectedProductObj.price_vnd)}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <div className="field">
              <span className="field__label">{ex.confidenceLabel}</span>
              <div
                className="likert-scale"
                role="group"
                aria-label={ex.confidenceLabel}
              >
                {LIKERT_OPTIONS.map((opt, idx) => (
                  <button
                    key={opt.score}
                    type="button"
                    className="likert-btn"
                    aria-pressed={confidenceScore === opt.score}
                    onClick={() => setConfidenceScore(opt.score)}
                  >
                    <strong
                      className="type-mono"
                      style={{ fontSize: '1.125rem' }}
                    >
                      {opt.score}
                    </strong>
                    <span style={{ fontSize: '0.72rem', textAlign: 'center' }}>
                      {ex.likert[idx] ?? opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label htmlFor="exp-decision-note" className="field__label">
                {ex.noteLabel}
              </label>
              <textarea
                id="exp-decision-note"
                className="textarea"
                rows={2}
                maxLength={500}
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder={ex.notePlaceholder}
              />
            </div>

            {(localError || errorMessage) && (
              <div className="callout callout--danger" role="alert">
                {localError ?? errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="dg-btn-purchase btn--block"
              style={{ justifyContent: 'center', minHeight: '50px' }}
              disabled={isLoading}
            >
              <CheckCircle2 size={16} />
              <span>
                {isLoading ? ex.submittingDecision : ex.submitDecision}
              </span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default function ExperimentPage() {
  return (
    <Suspense
      fallback={
        <section className="section section--compact">
          <div className="container experiment-shell">
            <div className="skeleton-box" style={{ height: '320px' }} />
          </div>
        </section>
      }
    >
      <ExperimentWorkspace />
    </Suspense>
  );
}
