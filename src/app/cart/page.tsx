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
import { useLocale } from '@/components/providers/LocaleProvider';
import { EditorialEmptyIllustration } from '@/components/visual/EditorialEmptyIllustration';
import { ProductPlaceholderFrame } from '@/components/visual/ProductPlaceholderFrame';
import { listOrders } from '@/services';
import { useCart, useExperiment } from '@/state';
import type { CartItemDto, OrderDto } from '@/types/api';

function CartItemThumb({ item }: { item: CartItemDto }) {
  const { getProductCopy, getProductTypeLabel } = useLocale();
  const [imgFailed, setImgFailed] = useState(false);
  const copy = getProductCopy({
    slug: item.slug,
    name: item.name,
    short_description: '',
  });

  if (!item.thumbnail_url || imgFailed) {
    return (
      <ProductPlaceholderFrame
        productType={item.product_type}
        industry="Đa ngành"
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
        alt={`${copy.name} (${getProductTypeLabel(item.product_type)})`}
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
  const {
    commerce,
    chrome,
    formatPrice,
    formatDate,
    getProductCopy,
    getProductTypeLabel,
    getOrderStatusMeta,
  } = useLocale();
  const ct = commerce.cart;
  const co = commerce.checkout;
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
        <div className="stepper" aria-label={ct.eyebrow}>
          <div className="stepper__item stepper__item--active">
            <span className="badge badge--accent">
              <ShoppingBag size={12} /> 1
            </span>
            <span>{ct.step1}</span>
          </div>
          <div className="stepper__item">
            <span className="badge">
              <Lock size={12} /> 2
            </span>
            <span>{ct.step2}</span>
          </div>
          <div className="stepper__item">
            <span className="badge">
              <Download size={12} /> 3
            </span>
            <span>{ct.step3}</span>
          </div>
        </div>

        <div className="section-header" style={{ marginBottom: '24px' }}>
          <div className="section-header__copy">
            <span className="type-eyebrow">{ct.eyebrow}</span>
            <h1 className="type-h1">{ct.title}</h1>
            <p className="type-body-sm">{ct.subtitle}</p>
          </div>
          {cart.items.length > 0 && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              disabled={isLoading}
              onClick={() => void clearAll()}
            >
              <X size={14} />
              <span>{ct.clearAll}</span>
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
            <EditorialEmptyIllustration title={ct.emptyTitle} />
            <h2 className="type-h3" style={{ margin: 0 }}>
              {ct.emptyTitle}
            </h2>
            <p className="type-body-sm" style={{ margin: 0, maxWidth: '46ch' }}>
              {ct.emptyDesc}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/products" className="dg-btn-purchase">
                <span>{ct.browseBtn}</span>
                <ArrowRight size={15} />
              </Link>
              <Link href="/orders" className="btn btn--secondary">
                {commerce.orders.title}
              </Link>
            </div>
          </div>
        ) : (
          <div className="two-col-ops">
            <div style={{ display: 'grid', gap: '16px', minWidth: 0 }}>
              {cart.items.map((item) => {
                const copy = getProductCopy({
                  slug: item.slug,
                  name: item.name,
                  short_description: '',
                });
                return (
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
                      {getProductTypeLabel(item.product_type)}
                    </span>
                    <Link href={`/products/${item.slug}`}>
                      <strong style={{ fontSize: '1rem' }}>{copy.name}</strong>
                    </Link>
                    <div className="type-body-sm">
                      <span className="type-mono">
                        {formatPrice(item.price_vnd)}
                      </span>{' '}
                      ×{' '}
                      <span className="type-mono">{item.quantity}</span>
                    </div>
                  </div>

                  <div className="cart-item-card__meta">
                    <strong
                      className="type-price"
                      style={{ color: 'var(--accent)' }}
                    >
                      {formatPrice(item.line_total_vnd)}
                    </strong>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      disabled={isLoading}
                      onClick={() => void removeItem(item.product_id)}
                    >
                      {ct.removeItem}
                    </button>
                  </div>
                </article>
                );
              })}
            </div>

            <aside
              className="surface-card dg-panel"
              style={{ display: 'grid', gap: '16px' }}
            >
              <h2 className="type-h3" style={{ margin: 0 }}>
                {ct.summaryHeading}
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
                  {ct.totalItemsLabel(cart.item_count)}
                </span>
                <strong
                  className="type-price"
                  style={{ fontSize: '1.5rem', color: 'var(--accent)' }}
                >
                  {formatPrice(cart.subtotal_vnd)}
                </strong>
              </div>

              <Link
                href="/checkout"
                className="dg-btn-purchase btn--block"
                style={{ justifyContent: 'center' }}
              >
                <span>{ct.checkoutBtn}</span>
                <ArrowRight size={16} />
              </Link>

              <p className="type-caption" style={{ margin: 0 }}>
                {co.sandboxHint}
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
                {ct.recentOrdersTitle}
              </h2>
              <Link href="/orders" className="btn btn--secondary btn--sm">
                {commerce.orders.viewAllBtn}
              </Link>
            </div>
            <div
              tabIndex={0}
              role="region"
              aria-label={ct.recentOrdersTitle}
              className="data-table-wrap dg-panel"
            >
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">{commerce.orders.statusLabel}</th>
                    <th scope="col">{commerce.orders.totalOrderValue}</th>
                    <th scope="col">{commerce.orders.createdAtLabel}</th>
                    <th scope="col">{chrome.common.orders}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
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
                        <td className="type-caption">
                          {formatDate(order.created_at)}
                        </td>
                        <td>
                          <Link
                            href={`/orders/${order.id}`}
                            className="btn btn--secondary btn--sm"
                          >
                            {commerce.orders.viewAndDownload}
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
