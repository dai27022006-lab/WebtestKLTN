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
import {
  formatDateTimeVi,
  formatVnd,
  ORDER_STATUS_META,
} from '@/components/shared/formatters';
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
          <span className="type-eyebrow">Quản lý Đơn hàng &amp; Cấp quyền tải</span>
          <h1 id="admin-orders-table-title" className="type-h2" style={{ margin: 0 }}>
            Danh sách Đơn hàng ({meta?.total ?? orders.length})
          </h1>
          <p className="type-body-sm" style={{ margin: 0 }}>
            Kiểm tra trạng thái thanh toán Sandbox, nguồn dữ liệu và số lượt
            tải còn lại trong từng <code className="type-mono">download_grants</code>.
          </p>
        </div>

        <button
          type="button"
          className="btn btn--secondary btn--sm"
          disabled={isLoading}
          onClick={() => void loadOrders(statusFilter, includeSimulated, page)}
        >
          <RefreshCw size={14} />
          <span>Làm mới</span>
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
          aria-label="Lọc đơn hàng theo trạng thái"
        >
          {STATUS_FILTERS.map((item) => (
            <button
              key={item.label}
              type="button"
              className="chip"
              aria-pressed={statusFilter === item.value}
              onClick={() => {
                setStatusFilter(item.value);
                setPage(1);
              }}
            >
              {item.label}
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
          <span>Bao gồm dữ liệu mô phỏng (is_simulated)</span>
        </label>
      </div>

      {includeSimulated && (
        <div className="callout callout--warning" role="alert">
          <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={15} />
            <span>Đang gộp cả đơn hàng mô phỏng (is_simulated = true)</span>
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
                <th scope="col">Mã đơn</th>
                <th scope="col">Ngày tạo</th>
                <th scope="col">Gói sản phẩm</th>
                <th scope="col">Tổng tiền VND</th>
                <th scope="col">Cổng thanh toán</th>
                <th scope="col">Nguồn</th>
                <th scope="col">Trạng thái</th>
                <th scope="col">Chi tiết &amp; Quyền tải</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                    Chưa có đơn hàng nào khớp bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusMeta = ORDER_STATUS_META[order.status];
                  const firstItem = order.items[0]?.product_name_snapshot ?? '—';
                  const extraCount = Math.max(0, order.items.length - 1);
                  return (
                    <tr key={order.id}>
                      <td className="type-mono" style={{ whiteSpace: 'nowrap' }}>
                        {order.order_code}
                      </td>
                      <td className="type-caption" style={{ whiteSpace: 'nowrap' }}>
                        {formatDateTimeVi(order.created_at)}
                      </td>
                      <td style={{ minWidth: '220px' }}>
                        <strong style={{ display: 'block', color: 'var(--ink)' }}>
                          {order.items.length} món: {firstItem}
                        </strong>
                        {extraCount > 0 && (
                          <span className="type-caption">
                            +{extraCount} gói khác
                          </span>
                        )}
                      </td>
                      <td className="type-price" style={{ whiteSpace: 'nowrap' }}>
                        {formatVnd(order.total_vnd)}
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
                          {order.is_simulated ? 'Mô phỏng' : 'Thật'}
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
                          <span>Xem chi tiết &amp; Quyền tải</span>
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
            Trang trước
          </button>
          <span className="type-mono type-body-sm">
            Trang {meta.page} / {meta.totalPages}
          </span>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Trang sau
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
            <span className="type-eyebrow">Chi tiết Đơn hàng &amp; Quyền tải</span>
            <h2
              id="admin-order-drawer-title"
              className="type-h3 type-mono"
              style={{ margin: '2px 0 0' }}
            >
              {selectedOrder?.order_code ?? 'Đơn hàng'}
            </h2>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={closeOrderDrawer}
            aria-label="Đóng ngăn chi tiết đơn hàng"
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
                <div className="type-caption">Trạng thái</div>
                <span
                  className={`badge badge--${
                    ORDER_STATUS_META[selectedOrder.status].tone
                  }`}
                >
                  {ORDER_STATUS_META[selectedOrder.status].label}
                </span>
              </div>
              <div>
                <div className="type-caption">Tổng giá trị</div>
                <strong
                  className="type-price"
                  style={{ color: 'var(--accent)', fontSize: '1.15rem' }}
                >
                  {formatVnd(selectedOrder.total_vnd)}
                </strong>
              </div>
              <div>
                <div className="type-caption">Cổng thanh toán</div>
                <code className="type-caption type-mono">
                  {selectedOrder.payment_provider}
                </code>
              </div>
              <div>
                <div className="type-caption">Nguồn dữ liệu</div>
                <span
                  className={`badge ${
                    selectedOrder.is_simulated
                      ? 'badge--warning'
                      : 'badge--success'
                  }`}
                >
                  {selectedOrder.is_simulated ? 'Mô phỏng' : 'Thật'}
                </span>
              </div>
              <div>
                <div className="type-caption">Ngày tạo</div>
                <span className="type-caption">
                  {formatDateTimeVi(selectedOrder.created_at)}
                </span>
              </div>
              <div>
                <div className="type-caption">Thanh toán lúc</div>
                <span className="type-caption">
                  {formatDateTimeVi(selectedOrder.paid_at)}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              <strong className="type-body-sm">
                Danh sách sản phẩm ({selectedOrder.items.length})
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
                      {formatVnd(item.unit_price_vnd)} × {item.quantity}
                    </span>
                  </div>
                  <strong className="type-price">
                    {formatVnd(item.line_total_vnd)}
                  </strong>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              <strong className="type-body-sm">
                Quyền tải file (<code className="type-mono">download_grants</code>)
              </strong>
              {!selectedOrder.download_grants ||
              selectedOrder.download_grants.length === 0 ? (
                <div className="callout">
                  <span>
                    {selectedOrder.status === 'paid'
                      ? 'Không tìm thấy bản ghi cấp quyền tải cho đơn này.'
                      : 'Chỉ cấp download_grants khi đơn đạt trạng thái paid.'}
                  </span>
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
                            {grant.download_count}/{grant.max_downloads} lượt
                          </span>
                        </span>
                      </div>
                      <span className="type-caption type-mono">
                        Hết hạn: {formatDateTimeVi(grant.expires_at)}
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
            Đóng
          </button>
          {selectedOrder && (
            <Link
              href={`/orders/${selectedOrder.id}`}
              className="dg-btn-purchase dg-btn-sm"
            >
              <ShoppingBag size={14} />
              <span>Mở trang Đơn hàng khách</span>
              <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      </dialog>
    </div>
  );
}
