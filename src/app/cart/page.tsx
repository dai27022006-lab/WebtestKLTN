'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  ArrowRight,
  Download,
  Lock,
  ShoppingBag,
  X,
} from '@/components/icons/DreamIcons';
import {
  formatDateTimeVi,
  formatVnd,
  ORDER_STATUS_META,
  PRODUCT_TYPE_LABELS,
} from '@/components/shared/formatters';
import { EditorialEmptyIllustration } from '@/components/visual/EditorialEmptyIllustration';
import { ProductPlaceholderFrame } from '@/components/visual/ProductPlaceholderFrame';
import { listOrders } from '@/services';
import { useCart, useExperiment } from '@/state';
import type { CartItemDto, OrderDto } from '@/types/api';

function CartItemThumb({ item }: { item: CartItemDto }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!item.thumbnail_url || imgFailed) {
    return (
      <ProductPlaceholderFrame
        productType={item.product_type}
        industry="Shop nhỏ"
        compact
        aspect="16/10"
      />
    );
  }

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '16 / 10',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        border: '1px solid var(--border-hairline)',
        backgroundColor: 'var(--bg-surface-sunken)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.thumbnail_url}
        alt={`${item.name} (${PRODUCT_TYPE_LABELS[item.product_type]})`}
        width={480}
        height={300}
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={() => setImgFailed(true)}
      />
    </div>
  );
}

export default function CartPage() {
  const { cart, isLoading, errorMessage, removeItem, clearAll } = useCart();
  const { visitorId } = useExperiment();
  const [recentOrders, setRecentOrders] = useState<OrderDto[]>([]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    void listOrders(visitorId || undefined, controller.signal).then((res) => {
      if (active && res.ok) {
        setRecentOrders(res.data.slice(0, 5));
      }
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, [visitorId]);

  return (
    <section className="section section--compact">
      <div className="container">
        <div className="stepper" aria-label="Tiến trình đặt hàng thử nghiệm">
          <div className="stepper__item stepper__item--active">
            <span className="badge badge--accent">
              <ShoppingBag size={12} /> 1
            </span>
            <span>Giỏ hàng</span>
          </div>
          <div className="stepper__item">
            <span className="badge">
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
            <span className="type-eyebrow">Giỏ hàng của bạn</span>
            <h1 className="type-h1">Kiểm tra các gói giải pháp đã chọn</h1>
            <p className="type-body-sm">
              Hệ thống đang chạy chế độ đặt hàng thử nghiệm (Sandbox) — bạn có
              thể kiểm tra quy trình tạo đơn và nhận file ngay mà không bị trừ
              tiền thật.
            </p>
          </div>
          {cart.items.length > 0 && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              disabled={isLoading}
              onClick={() => void clearAll()}
            >
              <X size={14} />
              <span>Xóa toàn bộ giỏ</span>
            </button>
          )}
        </div>

        {errorMessage && (
          <div
            className="callout callout--danger"
            role="alert"
            style={{ marginBottom: '20px' }}
          >
            {errorMessage}
          </div>
        )}

        {cart.items.length === 0 ? (
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
            <EditorialEmptyIllustration title="Giỏ hàng trống" />
            <h2 className="type-h3" style={{ margin: 0 }}>
              Giỏ hàng hiện chưa có gói sản phẩm nào
            </h2>
            <p className="type-body-sm" style={{ margin: 0, maxWidth: '46ch' }}>
              Khám phá danh mục Template Website, Prompt Pack AI hoặc Workflow tự
              động để thêm vào giỏ và trải nghiệm quy trình nhận file tức thì.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/products" className="dg-btn-purchase">
                <span>Xem danh mục sản phẩm</span>
                <ArrowRight size={15} />
              </Link>
              <Link href="/orders" className="btn btn--secondary">
                Thư viện đơn hàng đã mua
              </Link>
            </div>
          </div>
        ) : (
          <div className="two-col-ops">
            <div style={{ display: 'grid', gap: '16px', minWidth: 0 }}>
              {cart.items.map((item) => (
                <article
                  key={item.product_id}
                  className="surface-card dg-panel cart-item-card"
                >
                  <CartItemThumb item={item} />

                  <div style={{ display: 'grid', gap: '4px', minWidth: 0 }}>
                    <span
                      className="type-caption"
                      style={{ color: 'var(--accent)', fontWeight: 700 }}
                    >
                      {PRODUCT_TYPE_LABELS[item.product_type]}
                    </span>
                    <Link href={`/products/${item.slug}`}>
                      <strong style={{ fontSize: '1rem' }}>{item.name}</strong>
                    </Link>
                    <div className="type-body-sm">
                      Đơn giá:{' '}
                      <span className="type-mono">
                        {formatVnd(item.price_vnd)}
                      </span>{' '}
                      • Số lượng:{' '}
                      <span className="type-mono">{item.quantity}</span>
                    </div>
                  </div>

                  <div className="cart-item-card__meta">
                    <strong
                      className="type-price"
                      style={{ color: 'var(--accent)' }}
                    >
                      {formatVnd(item.line_total_vnd)}
                    </strong>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      disabled={isLoading}
                      onClick={() => void removeItem(item.product_id)}
                    >
                      Xóa
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside
              className="surface-card dg-panel"
              style={{ display: 'grid', gap: '16px' }}
            >
              <h2 className="type-h3" style={{ margin: 0 }}>
                Tóm tắt đơn hàng
              </h2>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBlock: '12px',
                  borderBlock: '1px solid var(--border-hairline)',
                }}
              >
                <span className="type-body-sm">
                  Tổng ({cart.item_count} gói)
                </span>
                <strong
                  className="type-price"
                  style={{ fontSize: '1.5rem', color: 'var(--accent)' }}
                >
                  {formatVnd(cart.subtotal_vnd)}
                </strong>
              </div>

              <Link
                href="/checkout"
                className="dg-btn-purchase btn--block"
                style={{ justifyContent: 'center' }}
              >
                <span>Tiếp tục xác nhận đơn thử nghiệm</span>
                <ArrowRight size={16} />
              </Link>

              <p className="type-caption" style={{ margin: 0 }}>
                Hệ thống đang chạy chế độ đặt hàng thử nghiệm (Sandbox) — bạn
                có thể kiểm tra quy trình tạo đơn và nhận file ngay mà không bị
                trừ tiền thật.
              </p>
            </aside>
          </div>
        )}

        {recentOrders.length > 0 && (
          <div style={{ display: 'grid', gap: '14px', marginTop: '40px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <h2 className="type-h3" style={{ margin: 0 }}>
                Đơn hàng gần đây của bạn
              </h2>
              <Link href="/orders" className="btn btn--secondary btn--sm">
                Xem tất cả đơn hàng
              </Link>
            </div>
            <div
              tabIndex={0}
              role="region"
              aria-label="Danh sách đơn hàng gần đây"
              className="data-table-wrap dg-panel"
            >
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Mã đơn</th>
                    <th scope="col">Trạng thái</th>
                    <th scope="col">Tổng tiền</th>
                    <th scope="col">Thời gian tạo</th>
                    <th scope="col">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const statusMeta = ORDER_STATUS_META[order.status];
                    return (
                      <tr key={order.id}>
                        <td className="type-mono">{order.order_code}</td>
                        <td>
                          <span className={`badge badge--${statusMeta.tone}`}>
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="type-price">
                          {formatVnd(order.total_vnd)}
                        </td>
                        <td className="type-caption">
                          {formatDateTimeVi(order.created_at)}
                        </td>
                        <td>
                          <Link
                            href={`/orders/${order.id}`}
                            className="btn btn--secondary btn--sm"
                          >
                            Xem đơn &amp; Tải file
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
