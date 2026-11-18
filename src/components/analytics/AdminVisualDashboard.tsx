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
import { formatVnd } from '@/components/shared/formatters';
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
  const onVariant = summary.variants.find((v) => v.variant === 'chatbot_on');
  const offVariant = summary.variants.find((v) => v.variant === 'chatbot_off');

  const onAccuracyPct = onVariant ? Math.round(onVariant.accuracy_rate * 100) : 0;
  const offAccuracyPct = offVariant ? Math.round(offVariant.accuracy_rate * 100) : 0;
  const accuracyDelta = onAccuracyPct - offAccuracyPct;

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
      label: 'Tỉ lệ chọn đúng (%)',
      onLabel: `${onAccuracyPct}%`,
      offLabel: `${offAccuracyPct}%`,
      onPct: onAccuracyPct,
      offPct: offAccuracyPct,
    },
    {
      label: 'Thời gian TB (giây)',
      onLabel: `${(onVariant?.avg_duration_seconds ?? 0).toFixed(1)}s`,
      offLabel: `${(offVariant?.avg_duration_seconds ?? 0).toFixed(1)}s`,
      onPct: Math.round(((onVariant?.avg_duration_seconds ?? 0) / maxDuration) * 100),
      offPct: Math.round(((offVariant?.avg_duration_seconds ?? 0) / maxDuration) * 100),
    },
    {
      label: 'Độ tự tin (1–5)',
      onLabel: `${(onVariant?.avg_confidence_score ?? 0).toFixed(2)} / 5`,
      offLabel: `${(offVariant?.avg_confidence_score ?? 0).toFixed(2)} / 5`,
      onPct: Math.round(((onVariant?.avg_confidence_score ?? 0) / 5) * 100),
      offPct: Math.round(((offVariant?.avg_confidence_score ?? 0) / 5) * 100),
    },
    {
      label: 'Ý định mua Sandbox',
      onLabel: `${onVariant?.sandbox_purchase_count ?? 0} đơn`,
      offLabel: `${offVariant?.sandbox_purchase_count ?? 0} đơn`,
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
      label: 'Đã thanh toán',
      count: summary.orders_breakdown.paid,
      pct: Math.round((summary.orders_breakdown.paid / totalOrders) * 100),
      toneClass: 'is-emerald',
    },
    {
      label: 'Chờ thanh toán',
      count: summary.orders_breakdown.pending,
      pct: Math.round((summary.orders_breakdown.pending / totalOrders) * 100),
      toneClass: 'is-copper',
    },
    {
      label: 'Thất bại / Hủy',
      count: summary.orders_breakdown.failed_or_cancelled,
      pct: Math.round(
        (summary.orders_breakdown.failed_or_cancelled / totalOrders) * 100
      ),
      toneClass: 'is-info',
    },
  ];

  return (
    <section aria-label="Bảng biểu đồ thống kê 5 yếu tố Admin" className="dg-dash-bento">
      {/* Yếu tố 1: Ring Đối chứng A/B & Tỉ lệ Đồng ý */}
      <article className="surface-card dg-panel dg-dash-card dg-dash-span-5">
        <div className="dg-dash-card__head">
          <div className="dg-dash-card__title-wrap">
            <span className="dg-dash-eyebrow">Yếu tố 1 • Độ chính xác &amp; Đồng thuận</span>
            <h2 className="type-h3" style={{ margin: 0 }}>
              Hiệu quả Trợ lý &amp; Tỉ lệ Tham gia
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
            Δ {accuracyDelta >= 0 ? `+${accuracyDelta}` : accuracyDelta} điểm %
          </span>
        </div>

        <div className="dg-ring-pair">
          <ProgressRing
            value={onAccuracyPct}
            label="Đúng (Có Trợ lý)"
            centerPrimary={`${onAccuracyPct}%`}
            centerSecondary={`${onVariant?.correct_runs ?? 0}/${onVariant?.completed_runs ?? 0}`}
            valueText={`Độ chính xác Có Trợ lý ${onAccuracyPct}%`}
            tone="accent"
            size={112}
            thickness={11}
          />
          <ProgressRing
            value={consentPct}
            label="Tỉ lệ Consent"
            centerPrimary={`${consentPct}%`}
            centerSecondary={`${summary.consented_participants}/${summary.total_participants}`}
            valueText={`Tỉ lệ đồng ý tham gia ${consentPct}%`}
            tone="copper"
            size={112}
            thickness={11}
          />
        </div>

        <p className="type-caption" style={{ margin: 0 }}>
          Đối chứng: nhánh <code className="type-mono">chatbot_off</code> đạt{' '}
          <strong className="type-mono">{offAccuracyPct}%</strong> (
          {offVariant?.correct_runs ?? 0}/{offVariant?.completed_runs ?? 0} lượt).
        </p>
      </article>

      {/* Yếu tố 2: Biểu đồ Cột Đôi So sánh Hai Nhánh A/B */}
      <article className="surface-card dg-panel dg-dash-card dg-dash-span-7">
        <div className="dg-dash-card__head">
          <div className="dg-dash-card__title-wrap">
            <span className="dg-dash-eyebrow">Yếu tố 2 • So sánh Hai Nhánh AB / BA</span>
            <h2 className="type-h3" style={{ margin: 0 }}>
              Tương quan chatbot_on vs chatbot_off
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
                  <strong style={{ color: 'var(--accent-copper)' }}>{metric.offLabel}</strong>
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

      {/* Yếu tố 3: Phễu Chuyển đổi 6 Chặng */}
      <article className="surface-card dg-panel dg-dash-card dg-dash-span-4">
        <div className="dg-dash-card__head">
          <div className="dg-dash-card__title-wrap">
            <span className="dg-dash-eyebrow">Yếu tố 3 • Phễu Hành Vi Thật</span>
            <h2 className="type-h3" style={{ margin: 0 }}>
              Chuyển đổi 6 Chặng
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
                  {stage.label}
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

      {/* Yếu tố 4: Kinh tế AI (Gemini vs Stub) & Xu hướng 7 ngày */}
      <article className="surface-card dg-panel dg-dash-card dg-dash-span-4">
        <div className="dg-dash-card__head">
          <div className="dg-dash-card__title-wrap">
            <span className="dg-dash-eyebrow">Yếu tố 4 • Xu hướng &amp; Kinh tế AI</span>
            <h2 className="type-h3" style={{ margin: 0 }}>
              Hoạt động 7 ngày &amp; LLM Mix
            </h2>
          </div>
          <Link href="/admin/chat-logs" className="btn btn--secondary btn--sm">
            <Cpu size={13} />
            <span>Nhật ký AI</span>
          </Link>
        </div>

        {/* AI Mix Split Bar */}
        <div style={{ display: 'grid', gap: '8px' }}>
          <div className="dg-compare-row__labels">
            <span className="type-caption">
              Tỉ lệ phản hồi ({totalAiMsgs} lượt)
            </span>
            <span className="badge badge--success type-mono">
              <ShieldCheck size={12} />
              <span>Grounding {groundingPct}%</span>
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

        {/* 7-Day Column Trend */}
        <div style={{ display: 'grid', gap: '8px' }}>
          <div className="dg-compare-row__labels">
            <span className="type-caption" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Rocket size={13} />
              <span>Hoạt động theo ngày (Lượt xong + Chat + Đơn)</span>
            </span>
          </div>
          <div className="dg-col-chart" role="list" aria-label="Biểu đồ hoạt động theo ngày">
            {trendPoints.map((pt) => {
              const total = pt.completed_runs + pt.assistant_messages + pt.orders_count;
              const heightPct = total > 0 ? Math.max(10, Math.round((total / maxDailyActivity) * 100)) : 4;
              return (
                <div
                  key={pt.date}
                  role="listitem"
                  className="dg-col-item"
                  title={`${pt.date}: ${pt.completed_runs} lượt A/B, ${pt.assistant_messages} chat AI, ${pt.orders_count} đơn (${formatVnd(pt.paid_revenue_vnd)})`}
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

      {/* Yếu tố 5: Cơ cấu Ngành Shop & Trạng thái Đơn Hàng */}
      <article className="surface-card dg-panel dg-dash-card dg-dash-span-4">
        <div className="dg-dash-card__head">
          <div className="dg-dash-card__title-wrap">
            <span className="dg-dash-eyebrow">Yếu tố 5 • Phân Khúc &amp; Giao Dịch</span>
            <h2 className="type-h3" style={{ margin: 0 }}>
              Ngành Shop &amp; Trạng thái Đơn
            </h2>
          </div>
          <Layers size={18} style={{ color: 'var(--accent)' }} />
        </div>

        <div style={{ display: 'grid', gap: '10px' }}>
          <span className="type-caption" style={{ fontWeight: 700 }}>
            Ngành hàng tham gia khảo sát
          </span>
          {summary.industry_breakdown.length === 0 ? (
            <p className="type-caption" style={{ margin: 0 }}>
              Chưa có dữ liệu hồ sơ ngành hàng từ phiên khảo sát.
            </p>
          ) : (
            <div className="dg-funnel-list">
              {summary.industry_breakdown.map((ind) => (
                <div key={ind.key} className="dg-funnel-step">
                  <div className="dg-funnel-step__meta">
                    <span>{ind.label}</span>
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
              <span>Đơn Sandbox ({summary.orders_summary.total_orders}) • {formatVnd(summary.orders_summary.total_sandbox_value_vnd)}</span>
            </span>
            <Link href="/admin/orders" className="type-caption" style={{ color: 'var(--accent)', fontWeight: 700 }}>
              Chi tiết →
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
              Đơn mới nhất:{' '}
              <code className="type-mono">{recentOrders[0].order_code}</code> —{' '}
              <strong className="type-price">{formatVnd(recentOrders[0].total_vnd)}</strong>
            </p>
          )}
        </div>
      </article>
    </section>
  );
}
