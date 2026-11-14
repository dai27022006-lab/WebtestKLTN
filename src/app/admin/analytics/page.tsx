'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/components/providers/AuthProvider';
import {
  formatDateTimeVi,
  formatVnd,
  ORDER_STATUS_META,
} from '@/components/shared/formatters';
import { EVENT_CATALOG, EVENT_NAMES } from '@/lib/tracking/events';
import { adminGetDashboard, adminListOrders } from '@/services';
import type { AdminDashboardSummaryDto, OrderDto } from '@/types/api';

export default function AdminAnalyticsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [includeSimulated, setIncludeSimulated] = useState(false);
  const [summary, setSummary] = useState<AdminDashboardSummaryDto | null>(null);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  if (isAuthLoading) {
    return (
      <section className="section section--compact">
        <div className="container">
          <div className="skeleton-box" style={{ height: '260px' }} />
        </div>
      </section>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <section className="section section--compact">
        <div className="container container--narrow">
          <div className="surface-card" style={{ display: 'grid', gap: '14px' }}>
            <span className="type-eyebrow">Khu vực Quản trị (F10)</span>
            <h1 className="type-h2" style={{ margin: 0 }}>
              Yêu cầu đăng nhập tài khoản Admin
            </h1>
            <p className="type-body-sm" style={{ margin: 0 }}>
              Dashboard phân tích số liệu A/B và chi phí RAG chỉ mở cho tài
              khoản có quyền <code className="type-mono">role = admin</code>{' '}
              (tài khoản demo: <code className="type-mono">admin@digitalstore.local</code>).
            </p>
            <div>
              <Link href="/auth" className="btn btn--primary">
                Đi tới trang Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const coreEvents = EVENT_NAMES.filter((name) => !EVENT_CATALOG[name].chatOnly);
  const chatOnlyEvents = EVENT_NAMES.filter(
    (name) => EVENT_CATALOG[name].chatOnly
  );

  return (
    <section className="section section--compact">
      <div className="container" style={{ display: 'grid', gap: '24px' }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-header__copy">
            <span className="type-eyebrow">
              Dashboard Phân tích & Tracking (F10)
            </span>
            <h1 className="type-h1">Đối chứng A/B, Chi phí RAG & Đơn Sandbox</h1>
          </div>

          <div
            className="chip-row"
            role="group"
            aria-label="Lọc dữ liệu mô phỏng"
          >
            <button
              type="button"
              className="chip"
              aria-pressed={!includeSimulated}
              onClick={() => setIncludeSimulated(false)}
            >
              Chỉ dữ liệu thật (is_simulated = false)
            </button>
            <button
              type="button"
              className="chip"
              aria-pressed={includeSimulated}
              onClick={() => setIncludeSimulated(true)}
            >
              Bao gồm dữ liệu mô phỏng
            </button>
          </div>
        </div>

        {/* Mandatory Static Simulated Data Warning Banner */}
        {includeSimulated && (
          <div className="callout callout--warning" role="alert">
            <strong>
              ĐANG HIỂN THỊ DỮ LIỆU MÔ PHỎNG (is_simulated = true)
            </strong>
            <span>
              Tuyệt đối không dùng bộ số liệu mô phỏng này để kết luận báo cáo
              thí nghiệm đồ án tốt nghiệp.
            </span>
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
                style={{ height: '120px' }}
              />
            ))}
          </div>
        ) : (
          <>
            {/* 1. KPI Summary */}
            <div className="kpi-grid">
              <div className="surface-card" style={{ display: 'grid', gap: '6px' }}>
                <span className="type-caption">Tổng người tham gia</span>
                <strong className="type-mono" style={{ fontSize: '2rem' }}>
                  {summary.total_participants}
                </strong>
                <span className="type-caption">
                  Đã đồng ý (Consent): {summary.consented_participants}
                </span>
              </div>

              <div className="surface-card" style={{ display: 'grid', gap: '6px' }}>
                <span className="type-caption">Lượt kịch bản hoàn thành</span>
                <strong className="type-mono" style={{ fontSize: '2rem' }}>
                  {summary.total_completed_runs}
                </strong>
                <span className="type-caption">Từ bảng scenario_runs</span>
              </div>

              <div className="surface-card" style={{ display: 'grid', gap: '6px' }}>
                <span className="type-caption">Ý định mua Sandbox (Paid)</span>
                <strong className="type-mono" style={{ fontSize: '2rem' }}>
                  {summary.orders_summary.paid_orders} /{' '}
                  {summary.orders_summary.total_orders}
                </strong>
                <span className="type-caption">
                  Giá trị sandbox:{' '}
                  {formatVnd(summary.orders_summary.total_sandbox_value_vnd)}
                </span>
              </div>

              <div className="surface-card" style={{ display: 'grid', gap: '6px' }}>
                <span className="type-caption">Tổng chi phí LLM / RAG</span>
                <strong className="type-mono" style={{ fontSize: '2rem' }}>
                  ${summary.rag_metrics.total_cost_usd.toFixed(4)}
                </strong>
                <span className="type-caption">
                  P95 độ trễ: {summary.rag_metrics.p95_latency_ms} ms
                </span>
              </div>
            </div>

            {/* 2. A/B Variant Comparison Table */}
            <div className="surface-card" style={{ display: 'grid', gap: '14px' }}>
              <h2 className="type-h3" style={{ margin: 0 }}>
                So sánh hiệu quả hai nhánh: chatbot_on vs chatbot_off
              </h2>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Biến thể</th>
                      <th>Số lượt hoàn thành</th>
                      <th>Chọn đúng đáp án</th>
                      <th>Tỉ lệ đúng</th>
                      <th>Thời gian TB (giây)</th>
                      <th>Độ tự tin TB (1–5)</th>
                      <th>Ý định mua Sandbox</th>
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
                        <td className="type-mono">
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

            {/* 3. RAG Metrics & 14-Event Funnel Matrix */}
            <div className="two-col-ops">
              <div className="surface-card" style={{ display: 'grid', gap: '14px' }}>
                <h2 className="type-h3" style={{ margin: 0 }}>
                  Phễu 14 sự kiện chuẩn (Tracking Spec)
                </h2>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <span className="type-caption">
                    11 sự kiện chung cho cả hai nhóm ({coreEvents.length})
                  </span>
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Tên sự kiện</th>
                          <th>Thời điểm kích hoạt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coreEvents.map((name) => (
                          <tr key={name}>
                            <td className="type-mono">{name}</td>
                            <td>{EVENT_CATALOG[name].trigger}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <span className="type-caption" style={{ marginTop: '8px' }}>
                    3 sự kiện chỉ phát sinh khi chatbot_on (
                    {chatOnlyEvents.length})
                  </span>
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <tbody>
                        {chatOnlyEvents.map((name) => (
                          <tr key={name}>
                            <td className="type-mono">{name}</td>
                            <td>{EVENT_CATALOG[name].trigger}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="surface-card" style={{ display: 'grid', gap: '14px' }}>
                <h2 className="type-h3" style={{ margin: 0 }}>
                  Hiệu năng & Kinh tế đơn vị Chatbot
                </h2>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <tbody>
                      <tr>
                        <td>Tổng lượt bot trả lời</td>
                        <td className="type-mono">
                          {summary.rag_metrics.total_assistant_messages}
                        </td>
                      </tr>
                      <tr>
                        <td>Độ trễ trung bình</td>
                        <td className="type-mono">
                          {summary.rag_metrics.avg_latency_ms} ms
                        </td>
                      </tr>
                      <tr>
                        <td>Độ trễ P95</td>
                        <td className="type-mono">
                          {summary.rag_metrics.p95_latency_ms} ms
                        </td>
                      </tr>
                      <tr>
                        <td>Tổng Token đã dùng</td>
                        <td className="type-mono">
                          {summary.rag_metrics.total_tokens_used}
                        </td>
                      </tr>
                      <tr>
                        <td>Chi phí TB / tin nhắn</td>
                        <td className="type-mono">
                          ${summary.rag_metrics.avg_cost_per_message_usd.toFixed(6)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 4. Recent Orders Table */}
            <div className="surface-card" style={{ display: 'grid', gap: '14px' }}>
              <h2 className="type-h3" style={{ margin: 0 }}>
                Đơn hàng Sandbox gần đây
              </h2>
              {orders.length === 0 ? (
                <p className="type-body-sm" style={{ margin: 0 }}>
                  Chưa có đơn hàng nào khớp bộ lọc hiện tại.
                </p>
              ) : (
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Trạng thái</th>
                        <th>Tổng tiền</th>
                        <th>Loại dữ liệu</th>
                        <th>Ngày tạo</th>
                        <th>Mở</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const statusMeta = ORDER_STATUS_META[order.status];
                        return (
                          <tr key={order.id}>
                            <td className="type-mono">{order.order_code}</td>
                            <td>
                              <span
                                className={`badge badge--${statusMeta.tone}`}
                              >
                                {statusMeta.label}
                              </span>
                            </td>
                            <td className="type-price">
                              {formatVnd(order.total_vnd)}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  order.is_simulated
                                    ? 'badge--warning'
                                    : 'badge--success'
                                }`}
                              >
                                {order.is_simulated ? 'Mô phỏng' : 'Thật'}
                              </span>
                            </td>
                            <td className="type-caption">
                              {formatDateTimeVi(order.created_at)}
                            </td>
                            <td>
                              <Link
                                href={`/orders/${order.id}`}
                                className="btn btn--secondary btn--sm"
                              >
                                Xem
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
    </section>
  );
}
