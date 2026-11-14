'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  formatVnd,
  PRODUCT_TYPE_LABELS,
  SOURCE_TYPE_META,
} from '@/components/shared/formatters';
import { ProductPlaceholderFrame } from '@/components/visual/ProductPlaceholderFrame';
import { getProductById, listProducts } from '@/services';
import { useCart, useExperiment } from '@/state';
import type { ProductDetailDto, ProductSummaryDto } from '@/types/api';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';
  const router = useRouter();
  const { addItem } = useCart();
  const { scenarioState, track } = useExperiment();

  const [product, setProduct] = useState<ProductDetailDto | null>(null);
  const [related, setRelated] = useState<ProductSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>(
    'desktop'
  );
  const [isAdding, setIsAdding] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const viewedTrackedRef = useRef<string | null>(null);

  const hasOpenScenario = Boolean(
    scenarioState?.scenario_run_id && !scenarioState.is_finished
  );

  useEffect(() => {
    if (!slug) return;
    let active = true;
    const controller = new AbortController();

    void Promise.resolve().then(async () => {
      if (!active) return;
      setIsLoading(true);
      setErrorMessage(null);
      const res = await getProductById(slug, controller.signal);
      if (!active) return;
      setIsLoading(false);

      if (!res.ok) {
        setErrorMessage(res.error.message);
        setProduct(null);
        return;
      }

      setProduct(res.data);

      const relRes = await listProducts(
        { industry: res.data.industry, limit: 4 },
        controller.signal
      );
      if (active && relRes.ok) {
        setRelated(
          relRes.data.filter((item) => item.id !== res.data.id).slice(0, 2)
        );
      }
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    if (viewedTrackedRef.current === product.id) return;
    viewedTrackedRef.current = product.id;
    void track('product_viewed', { product_id: product.id });
  }, [product, track]);

  const handleAddToCart = async (goToCheckout = false) => {
    if (!product || isAdding) return;
    setIsAdding(true);
    const ok = await addItem(product.id, 1);
    setIsAdding(false);
    if (ok) {
      void track('add_to_cart', { product_id: product.id });
      if (goToCheckout) {
        router.push('/checkout');
        return;
      }
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <section className="section section--compact">
        <div className="container split-stage">
          <div className="skeleton-box" style={{ height: '440px' }} />
          <div className="skeleton-box" style={{ height: '320px' }} />
        </div>
      </section>
    );
  }

  if (errorMessage || !product) {
    return (
      <section className="section section--compact">
        <div className="container container--narrow">
          <div className="callout callout--danger" role="alert">
            <strong>Không thể tải thông tin sản phẩm</strong>
            <span>{errorMessage ?? 'Sản phẩm không tồn tại hoặc đã ngừng bán.'}</span>
            <div style={{ marginTop: '8px' }}>
              <Link href="/products" className="btn btn--secondary btn--sm">
                Quay lại danh mục
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const sourceMeta = SOURCE_TYPE_META[product.source_type];
  const deliverables = Array.isArray(product.specs.deliverables)
    ? product.specs.deliverables
    : [];
  const platforms = Array.isArray(product.specs.platforms)
    ? product.specs.platforms
    : [];
  const techStack = Array.isArray(product.specs.tech_stack)
    ? product.specs.tech_stack
    : [];

  return (
    <section className="section section--compact has-mobile-cta-bar">
      <div className="container" style={{ display: 'grid', gap: '24px' }}>
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
            fontSize: 'var(--text-body-sm)',
            color: 'var(--ink-soft)',
          }}
        >
          <Link href="/products">Sản phẩm</Link>
          <span aria-hidden="true">/</span>
          <span>{product.industry}</span>
          <span aria-hidden="true">/</span>
          <strong style={{ color: 'var(--ink)' }}>{product.name}</strong>
        </nav>

        {/* Split Stage */}
        <div className="split-stage">
          {/* Left Column: Interactive Preview Stage + Specs */}
          <div style={{ display: 'grid', gap: '24px' }}>
            <div className="viewport-stage">
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <span className="type-eyebrow">Khung xem trước cấu trúc</span>
                  <div className="type-body-sm">
                    Kiểm tra bố cục gói trên màn hình máy tính và điện thoại
                  </div>
                </div>

                <div
                  className="chip-row"
                  role="group"
                  aria-label="Chọn kích thước khung xem trước"
                >
                  <button
                    type="button"
                    className="chip"
                    aria-pressed={viewportMode === 'desktop'}
                    onClick={() => setViewportMode('desktop')}
                  >
                    Desktop 1280px
                  </button>
                  <button
                    type="button"
                    className="chip"
                    aria-pressed={viewportMode === 'mobile'}
                    onClick={() => setViewportMode('mobile')}
                  >
                    Mobile 375px
                  </button>
                </div>
              </div>

              <div
                className={`viewport-frame ${
                  viewportMode === 'mobile'
                    ? 'viewport-frame--mobile'
                    : 'viewport-frame--desktop'
                }`}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--border-hairline)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--ink-soft)',
                  }}
                >
                  <span>
                    {viewportMode === 'mobile' ? '375px • Mobile' : '1280px • Desktop'}
                  </span>
                  <span>{product.slug}</span>
                </div>
                <div style={{ padding: '16px', display: 'grid', gap: '14px' }}>
                  <ProductPlaceholderFrame
                    productType={product.product_type}
                    industry={product.industry}
                    sourceType={product.source_type}
                  />
                  <div
                    style={{
                      display: 'grid',
                      gap: '6px',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                    }}
                  >
                    <strong>{product.name}</strong>
                    <span className="type-body-sm">{product.short_description}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-card" style={{ display: 'grid', gap: '16px' }}>
              <h2 className="type-h2" style={{ margin: 0 }}>
                Mô tả chi tiết giải pháp
              </h2>
              <p className="type-body" style={{ margin: 0 }}>
                {product.description}
              </p>

              {deliverables.length > 0 && (
                <div style={{ display: 'grid', gap: '8px' }}>
                  <h3 className="type-h3" style={{ margin: 0 }}>
                    Gói bàn giao bao gồm
                  </h3>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '20px',
                      display: 'grid',
                      gap: '6px',
                    }}
                  >
                    {deliverables.map((item) => (
                      <li key={String(item)} className="type-body-sm">
                        {String(item)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-hairline)',
                }}
              >
                {platforms.length > 0 && (
                  <div style={{ display: 'grid', gap: '6px' }}>
                    <span className="type-caption">Nền tảng hỗ trợ</span>
                    <div className="chip-row">
                      {platforms.map((pf) => (
                        <span key={String(pf)} className="badge">
                          {String(pf)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {techStack.length > 0 && (
                  <div style={{ display: 'grid', gap: '6px' }}>
                    <span className="type-caption">Công nghệ sử dụng</span>
                    <div className="chip-row">
                      {techStack.map((tech) => (
                        <span key={String(tech)} className="badge type-mono">
                          {String(tech)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {typeof product.specs.setup_time_minutes === 'number' && (
                  <div style={{ display: 'grid', gap: '6px' }}>
                    <span className="type-caption">Thời gian cài đặt</span>
                    <strong className="type-mono">
                      ~{product.specs.setup_time_minutes} phút
                    </strong>
                  </div>
                )}
              </div>

              {product.specs.guide_summary && (
                <div className="callout callout--info">
                  <strong>Hướng dẫn triển khai nhanh</strong>
                  <span>{String(product.specs.guide_summary)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Purchase & License Dock */}
          <aside className="split-stage__dock">
            <div className="surface-card" style={{ display: 'grid', gap: '16px' }}>
              <div className="chip-row">
                <span className="badge">
                  {PRODUCT_TYPE_LABELS[product.product_type]}
                </span>
                <span className="badge">{product.industry}</span>
                {product.specs.target_shop_size && (
                  <span className="badge">
                    Shop {String(product.specs.target_shop_size)}
                  </span>
                )}
              </div>

              <h1 className="type-h2" style={{ margin: 0 }}>
                {product.name}
              </h1>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: '12px',
                  paddingBlock: '8px',
                  borderBlock: '1px solid var(--border-hairline)',
                }}
              >
                <span className="type-body-sm">Giá niêm yết (DB)</span>
                <span className="type-price" style={{ fontSize: '1.75rem' }}>
                  {formatVnd(product.price_vnd)}
                </span>
              </div>

              {/* Mandatory Copyright Transparency Box */}
              <div className="callout">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <strong style={{ fontSize: '0.875rem' }}>
                    Minh bạch bản quyền
                  </strong>
                  <span className={`badge badge--${sourceMeta.badgeTone}`}>
                    {sourceMeta.label}
                  </span>
                </div>
                <p className="type-body-sm" style={{ margin: 0 }}>
                  {product.license_note}
                </p>
                <span className="type-caption">
                  Mã phân loại: <code className="type-mono">{product.source_type}</code>
                </span>
              </div>

              {hasOpenScenario && (
                <div className="callout callout--success">
                  <strong>Bạn đang làm Kịch bản F11</strong>
                  <span>
                    Nếu gói này phù hợp với đề bài, bấm nút bên dưới để chốt gói
                    và chấm độ tự tin.
                  </span>
                  <button
                    type="button"
                    className="btn btn--primary btn--block"
                    onClick={() =>
                      router.push(
                        `/experiment?selected_product_id=${encodeURIComponent(product.id)}`
                      )
                    }
                  >
                    Chọn gói này cho Kịch bản
                  </button>
                </div>
              )}

              <div style={{ display: 'grid', gap: '10px' }}>
                <button
                  type="button"
                  className={
                    hasOpenScenario
                      ? 'btn btn--secondary btn--block'
                      : 'btn btn--primary btn--block'
                  }
                  disabled={isAdding}
                  onClick={() => void handleAddToCart(false)}
                >
                  {addedFeedback
                    ? 'Đã thêm vào giỏ hàng'
                    : isAdding
                      ? 'Đang thêm...'
                      : 'Thêm vào giỏ hàng'}
                </button>
                <button
                  type="button"
                  className="btn btn--secondary btn--block"
                  disabled={isAdding}
                  onClick={() => void handleAddToCart(true)}
                >
                  Mua ngay (Thanh toán Sandbox)
                </button>
              </div>

              <span className="type-caption">
                {product.has_downloadable_file
                  ? 'Sẵn sàng bàn giao file số qua token sau khi thanh toán Sandbox.'
                  : 'Liên hệ nhóm đề tài để nhận bàn giao bổ sung.'}
              </span>
            </div>
          </aside>
        </div>

        {/* Related 2-pack strip */}
        {related.length > 0 && (
          <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
            <h2 className="type-h2" style={{ margin: 0 }}>
              Gợi ý khác cùng ngành {product.industry}
            </h2>
            <div className="assurance-grid">
              {related.map((item) => (
                <article
                  key={item.id}
                  className="product-card product-card--horizontal"
                >
                  <ProductPlaceholderFrame
                    productType={item.product_type}
                    industry={item.industry}
                    sourceType={item.source_type}
                  />
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <span className="badge" style={{ width: 'fit-content' }}>
                      {PRODUCT_TYPE_LABELS[item.product_type]}
                    </span>
                    <h3 className="product-card__title">
                      <Link href={`/products/${item.slug}`}>{item.name}</Link>
                    </h3>
                    <div className="product-card__footer">
                      <span className="type-price">
                        {formatVnd(item.price_vnd)}
                      </span>
                      <Link
                        href={`/products/${item.slug}`}
                        className="btn btn--secondary btn--sm"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="mobile-bottom-cta">
        <div>
          <div className="type-caption">Giá niêm yết</div>
          <strong className="type-price">{formatVnd(product.price_vnd)}</strong>
        </div>
        {hasOpenScenario ? (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() =>
              router.push(
                `/experiment?selected_product_id=${encodeURIComponent(product.id)}`
              )
            }
          >
            Chọn cho Kịch bản
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primary"
            disabled={isAdding}
            onClick={() => void handleAddToCart(false)}
          >
            {addedFeedback ? 'Đã thêm' : 'Thêm vào giỏ'}
          </button>
        )}
      </div>
    </section>
  );
}
