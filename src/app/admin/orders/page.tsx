'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Download,
  RefreshCw,
  ShoppingBag,
  X,
} from '@/components/icons/DreamIcons';
import { useLocale } from '@/components/providers/LocaleProvider';
import { adminListOrders } from '@/services';
import type { OrderDto, OrderStatus, PaginationMeta } from '@/types/api';

const STATUS_FILTERS: Array<{ value: '' | OrderStatus; label: string }> = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'failed', label: 'Thất bại' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const DIALOG_LIGHT_DISMISS = {
  closedby: 'any',
} as unknown as React.DialogHTMLAttributes<HTMLDialogElement>;

export default function AdminOrdersPage() {
  const {
    admin,
    chrome,
    commerce,
    formatPrice,
    formatDate,
    getOrderStatusMeta,
  } = useLocale();
  const ao = admin.orders;
  const aa = admin.analytics;
  const co = commerce.orders;
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [statusFilter, setStatusFilter] = useState<'' | OrderStatus>('');
  const [includeSimulated, setIncludeSimulated] = useState(false);
  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
  const drawerRef = useRef<HTMLDialogElement | null>(null);

  const loadOrders = useCallback(
    async (
      nextStatus: '' | OrderStatus,
      simFlag: boolean,
      nextPage: number,
      signal?: AbortSignal
    ) => {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await adminListOrders(
        {
          status: nextStatus || undefined,
          include_simulated: simFlag,
          page: nextPage,
          limit: 20,
        },
        signal
      );
      if (signal?.aborted) return;
      setIsLoading(false);

      if (!res.ok) {
        setErrorMessage(res.error.message);
        return;
      }

      setOrders(res.data);
      setMeta(res.meta ?? null);
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void loadOrders(statusFilter, includeSimulated, page, controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [statusFilter, includeSimulated, page, loadOrders]);

  useEffect(() => {
    const dialog = drawerRef.current;
    if (!dialog) return;

    const onClose = () => setSelectedOrder(null);
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

    dialog.addEventListener('close', onClose);
    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);

    return () => {
      dialog.removeEventListener('close', onClose);
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, []);

  const openOrderDrawer = (order: OrderDto) => {
    setSelectedOrder(order);
    drawerRef.current?.showModal();
  };

  const closeOrderDrawer = () => {
    drawerRef.current?.close();
    setSelectedOrder(null);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Header */}
      <div
        className="surface-card dg-panel"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'grid', gap: '4px' }}>
          <span className="type-eyebrow">{ao.title}</span>
          <h1 id="admin-orders-table-title" className="type-h2" style={{ margin: 0 }}>
            {ao.title} ({meta?.total ?? orders.length})
          </h1>
          <p className="type-body-sm" style={{ margin: 0 }}>
            {ao.subtitle}
          </p>
        </div>

        <button
          type="button"
          className="btn btn--secondary btn--sm"
          disabled={isLoading}
          onClick={() => void loadOrders(statusFilter, includeSimulated, page)}
        >
          <RefreshCw size={14} />
          <span>{chrome.common.refresh}</span>
        </button>
      </div>

      {/* Filters */}
      <div
        className="surface-card dg-panel"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div
          className="chip-row"
          role="group"
          aria-label={ao.title}
        >
          {STATUS_FILTERS.map((item) => (
            <button
              key={item.value || 'all'}
              type="button"
              className="chip"
              aria-pressed={statusFilter === item.value}
              onClick={() => {
                setStatusFilter(item.value);
                setPage(1);
              }}
            >
              {item.value === ''
                ? ao.statusAll
                : getOrderStatusMeta(item.value).label}
            </button>
          ))}
        </div>

        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: 'var(--text-body-sm)',
            fontWeight: 600,
          }}
        >
          <input
            type="checkbox"
            checked={includeSimulated}
            onChange={(e) => {
              setIncludeSimulated(e.target.checked);
              setPage(1);
            }}
            style={{ width: '18px', height: '18px' }}
          />
          <span>{aa.toggleWithSim}</span>
        </label>
      </div>

      {includeSimulated && (
        <div className="callout callout--warning" role="alert">
          <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={15} />
            <span>{aa.simWarningTitle}</span>
          </strong>
        </div>
      )}

      {errorMessage && (
        <div className="callout callout--danger" role="alert">
          {errorMessage}
        </div>
      )}

      {/* Orders Table */}
      {isLoading ? (
        <div className="skeleton-box" style={{ height: '300px' }} />
      ) : (
        <div
          tabIndex={0}
          role="region"
          aria-labelledby="admin-orders-table-title"
          className="admin-table-wrap dg-panel"
        >
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">{ao.colCode}</th>
                <th scope="col">{ao.colCreated}</th>
                <th scope="col">{ao.colItems}</th>
                <th scope="col">{ao.colTotal}</th>
                <th scope="col">{co.paymentMethodLabel}</th>
                <th scope="col">{ao.colType}</th>
                <th scope="col">{ao.colStatus}</th>
                <th scope="col">{ao.colDetail}</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                    {aa.noOrders}
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusMeta = getOrderStatusMeta(order.status);
                  const firstItem = order.items[0]?.product_name_snapshot ?? '—';
                  const extraCount = Math.max(0, order.items.length - 1);
                  return (
                    <tr key={order.id}>
                      <td className="type-mono" style={{ whiteSpace: 'nowrap' }}>
                        {order.order_code}
                      </td>
                      <td className="type-caption" style={{ whiteSpace: 'nowrap' }}>
                        {formatDate(order.created_at)}
                      </td>
                      <td style={{ minWidth: '220px' }}>
                        <strong style={{ display: 'block', color: 'var(--ink)' }}>
                          {order.items.length} × {firstItem}
                        </strong>
                        {extraCount > 0 && (
                          <span className="type-caption">+{extraCount}</span>
                        )}
                      </td>
                      <td className="type-price" style={{ whiteSpace: 'nowrap' }}>
                        {formatPrice(order.total_vnd)}
                      </td>
                      <td className="type-mono type-caption">
                        {order.payment_provider}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            order.is_simulated
                              ? 'badge--warning'
                              : 'badge--success'
                          }`}
                        >
                          {order.is_simulated ? aa.dataSimLabel : aa.dataRealLabel}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge--${statusMeta.tone}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          onClick={() => openOrderDrawer(order)}
                        >
                          <Download size={13} />
                          <span>{aa.viewBtn}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {commerce.catalog.prevPage}
          </button>
          <span className="type-mono type-body-sm">
            {commerce.catalog.pageOf(meta.page, meta.totalPages)}
          </span>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {commerce.catalog.nextPage}
          </button>
        </div>
      )}

      {/* Slide-over Order & Download Grants Drawer */}
      <dialog
        ref={drawerRef}
        className="admin-drawer"
        aria-labelledby="admin-order-drawer-title"
        {...DIALOG_LIGHT_DISMISS}
      >
        <div className="admin-drawer__head">
          <div>
            <span className="type-eyebrow">{ao.drawerTitle}</span>
            <h2
              id="admin-order-drawer-title"
              className="type-h3 type-mono"
              style={{ margin: '2px 0 0' }}
            >
              {selectedOrder?.order_code ?? ao.colCode}
            </h2>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={closeOrderDrawer}
            aria-label={chrome.common.close}
            autoFocus
          >
            <X size={18} />
          </button>
        </div>

        {selectedOrder && (
          <div className="admin-drawer__body">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '12px',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-hairline)',
              }}
            >
              <div>
                <div className="type-caption">{ao.colStatus}</div>
                <span
                  className={`badge badge--${
                    getOrderStatusMeta(selectedOrder.status).tone
                  }`}
                >
                  {getOrderStatusMeta(selectedOrder.status).label}
                </span>
              </div>
              <div>
                <div className="type-caption">{ao.colTotal}</div>
                <strong
                  className="type-price"
                  style={{ color: 'var(--accent)', fontSize: '1.15rem' }}
                >
                  {formatPrice(selectedOrder.total_vnd)}
                </strong>
              </div>
              <div>
                <div className="type-caption">{co.paymentMethodLabel}</div>
                <code className="type-caption type-mono">
                  {selectedOrder.payment_provider}
                </code>
              </div>
              <div>
                <div className="type-caption">{ao.colType}</div>
                <span
                  className={`badge ${
                    selectedOrder.is_simulated
                      ? 'badge--warning'
                      : 'badge--success'
                  }`}
                >
                  {selectedOrder.is_simulated ? aa.dataSimLabel : aa.dataRealLabel}
                </span>
              </div>
              <div>
                <div className="type-caption">{ao.colCreated}</div>
                <span className="type-caption">
                  {formatDate(selectedOrder.created_at)}
                </span>
              </div>
              <div>
                <div className="type-caption">{co.paidAtLabel}</div>
                <span className="type-caption">
                  {formatDate(selectedOrder.paid_at)}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              <strong className="type-body-sm">
                {co.itemsTitle} ({selectedOrder.items.length})
              </strong>
              {selectedOrder.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-hairline)',
                  }}
                >
                  <div style={{ display: 'grid', gap: '2px' }}>
                    <strong style={{ fontSize: '0.88rem' }}>
                      {item.product_name_snapshot}
                    </strong>
                    <span className="type-caption type-mono">
                      {formatPrice(item.unit_price_vnd)} × {item.quantity}
                    </span>
                  </div>
                  <strong className="type-price">
                    {formatPrice(item.line_total_vnd)}
                  </strong>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              <strong className="type-body-sm">
                {co.downloadsTitle} (<code className="type-mono">download_grants</code>)
              </strong>
              {!selectedOrder.download_grants ||
              selectedOrder.download_grants.length === 0 ? (
                <div className="callout">
                  <span>{chrome.common.noData}</span>
                </div>
              ) : (
                selectedOrder.download_grants.map((grant) => {
                  const matchedItem = selectedOrder.items.find(
                    (i) => i.product_id === grant.product_id
                  );
                  return (
                    <div
                      key={grant.id}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-strong)',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        display: 'grid',
                        gap: '6px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                        }}
                      >
                        <strong style={{ fontSize: '0.86rem' }}>
                          {matchedItem?.product_name_snapshot ??
                            grant.product_id}
                        </strong>
                        <span className="badge badge--success type-mono">
                          <CheckCircle2 size={12} />
                          <span>
                            {co.downloadsUsed(
                              grant.download_count,
                              grant.max_downloads
                            )}
                          </span>
                        </span>
                      </div>
                      <span className="type-caption type-mono">
                        {co.expiresAt}: {formatDate(grant.expires_at)}
                      </span>
                      <span
                        className="type-caption type-mono"
                        style={{ overflowWrap: 'anywhere' }}
                      >
                        Path: {grant.download_url}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        <div className="admin-drawer__foot">
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={closeOrderDrawer}
          >
            {chrome.common.close}
          </button>
          {selectedOrder && (
            <Link
              href={`/orders/${selectedOrder.id}`}
              className="dg-btn-purchase dg-btn-sm"
            >
              <ShoppingBag size={14} />
              <span>{co.viewAndDownload}</span>
              <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      </dialog>
    </div>
  );
}
