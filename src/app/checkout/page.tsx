'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

  const handleMockSandboxWebhook = async (outcome: 'paid' | 'failed') => {
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
      'Webhook Sandbox đã trả về trạng thái Thất bại (Failed). Bạn có thể thử thanh toán lại bất kỳ lúc nào.'
    );
  };

  return (
    <section className="section section--compact">
      <div className="container">
        <div className="stepper" aria-label="Tiến trình giao dịch Sandbox">
          <div className="stepper__item stepper__item--done">
            <span className="badge badge--success">1</span>
            <span>Giỏ hàng</span>
          </div>
          <div className="stepper__item stepper__item--active">
            <span className="badge badge--accent">2</span>
            <span>Thanh toán Sandbox</span>
          </div>
          <div className="stepper__item">
            <span className="badge">3</span>
            <span>Nhận file qua token</span>
          </div>
        </div>

        <div className="section-header" style={{ marginBottom: '24px' }}>
          <div className="section-header__copy">
            <span className="type-eyebrow">Cổng thanh toán thử nghiệm (F5)</span>
            <h1 className="type-h1">Tạo đơn & Mô phỏng Mock Sandbox Webhook</h1>
            <p className="type-body-sm">
              Thanh toán Sandbox phục vụ đo ý định mua trong đồ án nghiên cứu,
              tuyệt đối không thu tiền thật.
            </p>
          </div>
          {!user && (
            <Link href="/auth" className="btn btn--ghost btn--sm">
              Đăng nhập để gắn đơn vào tài khoản
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
            className="surface-card"
            style={{
              textAlign: 'center',
              paddingBlock: '48px',
              display: 'grid',
              gap: '16px',
              justifyItems: 'center',
            }}
          >
            <EditorialEmptyIllustration title="Chưa có sản phẩm để thanh toán" />
            <h2 className="type-h3" style={{ margin: 0 }}>
              Chưa có sản phẩm trong giỏ để tạo đơn Sandbox
            </h2>
            <Link href="/products" className="btn btn--primary">
              Quay lại chọn gói giải pháp
            </Link>
          </div>
        ) : (
          <div className="two-col-ops">
            {/* Left: Order Summary from Server */}
            <div className="surface-card" style={{ display: 'grid', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <h2 className="type-h3" style={{ margin: 0 }}>
                  Chi tiết đơn hàng đối soát DB
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
                      {row.name} × <strong className="type-mono">{row.qty}</strong>
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
                <strong>Tổng thanh toán (Server chốt)</strong>
                <strong className="type-price" style={{ fontSize: '1.5rem' }}>
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
                  className="btn btn--primary btn--lg btn--block"
                  disabled={isCreating}
                  onClick={() => void handleCreateOrder()}
                >
                  {isCreating
                    ? 'Đang tạo đơn hàng...'
                    : 'Tạo đơn Sandbox & Mở cổng giả lập'}
                </button>
              )}
            </div>

            {/* Right: Mock Sandbox Webhook Panel */}
            <aside className="surface-card" style={{ display: 'grid', gap: '16px' }}>
              <span className="type-eyebrow">Mock Sandbox Webhook Panel</span>
              <h2 className="type-h3" style={{ margin: 0 }}>
                Mô phỏng kết quả thanh toán
              </h2>

              {!orderCreated ? (
                <div className="callout callout--info">
                  <span>
                    Bấm <strong>Tạo đơn Sandbox</strong> ở cột bên trái để sinh
                    mã đơn và kích hoạt 2 nút mô phỏng kết quả webhook{' '}
                    <code className="type-mono">Paid / Failed</code>.
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
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
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
                      }}
                    >
                      <span className="type-caption">Số tiền</span>
                      <strong className="type-price">
                        {formatVnd(orderCreated.payment_intent.amount_vnd)}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span className="type-caption">Webhook nội bộ</span>
                      <code className="type-caption type-mono">
                        {orderCreated.payment_intent.webhook_path}
                      </code>
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
                      className="btn btn--primary btn--lg btn--block"
                      disabled={isPaying}
                      onClick={() => void handleMockSandboxWebhook('paid')}
                    >
                      {isPaying
                        ? 'Đang gửi webhook...'
                        : 'Giả lập Thanh toán Thành công (Paid)'}
                    </button>

                    <button
                      type="button"
                      className="btn btn--secondary btn--block"
                      disabled={isPaying}
                      onClick={() => void handleMockSandboxWebhook('failed')}
                    >
                      Giả lập Thất bại (Failed)
                    </button>
                  </div>
                </>
              )}

              <p className="type-caption" style={{ margin: 0 }}>
                Khi giả lập <strong>Paid</strong> thành công, server tự phát
                hành <code className="type-mono">download_grants</code> có thời
                hạn 7 ngày (tối đa 5 lượt tải) và xóa giỏ hàng hiện tại.
              </p>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
