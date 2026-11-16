'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';

import { ArrowRight, Timer, X } from '@/components/icons/DreamIcons';
import {
  DIFFICULTY_LABELS,
  formatDurationMmSs,
  formatVnd,
} from '@/components/shared/formatters';
import { useElapsedTimer } from '@/motion/useElapsedTimer';
import { useExperiment } from '@/state';

export function ScenarioContextBar() {
  const pathname = usePathname();
  const { assignment, scenarioState, activeVariant } = useExperiment();
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const isVisible = Boolean(
    assignment &&
      scenarioState?.scenario_run_id &&
      scenarioState.scenario &&
      !scenarioState.is_finished &&
      pathname !== '/experiment'
  );

  const elapsedSeconds = useElapsedTimer(
    isVisible ? scenarioState?.started_at : null
  );

  if (!isVisible || !assignment || !scenarioState?.scenario) {
    return null;
  }

  const { scenario, step_order, total_steps } = scenarioState;

  return (
    <aside className="scenario-bar" aria-label="Ngữ cảnh kịch bản F11 đang mở">
      <div className="container scenario-bar__inner">
        <div className="scenario-bar__info">
          <span className="badge type-mono">{assignment.participant_code}</span>
          <span className="badge badge--accent">
            Lượt {step_order}/{total_steps}
          </span>
          <span
            className={`badge ${
              activeVariant === 'chatbot_on' ? 'badge--success' : 'badge--info'
            }`}
          >
            {activeVariant === 'chatbot_on'
              ? 'Có trợ lý ảo'
              : 'Không trợ lý ảo'}
          </span>
          <span className="scenario-bar__title" title={scenario.title}>
            {scenario.code}: {scenario.title}
          </span>
        </div>

        <div className="scenario-bar__actions">
          <span
            className="badge type-timer"
            aria-label={`Thời gian đã trôi qua ${formatDurationMmSs(elapsedSeconds)}`}
          >
            <Timer size={13} />
            <span>{formatDurationMmSs(elapsedSeconds)}</span>
          </span>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => dialogRef.current?.showModal()}
          >
            Xem đề bài
          </button>
          <Link href="/experiment" className="dg-btn-purchase dg-btn-sm">
            <span>Về chốt gói</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="editorial-dialog"
        aria-labelledby="scenario-bar-dialog-title"
      >
        <div style={{ padding: '24px', display: 'grid', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span className="type-eyebrow">
              Đề bài {scenario.code} • {DIFFICULTY_LABELS[scenario.difficulty]}
            </span>
            <button
              type="button"
              className="icon-btn"
              onClick={() => dialogRef.current?.close()}
              aria-label="Đóng đề bài"
            >
              <X size={16} />
            </button>
          </div>

          <h2 id="scenario-bar-dialog-title" style={{ margin: 0 }}>
            {scenario.title}
          </h2>
          <p className="type-body" style={{ margin: 0 }}>
            {scenario.prompt_text}
          </p>

          <div className="chip-row">
            <span className="badge">Ngành: {scenario.industry}</span>
            <span className="badge type-mono">
              Ngân sách tối đa: {formatVnd(scenario.budget_vnd)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => dialogRef.current?.close()}
            >
              Tiếp tục duyệt gói
            </button>
            <Link
              href="/experiment"
              className="dg-btn-purchase dg-btn-sm"
              onClick={() => dialogRef.current?.close()}
            >
              <span>Quay về trang chốt gói</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </dialog>
    </aside>
  );
}
