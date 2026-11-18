'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useLocale } from '@/components/providers/LocaleProvider';
import { ShopDashboardPanel } from '@/components/analytics/ShopDashboardPanel';
import { EditorialEmptyIllustration } from '@/components/visual/EditorialEmptyIllustration';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  RefreshCw,
  ShoppingBag,
} from '@/components/icons/DreamIcons';
import { listOrders, listProducts } from '@/services';
import { useExperiment } from '@/state';
import type { OrderDto, OrderStatus, ProductSummaryDto } from '@/types/api';

type OrderFilterValue = 'all' | 'paid' | 'pending' | 'failed';

export default function OrdersLedgerPage() {
  const { commerce, chrome, formatPrice, formatDate, getOrderStatusMeta } =
    useLocale();
  const od = commerce.orders;
  const sd = commerce.shopDashboard;
  const { visitorId } = useExperiment();

  const statusFilters: Array<{ value: OrderFilterValue; label: string }> = [
    { value: 'all', label: od.filterAll },
    { value: 'paid', label: od.filterPaid },
    { value: 'pending', label: od.filterPending },
    { value: 'failed', label: od.filterFailed },
  ];

  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [products, setProducts] = useState<ProductSummaryDto[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderFilterValue>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOrders = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setErrorMessage(null);
      const [ordersRes, productsRes] = await Promise.all([
        listOrders(visitorId || undefined, signal),
        listProducts({ limit: 50 }, signal),
      ]);
      if (signal?.aborted) return;
      setIsLoading(false);

      if (!ordersRes.ok) {
        setErrorMessage(ordersRes.error.message);
        return;
      }

      setOrders(ordersRes.data);
      if (productsRes.ok) {
        setProducts(productsRes.data);
      }
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
            <span className="type-eyebrow">{od.eyebrow}</span>
            <h1 className="type-h1">{od.title}</h1>
            <p className="type-body-sm">{od.subtitle}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              disabled={isLoading}
              onClick={() => void loadOrders()}
            >
              <RefreshCw size={14} />
              <span>{chrome.common.refresh}</span>
            </button>
            <Link href="/products" className="dg-btn-purchase dg-btn-sm">
              <ShoppingBag size={14} />
              <span>{chrome.common.products}</span>
            </Link>
          </div>
        </div>

        <div className="callout callout--info">
          <span>{od.sandboxNote}</span>
        </div>

        <ShopDashboardPanel
          orders={orders}
          products={products}
          isLoading={isLoading}
          title={sd.ordersTitle}
          subtitle={sd.ordersSubtitle}
        />

        <div className="orders-ledger__filters">
          <div
            className="chip-row"
            role="group"
            aria-label={od.eyebrow}
          >
            {statusFilters.map((item) => (
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
            {od.showingCount(filteredOrders.length, orders.length)}
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
                {chrome.common.retry}
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
            <EditorialEmptyIllustration
              title={orders.length === 0 ? od.emptyAllTitle : od.emptyFilteredTitle}
            />
            <h2 className="type-h3" style={{ margin: 0 }}>
              {orders.length === 0 ? od.emptyAllTitle : od.emptyFilteredTitle}
            </h2>
            <p className="type-body-sm" style={{ margin: 0, maxWidth: '46ch' }}>
              {orders.length === 0 ? od.emptyAllDesc : od.emptyFilteredDesc}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/products" className="dg-btn-purchase">
                <span>{chrome.common.products}</span>
                <ArrowRight size={15} />
              </Link>
              {orders.length > 0 && statusFilter !== 'all' && (
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setStatusFilter('all')}
                >
                  {od.viewAllBtn}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="orders-ledger__list">
            {filteredOrders.map((order) => {
              const statusMeta = getOrderStatusMeta(order.status);
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
                        {formatDate(order.created_at)}
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
                    <span className="type-caption">{od.totalOrderValue}</span>
                    <strong
                      className="type-price"
                      style={{ fontSize: '1.25rem', color: 'var(--accent)' }}
                    >
                      {formatPrice(order.total_vnd)}
                    </strong>
                    {order.status === 'paid' && order.download_grants && (
                      <span className="type-caption type-mono">
                        {od.readyPackages(order.download_grants.length)}
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
                      <span>{od.viewAndDownload}</span>
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
