'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import {
  ArrowRight,
  Download,
  Layers,
  Rocket,
  ShoppingBag,
} from '@/components/icons/DreamIcons';
import { useLocale } from '@/components/providers/LocaleProvider';
import type { OrderDto, ProductSummaryDto, ProductType } from '@/types/api';

import { ProgressRing } from './ProgressRing';

export interface ShopDashboardPanelProps {
  orders: OrderDto[];
  products: ProductSummaryDto[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
}

function toLocalDayKey(iso: string): { key: string; label: string } {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return { key: 'unknown', label: '—' };
  }
  const vnMs = date.getTime() + 7 * 60 * 60 * 1000;
  const key = new Date(vnMs).toISOString().slice(0, 10);
  const [, month, day] = key.split('-');
  return { key, label: day && month ? `${day}/${month}` : key };
}

export function ShopDashboardPanel({
  orders,
  products,
  isLoading = false,
  title,
  subtitle,
}: ShopDashboardPanelProps) {
  const {
    commerce,
    formatPrice,
    formatDate,
    getProductTypeLabel,
    getOrderStatusMeta,
  } = useLocale();
  const sd = commerce.shopDashboard;
  const [referenceNowMs] = useState<number>(() => Date.now());

  const stats = useMemo(() => {
    const productTypeMap = new Map<string, ProductType>();
    for (const prod of products) {
      productTypeMap.set(prod.id, prod.product_type);
    }

    const totalOrders = orders.length;
    const paidOrders = orders.filter((o) => o.status === 'paid');
    const pendingOrders = orders.filter((o) => o.status === 'pending');

    const completionRate =
      totalOrders > 0 ? Math.round((paidOrders.length / totalOrders) * 100) : 0;

    const totalPaidVnd = paidOrders.reduce((sum, o) => sum + o.total_vnd, 0);
    const avgPaidOrderVnd =
      paidOrders.length > 0 ? Math.round(totalPaidVnd / paidOrders.length) : 0;

    let totalItemsQty = 0;
    const typeCounts: Record<ProductType, number> = {
      template: 0,
      prompt_pack: 0,
      workflow: 0,
    };

    for (const order of paidOrders.length > 0 ? paidOrders : orders) {
      for (const item of order.items) {
        totalItemsQty += item.quantity;
        const pType = productTypeMap.get(item.product_id) ?? 'template';
        typeCounts[pType] += item.quantity;
      }
    }

    let totalQuota = 0;
    let usedDownloads = 0;
    for (const order of paidOrders) {
      for (const grant of order.download_grants ?? []) {
        totalQuota += grant.max_downloads;
        usedDownloads += grant.download_count;
      }
    }
    const remainingDownloads = Math.max(0, totalQuota - usedDownloads);
    const quotaRemainingPct =
      totalQuota > 0 ? Math.round((remainingDownloads / totalQuota) * 100) : 0;

    const dailyMap = new Map<
      string,
      { label: string; count: number; totalVnd: number }
    >();
    for (const order of orders) {
      const { key, label } = toLocalDayKey(order.created_at);
      if (key === 'unknown') continue;
      const existing = dailyMap.get(key);
      if (existing) {
        existing.count += 1;
        if (order.status === 'paid') existing.totalVnd += order.total_vnd;
      } else {
        dailyMap.set(key, {
          label,
          count: 1,
          totalVnd: order.status === 'paid' ? order.total_vnd : 0,
        });
      }
    }

    const nowVnMs = referenceNowMs + 7 * 60 * 60 * 1000;
    const rollingDays: string[] = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      rollingDays.push(
        new Date(nowVnMs - offset * 86_400_000).toISOString().slice(0, 10)
      );
    }
    const hasRolling = rollingDays.some((d) => dailyMap.has(d));
    const targetDays =
      hasRolling || dailyMap.size === 0
        ? rollingDays
        : Array.from(dailyMap.keys()).sort().slice(-7);

    const dailyTrend = targetDays.map((date) => {
      const row = dailyMap.get(date);
      const [, month, day] = date.split('-');
      return {
        date,
        label: row?.label ?? `${day}/${month}`,
        count: row?.count ?? 0,
        totalVnd: row?.totalVnd ?? 0,
      };
    });

    const maxDailyCount = Math.max(1, ...dailyTrend.map((d) => d.count));
    const recentOrders = [...orders]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 4);

    return {
      totalOrders,
      paidCount: paidOrders.length,
      pendingCount: pendingOrders.length,
      completionRate,
      totalPaidVnd,
      avgPaidOrderVnd,
      totalItemsQty,
      typeCounts,
      totalQuota,
      usedDownloads,
      remainingDownloads,
      quotaRemainingPct,
      dailyTrend,
      maxDailyCount,
      recentOrders,
    };
  }, [orders, products, referenceNowMs]);

  const totalTypeUnits = Math.max(
    1,
    stats.typeCounts.template +
      stats.typeCounts.prompt_pack +
      stats.typeCounts.workflow
  );

  const typeRows: Array<{
    type: ProductType;
    label: string;
    count: number;
    pct: number;
    toneClass: string;
  }> = [
    {
      type: 'template',
      label: getProductTypeLabel('template'),
      count: stats.typeCounts.template,
      pct: Math.round((stats.typeCounts.template / totalTypeUnits) * 100),
      toneClass: 'is-emerald',
    },
    {
      type: 'prompt_pack',
      label: getProductTypeLabel('prompt_pack'),
      count: stats.typeCounts.prompt_pack,
      pct: Math.round((stats.typeCounts.prompt_pack / totalTypeUnits) * 100),
      toneClass: 'is-copper',
    },
    {
      type: 'workflow',
      label: getProductTypeLabel('workflow'),
      count: stats.typeCounts.workflow,
      pct: Math.round((stats.typeCounts.workflow / totalTypeUnits) * 100),
      toneClass: 'is-info',
    },
  ];

  const resolvedTitle = title ?? sd.titleDefault;
  const resolvedSubtitle = subtitle ?? sd.subtitleDefault;

  if (isLoading) {
    return (
      <div className="dg-dash-bento" aria-busy="true" aria-label={resolvedTitle}>
        <div className="skeleton-box dg-dash-span-5" style={{ height: '210px' }} />
        <div className="skeleton-box dg-dash-span-7" style={{ height: '210px' }} />
        <div className="skeleton-box dg-dash-span-4" style={{ height: '190px' }} />
        <div className="skeleton-box dg-dash-span-4" style={{ height: '190px' }} />
        <div className="skeleton-box dg-dash-span-4" style={{ height: '190px' }} />
      </div>
    );
  }

  return (
    <section
      aria-label={resolvedTitle}
      style={{ display: 'grid', gap: 'var(--space-4)' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'grid', gap: '4px' }}>
          <span className="type-eyebrow">{sd.eyebrow}</span>
          <h2 className="type-h2" style={{ margin: 0 }}>
            {resolvedTitle}
          </h2>
          <p className="type-body-sm" style={{ margin: 0 }}>
            {resolvedSubtitle}
          </p>
        </div>

        <Link href="/products" className="btn btn--secondary btn--sm">
          <ShoppingBag size={14} />
          <span>{sd.chooseMoreBtn}</span>
        </Link>
      </div>

      <div className="dg-dash-bento">
        {/* Element 1 */}
        <article className="surface-card dg-panel dg-dash-card dg-dash-span-5">
          <div className="dg-dash-card__head">
            <div className="dg-dash-card__title-wrap">
              <span className="dg-dash-eyebrow">{sd.el1Eyebrow}</span>
              <h3 className="type-h3" style={{ margin: 0 }}>
                {sd.el1Title}
              </h3>
            </div>
            <span className="badge badge--accent type-mono">
              {sd.el1OrdersBadge(stats.paidCount, stats.totalOrders)}
            </span>
          </div>

          <div className="dg-ring-pair">
            <ProgressRing
              value={stats.completionRate}
              label={sd.el1RingPay}
              centerPrimary={`${stats.completionRate}%`}
              centerSecondary={`${stats.paidCount}/${stats.totalOrders}`}
              valueText={`${sd.el1RingPay} ${stats.completionRate}%`}
              tone="accent"
              size={104}
              thickness={10}
            />
            <ProgressRing
              value={stats.quotaRemainingPct}
              label={sd.el1RingQuota}
              centerPrimary={`${stats.remainingDownloads}`}
              centerSecondary={
                stats.totalQuota > 0
                  ? sd.el1QuotaSub(stats.totalQuota)
                  : sd.el1None
              }
              valueText={`${sd.el1RingQuota} ${stats.remainingDownloads}`}
              tone="info"
              size={104}
              thickness={10}
            />
          </div>
        </article>

        {/* Element 2 */}
        <article className="surface-card dg-panel dg-dash-card dg-dash-span-7">
          <div className="dg-dash-card__head">
            <div className="dg-dash-card__title-wrap">
              <span className="dg-dash-eyebrow">{sd.el2Eyebrow}</span>
              <h3 className="type-h3" style={{ margin: 0 }}>
                {sd.el2Title}
              </h3>
            </div>
            <span className="badge badge--success">
              {sd.el2PaidBadge(stats.paidCount)}
            </span>
          </div>

          <div className="dg-spend-hero">
            <div className="dg-spend-main">
              <span className="type-caption">{sd.el2TotalPaid}</span>
              <strong
                className="dg-kpi-value type-price"
                style={{ color: 'var(--accent)' }}
              >
                {formatPrice(stats.totalPaidVnd)}
              </strong>
            </div>

            <div className="dg-chip-metrics">
              <div className="dg-mini-stat">
                <span className="type-caption">{sd.el2AvgOrder}</span>
                <strong className="type-price">
                  {formatPrice(stats.avgPaidOrderVnd)}
                </strong>
              </div>
              <div className="dg-mini-stat">
                <span className="type-caption">{sd.el2TotalItems}</span>
                <strong className="type-mono">
                  {stats.totalItemsQty} {sd.el2UnitPkg}
                </strong>
              </div>
              <div className="dg-mini-stat">
                <span className="type-caption">{sd.el2Pending}</span>
                <strong className="type-mono">
                  {stats.pendingCount} {sd.el2UnitOrder}
                </strong>
              </div>
            </div>
          </div>
        </article>

        {/* Element 3 */}
        <article className="surface-card dg-panel dg-dash-card dg-dash-span-4">
          <div className="dg-dash-card__head">
            <div className="dg-dash-card__title-wrap">
              <span className="dg-dash-eyebrow">{sd.el3Eyebrow}</span>
              <h3 className="type-h3" style={{ margin: 0 }}>
                {sd.el3Title}
              </h3>
            </div>
            <Layers size={18} style={{ color: 'var(--accent)' }} />
          </div>

          <div className="dg-funnel-list">
            {typeRows.map((row) => (
              <div key={row.type} className="dg-funnel-step">
                <div className="dg-funnel-step__meta">
                  <span>{row.label}</span>
                  <strong className="type-mono">
                    {row.count} ({stats.totalItemsQty > 0 ? row.pct : 0}%)
                  </strong>
                </div>
                <div className="dg-bar-track">
                  <div
                    className={`dg-bar-fill ${row.toneClass}`}
                    style={{ width: `${stats.totalItemsQty > 0 ? row.pct : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Element 4 */}
        <article className="surface-card dg-panel dg-dash-card dg-dash-span-4">
          <div className="dg-dash-card__head">
            <div className="dg-dash-card__title-wrap">
              <span className="dg-dash-eyebrow">{sd.el4Eyebrow}</span>
              <h3 className="type-h3" style={{ margin: 0 }}>
                {sd.el4Title}
              </h3>
            </div>
            <Rocket size={18} style={{ color: 'var(--accent)' }} />
          </div>

          <div className="dg-col-chart" role="list" aria-label={sd.el4Title}>
            {stats.dailyTrend.map((pt) => {
              const heightPct =
                pt.count > 0
                  ? Math.max(14, Math.round((pt.count / stats.maxDailyCount) * 100))
                  : 5;
              return (
                <div
                  key={pt.date}
                  role="listitem"
                  className="dg-col-item"
                  title={`${pt.date}: ${pt.count} (${formatPrice(pt.totalVnd)})`}
                >
                  <span className="dg-col-value type-mono">{pt.count}</span>
                  <div className="dg-col-track">
                    <div
                      className={`dg-col-bar ${pt.count > 0 ? 'is-active' : ''}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="dg-col-label type-mono">{pt.label}</span>
                </div>
              );
            })}
          </div>
        </article>

        {/* Element 5 */}
        <article className="surface-card dg-panel dg-dash-card dg-dash-span-4">
          <div className="dg-dash-card__head">
            <div className="dg-dash-card__title-wrap">
              <span className="dg-dash-eyebrow">{sd.el5Eyebrow}</span>
              <h3 className="type-h3" style={{ margin: 0 }}>
                {sd.el5Title}
              </h3>
            </div>
            <Download size={18} style={{ color: 'var(--accent)' }} />
          </div>

          {stats.recentOrders.length === 0 ? (
            <p className="type-body-sm" style={{ margin: 0 }}>
              {sd.el5EmptyPrefix}
              <Link
                href="/products"
                style={{ color: 'var(--accent)', fontWeight: 700 }}
              >
                {sd.el5EmptyLink}
              </Link>
              {sd.el5EmptySuffix}
            </p>
          ) : (
            <div className="dg-recent-feed">
              {stats.recentOrders.map((order) => {
                const statusMeta = getOrderStatusMeta(order.status);
                const grantCount = order.download_grants?.length ?? 0;
                const usedCount =
                  order.download_grants?.reduce((s, g) => s + g.download_count, 0) ?? 0;
                const maxCount =
                  order.download_grants?.reduce((s, g) => s + g.max_downloads, 0) ?? 0;

                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="dg-recent-row"
                  >
                    <div style={{ minWidth: 0, display: 'grid', gap: '2px' }}>
                      <span
                        className="type-mono"
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: 'var(--ink)',
                        }}
                      >
                        {order.order_code}
                      </span>
                      <span
                        className="type-caption"
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {formatDate(order.created_at)}
                        {grantCount > 0
                          ? ` • ${sd.el5Downloaded(usedCount, maxCount)}`
                          : ''}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexShrink: 0,
                      }}
                    >
                      <span className={`badge badge--${statusMeta.tone}`}>
                        {order.status === 'paid' ? sd.el5Ready : statusMeta.label}
                      </span>
                      <ArrowRight size={14} style={{ color: 'var(--ink-soft)' }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
