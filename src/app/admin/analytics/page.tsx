'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useLocale } from '@/components/providers/LocaleProvider';
import { AdminVisualDashboard } from '@/components/analytics/AdminVisualDashboard';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Cpu,
  Database,
  Download,
  FileCode2,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Timer,
  User,
} from '@/components/icons/DreamIcons';
import { useAuth } from '@/components/providers/AuthProvider';
import { EVENT_CATALOG, EVENT_NAMES } from '@/lib/tracking/events';
import {
  adminExportDatasetJson,
  adminGetDashboard,
  adminGetExportCsvUrl,
  adminListOrders,
} from '@/services';
import type {
  AdminDashboardSummaryDto,
  AdminExportDataset,
  OrderDto,
} from '@/types/api';

const EXPORT_DATASETS: Array<{
  dataset: AdminExportDataset;
  title: string;
  description: string;
  usageTag: string;
}> = [
  {
    dataset: 'scenario_runs',
    title: 'Lượt chạy kịch bản A/B',
    description:
      'Số liệu paired AB/BA phục vụ kiểm định McNemar và Wilcoxon signed-rank — khớp script analyze_experiment.py.',
    usageTag: 'McNemar • Wilcoxon',
  },
  {
    dataset: 'events',
    title: 'Nhật ký 14 sự kiện hành vi',
    description:
      'Toàn bộ 14 sự kiện chuẩn kèm participant_code, assignment_id, visitor_id cho phễu chuyển đổi & phân cụm K-Means.',
    usageTag: 'Funnel • K-Means',
  },
  {
    dataset: 'rag_logs',
    title: 'Nhật ký Gemini RAG & Chi phí',
    description:
      'Prompt version, model, số ID gợi ý/truy xuất, độ trễ (ms), tokens và chi phí truy vấn cho Unit Economics.',
    usageTag: 'Latency • Unit Economics',
  },
];

export default function AdminAnalyticsPage() {
  const { admin, formatPrice, formatDate, getOrderStatusMeta } = useLocale();
  const aa = admin.analytics;
  const { user, isLoading: isAuthLoading } = useAuth();

  const [includeSimulated, setIncludeSimulated] = useState(false);
  const [summary, setSummary] = useState<AdminDashboardSummaryDto | null>(null);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exportingByDataset, setExportingByDataset] = useState<
    Record<AdminExportDataset, boolean>
  >({
    scenario_runs: false,
    events: false,
    rag_logs: false,
  });
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadAnalytics = useCallback(
    async (simFlag: boolean, signal?: AbortSignal) => {
      setIsLoading(true);
      setErrorMessage(null);

      const [dashRes, ordersRes] = await Promise.all([
        adminGetDashboard(simFlag, signal),
        adminListOrders({ include_simulated: simFlag, limit: 15 }, signal),
      ]);

      if (signal?.aborted) return;
      setIsLoading(false);

      if (!dashRes.ok) {
        setErrorMessage(dashRes.error.message);
        setSummary(null);
        return;
      }

      setSummary(dashRes.data);
      if (ordersRes.ok) {
        setOrders(ordersRes.data);
      }
    },
    []
  );

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user || user.role !== 'admin') return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      void loadAnalytics(includeSimulated, controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [isAuthLoading, user, includeSimulated, loadAnalytics]);

  const handleToggleSimulated = (nextValue: boolean) => {
    setIncludeSimulated(nextValue);
    setExportError(null);
    setExportFeedback(null);
  };

  const handleExportJson = async (dataset: AdminExportDataset) => {
    if (exportingByDataset[dataset]) return;

    setExportError(null);
    setExportFeedback(null);
    setExportingByDataset((prev) => ({ ...prev, [dataset]: true }));

    let objectUrl: string | null = null;
    try {
      const res = await adminExportDatasetJson({
        dataset,
        include_simulated: includeSimulated,
      });

      if (!isMountedRef.current) return;

      if (!res.ok) {
        setExportError(
          res.error?.message || 'Không thể xuất dữ liệu JSON ẩn danh.'
        );
        return;
      }

      if (
        !res.data ||
        !Array.isArray(res.data.rows) ||
        typeof window === 'undefined' ||
        typeof document === 'undefined' ||
        typeof URL === 'undefined' ||
        typeof URL.createObjectURL !== 'function'
      ) {
        setExportError(
          'Trình duyệt hoặc dữ liệu phản hồi không hỗ trợ tạo tệp JSON.'
        );
        return;
      }

      const jsonPayload = JSON.stringify(res.data, null, 2);
      const blob = new Blob([jsonPayload], {
        type: 'application/json;charset=utf-8',
      });
      objectUrl = URL.createObjectURL(blob);

      const dateTag = (
        res.data.exported_at || new Date().toISOString()
      ).slice(0, 10);
      const simSuffix = res.data.include_simulated ? 'with-sim' : 'real-only';
      const filename = `dsa-${dataset}-${simSuffix}-${dateTag}.json`;

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();

      setExportFeedback(
        `Đã tải xuống ${filename} (${res.data.total_rows} bản ghi ẩn danh, 0 PII).`
      );
    } catch {
      if (isMountedRef.current) {
        setExportError(
          'Không thể tạo tệp JSON để tải xuống. Vui lòng thử lại.'
        );
      }
    } finally {
      if (objectUrl && typeof URL.revokeObjectURL === 'function') {
        const urlToRevoke = objectUrl;
        window.setTimeout(() => {
          URL.revokeObjectURL(urlToRevoke);
        }, 1000);
      }
      if (isMountedRef.current) {
        setExportingByDataset((prev) => ({ ...prev, [dataset]: false }));
      }
    }
  };

  const coreEvents = EVENT_NAMES.filter((name) => !EVENT_CATALOG[name].chatOnly);
  const chatOnlyEvents = EVENT_NAMES.filter(
    (name) => EVENT_CATALOG[name].chatOnly
  );

  const consentRate =
    summary && summary.total_participants > 0
      ? Math.round(
          (summary.consented_participants / summary.total_participants) * 100
        )
      : 0;

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* 1. Executive Hero Banner */}
      <div className="dg-exec-banner dg-dark-band">
        <div className="dg-exec-banner-grid" aria-hidden="true" />
        <div className="dg-exec-banner-content">
          <div className="dg-exec-banner-top">
            <div>
              <div className="dg-exec-pills">
                <span className="dg-exec-pill">
                  <span className="dg-dot" />
                  <span>{aa.pillLive}</span>
                </span>
                <span className="dg-exec-pill">
                  <Sparkles size={12} />
                  <span>
                    {includeSimulated ? aa.pillSim : aa.pillReal}
                  </span>
                </span>
              </div>
              <h1>{aa.heroTitle}</h1>
              <p>{aa.heroDesc}</p>
            </div>

            <div className="dg-exec-actions">
              <button
                type="button"
                className="dg-exec-btn-light"
                onClick={() => void loadAnalytics(includeSimulated)}
                disabled={isLoading}
              >
                <RefreshCw size={14} />
                <span>{isLoading ? aa.refreshingBtn : aa.refreshBtn}</span>
              </button>
            </div>
          </div>

          <div className="dg-exec-controls">
            <div
              className="dg-exec-segmented"
              role="group"
              aria-label={aa.kpiSource}
            >
              <button
                type="button"
                aria-pressed={!includeSimulated}
                className={!includeSimulated ? 'is-active' : ''}
                onClick={() => handleToggleSimulated(false)}
              >
                {aa.toggleRealOnly}
              </button>
              <button
                type="button"
                aria-pressed={includeSimulated}
                className={includeSimulated ? 'is-active' : ''}
                onClick={() => handleToggleSimulated(true)}
              >
                {aa.toggleWithSim}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Data Warning Banner */}
      {includeSimulated && (
        <div className="callout callout--warning" role="alert">
          <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>{aa.simWarningTitle}</span>
          </strong>
          <span>{aa.simWarningDesc}</span>
        </div>
      )}

      {errorMessage && (
        <div className="callout callout--danger" role="alert">
          {errorMessage}
        </div>
      )}

      {isLoading || !summary ? (
        <div className="kpi-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="skeleton-box"
              style={{ height: '160px' }}
            />
          ))}
        </div>
      ) : (
        <>
          {/* 2. 4 Executive KPI Cards */}
          <div className="kpi-grid">
            <article className="dg-kpi-card dg-panel">
              <div className="dg-kpi-top">
                <span className="dg-kpi-icon dg-grad-1">
                  <User size={18} />
                </span>
                <span className="badge badge--accent type-mono">
                  {aa.kpiConsentTag(consentRate)}
                </span>
              </div>
              <span className="dg-kpi-label">{aa.kpiParticipants}</span>
              <strong className="dg-kpi-value type-mono">
                {summary.total_participants}
              </strong>
              <ul className="dg-kpi-meta">
                <li>
                  <span>{aa.kpiConsented}</span>
                  <strong className="type-mono">
                    {summary.consented_participants}
                  </strong>
                </li>
                <li>
                  <span>{aa.kpiSource}</span>
                  <strong className="type-mono">
                    {summary.include_simulated ? aa.kpiSourceSim : aa.kpiSourceReal}
                  </strong>
                </li>
              </ul>
            </article>

            <article className="dg-kpi-card dg-panel">
              <div className="dg-kpi-top">
                <span className="dg-kpi-icon dg-grad-2">
                  <Timer size={18} />
                </span>
                <span className="badge badge--success">AB / BA</span>
              </div>
              <span className="dg-kpi-label">{aa.kpiCompletedRuns}</span>
              <strong className="dg-kpi-value type-mono">
                {summary.total_completed_runs}
              </strong>
              <ul className="dg-kpi-meta">
                <li>
                  <span>Table</span>
                  <strong className="type-mono">scenario_runs</strong>
                </li>
                <li>
                  <span>{aa.kpiMethod}</span>
                  <strong>Within-subject</strong>
                </li>
              </ul>
            </article>

            <article className="dg-kpi-card dg-panel">
              <div className="dg-kpi-top">
                <span className="dg-kpi-icon dg-grad-3">
                  <ShoppingBag size={18} />
                </span>
                <span className="badge badge--info">Sandbox</span>
              </div>
              <span className="dg-kpi-label">{aa.kpiOrdersTitle}</span>
              <strong className="dg-kpi-value type-mono">
                {summary.orders_summary.paid_orders} /{' '}
                {summary.orders_summary.total_orders}
              </strong>
              <ul className="dg-kpi-meta">
                <li>
                  <span>{aa.kpiSandboxValue}</span>
                  <strong className="type-price">
                    {formatPrice(summary.orders_summary.total_sandbox_value_vnd)}
                  </strong>
                </li>
                <li>
                  <span>{aa.kpiGateway}</span>
                  <strong className="type-mono">mock_sandbox</strong>
                </li>
              </ul>
            </article>

            <article className="dg-kpi-card dg-panel">
              <div className="dg-kpi-top">
                <span className="dg-kpi-icon dg-grad-4">
                  <Cpu size={18} />
                </span>
                <span className="badge type-mono">
                  P95 {summary.rag_metrics.p95_latency_ms}ms
                </span>
              </div>
              <span className="dg-kpi-label">{aa.kpiAiTitle}</span>
              <strong className="dg-kpi-value type-mono">
                ${summary.rag_metrics.total_cost_usd.toFixed(4)}
              </strong>
              <ul className="dg-kpi-meta">
                <li>
                  <span>{aa.kpiAvgCost}</span>
                  <strong className="type-mono">
                    ${summary.rag_metrics.avg_cost_per_message_usd.toFixed(6)}
                  </strong>
                </li>
                <li>
                  <span>{aa.kpiTotalTokens}</span>
                  <strong className="type-mono">
                    {summary.rag_metrics.total_tokens_used}
                  </strong>
                </li>
              </ul>
            </article>
          </div>

          {/* 2.5. Visual 5-Element Dashboard (Charts, Progress Rings, Funnel & Daily Trend) */}
          <AdminVisualDashboard summary={summary} recentOrders={orders} />

          {/* 3. A/B Variant Comparison Table */}
          <div className="surface-card dg-panel" style={{ display: 'grid', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <h2
                className="type-h3"
                style={{
                  margin: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <BarChart3 size={18} style={{ color: 'var(--accent)' }} />
                <span>{aa.compareTableTitle}</span>
              </h2>
              <span className="badge">{aa.compareTableUnit}</span>
            </div>
            <div
              tabIndex={0}
              role="region"
              aria-label={aa.compareTableTitle}
              className="data-table-wrap"
            >
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">{aa.colVariant}</th>
                    <th scope="col">{aa.colCompleted}</th>
                    <th scope="col">{aa.colCorrect}</th>
                    <th scope="col">{aa.colAccuracy}</th>
                    <th scope="col">{aa.colDuration}</th>
                    <th scope="col">{aa.colConfidence}</th>
                    <th scope="col">{aa.colPurchase}</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.variants.map((row) => (
                    <tr key={row.variant}>
                      <td>
                        <span
                          className={`badge ${
                            row.variant === 'chatbot_on'
                              ? 'badge--success'
                              : 'badge--info'
                          }`}
                        >
                          {row.variant}
                        </span>
                      </td>
                      <td className="type-mono">{row.completed_runs}</td>
                      <td className="type-mono">{row.correct_runs}</td>
                      <td
                        className="type-mono"
                        style={{ fontWeight: 700, color: 'var(--accent)' }}
                      >
                        {(row.accuracy_rate * 100).toFixed(1)}%
                      </td>
                      <td className="type-mono">
                        {row.avg_duration_seconds.toFixed(1)}s
                      </td>
                      <td className="type-mono">
                        {row.avg_confidence_score.toFixed(2)}
                      </td>
                      <td className="type-mono">
                        {row.sandbox_purchase_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. RAG Metrics & 14-Event Funnel Matrix */}
          <div className="two-col-ops">
            <div
              className="surface-card dg-panel"
              style={{ display: 'grid', gap: '14px' }}
            >
              <h2 className="type-h3" style={{ margin: 0 }}>
                {aa.eventsTitle}
              </h2>
              <div style={{ display: 'grid', gap: '8px' }}>
                <span className="type-caption">
                  {aa.eventsCoreSub(coreEvents.length)}
                </span>
                <div
                  tabIndex={0}
                  role="region"
                  aria-label={aa.eventsCoreSub(coreEvents.length)}
                  className="data-table-wrap"
                >
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th scope="col">{aa.colEventName}</th>
                        <th scope="col">{aa.colEventCount}</th>
                        <th scope="col">{aa.colEventTrigger}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coreEvents.map((name) => (
                        <tr key={name}>
                          <td className="type-mono">{name}</td>
                          <td className="type-mono" style={{ fontWeight: 700 }}>
                            {summary.event_counts?.[name] ?? 0}
                          </td>
                          <td>{EVENT_CATALOG[name].trigger}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <span className="type-caption" style={{ marginTop: '8px' }}>
                  {aa.eventsChatSub(chatOnlyEvents.length)}
                </span>
                <div
                  tabIndex={0}
                  role="region"
                  aria-label={aa.eventsChatSub(chatOnlyEvents.length)}
                  className="data-table-wrap"
                >
                  <table className="data-table">
                    <tbody>
                      {chatOnlyEvents.map((name) => (
                        <tr key={name}>
                          <td className="type-mono">{name}</td>
                          <td className="type-mono" style={{ fontWeight: 700 }}>
                            {summary.event_counts?.[name] ?? 0}
                          </td>
                          <td>{EVENT_CATALOG[name].trigger}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div
              className="surface-card dg-panel"
              style={{ display: 'grid', gap: '14px' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <h2
                  className="type-h3"
                  style={{
                    margin: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle2 size={18} style={{ color: 'var(--accent)' }} />
                  <span>{aa.unitEconTitle}</span>
                </h2>
                <Link href="/admin/chat-logs" className="btn btn--secondary btn--sm">
                  {aa.unitEconBtn}
                </Link>
              </div>
              <div
                tabIndex={0}
                role="region"
                aria-label={aa.unitEconTitle}
                className="data-table-wrap"
              >
                <table className="data-table">
                  <tbody>
                    <tr>
                      <td>{aa.ueTotalReplies}</td>
                      <td className="type-mono">
                        {summary.rag_metrics.total_assistant_messages}
                      </td>
                    </tr>
                    <tr>
                      <td>{aa.ueAvgLatency}</td>
                      <td className="type-mono">
                        {summary.rag_metrics.avg_latency_ms} ms
                      </td>
                    </tr>
                    <tr>
                      <td>{aa.ueP95Latency}</td>
                      <td className="type-mono">
                        {summary.rag_metrics.p95_latency_ms} ms
                      </td>
                    </tr>
                    <tr>
                      <td>{aa.ueTotalTokens}</td>
                      <td className="type-mono">
                        {summary.rag_metrics.total_tokens_used}
                      </td>
                    </tr>
                    <tr>
                      <td>{aa.ueAvgCost}</td>
                      <td className="type-mono">
                        ${summary.rag_metrics.avg_cost_per_message_usd.toFixed(6)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 5. Anonymized Research Dataset Export (CSV / JSON) */}
          <div className="surface-card dg-panel" style={{ display: 'grid', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'grid', gap: '4px' }}>
                <h2
                  className="type-h3"
                  style={{
                    margin: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Database size={18} style={{ color: 'var(--accent)' }} />
                  <span>{aa.exportTitle}</span>
                </h2>
                <p className="type-body-sm" style={{ margin: 0 }}>
                  {aa.exportDesc}
                </p>
              </div>

              <div className="chip-row">
                <span className="badge badge--accent">
                  <ShieldCheck size={13} />
                  <span>{aa.exportAnonymizedBadge}</span>
                </span>
                <span
                  className={`badge ${
                    includeSimulated ? 'badge--warning' : 'badge--success'
                  }`}
                >
                  {includeSimulated ? aa.pillSim : aa.pillReal}
                </span>
              </div>
            </div>

            {exportError && (
              <div className="callout callout--danger" role="alert">
                <strong>{exportError}</strong>
              </div>
            )}

            {exportFeedback && (
              <div className="callout callout--success" role="status">
                <span>{exportFeedback}</span>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                gap: '16px',
              }}
            >
              {EXPORT_DATASETS.map((item, idx) => {
                const isExporting = Boolean(exportingByDataset[item.dataset]);
                const csvUrl = adminGetExportCsvUrl({
                  dataset: item.dataset,
                  include_simulated: includeSimulated,
                });
                const dsCopy = aa.datasets[idx];

                return (
                  <article
                    key={item.dataset}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-hairline)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <code className="badge type-mono">{item.dataset}</code>
                      <span className="badge badge--info">{item.usageTag}</span>
                    </div>

                    <div style={{ display: 'grid', gap: '6px' }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: 'var(--ink)',
                        }}
                      >
                        {dsCopy?.title ?? item.title}
                      </h3>
                      <p className="type-body-sm" style={{ margin: 0 }}>
                        {dsCopy?.description ?? item.description}
                      </p>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginTop: 'auto',
                        paddingTop: '4px',
                      }}
                    >
                      <a
                        href={csvUrl}
                        download
                        className="btn btn--secondary btn--sm"
                      >
                        <Download size={14} />
                        <span>{aa.exportCsvBtn}</span>
                      </a>
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        disabled={isExporting}
                        onClick={() => void handleExportJson(item.dataset)}
                      >
                        <FileCode2 size={14} />
                        <span>
                          {isExporting ? aa.exportingJsonBtn : aa.exportJsonBtn}
                        </span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* 6. Recent Orders Table */}
          <div className="surface-card dg-panel" style={{ display: 'grid', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <h2 className="type-h3" style={{ margin: 0 }}>
                {aa.recentOrdersTitle}
              </h2>
              <Link href="/admin/orders" className="btn btn--secondary btn--sm">
                {aa.openOrdersBtn}
              </Link>
            </div>
            {orders.length === 0 ? (
              <p className="type-body-sm" style={{ margin: 0 }}>
                {aa.noOrders}
              </p>
            ) : (
              <div
                tabIndex={0}
                role="region"
                aria-label={aa.recentOrdersTitle}
                className="data-table-wrap"
              >
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">{aa.colOrderCode}</th>
                      <th scope="col">{aa.colOrderStatus}</th>
                      <th scope="col">{aa.colOrderTotal}</th>
                      <th scope="col">{aa.colOrderDataType}</th>
                      <th scope="col">{aa.colOrderDate}</th>
                      <th scope="col">{aa.colOrderOpen}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const statusMeta = getOrderStatusMeta(order.status);
                      return (
                        <tr key={order.id}>
                          <td className="type-mono">{order.order_code}</td>
                          <td>
                            <span className={`badge badge--${statusMeta.tone}`}>
                              {statusMeta.label}
                            </span>
                          </td>
                          <td className="type-price">
                            {formatPrice(order.total_vnd)}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                order.is_simulated
                                  ? 'badge--warning'
                                  : 'badge--success'
                              }`}
                            >
                              {order.is_simulated
                                ? aa.dataSimLabel
                                : aa.dataRealLabel}
                            </span>
                          </td>
                          <td className="type-caption">
                            {formatDate(order.created_at)}
                          </td>
                          <td>
                            <Link
                              href={`/orders/${order.id}`}
                              className="btn btn--secondary btn--sm"
                            >
                              {aa.viewBtn}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
