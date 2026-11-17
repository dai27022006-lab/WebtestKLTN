'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  ArrowRight,
  CheckCircle2,
  Download,
  Lock,
  ShoppingBag,
} from '@/components/icons/DreamIcons';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  formatVnd,
  ORDER_STATUS_META,
} from '@/components/shared/formatters';
import { EditorialEmptyIllustration } from '@/components/visual/EditorialEmptyIllustration';
import { createOrder, sandboxPayOrder } from '@/services';
import { useCart, useExperiment } from '@/state';
import type { CreateOrderResponse } from '@/types/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const { visitorId, assignment, track } = useExperiment();

  const [orderCreated, setOrderCreated] = useState<CreateOrderResponse | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needAuthNotice, setNeedAuthNotice] = useState(false);
  const [failedNotice, setFailedNotice] = useState<string | null>(null);

  const handleCreateOrder = async () => {
    if (cart.items.length === 0 || isCreating) return;
    setIsCreating(true);
    setErrorMessage(null);
    setNeedAuthNotice(false);
    setFailedNotice(null);

    void track('checkout_started', {
      properties: {
        item_count: cart.item_count,
        subtotal_vnd: cart.subtotal_vnd,
      },
    });

    const res = await createOrder({
      items: cart.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      payment_provider: 'mock_sandbox',
      assignment_id: assignment?.assignment_id,
      visitor_id: visitorId || undefined,
    });

    setIsCreating(false);

    if (!res.ok) {
      if (res.error.code === 'UNAUTHORIZED') {
        setNeedAuthNotice(true);
      }
      setErrorMessage(res.error.message);
      return;
    }

    setOrderCreated(res.data);
  };

  const handleSandboxConfirm = async (outcome: 'paid' | 'failed') => {
    if (!orderCreated || isPaying) return;
    setIsPaying(true);
    setErrorMessage(null);
    setFailedNotice(null);

    const res = await sandboxPayOrder(
      orderCreated.order.id,
      { outcome },
      visitorId || undefined
    );

    setIsPaying(false);

    if (!res.ok) {
      setErrorMessage(res.error.message);
      return;
    }

    if (res.data.status === 'paid') {
      void track('purchase', {
        properties: {
          order_id: res.data.order_id,
          order_code: res.data.order_code,
          total_vnd: orderCreated.order.total_vnd,
          payment_provider: 'mock_sandbox',
        },
      });
      await refreshCart();
      router.push(`/orders/${res.data.order_id}`);
      return;
    }

    setOrderCreated((prev) =>
      prev
        ? {
            ...prev,
            order: {
              ...prev.order,
              status: 'failed',
            },
          }
        : null
    );
    setFailedNotice(
      'Giao dịch thử nghiệm vừa mô phỏng trạng thái chưa thành công. Bạn có thể bấm xác nhận thanh toán lại bất kỳ lúc nào.'
    );
  };

  return (
    <section className="section section--compact">
      <div className="container">
        <div className="stepper" aria-label="Tiến trình đặt hàng thử nghiệm">
          <div className="stepper__item stepper__item--done">
            <span className="badge badge--success">
              <ShoppingBag size={12} /> 1
            </span>
            <span>Giỏ hàng</span>
          </div>
          <div className="stepper__item stepper__item--active">
            <span className="badge badge--accent">
              <Lock size={12} /> 2
            </span>
            <span>Xác nhận đơn thử nghiệm</span>
          </div>
          <div className="stepper__item">
            <span className="badge">
              <Download size={12} /> 3
            </span>
            <span>Nhận file ngay</span>
          </div>
        </div>

        <div className="section-header" style={{ marginBottom: '24px' }}>
          <div className="section-header__copy">
            <span className="type-eyebrow">Thanh toán thử nghiệm</span>
            <h1 className="type-h1">
              Xác nhận đơn hàng &amp; Mở kho link tải
            </h1>
            <p className="type-body-sm">
              Hệ thống đang chạy chế độ đặt hàng thử nghiệm (Sandbox) — bạn có
              thể kiểm tra quy trình tạo đơn và nhận file ngay mà không bị trừ
              tiền thật.
            </p>
          </div>
          {!user && (
            <Link href="/auth" className="btn btn--secondary btn--sm">
              Đăng nhập để lưu đơn vào tài khoản
            </Link>
          )}
        </div>

        {errorMessage && (
          <div
            className="callout callout--danger"
            role="alert"
            style={{ marginBottom: '20px' }}
          >
            <strong>Không thể xử lý yêu cầu</strong>
            <span>{errorMessage}</span>
            {needAuthNotice && (
              <div>
                <Link href="/auth" className="btn btn--secondary btn--sm">
                  Đi tới trang Đăng nhập
                </Link>
              </div>
            )}
          </div>
        )}

        {!orderCreated && cart.items.length === 0 ? (
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
            <EditorialEmptyIllustration title="Chưa có sản phẩm để xác nhận" />
            <h2 className="type-h3" style={{ margin: 0 }}>
              Chưa có sản phẩm trong giỏ để tạo đơn thử nghiệm
            </h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/products" className="dg-btn-purchase">
                <span>Quay lại chọn gói giải pháp</span>
                <ArrowRight size={15} />
              </Link>
              <Link href="/orders" className="btn btn--secondary">
                Thư viện đơn hàng đã mua
              </Link>
            </div>
          </div>
        ) : (
          <div className="two-col-ops">
            {/* Left: Order Summary */}
            <div
              className="surface-card dg-panel"
              style={{ display: 'grid', gap: '16px' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <h2 className="type-h3" style={{ margin: 0 }}>
                  Chi tiết đơn hàng
                </h2>
                {orderCreated && (
                  <span
                    className={`badge badge--${
                      ORDER_STATUS_META[orderCreated.order.status].tone
                    }`}
                  >
                    {ORDER_STATUS_META[orderCreated.order.status].label}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gap: '10px' }}>
                {(orderCreated
                  ? orderCreated.order.items.map((i) => ({
                      id: i.id,
                      name: i.product_name_snapshot,
                      qty: i.quantity,
                      total: i.line_total_vnd,
                    }))
                  : cart.items.map((i) => ({
                      id: i.product_id,
                      name: i.name,
                      qty: i.quantity,
                      total: i.line_total_vnd,
                    }))
                ).map((row) => (
                  <div
                    key={row.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      paddingBlock: '8px',
                      borderBottom: '1px solid var(--border-hairline)',
                    }}
                  >
                    <span className="type-body-sm">
                      {row.name} ×{' '}
                      <strong className="type-mono">{row.qty}</strong>
                    </span>
                    <strong className="type-price">
                      {formatVnd(row.total)}
                    </strong>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <strong>Tổng thanh toán (Thử nghiệm)</strong>
                <strong
                  className="type-price"
                  style={{ fontSize: '1.5rem', color: 'var(--accent)' }}
                >
                  {formatVnd(
                    orderCreated
                      ? orderCreated.order.total_vnd
                      : cart.subtotal_vnd
                  )}
                </strong>
              </div>

              {!orderCreated && (
                <button
                  type="button"
                  className="dg-btn-purchase btn--block"
                  style={{ justifyContent: 'center' }}
                  disabled={isCreating}
                  onClick={() => void handleCreateOrder()}
                >
                  <span>
                    {isCreating
                      ? 'Đang tạo đơn hàng...'
                      : 'Tạo đơn hàng thử nghiệm'}
                  </span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>

            {/* Right: Sandbox Payment Confirmation */}
            <aside
              className="surface-card dg-panel"
              style={{ display: 'grid', gap: '16px' }}
            >
              <span className="type-eyebrow">Xác nhận đơn thử nghiệm</span>
              <h2 className="type-h3" style={{ margin: 0 }}>
                Hoàn tất thanh toán thử nghiệm
              </h2>

              {!orderCreated ? (
                <div className="callout callout--info">
                  <span>
                    Bấm <strong>Tạo đơn hàng thử nghiệm</strong> ở cột bên trái
                    để khởi tạo mã đơn và trải nghiệm bước xác nhận nhận file
                    ngay.
                  </span>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gap: '8px',
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-hairline)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <span className="type-caption">Mã đơn hàng</span>
                      <strong className="type-mono">
                        {orderCreated.payment_intent.order_code}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <span className="type-caption">Giá trị đơn thử nghiệm</span>
                      <strong
                        className="type-price"
                        style={{ color: 'var(--accent)' }}
                      >
                        {formatVnd(orderCreated.payment_intent.amount_vnd)}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <span className="type-caption">Hình thức</span>
                      <span className="badge badge--info">
                        Sandbox không trừ tiền
                      </span>
                    </div>
                  </div>

                  {failedNotice && (
                    <div className="callout callout--danger" role="alert">
                      {failedNotice}
                    </div>
                  )}

                  <div style={{ display: 'grid', gap: '10px' }}>
                    <button
                      type="button"
                      className="dg-btn-purchase btn--block"
                      style={{ justifyContent: 'center' }}
                      disabled={isPaying}
                      onClick={() => void handleSandboxConfirm('paid')}
                    >
                      <CheckCircle2 size={16} />
                      <span>
                        {isPaying
                          ? 'Đang xác nhận đơn...'
                          : 'Xác nhận Thành công & Nhận file ngay'}
                      </span>
                    </button>

                    <button
                      type="button"
                      className="btn btn--secondary btn--block"
                      disabled={isPaying}
                      onClick={() => void handleSandboxConfirm('failed')}
                    >
                      Thử trạng thái Thanh toán chưa thành công
                    </button>
                  </div>
                </>
              )}

              <p className="type-caption" style={{ margin: 0 }}>
                Sau khi xác nhận thành công, hệ thống tự động mở{' '}
                <strong>Kho link tải an toàn (hạn 7 ngày)</strong> với tối đa
                5 lượt tải cho từng gói và làm mới giỏ hàng của bạn.
              </p>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
