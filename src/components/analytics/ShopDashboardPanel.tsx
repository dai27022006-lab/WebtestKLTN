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
import {
  formatDateTimeVi,
  formatVnd,
  ORDER_STATUS_META,
  PRODUCT_TYPE_LABELS,
} from '@/components/shared/formatters';
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
  title = 'Bảng Thống Kê Tài Khoản Shop',
  subtitle = 'Theo dõi tiến độ đơn hàng, tổng chi tiêu, cơ cấu gói số và lượt tải còn lại của bạn.',
}: ShopDashboardPanelProps) {
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

    // Element 4: Daily order buckets (rolling 7 VN days or active order dates)
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
      rollingDays.push(new Date(nowVnMs - offset * 86_400_000).toISOString().slice(0, 10));
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
      label: PRODUCT_TYPE_LABELS.template,
      count: stats.typeCounts.template,
      pct: Math.round((stats.typeCounts.template / totalTypeUnits) * 100),
      toneClass: 'is-emerald',
    },
    {
      type: 'prompt_pack',
      label: PRODUCT_TYPE_LABELS.prompt_pack,
      count: stats.typeCounts.prompt_pack,
      pct: Math.round((stats.typeCounts.prompt_pack / totalTypeUnits) * 100),
      toneClass: 'is-copper',
    },
    {
      type: 'workflow',
      label: PRODUCT_TYPE_LABELS.workflow,
      count: stats.typeCounts.workflow,
      pct: Math.round((stats.typeCounts.workflow / totalTypeUnits) * 100),
      toneClass: 'is-info',
    },
  ];

  if (isLoading) {
    return (
      <div className="dg-dash-bento" aria-busy="true" aria-label="Đang tải thống kê shop">
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
      aria-label={title}
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
          <span className="type-eyebrow">Tổng quan hoạt động shop (5 chỉ số)</span>
          <h2 className="type-h2" style={{ margin: 0 }}>
            {title}
          </h2>
          <p className="type-body-sm" style={{ margin: 0 }}>
            {subtitle}
          </p>
        </div>

        <Link href="/products" className="btn btn--secondary btn--sm">
          <ShoppingBag size={14} />
          <span>Chọn thêm gói mới</span>
        </Link>
      </div>

      <div className="dg-dash-bento">
        {/* Yếu tố 1: Vòng tròn Tỉ lệ Hoàn tất Đơn & Hạn mức Tải */}
        <article className="surface-card dg-panel dg-dash-card dg-dash-span-5">
          <div className="dg-dash-card__head">
            <div className="dg-dash-card__title-wrap">
              <span className="dg-dash-eyebrow">Yếu tố 1 • Trạng thái Sở hữu</span>
              <h3 className="type-h3" style={{ margin: 0 }}>
                Hoàn tất Đơn &amp; Lượt tải
              </h3>
            </div>
            <span className="badge badge--accent type-mono">
              {stats.paidCount}/{stats.totalOrders} đơn
            </span>
          </div>

          <div className="dg-ring-pair">
            <ProgressRing
              value={stats.completionRate}
              label="Tỉ lệ thanh toán"
              centerPrimary={`${stats.completionRate}%`}
              centerSecondary={`${stats.paidCount}/${stats.totalOrders}`}
              valueText={`Đã thanh toán ${stats.paidCount} trên ${stats.totalOrders} đơn`}
              tone="accent"
              size={104}
              thickness={10}
            />
            <ProgressRing
              value={stats.quotaRemainingPct}
              label="Lượt tải còn lại"
              centerPrimary={`${stats.remainingDownloads}`}
              centerSecondary={stats.totalQuota > 0 ? `/ ${stats.totalQuota} lượt` : 'Chưa có'}
              valueText={`Còn ${stats.remainingDownloads} trên tổng ${stats.totalQuota} lượt tải`}
              tone="info"
              size={104}
              thickness={10}
            />
          </div>
        </article>

        {/* Yếu tố 2: Tổng Chi tiêu & Giá trị Đơn Hàng */}
        <article className="surface-card dg-panel dg-dash-card dg-dash-span-7">
          <div className="dg-dash-card__head">
            <div className="dg-dash-card__title-wrap">
              <span className="dg-dash-eyebrow">Yếu tố 2 • Ngân sách Đầu tư Công cụ</span>
              <h3 className="type-h3" style={{ margin: 0 }}>
                Tổng Chi tiêu &amp; Quy mô Đơn
              </h3>
            </div>
            <span className="badge badge--success">
              Đã chi trả {stats.paidCount} đơn
            </span>
          </div>

          <div className="dg-spend-hero">
            <div className="dg-spend-main">
              <span className="type-caption">Tổng giá trị đã thanh toán</span>
              <strong className="dg-kpi-value type-price" style={{ color: 'var(--accent)' }}>
                {formatVnd(stats.totalPaidVnd)}
              </strong>
            </div>

            <div className="dg-chip-metrics">
              <div className="dg-mini-stat">
                <span className="type-caption">TB mỗi đơn</span>
                <strong className="type-price">
                  {formatVnd(stats.avgPaidOrderVnd)}
                </strong>
              </div>
              <div className="dg-mini-stat">
                <span className="type-caption">Tổng gói số</span>
                <strong className="type-mono">{stats.totalItemsQty} gói</strong>
              </div>
              <div className="dg-mini-stat">
                <span className="type-caption">Đang chờ</span>
                <strong className="type-mono">{stats.pendingCount} đơn</strong>
              </div>
            </div>
          </div>

          {/* Yếu tố 3 inline-paired or separate card below — wait, let's give Element 3 its own clear Bento card below so all 5 cards are unmistakably distinct! */}
        </article>

        {/* Yếu tố 3: Cơ cấu Gói Số Theo Danh mục */}
        <article className="surface-card dg-panel dg-dash-card dg-dash-span-4">
          <div className="dg-dash-card__head">
            <div className="dg-dash-card__title-wrap">
              <span className="dg-dash-eyebrow">Yếu tố 3 • Phân Bổ Danh Mục</span>
              <h3 className="type-h3" style={{ margin: 0 }}>
                Loại Gói Đã Chọn
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

        {/* Yếu tố 4: Biểu đồ Xu hướng Đặt đơn 7 Ngày */}
        <article className="surface-card dg-panel dg-dash-card dg-dash-span-4">
          <div className="dg-dash-card__head">
            <div className="dg-dash-card__title-wrap">
              <span className="dg-dash-eyebrow">Yếu tố 4 • Tần suất Giao dịch</span>
              <h3 className="type-h3" style={{ margin: 0 }}>
                Đơn hàng Theo Ngày
              </h3>
            </div>
            <Rocket size={18} style={{ color: 'var(--accent)' }} />
          </div>

          <div className="dg-col-chart" role="list" aria-label="Biểu đồ đơn hàng theo ngày">
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
                  title={`${pt.date}: ${pt.count} đơn (${formatVnd(pt.totalVnd)})`}
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

        {/* Yếu tố 5: Hoạt động & Truy cập Tải file Gần nhất */}
        <article className="surface-card dg-panel dg-dash-card dg-dash-span-4">
          <div className="dg-dash-card__head">
            <div className="dg-dash-card__title-wrap">
              <span className="dg-dash-eyebrow">Yếu tố 5 • Tải Nhanh Gần Nhất</span>
              <h3 className="type-h3" style={{ margin: 0 }}>
                Giao dịch &amp; Hạn tải
              </h3>
            </div>
            <Download size={18} style={{ color: 'var(--accent)' }} />
          </div>

          {stats.recentOrders.length === 0 ? (
            <p className="type-body-sm" style={{ margin: 0 }}>
              Chưa có đơn hàng nào. Chọn một gói tại{' '}
              <Link href="/products" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                Danh mục sản phẩm
              </Link>{' '}
              để bắt đầu.
            </p>
          ) : (
            <div className="dg-recent-feed">
              {stats.recentOrders.map((order) => {
                const statusMeta = ORDER_STATUS_META[order.status];
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
                      <span className="type-caption" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {formatDateTimeVi(order.created_at)}
                        {grantCount > 0 ? ` • Đã tải ${usedCount}/${maxCount}` : ''}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span className={`badge badge--${statusMeta.tone}`}>
                        {order.status === 'paid' ? 'Sẵn sàng' : statusMeta.label}
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
