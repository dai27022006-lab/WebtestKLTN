'use client';

import Link from 'next/link';

import {
  BarChart3,
  Cpu,
  Layers,
  Rocket,
  ShieldCheck,
  Zap,
} from '@/components/icons/DreamIcons';
import { useLocale } from '@/components/providers/LocaleProvider';
import type { AdminDashboardSummaryDto, OrderDto } from '@/types/api';

import { ProgressRing } from './ProgressRing';

export interface AdminVisualDashboardProps {
  summary: AdminDashboardSummaryDto;
  recentOrders: OrderDto[];
}

export function AdminVisualDashboard({
  summary,
  recentOrders,
}: AdminVisualDashboardProps) {
  const { admin, formatPrice, getIndustryLabel } = useLocale();
  const aa = admin.analytics;

  const onVariant = summary.variants.find((v) => v.variant === 'chatbot_on');
  const offVariant = summary.variants.find((v) => v.variant === 'chatbot_off');

  const onAccuracyPct = onVariant ? Math.round(onVariant.accuracy_rate * 100) : 0;
  const offAccuracyPct = offVariant ? Math.round(offVariant.accuracy_rate * 100) : 0;
  const accuracyDelta = onAccuracyPct - offAccuracyPct;
  const deltaStr = `${accuracyDelta >= 0 ? `+${accuracyDelta}` : accuracyDelta}`;

  const consentPct =
    summary.total_participants > 0
      ? Math.round((summary.consented_participants / summary.total_participants) * 100)
      : 0;

  const maxDuration = Math.max(
    1,
    onVariant?.avg_duration_seconds ?? 0,
    offVariant?.avg_duration_seconds ?? 0
  );
  const maxPurchases = Math.max(
    1,
    onVariant?.sandbox_purchase_count ?? 0,
    offVariant?.sandbox_purchase_count ?? 0
  );

  const comparisonMetrics = [
    {
      label: aa.dashEl2MetricAcc,
      onLabel: `${onAccuracyPct}%`,
      offLabel: `${offAccuracyPct}%`,
      onPct: onAccuracyPct,
      offPct: offAccuracyPct,
    },
    {
      label: aa.dashEl2MetricDur,
      onLabel: `${(onVariant?.avg_duration_seconds ?? 0).toFixed(1)}s`,
      offLabel: `${(offVariant?.avg_duration_seconds ?? 0).toFixed(1)}s`,
      onPct: Math.round(((onVariant?.avg_duration_seconds ?? 0) / maxDuration) * 100),
      offPct: Math.round(((offVariant?.avg_duration_seconds ?? 0) / maxDuration) * 100),
    },
    {
      label: aa.dashEl2MetricConf,
      onLabel: `${(onVariant?.avg_confidence_score ?? 0).toFixed(2)} / 5`,
      offLabel: `${(offVariant?.avg_confidence_score ?? 0).toFixed(2)} / 5`,
      onPct: Math.round(((onVariant?.avg_confidence_score ?? 0) / 5) * 100),
      offPct: Math.round(((offVariant?.avg_confidence_score ?? 0) / 5) * 100),
    },
    {
      label: aa.dashEl2MetricBuy,
      onLabel: `${onVariant?.sandbox_purchase_count ?? 0} ${aa.dashEl2UnitOrder}`,
      offLabel: `${offVariant?.sandbox_purchase_count ?? 0} ${aa.dashEl2UnitOrder}`,
      onPct: Math.round(((onVariant?.sandbox_purchase_count ?? 0) / maxPurchases) * 100),
      offPct: Math.round(((offVariant?.sandbox_purchase_count ?? 0) / maxPurchases) * 100),
    },
  ];

  const totalAiMsgs = Math.max(0, summary.rag_metrics.total_assistant_messages);
  const geminiSharePct =
    totalAiMsgs > 0 ? Math.round((summary.ai_mix.gemini_count / totalAiMsgs) * 100) : 0;
  const stubSharePct = totalAiMsgs > 0 ? Math.max(0, 100 - geminiSharePct) : 0;
  const groundingPct = Math.round(summary.ai_mix.grounding_rate * 100);

  const trendPoints = summary.daily_trend;
  const maxDailyActivity = Math.max(
    1,
    ...trendPoints.map(
      (pt) => pt.completed_runs + pt.assistant_messages + pt.orders_count
    )
  );

  const totalOrders = Math.max(1, summary.orders_summary.total_orders);
  const orderMix = [
    {
      label: aa.dashEl5Paid,
      count: summary.orders_breakdown.paid,
      pct: Math.round((summary.orders_breakdown.paid / totalOrders) * 100),
      toneClass: 'is-emerald',
    },
    {
      label: aa.dashEl5Pending,
      count: summary.orders_breakdown.pending,
      pct: Math.round((summary.orders_breakdown.pending / totalOrders) * 100),
      toneClass: 'is-copper',
    },
    {
      label: aa.dashEl5Failed,
      count: summary.orders_breakdown.failed_or_cancelled,
      pct: Math.round(
        (summary.orders_breakdown.failed_or_cancelled / totalOrders) * 100
      ),
      toneClass: 'is-info',
    },
  ];

  return (
    <section aria-label={aa.dashEl1Title} className="dg-dash-bento">
      {/* Element 1 */}
      <article className="surface-card dg-panel dg-dash-card dg-dash-span-5">
        <div className="dg-dash-card__head">
          <div className="dg-dash-card__title-wrap">
            <span className="dg-dash-eyebrow">{aa.dashEl1Eyebrow}</span>
            <h2 className="type-h3" style={{ margin: 0 }}>
              {aa.dashEl1Title}
            </h2>
          </div>
          <span
            className={`badge ${
              accuracyDelta > 0
                ? 'badge--success'
                : accuracyDelta < 0
                  ? 'badge--warning'
                  : 'badge--info'
            } type-mono`}
          >
            {aa.dashEl1Delta(deltaStr)}
          </span>
        </div>

        <div className="dg-ring-pair">
          <ProgressRing
            value={onAccuracyPct}
            label={aa.dashEl1RingAcc}
            centerPrimary={`${onAccuracyPct}%`}
            centerSecondary={`${onVariant?.correct_runs ?? 0}/${onVariant?.completed_runs ?? 0}`}
            valueText={`${aa.dashEl1RingAcc} ${onAccuracyPct}%`}
            tone="accent"
            size={112}
            thickness={11}
          />
          <ProgressRing
            value={consentPct}
            label={aa.dashEl1RingConsent}
            centerPrimary={`${consentPct}%`}
            centerSecondary={`${summary.consented_participants}/${summary.total_participants}`}
            valueText={`${aa.dashEl1RingConsent} ${consentPct}%`}
            tone="copper"
            size={112}
            thickness={11}
          />
        </div>

        <p className="type-caption" style={{ margin: 0 }}>
          {aa.dashEl1ControlNote}:{' '}
          <strong className="type-mono">{offAccuracyPct}%</strong> (
          {offVariant?.correct_runs ?? 0}/{offVariant?.completed_runs ?? 0})
        </p>
      </article>

      {/* Element 2 */}
      <article className="surface-card dg-panel dg-dash-card dg-dash-span-7">
        <div className="dg-dash-card__head">
          <div className="dg-dash-card__title-wrap">
            <span className="dg-dash-eyebrow">{aa.dashEl2Eyebrow}</span>
            <h2 className="type-h3" style={{ margin: 0 }}>
              {aa.dashEl2Title}
            </h2>
          </div>
          <div className="dg-dash-legend">
            <span className="dg-legend-item">
              <span className="dg-legend-swatch is-emerald" aria-hidden="true" />
              <span>chatbot_on</span>
            </span>
            <span className="dg-legend-item">
              <span className="dg-legend-swatch is-copper" aria-hidden="true" />
              <span>chatbot_off</span>
            </span>
          </div>
        </div>

        <div className="dg-compare-list">
          {comparisonMetrics.map((metric) => (
            <div key={metric.label} className="dg-compare-row">
              <div className="dg-compare-row__labels">
                <span className="dg-compare-row__title">{metric.label}</span>
                <span className="type-caption type-mono">
                  <strong style={{ color: 'var(--accent)' }}>{metric.onLabel}</strong>
                  {' • '}
                  <strong style={{ color: 'var(--accent-copper)' }}>
                    {metric.offLabel}
                  </strong>
                </span>
              </div>
              <div className="dg-compare-bars" aria-hidden="true">
                <div className="dg-bar-track">
                  <div
                    className="dg-bar-fill is-emerald"
                    style={{ width: `${Math.max(metric.onPct, metric.onPct > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <div className="dg-bar-track">
                  <div
                    className="dg-bar-fill is-copper"
                    style={{ width: `${Math.max(metric.offPct, metric.offPct > 0 ? 4 : 0)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>

      {/* Element 3 */}
      <article className="surface-card dg-panel dg-dash-card dg-dash-span-4">
        <div className="dg-dash-card__head">
          <div className="dg-dash-card__title-wrap">
            <span className="dg-dash-eyebrow">{aa.dashEl3Eyebrow}</span>
            <h2 className="type-h3" style={{ margin: 0 }}>
              {aa.dashEl3Title}
            </h2>
          </div>
          <BarChart3 size={18} style={{ color: 'var(--accent)' }} />
        </div>

        <div className="dg-funnel-list">
          {summary.funnel_stages.map((stage, index) => (
            <div key={stage.key} className="dg-funnel-step">
              <div className="dg-funnel-step__meta">
                <span>
                  <span className="type-mono" style={{ opacity: 0.72, marginRight: '6px' }}>
                    {index + 1}.
                  </span>
                  {aa.funnelLabels[stage.key] ?? stage.label}
                </span>
                <strong className="type-mono">
                  {stage.count} ({stage.pct_of_top}%)
                </strong>
              </div>
              <div className="dg-bar-track">
                <div
                  className="dg-bar-fill is-emerald"
                  style={{
                    width: `${stage.pct_of_top}%`,
                    opacity: Math.max(0.45, 1 - index * 0.09),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>

      {/* Element 4 */}
      <article className="surface-card dg-panel dg-dash-card dg-dash-span-4">
        <div className="dg-dash-card__head">
          <div className="dg-dash-card__title-wrap">
            <span className="dg-dash-eyebrow">{aa.dashEl4Eyebrow}</span>
            <h2 className="type-h3" style={{ margin: 0 }}>
              {aa.dashEl4Title}
            </h2>
          </div>
          <Link href="/admin/chat-logs" className="btn btn--secondary btn--sm">
            <Cpu size={13} />
            <span>{aa.dashEl4LogsBtn}</span>
          </Link>
        </div>

        <div style={{ display: 'grid', gap: '8px' }}>
          <div className="dg-compare-row__labels">
            <span className="type-caption">{aa.dashEl4ReplyRatio(totalAiMsgs)}</span>
            <span className="badge badge--success type-mono">
              <ShieldCheck size={12} />
              <span>{aa.dashEl4Grounding(groundingPct)}</span>
            </span>
          </div>
          <div className="dg-split-bar" aria-label={`Gemini ${geminiSharePct}%, Stub ${stubSharePct}%`}>
            <div
              className="dg-split-bar__seg is-emerald"
              style={{ width: `${geminiSharePct}%` }}
              title={`Gemini LLM: ${summary.ai_mix.gemini_count}`}
            />
            <div
              className="dg-split-bar__seg is-copper"
              style={{ width: `${stubSharePct}%` }}
              title={`Stub/Fallback: ${summary.ai_mix.stub_count}`}
            />
          </div>
          <div className="dg-dash-legend">
            <span className="dg-legend-item">
              <span className="dg-legend-swatch is-emerald" aria-hidden="true" />
              <span>Gemini ({summary.ai_mix.gemini_count})</span>
            </span>
            <span className="dg-legend-item">
              <span className="dg-legend-swatch is-copper" aria-hidden="true" />
              <span>Stub ({summary.ai_mix.stub_count})</span>
            </span>
            <span className="type-caption type-mono" style={{ marginLeft: 'auto' }}>
              P95 {summary.rag_metrics.p95_latency_ms}ms • ${summary.rag_metrics.total_cost_usd.toFixed(4)}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '8px' }}>
          <div className="dg-compare-row__labels">
            <span className="type-caption" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Rocket size={13} />
              <span>{aa.dashEl4TrendLabel}</span>
            </span>
          </div>
          <div className="dg-col-chart" role="list" aria-label={aa.dashEl4TrendLabel}>
            {trendPoints.map((pt) => {
              const total = pt.completed_runs + pt.assistant_messages + pt.orders_count;
              const heightPct = total > 0 ? Math.max(10, Math.round((total / maxDailyActivity) * 100)) : 4;
              return (
                <div
                  key={pt.date}
                  role="listitem"
                  className="dg-col-item"
                  title={`${pt.date}: ${pt.completed_runs} A/B, ${pt.assistant_messages} AI, ${pt.orders_count} (${formatPrice(pt.paid_revenue_vnd)})`}
                >
                  <span className="dg-col-value type-mono">{total}</span>
                  <div className="dg-col-track">
                    <div
                      className={`dg-col-bar ${total > 0 ? 'is-active' : ''}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="dg-col-label type-mono">{pt.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </article>

      {/* Element 5 */}
      <article className="surface-card dg-panel dg-dash-card dg-dash-span-4">
        <div className="dg-dash-card__head">
          <div className="dg-dash-card__title-wrap">
            <span className="dg-dash-eyebrow">{aa.dashEl5Eyebrow}</span>
            <h2 className="type-h3" style={{ margin: 0 }}>
              {aa.dashEl5Title}
            </h2>
          </div>
          <Layers size={18} style={{ color: 'var(--accent)' }} />
        </div>

        <div style={{ display: 'grid', gap: '10px' }}>
          <span className="type-caption" style={{ fontWeight: 700 }}>
            {aa.dashEl5Industries}
          </span>
          {summary.industry_breakdown.length === 0 ? (
            <p className="type-caption" style={{ margin: 0 }}>
              {aa.dashEl5IndustriesEmpty}
            </p>
          ) : (
            <div className="dg-funnel-list">
              {summary.industry_breakdown.map((ind) => (
                <div key={ind.key} className="dg-funnel-step">
                  <div className="dg-funnel-step__meta">
                    <span>{getIndustryLabel(ind.label)}</span>
                    <strong className="type-mono">
                      {ind.count} ({ind.share_pct}%)
                    </strong>
                  </div>
                  <div className="dg-bar-track">
                    <div
                      className="dg-bar-fill is-info"
                      style={{ width: `${ind.share_pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gap: '8px',
            paddingTop: '10px',
            borderTop: '1px solid var(--border-hairline)',
          }}
        >
          <div className="dg-compare-row__labels">
            <span className="type-caption" style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Zap size={13} />
              <span>
                {aa.dashEl5OrdersLabel(
                  summary.orders_summary.total_orders,
                  formatPrice(summary.orders_summary.total_sandbox_value_vnd)
                )}
              </span>
            </span>
            <Link href="/admin/orders" className="type-caption" style={{ color: 'var(--accent)', fontWeight: 700 }}>
              {aa.dashEl5DetailsLink}
            </Link>
          </div>
          <div className="dg-chip-metrics">
            {orderMix.map((st) => (
              <div key={st.label} className="dg-mini-stat">
                <span className="type-caption">{st.label}</span>
                <strong className="type-mono">
                  {st.count}{' '}
                  <span style={{ opacity: 0.7 }}>
                    ({summary.orders_summary.total_orders > 0 ? st.pct : 0}%)
                  </span>
                </strong>
              </div>
            ))}
          </div>
          {recentOrders.length > 0 && (
            <p className="type-caption" style={{ margin: 0 }}>
              {aa.dashEl5LatestOrder}:{' '}
              <code className="type-mono">{recentOrders[0].order_code}</code> —{' '}
              <strong className="type-price">
                {formatPrice(recentOrders[0].total_vnd)}
              </strong>
            </p>
          )}
        </div>
      </article>
    </section>
  );
}
