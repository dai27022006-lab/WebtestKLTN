'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { ArrowRight, Timer, X } from '@/components/icons/DreamIcons';
import { formatDurationMmSs, formatVnd } from '@/components/shared/formatters';
import { useElapsedTimer } from '@/motion/useElapsedTimer';
import { useExperiment } from '@/state';

const DIALOG_LIGHT_DISMISS = {
  closedby: 'any',
} as unknown as React.DialogHTMLAttributes<HTMLDialogElement>;

export function ScenarioContextBar() {
  const pathname = usePathname();
  const { assignment, scenarioState, resetSession } = useExperiment();
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const isVisible = Boolean(
    assignment?.consent_given &&
      scenarioState?.scenario_run_id &&
      scenarioState.scenario &&
      !scenarioState.is_finished &&
      pathname !== '/experiment' &&
      !pathname.startsWith('/admin')
  );

  const elapsedSeconds = useElapsedTimer(
    isVisible ? scenarioState?.started_at : null
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    let pressedOutside = false;
    const isOutside = (e: PointerEvent) => {
      const rect = dialog.getBoundingClientRect();
      return (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      );
    };

    const onDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onUp = (e: PointerEvent) => {
      if (dialog.open && pressedOutside && isOutside(e)) {
        dialog.close();
      }
    };

    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);
    return () => {
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, [isVisible]);

  if (!isVisible || !assignment || !scenarioState?.scenario) {
    return null;
  }

  const { scenario, step_order, total_steps } = scenarioState;

  return (
    <aside className="scenario-bar" aria-label="Nhiệm vụ trải nghiệm đang mở">
      <div className="container scenario-bar__inner">
        <div className="scenario-bar__info">
          <span className="badge badge--accent">
            Nhiệm vụ {step_order}/{total_steps}
          </span>
          <span className="scenario-bar__title" title={scenario.title}>
            {scenario.title}
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
            <span>Chốt lựa chọn</span>
            <ArrowRight size={14} />
          </Link>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={resetSession}
          >
            Thoát khảo sát
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="editorial-dialog"
        aria-labelledby="scenario-bar-dialog-title"
        {...DIALOG_LIGHT_DISMISS}
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
              Nhiệm vụ {step_order}/{total_steps}
            </span>
            <button
              type="button"
              className="icon-btn"
              onClick={() => dialogRef.current?.close()}
              aria-label="Đóng đề bài"
              autoFocus
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

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
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
              <span>Chốt lựa chọn</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </dialog>
    </aside>
  );
}
