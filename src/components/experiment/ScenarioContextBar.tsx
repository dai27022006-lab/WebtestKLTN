'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { ArrowRight, Timer, X } from '@/components/icons/DreamIcons';
import { useLocale } from '@/components/providers/LocaleProvider';
import { formatDurationMmSs } from '@/components/shared/formatters';
import { useElapsedTimer } from '@/motion/useElapsedTimer';
import { useExperiment } from '@/state';

const DIALOG_LIGHT_DISMISS = {
  closedby: 'any',
} as unknown as React.DialogHTMLAttributes<HTMLDialogElement>;

export function ScenarioContextBar() {
  const pathname = usePathname();
  const { assignment, scenarioState, resetSession } = useExperiment();
  const { chrome, formatPrice, getIndustryLabel, getScenarioCopy } = useLocale();
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
  const localizedScenario = getScenarioCopy(scenario);

  return (
    <aside className="scenario-bar" aria-label={chrome.scenarioBar.ariaLabel}>
      <div className="container scenario-bar__inner">
        <div className="scenario-bar__info">
          <span className="badge badge--accent">
            {chrome.scenarioBar.taskBadge(step_order, total_steps)}
          </span>
          <span className="scenario-bar__title" title={localizedScenario.title}>
            {localizedScenario.title}
          </span>
        </div>

        <div className="scenario-bar__actions">
          <span
            className="badge type-timer"
            aria-label={chrome.scenarioBar.timerAria(
              formatDurationMmSs(elapsedSeconds)
            )}
          >
            <Timer size={13} />
            <span>{formatDurationMmSs(elapsedSeconds)}</span>
          </span>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => dialogRef.current?.showModal()}
          >
            {chrome.scenarioBar.viewBrief}
          </button>
          <Link href="/experiment" className="dg-btn-purchase dg-btn-sm">
            <span>{chrome.scenarioBar.submitChoice}</span>
            <ArrowRight size={14} />
          </Link>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={resetSession}
          >
            {chrome.scenarioBar.exitSurvey}
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
              {chrome.scenarioBar.taskBadge(step_order, total_steps)}
            </span>
            <button
              type="button"
              className="icon-btn"
              onClick={() => dialogRef.current?.close()}
              aria-label={chrome.scenarioBar.closeBrief}
              autoFocus
            >
              <X size={16} />
            </button>
          </div>

          <h2 id="scenario-bar-dialog-title" style={{ margin: 0 }}>
            {localizedScenario.title}
          </h2>
          <p className="type-body" style={{ margin: 0 }}>
            {localizedScenario.prompt_text}
          </p>

          <div className="chip-row">
            <span className="badge">
              {chrome.scenarioBar.industry}: {getIndustryLabel(localizedScenario.industry)}
            </span>
            <span className="badge type-mono">
              {chrome.scenarioBar.maxBudget}: {formatPrice(localizedScenario.budget_vnd)}
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
              {chrome.scenarioBar.browseWithBar}
            </button>
            <Link
              href="/experiment"
              className="dg-btn-purchase dg-btn-sm"
              onClick={() => dialogRef.current?.close()}
            >
              <span>{chrome.scenarioBar.submitChoice}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </dialog>
    </aside>
  );
}
