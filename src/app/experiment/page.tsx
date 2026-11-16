'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import {
  ArrowRight,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Sparkles,
  Timer,
} from '@/components/icons/DreamIcons';
import {
  DIFFICULTY_LABELS,
  formatDurationMmSs,
  formatVnd,
  PRODUCT_TYPE_LABELS,
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
  const [roleInStudy, setRoleInStudy] = useState<'shop_owner' | 'student_roleplay'>(
    'shop_owner'
  );
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    'TikTok Shop',
    'Shopee',
  ]);

  const [products, setProducts] = useState<ProductSummaryDto[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [confidenceScore, setConfidenceScore] = useState<1 | 2 | 3 | 4 | 5 | null>(
    null
  );
  const [decisionNote, setDecisionNote] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [completedStepBanner, setCompletedStepBanner] =
    useState<CompleteScenarioResponse | null>(null);

  const startedTrackedRef = useRef<string | null>(null);

  const activeScenarioRunId = scenarioState?.scenario_run_id ?? null;
  const elapsedSeconds = useElapsedTimer(
    scenarioState && !scenarioState.is_finished ? scenarioState.started_at : null
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
      setLocalError('Vui lòng chọn 1 gói sản phẩm phù hợp với thẻ kịch bản.');
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

  // Phase 1: Consent screen
  if (!assignment || !assignment.consent_given) {
    return (
      <section className="section section--compact">
        <div className="container experiment-shell">
          {/* Dark Emerald Briefing Header */}
          <div className="dg-exec-banner dg-dark-band">
            <div className="dg-exec-banner-grid" aria-hidden="true" />
            <div className="dg-exec-banner-content">
              <div className="dg-exec-pills">
                <span className="dg-exec-pill">
                  <span className="dg-dot" />
                  <span>Within-subject AB/BA</span>
                </span>
                <span className="dg-exec-pill">~5 phút • Miễn tạo tài khoản</span>
              </div>
              <h1 style={{ color: '#ffffff', margin: '8px 0 6px' }}>
                Thí nghiệm A/B Đánh giá Trợ lý Ảo DreamTeam (F11)
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.78)', margin: 0, maxWidth: '60ch' }}>
                Bạn sẽ thực hiện lần lượt 2 thẻ kịch bản mô phỏng chủ shop nhỏ
                chọn gói công cụ số: 1 lượt có trợ lý ảo tư vấn và 1 lượt tự
                duyệt danh mục (thứ tự đảo ngẫu nhiên).
              </p>
            </div>
          </div>

          <div className="surface-card dg-panel" style={{ display: 'grid', gap: '20px' }}>
            <div className="callout callout--info">
              <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} />
                <span>Cam kết ẩn danh &amp; đạo đức nghiên cứu</span>
              </strong>
              <span>
                Không yêu cầu đăng ký email hay thông tin cá nhân. Hệ thống chỉ
                gắn log hội thoại và sự kiện thao tác với mã phiên ngẫu nhiên (
                <code className="type-mono">participant_code</code>) phục vụ phân
                tích thống kê đồ án tốt nghiệp.
              </span>
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
                    Ngành hàng quan tâm (tùy chọn)
                  </label>
                  <select
                    id="exp-industry"
                    className="select"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    <option value="Mỹ phẩm">Mỹ phẩm</option>
                    <option value="Thời trang">Thời trang</option>
                    <option value="F&B">F&amp;B / Đồ ăn uống</option>
                    <option value="Đa ngành">Đa ngành / Gia dụng</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="exp-team-size" className="field__label">
                    Quy mô nhân sự shop (tùy chọn)
                  </label>
                  <select
                    id="exp-team-size"
                    className="select"
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                  >
                    <option value="1">1 người (Tự làm hết)</option>
                    <option value="2">2 người</option>
                    <option value="3">3 người</option>
                    <option value="5">4–5 người</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="exp-role" className="field__label">
                    Vai trò tham gia
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
                    <option value="shop_owner">Chủ shop / Người bán thật</option>
                    <option value="student_roleplay">
                      Sinh viên nhập vai tình huống
                    </option>
                  </select>
                </div>
              </div>

              <div className="field">
                <span className="field__label">Kênh bán chính (tùy chọn)</span>
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
                    <strong>Tôi đồng ý tham gia thí nghiệm nghiên cứu</strong>{' '}
                    và cho phép hệ thống ghi nhận thời gian chọn gói, độ tự tin
                    (1–5) cùng log hội thoại ẩn danh.
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
                    Vui lòng đánh dấu đồng ý tham gia trước khi bắt đầu.
                  </span>
                )}
              </div>

              {errorMessage && (
                <div className="callout callout--danger" role="alert">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="dg-btn-purchase btn--block"
                style={{ justifyContent: 'center', minHeight: '50px' }}
                disabled={isLoading}
              >
                <span>
                  {isLoading
                    ? 'Đang khởi tạo mã phiên...'
                    : 'Xác nhận & Nhận thẻ kịch bản đầu tiên'}
                </span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  // Phase 4 (Finished): Debrief & Completion Card
  if (scenarioState?.is_finished) {
    return (
      <section className="section section--compact">
        <div className="container experiment-shell">
          <div className="surface-card dg-panel" style={{ display: 'grid', gap: '20px' }}>
            <span className="badge badge--success" style={{ width: 'fit-content' }}>
              <CheckCircle2 size={14} />
              <span>Hoàn tất toàn bộ kịch bản thí nghiệm</span>
            </span>
            <h1 className="type-h1" style={{ margin: 0 }}>
              Cảm ơn bạn đã hoàn thành thí nghiệm F11!
            </h1>
            <p className="type-body" style={{ margin: 0 }}>
              Kết quả chọn gói, thời gian quyết định và độ tự tin của bạn đã
              được lưu an toàn dưới mã tham gia{' '}
              <strong className="type-mono">{assignment.participant_code}</strong>.
            </p>

            <div className="callout callout--info">
              <strong>Tóm tắt phiên vừa thực hiện</strong>
              <span>
                Số lượt đã hoàn thành:{' '}
                <strong className="type-mono">
                  {scenarioState.step_order}/{scenarioState.total_steps}
                </strong>{' '}
                • Thứ tự nhánh:{' '}
                <code className="type-mono">{assignment.variant}</code>
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <Link href="/products" className="dg-btn-purchase">
                <span>Khám phá tự do danh mục sản phẩm</span>
                <ArrowRight size={15} />
              </Link>
              <Link href="/" className="btn btn--secondary">
                Quay về trang chủ
              </Link>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={resetSession}
              >
                Tạo phiên thí nghiệm mới (Reset)
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Intermediate Crossover Transition Banner after completing step 1
  if (completedStepBanner && scenarioState?.scenario) {
    return (
      <section className="section section--compact">
        <div className="container experiment-shell">
          <div className="surface-card dg-panel" style={{ display: 'grid', gap: '20px' }}>
            <span className="badge badge--success" style={{ width: 'fit-content' }}>
              <CheckCircle2 size={14} />
              <span>
                Hoàn thành Lượt {completedStepBanner.step_order} trong{' '}
                {formatDurationMmSs(completedStepBanner.duration_seconds)}
              </span>
            </span>
            <h1 className="type-h2" style={{ margin: 0 }}>
              Sẵn sàng chuyển sang Lượt {scenarioState.step_order}/
              {scenarioState.total_steps} (Đảo điều kiện AB/BA)
            </h1>
            <p className="type-body" style={{ margin: 0 }}>
              Theo thiết kế đối chứng chéo Within-subject, lượt tiếp theo của
              bạn sẽ chuyển sang trạng thái:{' '}
              <strong>
                {scenarioState.active_variant === 'chatbot_on'
                  ? 'CÓ Trợ lý ảo tư vấn'
                  : 'KHÔNG có Trợ lý ảo (Tự duyệt danh mục)'}
              </strong>
              .
            </p>
            <button
              type="button"
              className="dg-btn-purchase"
              style={{ width: 'fit-content' }}
              onClick={() => setCompletedStepBanner(null)}
            >
              <span>Mở thẻ kịch bản tiếp theo</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  const scenario = scenarioState?.scenario;
  const selectedProductObj = products.find((p) => p.id === selectedProductId);

  return (
    <section className="section section--compact">
      <div className="container experiment-shell">
        {/* AB/BA Condition Banner */}
        <div
          className={`callout ${
            activeVariant === 'chatbot_on' ? 'callout--success' : 'callout--info'
          }`}
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
            <div>
              <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={15} />
                <span>
                  {activeVariant === 'chatbot_on'
                    ? 'Lượt này BẬT Trợ lý ảo Tư vấn (chatbot_on)'
                    : 'Lượt này TẮT Trợ lý ảo — Đối chứng (chatbot_off)'}
                </span>
              </strong>
              <div className="type-body-sm" style={{ color: 'inherit', marginTop: '4px' }}>
                {activeVariant === 'chatbot_on'
                  ? 'Bạn có thể mở Trợ lý ảo để hỏi tư vấn theo ngành và ngân sách, hoặc duyệt danh mục.'
                  : 'Ở lượt này, bạn vui lòng tự tìm kiếm và lọc trong danh mục sản phẩm để chọn gói phù hợp nhất.'}
              </div>
            </div>

            {activeVariant === 'chatbot_on' && (
              <button
                type="button"
                className="dg-btn-purchase dg-btn-sm"
                onClick={() => window.dispatchEvent(new Event('dsa:open-chat'))}
              >
                <Sparkles size={14} />
                <span>Mở Trợ lý ảo ngay</span>
              </button>
            )}
          </div>
        </div>

        {/* Phase 2: Scenario Card & Live Tabular Timer */}
        {scenario ? (
          <div className="surface-card dg-panel" style={{ display: 'grid', gap: '16px' }}>
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
                <span className="badge badge--accent type-mono">
                  {scenario.code}
                </span>
                <span className="badge">
                  Lượt {scenarioState.step_order}/{scenarioState.total_steps}
                </span>
                <span className="badge">
                  {DIFFICULTY_LABELS[scenario.difficulty]}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="type-caption">Thời gian làm bài:</span>
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
              <span className="badge">Ngành: {scenario.industry}</span>
              <span className="badge type-mono">
                Ngân sách mục tiêu: {formatVnd(scenario.budget_vnd)}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingTop: '8px' }}>
              <Link href="/products" className="btn btn--secondary">
                <span>Mở Danh mục sản phẩm (/products) để tìm &amp; lọc</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="surface-card dg-panel">
            <p className="type-body-sm" style={{ margin: 0 }}>
              Đang tải thẻ kịch bản từ hệ thống...
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
              <span className="type-eyebrow">Chốt quyết định (Pha 3)</span>
              <h2 className="type-h3" style={{ margin: '4px 0 0' }}>
                Chọn gói sản phẩm &amp; Chấm độ tự tin
              </h2>
            </div>

            <div className="field">
              <label htmlFor="exp-product-select" className="field__label">
                Gói sản phẩm bạn chọn cho kịch bản này
              </label>
              <select
                id="exp-product-select"
                className="select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                <option value="">
                  -- Chọn 1 gói trong danh mục (hoặc chọn từ /products) --
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{PRODUCT_TYPE_LABELS[p.product_type]}] {p.name} —{' '}
                    {formatVnd(p.price_vnd)}
                  </option>
                ))}
              </select>

              {selectedProductObj && (
                <div className="callout" style={{ marginTop: '8px' }}>
                  <strong>{selectedProductObj.name}</strong>
                  <span className="type-body-sm">
                    {selectedProductObj.short_description} •{' '}
                    <strong className="type-price" style={{ color: 'var(--accent)' }}>
                      {formatVnd(selectedProductObj.price_vnd)}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <div className="field">
              <span className="field__label">
                Bạn tự tin mức nào rằng gói này phù hợp nhất với đề bài? (1–5)
              </span>
              <div
                className="likert-scale"
                role="group"
                aria-label="Thang đo độ tự tin từ 1 đến 5"
              >
                {LIKERT_OPTIONS.map((opt) => (
                  <button
                    key={opt.score}
                    type="button"
                    className="likert-btn"
                    aria-pressed={confidenceScore === opt.score}
                    onClick={() => setConfidenceScore(opt.score)}
                  >
                    <strong className="type-mono" style={{ fontSize: '1.125rem' }}>
                      {opt.score}
                    </strong>
                    <span style={{ fontSize: '0.72rem', textAlign: 'center' }}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label htmlFor="exp-decision-note" className="field__label">
                Lý do chọn gói (tùy chọn)
              </label>
              <textarea
                id="exp-decision-note"
                className="textarea"
                rows={2}
                maxLength={500}
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="Ví dụ: Đúng ngành mỹ phẩm, nằm trong ngân sách 1 triệu và tối ưu mobile..."
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
                {isLoading
                  ? 'Đang ghi nhận kết quả...'
                  : 'Xác nhận hoàn thành kịch bản'}
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
