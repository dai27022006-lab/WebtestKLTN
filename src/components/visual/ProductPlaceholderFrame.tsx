import { PRODUCT_TYPE_LABELS, SOURCE_TYPE_META } from '@/components/shared/formatters';
import type { ProductSourceType, ProductType } from '@/types/api';

interface ProductPlaceholderFrameProps {
  productType: ProductType;
  industry: string;
  sourceType?: ProductSourceType;
  compact?: boolean;
}

export function ProductPlaceholderFrame({
  productType,
  industry,
  sourceType,
  compact = false,
}: ProductPlaceholderFrameProps) {
  const typeLabel = PRODUCT_TYPE_LABELS[productType];
  const sourceMeta = sourceType ? SOURCE_TYPE_META[sourceType] : null;

  return (
    <div
      className={`product-frame ${compact ? 'product-frame--compact' : ''}`}
      aria-hidden="true"
    >
      <div className="product-frame__top">
        <span className="badge">{typeLabel}</span>
        {!compact && sourceMeta && (
          <span className={`badge badge--${sourceMeta.badgeTone}`}>
            {sourceMeta.label}
          </span>
        )}
      </div>

      <div className="product-frame__canvas">
        {productType === 'template' && (
          <div className="wireframe-browser">
            <div className="wireframe-dots">
              <i />
              <i />
              <i />
              <span className="type-caption" style={{ marginLeft: 'auto' }}>
                {industry}
              </span>
            </div>
            <div className="wireframe-body">
              <div className="wireframe-block wireframe-block--accent" />
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
                }}
              >
                <span className="prompt-token">{'{{nganh_hang}}'}</span>
                <span className="type-caption">{industry}</span>
              </div>
              {!compact && (
                <div
                  className="wireframe-block"
                  style={{ height: '14px', width: '88%' }}
                />
              )}
            </div>
            {!compact && (
              <div className="prompt-card-mini">
                <span className="prompt-token">{'{{loi_ich_chinh}}'}</span>
                <div
                  className="wireframe-block"
                  style={{ height: '12px', width: '74%' }}
                />
              </div>
            )}
          </div>
        )}

        {productType === 'workflow' && (
          <div className="workflow-nodes">
            <div className="workflow-node">Đơn mới</div>
            <div className="workflow-arrow" />
            <div className="workflow-node workflow-node--accent">Đồng bộ</div>
            <div className="workflow-arrow" />
            <div className="workflow-node">Sheets/Zalo</div>
          </div>
        )}
      </div>
    </div>
  );
}
