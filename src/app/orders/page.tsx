'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ArrowRight,
  CheckCircle2,
  Download,
  RefreshCw,
  ShoppingBag,
} from '@/components/icons/DreamIcons';
import {
  formatDateTimeVi,
  formatVnd,
  ORDER_STATUS_META,
} from '@/components/shared/formatters';
import { EditorialEmptyIllustration } from '@/components/visual/EditorialEmptyIllustration';
import { listOrders } from '@/services';
import { useExperiment } from '@/state';
import type { OrderDto, OrderStatus } from '@/types/api';

type OrderFilterValue = 'all' | 'paid' | 'pending' | 'failed';

const STATUS_FILTERS: Array<{ value: OrderFilterValue; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'failed', label: 'Thất bại' },
];

export default function OrdersLedgerPage() {
  const { visitorId } = useExperiment();

  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderFilterValue>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOrders = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await listOrders(visitorId || undefined, signal);
      if (signal?.aborted) return;
      setIsLoading(false);

      if (!res.ok) {
        setErrorMessage(res.error.message);
        return;
      }

      setOrders(res.data);
    },
    [visitorId]
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void loadOrders(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadOrders]);

  const countsByStatus = useMemo(() => {
    const counts: Record<OrderFilterValue, number> = {
      all: orders.length,
      paid: 0,
      pending: 0,
      failed: 0,
    };
    for (const order of orders) {
      if (order.status === 'paid') counts.paid += 1;
      else if (order.status === 'pending') counts.pending += 1;
      else if (order.status === 'failed' || order.status === 'cancelled') {
        counts.failed += 1;
      }
    }
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    if (statusFilter === 'failed') {
      return orders.filter(
        (o) => o.status === 'failed' || o.status === 'cancelled'
      );
    }
    return orders.filter((o) => o.status === (statusFilter as OrderStatus));
  }, [orders, statusFilter]);

  return (
    <section className="section section--compact">
      <div className="container orders-ledger">
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-header__copy">
            <span className="type-eyebrow">Thư viện đơn hàng &amp; Tải file</span>
            <h1 className="type-h1">Lịch sử đơn hàng đã mua</h1>
            <p className="type-body-sm">
              Theo dõi các đơn hàng thử nghiệm và mở kho link tải an toàn (hạn 7
              ngày, tối đa 5 lượt tải cho mỗi gói).
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              disabled={isLoading}
              onClick={() => void loadOrders()}
            >
              <RefreshCw size={14} />
              <span>Làm mới</span>
            </button>
            <Link href="/products" className="dg-btn-purchase dg-btn-sm">
              <ShoppingBag size={14} />
              <span>Khám phá sản phẩm</span>
            </Link>
          </div>
        </div>

        <div className="callout callout--info">
          <span>
            Hệ thống đang chạy chế độ đặt hàng thử nghiệm (Sandbox) — mọi đơn
            hàng đều phục vụ kiểm tra quy trình và nhận file ngay mà không bị
            trừ tiền thật.
          </span>
        </div>

        <div className="orders-ledger__filters">
          <div
            className="chip-row"
            role="group"
            aria-label="Lọc đơn hàng theo trạng thái"
          >
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                className="chip"
                aria-pressed={statusFilter === item.value}
                onClick={() => setStatusFilter(item.value)}
              >
                <span>{item.label}</span>
                <span
                  className="type-mono"
                  style={{ marginLeft: '6px', opacity: 0.78 }}
                >
                  ({countsByStatus[item.value]})
                </span>
              </button>
            ))}
          </div>

          <span className="type-caption type-mono">
            Hiển thị {filteredOrders.length} / {orders.length} đơn
          </span>
        </div>

        {errorMessage && (
          <div className="callout callout--danger" role="alert">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <span>{errorMessage}</span>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => void loadOrders()}
              >
                Thử tải lại
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="orders-ledger__list">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="skeleton-box"
                style={{ height: '116px' }}
              />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            className="surface-card dg-panel"
            style={{
              textAlign: 'center',
              paddingBlock: '48px',
              display: 'grid',
              gap: '16px',
              justifyItems: 'center',
            }}
          >
            <EditorialEmptyIllustration title="Chưa có đơn hàng phù hợp" />
            <h2 className="type-h3" style={{ margin: 0 }}>
              {orders.length === 0
                ? 'Bạn chưa có đơn hàng nào trong phiên này'
                : 'Không có đơn hàng nào thuộc trạng thái đang chọn'}
            </h2>
            <p className="type-body-sm" style={{ margin: 0, maxWidth: '46ch' }}>
              {orders.length === 0
                ? 'Hãy chọn gói Template Website, Prompt Pack AI hoặc Workflow tự động và thử xác nhận đơn để nhận link tải file ngay.'
                : 'Bấm chọn Tất cả để xem toàn bộ lịch sử đơn hàng của bạn.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/products" className="dg-btn-purchase">
                <span>Khám phá sản phẩm</span>
                <ArrowRight size={15} />
              </Link>
              {orders.length > 0 && statusFilter !== 'all' && (
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setStatusFilter('all')}
                >
                  Xem tất cả đơn hàng
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="orders-ledger__list">
            {filteredOrders.map((order) => {
              const statusMeta = ORDER_STATUS_META[order.status];
              return (
                <article key={order.id} className="orders-ledger__row dg-panel">
                  <div style={{ display: 'grid', gap: '8px', minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <strong
                        className="type-mono"
                        style={{ fontSize: '1rem', color: 'var(--ink)' }}
                      >
                        {order.order_code}
                      </strong>
                      <span className={`badge badge--${statusMeta.tone}`}>
                        {order.status === 'paid' && <CheckCircle2 size={12} />}
                        <span>{statusMeta.label}</span>
                      </span>
                      <span className="type-caption">
                        {formatDateTimeVi(order.created_at)}
                      </span>
                    </div>

                    <ul
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: 'none',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px 14px',
                      }}
                    >
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className="type-body-sm"
                          style={{ color: 'var(--ink-soft)' }}
                        >
                          {item.product_name_snapshot}{' '}
                          <span className="type-mono">× {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'grid', gap: '4px' }}>
                    <span className="type-caption">Tổng giá trị đơn</span>
                    <strong
                      className="type-price"
                      style={{ fontSize: '1.25rem', color: 'var(--accent)' }}
                    >
                      {formatVnd(order.total_vnd)}
                    </strong>
                    {order.status === 'paid' && order.download_grants && (
                      <span className="type-caption type-mono">
                        {order.download_grants.length} gói sẵn sàng tải
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Link
                      href={`/orders/${order.id}`}
                      className={
                        order.status === 'paid'
                          ? 'dg-btn-purchase dg-btn-sm'
                          : 'btn btn--secondary btn--sm'
                      }
                    >
                      {order.status === 'paid' ? (
                        <Download size={14} />
                      ) : (
                        <ArrowRight size={14} />
                      )}
                      <span>Xem đơn &amp; Tải file</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
