'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Timer,
} from '@/components/icons/DreamIcons';
import {
  formatVnd,
  PRODUCT_TYPE_LABELS,
  SOURCE_TYPE_META,
} from '@/components/shared/formatters';
import { LiveHtmlPreviewFrame } from '@/components/visual/LiveHtmlPreviewFrame';
import { ProductPlaceholderFrame } from '@/components/visual/ProductPlaceholderFrame';
import { getProductById, listProducts } from '@/services';
import { useCart, useExperiment } from '@/state';
import type {
  ProductCaseStudy,
  ProductDetailDto,
  ProductSummaryDto,
} from '@/types/api';

interface ProductDetailClientProps {
  slug?: string;
}

function RelatedThumb({ item }: { item: ProductSummaryDto }) {
  const [imgFailed, setImgFailed] = useState(false);
  if (!item.thumbnail_url || imgFailed) {
    return (
      <ProductPlaceholderFrame
        productType={item.product_type}
        industry={item.industry}
        sourceType={item.source_type}
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
        backgroundColor: 'var(--bg-surface-subtle)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.thumbnail_url}
        alt={`Ảnh minh họa ${item.name}`}
        width={960}
        height={600}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={() => setImgFailed(true)}
      />
    </div>
  );
}

export function ProductDetailClient({ slug: slugProp }: ProductDetailClientProps) {
  const params = useParams<{ slug: string }>();
  const slug = slugProp ?? params?.slug ?? '';
  const router = useRouter();
  const { addItem } = useCart();
  const { assignment, scenarioState, track } = useExperiment();

  const [product, setProduct] = useState<ProductDetailDto | null>(null);
  const [related, setRelated] = useState<ProductSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const viewedTrackedRef = useRef<string | null>(null);

  const hasOpenScenario = Boolean(
    assignment?.consent_given &&
      scenarioState?.scenario_run_id &&
      !scenarioState.is_finished
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
            <span>
              {errorMessage ?? 'Sản phẩm không tồn tại hoặc đã ngừng bán.'}
            </span>
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
    ? product.specs.deliverables.map(String)
    : [];
  const platforms = Array.isArray(product.specs.platforms)
    ? product.specs.platforms.map(String)
    : [];
  const techStack = Array.isArray(product.specs.tech_stack)
    ? product.specs.tech_stack.map(String)
    : [];
  const previewHighlights = Array.isArray(product.specs.preview_highlights)
    ? product.specs.preview_highlights.map(String)
    : [];
  const caseStudies: ProductCaseStudy[] = Array.isArray(
    product.specs.case_studies
  )
    ? product.specs.case_studies.filter(
        (cs): cs is ProductCaseStudy =>
          Boolean(cs && typeof cs.shop_name === 'string' && cs.quote)
      )
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
            gap: '6px',
            fontSize: 'var(--text-body-sm)',
            color: 'var(--ink-soft)',
          }}
        >
          <Link
            href="/products"
            style={{ fontWeight: 600, color: 'var(--accent)' }}
          >
            Sản phẩm
          </Link>
          <ChevronRight size={14} />
          <span>{product.industry}</span>
          <ChevronRight size={14} />
          <strong style={{ color: 'var(--ink)' }}>{product.name}</strong>
        </nav>

        {/* Split Stage */}
        <div className="split-stage">
          {/* Left Column: Live HTML Preview Stage + Specs + Case Studies */}
          <div style={{ display: 'grid', gap: '24px', minWidth: 0 }}>
            <LiveHtmlPreviewFrame
              demoUrl={product.demo_url}
              thumbnailUrl={product.thumbnail_url}
              productType={product.product_type}
              industry={product.industry}
              sourceType={product.source_type}
              slug={product.slug}
              productName={product.name}
              shortDescription={product.short_description}
              deliverables={deliverables}
            />

            <div
              className="surface-card dg-panel"
              style={{ display: 'grid', gap: '16px' }}
            >
              <h2 className="type-h2" style={{ margin: 0 }}>
                Mô tả chi tiết giải pháp
              </h2>
              <p className="type-body" style={{ margin: 0 }}>
                {product.description}
              </p>

              {previewHighlights.length > 0 && (
                <div style={{ display: 'grid', gap: '10px' }}>
                  <h3 className="type-h3" style={{ margin: 0 }}>
                    Điểm nổi bật khi triển khai
                  </h3>
                  <ul
                    style={{
                      margin: 0,
                      padding: 0,
                      listStyle: 'none',
                      display: 'grid',
                      gap: '8px',
                    }}
                  >
                    {previewHighlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="type-body-sm"
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          color: 'var(--ink)',
                        }}
                      >
                        <Sparkles
                          size={15}
                          style={{
                            color: 'var(--accent)',
                            flexShrink: 0,
                            marginTop: '3px',
                          }}
                        />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {deliverables.length > 0 && (
                <div style={{ display: 'grid', gap: '10px' }}>
                  <h3 className="type-h3" style={{ margin: 0 }}>
                    Gói bàn giao bao gồm
                  </h3>
                  <ul
                    style={{
                      margin: 0,
                      padding: 0,
                      listStyle: 'none',
                      display: 'grid',
                      gap: '8px',
                    }}
                  >
                    {deliverables.map((item) => (
                      <li
                        key={item}
                        className="type-body-sm"
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          color: 'var(--ink)',
                        }}
                      >
                        <CheckCircle2
                          size={16}
                          style={{
                            color: 'var(--accent)',
                            flexShrink: 0,
                            marginTop: '3px',
                          }}
                        />
                        <span>{item}</span>
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
                        <span key={pf} className="badge">
                          {pf}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {techStack.length > 0 && (
                  <div style={{ display: 'grid', gap: '6px' }}>
                    <span className="type-caption">Thành phần &amp; Định dạng</span>
                    <div className="chip-row">
                      {techStack.map((tech) => (
                        <span key={tech} className="badge type-mono">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {typeof product.specs.setup_time_minutes === 'number' && (
                  <div style={{ display: 'grid', gap: '6px' }}>
                    <span className="type-caption">Thời gian cài đặt</span>
                    <strong
                      className="type-mono"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Timer size={15} style={{ color: 'var(--accent)' }} />
                      <span>~{product.specs.setup_time_minutes} phút</span>
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

            {caseStudies.length > 0 && (
              <div
                className="surface-card dg-panel"
                style={{ display: 'grid', gap: '16px' }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'grid', gap: '4px' }}>
                    <span className="type-eyebrow">Case Study mẫu</span>
                    <h2 className="type-h2" style={{ margin: 0 }}>
                      Trải nghiệm thực tế (Case Study mẫu)
                    </h2>
                  </div>
                  <span className="badge badge--warning">
                    Phản hồi từ đợt chạy thử nghiệm mẫu
                  </span>
                </div>

                <div className="case-study-grid">
                  {caseStudies.map((cs) => (
                    <article key={cs.shop_name} className="case-study-card">
                      <div className="case-study-card__head">
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.95rem' }}>
                            {cs.shop_name}
                          </strong>
                          <span className="type-caption">{cs.shop_type}</span>
                        </div>
                        <span className="badge badge--accent type-mono">
                          {Number(cs.rating).toFixed(1)} / 5.0
                        </span>
                      </div>
                      <p className="case-study-card__quote">“{cs.quote}”</p>
                      <div className="case-study-card__outcome">
                        <CheckCircle2 size={14} />
                        <span>{cs.outcome}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Purchase & License Dock */}
          <aside className="split-stage__dock">
            <div
              className="surface-card dg-panel"
              style={{ display: 'grid', gap: '16px' }}
            >
              <div className="chip-row">
                <span className="badge badge--accent">
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
                  paddingBlock: '10px',
                  borderBlock: '1px solid var(--border-hairline)',
                }}
              >
                <span className="type-body-sm">Giá niêm yết</span>
                <span
                  className="type-price"
                  style={{ fontSize: '1.75rem', color: 'var(--accent)' }}
                >
                  {formatVnd(product.price_vnd)}
                </span>
              </div>

              {/* Copyright Transparency Box */}
              <div className="callout">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <strong
                    style={{
                      fontSize: '0.875rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <ShieldCheck size={15} style={{ color: 'var(--accent)' }} />
                    <span>Minh bạch bản quyền</span>
                  </strong>
                  <span className={`badge badge--${sourceMeta.badgeTone}`}>
                    {sourceMeta.label}
                  </span>
                </div>
                <p className="type-body-sm" style={{ margin: 0 }}>
                  {product.license_note}
                </p>
                <span className="type-caption">{sourceMeta.summary}</span>
              </div>

              {hasOpenScenario && (
                <div className="callout callout--success">
                  <strong>Đang thực hiện nhiệm vụ chọn gói</strong>
                  <span>
                    Nếu gói này phù hợp với đề bài, bấm nút bên dưới để chốt lựa
                    chọn cho nhiệm vụ đang làm.
                  </span>
                  <button
                    type="button"
                    className="dg-btn-purchase btn--block"
                    onClick={() =>
                      router.push(
                        `/experiment?selected_product_id=${encodeURIComponent(product.id)}`
                      )
                    }
                  >
                    <span>Chọn gói này cho nhiệm vụ đang làm</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}

              <div style={{ display: 'grid', gap: '10px' }}>
                <button
                  type="button"
                  className={
                    hasOpenScenario
                      ? 'btn btn--secondary btn--block'
                      : 'dg-btn-purchase btn--block'
                  }
                  disabled={isAdding}
                  onClick={() => void handleAddToCart(false)}
                >
                  <ShoppingBag size={16} />
                  <span>
                    {addedFeedback
                      ? 'Đã thêm vào giỏ hàng'
                      : isAdding
                        ? 'Đang thêm...'
                        : 'Thêm vào giỏ hàng'}
                  </span>
                </button>
                <button
                  type="button"
                  className="btn btn--secondary btn--block"
                  disabled={isAdding}
                  onClick={() => void handleAddToCart(true)}
                >
                  <span>Mua ngay (Thanh toán thử nghiệm)</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              <span className="type-caption">
                {product.has_downloadable_file
                  ? 'Sẵn sàng tải file ngay qua link riêng sau khi xác nhận đơn.'
                  : 'Liên hệ bộ phận hỗ trợ để nhận bàn giao bổ sung.'}
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
                  className="product-card product-card--horizontal dg-panel"
                >
                  <RelatedThumb item={item} />
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <span
                      className="badge badge--accent"
                      style={{ width: 'fit-content' }}
                    >
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
          <strong className="type-price" style={{ color: 'var(--accent)' }}>
            {formatVnd(product.price_vnd)}
          </strong>
        </div>
        {hasOpenScenario ? (
          <button
            type="button"
            className="dg-btn-purchase dg-btn-sm"
            onClick={() =>
              router.push(
                `/experiment?selected_product_id=${encodeURIComponent(product.id)}`
              )
            }
          >
            <span>Chọn cho nhiệm vụ</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            className="dg-btn-purchase dg-btn-sm"
            disabled={isAdding}
            onClick={() => void handleAddToCart(false)}
          >
            <ShoppingBag size={14} />
            <span>{addedFeedback ? 'Đã thêm' : 'Thêm vào giỏ'}</span>
          </button>
        )}
      </div>
    </section>
  );
}
