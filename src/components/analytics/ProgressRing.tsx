'use client';

import { useEffect, useId, useRef } from 'react';

export type ProgressRingTone = 'accent' | 'copper' | 'info' | 'success';

export interface ProgressRingProps {
  value: number;
  label: string;
  centerPrimary: string;
  centerSecondary?: string;
  valueText?: string;
  tone?: ProgressRingTone;
  size?: number;
  thickness?: number;
}

const TONE_COLOR_VAR: Record<ProgressRingTone, string> = {
  accent: 'var(--accent)',
  copper: 'var(--accent-copper)',
  info: 'var(--status-info)',
  success: 'var(--status-success)',
};

export function ProgressRing({
  value,
  label,
  centerPrimary,
  centerSecondary,
  valueText,
  tone = 'accent',
  size = 116,
  thickness = 12,
}: ProgressRingProps) {
  const clamped = Number.isFinite(value)
    ? Math.max(0, Math.min(100, Math.round(value)))
    : 0;
  const progressRef = useRef<HTMLProgressElement | null>(null);
  const labelId = useId();

  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    el.style.setProperty('--dg-ring-value', String(clamped));
  }, [clamped]);

  return (
    <div className="dg-ring-card">
      <div
        className="dg-progress-ring-wrap"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <progress
          ref={progressRef}
          value={clamped}
          max={100}
          aria-labelledby={labelId}
          aria-valuetext={valueText ?? `${clamped}%`}
          className="dg-progress-ring"
          style={
            {
              '--ring-size': `${size}px`,
              '--ring-thickness': `${thickness}px`,
              '--ring-fill': TONE_COLOR_VAR[tone],
              '--dg-ring-value': clamped,
            } as React.CSSProperties
          }
        />
        <div className="dg-progress-ring-content" aria-hidden="true">
          <strong className="dg-progress-ring-primary type-mono">
            {centerPrimary}
          </strong>
          {centerSecondary && (
            <span className="dg-progress-ring-secondary">{centerSecondary}</span>
          )}
        </div>
      </div>

      <span id={labelId} className="dg-ring-label">
        {label}
      </span>
    </div>
  );
}
