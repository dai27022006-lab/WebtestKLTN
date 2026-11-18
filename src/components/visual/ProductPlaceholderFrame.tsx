'use client';

import { Lock } from '@/components/icons/DreamIcons';
import { useLocale } from '@/components/providers/LocaleProvider';
import type { ProductSourceType, ProductType } from '@/types/api';

interface ProductPlaceholderFrameProps {
  productType: ProductType;
  industry: string;
  sourceType?: ProductSourceType;
  compact?: boolean;
  aspect?: '4/3' | '16/10';
  slug?: string;
}

export function ProductPlaceholderFrame({
  productType,
  industry,
  sourceType,
  compact = false,
  aspect = '4/3',
  slug,
}: ProductPlaceholderFrameProps) {
  const { locale, getProductTypeLabel, getSourceMeta, getIndustryLabel } =
    useLocale();
  const typeLabel = getProductTypeLabel(productType);
  const sourceMeta = sourceType ? getSourceMeta(sourceType) : null;
  const industryLabel = getIndustryLabel(industry);

  const flowStep1 =
    locale === 'en'
      ? 'New Order'
      : locale === 'ru'
        ? 'Заказ'
        : locale === 'zh'
          ? '新订单'
          : 'Đơn mới';
  const flowStep2 =
    locale === 'en'
      ? 'Sync'
      : locale === 'ru'
        ? 'Синхрон'
        : locale === 'zh'
          ? '自动同步'
          : 'Đồng bộ';

  return (
    <div
      className={`product-frame ${compact ? 'product-frame--compact' : ''} ${
        aspect === '16/10' ? 'product-frame--16-10' : ''
      }`}
      aria-hidden="true"
    >
      {!compact && (
        <div className="dg-browser-frame-bar dg-browser-frame-bar--embedded">
          <div className="dg-mac-dots">
            <span className="red" />
            <span className="yellow" />
            <span className="green" />
          </div>
          <div className="dg-browser-url">
            <Lock size={10} />
            <span>{slug ? `dreamteam.vn/${slug}` : `dreamteam.vn/${productType}`}</span>
          </div>
          {sourceMeta && (
            <span className={`badge badge--${sourceMeta.badgeTone}`}>
              {sourceMeta.label}
            </span>
          )}
        </div>
      )}

      <div className="product-frame__inner">
        <div className="product-frame__top">
          <span className="badge badge--accent">{typeLabel}</span>
          {!compact && <span className="badge">{industryLabel}</span>}
        </div>

        <div className="product-frame__canvas">
          {productType === 'template' && (
            <div className="wireframe-browser">
              <div className="wireframe-dots">
                <i />
                <i />
                <i />
                <span className="type-caption" style={{ marginLeft: 'auto' }}>
                  {industryLabel} • 375px–1440px
                </span>
              </div>
              <div className="wireframe-body">
                <div className="wireframe-block wireframe-block--accent">
                  <div className="wireframe-mini-pill" />
                  <div className="wireframe-mini-bar" />
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateRows: '1fr 1fr',
                    gap: '6px',
                  }}
                >
                  <div className="wireframe-block" />
                  <div className="wireframe-block" />
                </div>
              </div>
            </div>
          )}

          {productType === 'prompt_pack' && (
            <div className="prompt-stack">
              <div className="prompt-card-mini">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span className="prompt-token">{'{{category}}'}</span>
                  <span className="type-caption">{industryLabel}</span>
                </div>
                {!compact && (
                  <div
                    className="wireframe-block"
                    style={{ height: '12px', width: '88%' }}
                  />
                )}
              </div>
              {!compact && (
                <div className="prompt-card-mini">
                  <span className="prompt-token">{'{{key_benefit}}'}</span>
                  <div
                    className="wireframe-block"
                    style={{ height: '10px', width: '74%' }}
                  />
                </div>
              )}
            </div>
          )}

          {productType === 'workflow' && (
            <div className="workflow-nodes">
              <div className="workflow-node">{flowStep1}</div>
              <div className="workflow-arrow" />
              <div className="workflow-node workflow-node--accent">{flowStep2}</div>
              <div className="workflow-arrow" />
              <div className="workflow-node">Sheets/Alert</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
