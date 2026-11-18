'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import {
  ArrowRight,
  CheckCircle2,
  Filter,
  Search,
  ShoppingBag,
} from '@/components/icons/DreamIcons';
import { EditorialEmptyIllustration } from '@/components/visual/EditorialEmptyIllustration';
import { ProductPlaceholderFrame } from '@/components/visual/ProductPlaceholderFrame';
import { useSpecularSpotlight } from '@/motion/useSpecularSpotlight';
import { listProducts } from '@/services';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useCart, useExperiment } from '@/state';
import type {
  PaginationMeta,
  ProductListQuery,
  ProductSummaryDto,
  ProductType,
} from '@/types/api';

const PRODUCT_TYPES: Array<{ value: '' | ProductType; label: string }> = [
  { value: '', label: 'Tất cả loại' },
  { value: 'template', label: 'Template Website' },
  { value: 'prompt_pack', label: 'Prompt Pack' },
  { value: 'workflow', label: 'Workflow Tự Động' },
];

const INDUSTRIES = ['Tất cả', 'Mỹ phẩm', 'Thời trang', 'F&B', 'Đa ngành'];

const MAX_PRICE_OPTIONS = [
  { label: 'Mọi mức giá', value: '' },
  { label: 'Dưới 300.000đ', value: '300000' },
  { label: 'Dưới 500.000đ', value: '500000' },
  { label: 'Dưới 700.000đ', value: '700000' },
  { label: 'Dưới 1.000.000đ', value: '1000000' },
];

function parseInitialProductType(val: string | null): '' | ProductType {
  if (val === 'template' || val === 'prompt_pack' || val === 'workflow') {
    return val;
  }
  return '';
}

function CatalogThumbnail({ product }: { product: ProductSummaryDto }) {
  const { getProductCopy, getProductTypeLabel } = useLocale();
  const [imgFailed, setImgFailed] = useState(false);
  const copy = getProductCopy(product);

  if (!product.thumbnail_url || imgFailed) {
    return (
      <ProductPlaceholderFrame
        productType={product.product_type}
        industry={product.industry}
        sourceType={product.source_type}
        aspect="16/10"
        slug={product.slug}
      />
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={product.thumbnail_url}
      alt={`${copy.name} (${getProductTypeLabel(product.product_type)})`}
      width={960}
      height={600}
      loading="lazy"
      decoding="async"
      className="dg-showcase-thumb-img"
      onError={() => setImgFailed(true)}
    />
  );
}

function ProductsCatalogContent() {
  const {
    commerce,
    chrome,
    formatPrice,
    getProductCopy,
    getProductTypeLabel,
    getSourceMeta,
    getIndustryLabel,
  } = useLocale();
  const c = commerce.catalog;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const { assignment, scenarioState, track } = useExperiment();

  const initialQuery = searchParams.get('q') ?? '';
  const initialType = parseInitialProductType(searchParams.get('product_type'));
  const initialIndustryParam = searchParams.get('industry');
  const initialIndustry =
    initialIndustryParam && INDUSTRIES.includes(initialIndustryParam)
      ? initialIndustryParam
      : 'Tất cả';
  const initialMaxPrice = searchParams.get('max_price') ?? '';

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [productType, setProductType] = useState<'' | ProductType>(initialType);
  const [industry, setIndustry] = useState(initialIndustry);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc'>(
    'newest'
  );
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<ProductSummaryDto[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  const spotlightGridRef = useSpecularSpotlight<HTMLDivElement>({
    disabled: isLoading || products.length === 0,
  });

  const hasOpenScenario = Boolean(
    assignment?.consent_given &&
      scenarioState?.scenario_run_id &&
      !scenarioState.is_finished
  );
  const lastSearchTrackedRef = useRef<string>('');

  // Sync URL query updates when navigating from Home categories or Footer
  useEffect(() => {
    const paramType = parseInitialProductType(searchParams.get('product_type'));
    const paramIndustry = searchParams.get('industry');
    const paramQ = searchParams.get('q') ?? '';
    const paramMax = searchParams.get('max_price') ?? '';

    const timer = setTimeout(() => {
      setProductType(paramType);
      setIndustry(
        paramIndustry && INDUSTRIES.includes(paramIndustry)
          ? paramIndustry
          : 'Tất cả'
      );
      setSearchInput(paramQ);
      setDebouncedQuery(paramQ);
      setMaxPrice(paramMax);
      setPage(1);
    }, 0);

    return () => clearTimeout(timer);
  }, [searchParams]);

  // Debounce keyword search 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchInput.trim();
      setDebouncedQuery(next);
      setPage(1);
      if (next && lastSearchTrackedRef.current !== next) {
        lastSearchTrackedRef.current = next;
        void track('search_used', { properties: { q: next } });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, track]);

  const fetchProducts = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setErrorMessage(null);

      const query: ProductListQuery = {
        q: debouncedQuery || undefined,
        product_type: productType || undefined,
        industry: industry !== 'Tất cả' ? industry : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        sort,
        page,
        limit: 9,
      };

      const res = await listProducts(query, signal);
      if (signal?.aborted) return;

      setIsLoading(false);
      if (!res.ok) {
        setErrorMessage(res.error.message);
        return;
      }

      setProducts(res.data);
      setMeta(res.meta ?? null);
    },
    [debouncedQuery, productType, industry, maxPrice, sort, page]
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void fetchProducts(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fetchProducts]);

  const trackFilterChange = (next: Record<string, unknown>) => {
    void track('filter_applied', {
      properties: {
        product_type: productType || null,
        industry: industry !== 'Tất cả' ? industry : null,
        max_price: maxPrice ? Number(maxPrice) : null,
        sort,
        ...next,
      },
    });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedQuery('');
    setProductType('');
    setIndustry('Tất cả');
    setMaxPrice('');
    setSort('newest');
    setPage(1);
    router.replace('/products');
  };

  const handleAddToCart = async (productId: string) => {
    setAddingId(productId);
    const ok = await addItem(productId, 1);
    setAddingId(null);
    if (ok) {
      setAddedProductId(productId);
      void track('add_to_cart', { product_id: productId });
      setTimeout(() => {
        setAddedProductId((prev) => (prev === productId ? null : prev));
      }, 1800);
    }
  };

  const hasActiveFilter = Boolean(
    debouncedQuery ||
      productType ||
      industry !== 'Tất cả' ||
      maxPrice ||
      sort !== 'newest'
  );

  return (
    <section className="section section--compact">
      <div className="container">
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <div className="section-header__copy">
            <span className="type-eyebrow">{c.eyebrow}</span>
            <h1 className="type-h1">{c.title}</h1>
            <p className="type-body-sm">{c.subtitle}</p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            {meta && (
              <span className="badge badge--accent type-mono">
                <Filter size={12} />
                <span>{c.showingRange(products.length, meta.total)}</span>
              </span>
            )}
            {hasActiveFilter && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={handleResetFilters}
              >
                {c.filterReset}
              </button>
            )}
          </div>
        </div>

        {/* Filter Ribbon */}
        <div className="catalog-toolbar dg-panel">
          <div
            className="dg-fw-tabs dg-fw-tabs--inline"
            role="tablist"
            aria-label={c.eyebrow}
          >
            {PRODUCT_TYPES.map((item) => {
              const selected = productType === item.value;
              const tabLabel = item.value
                ? getProductTypeLabel(item.value)
                : c.typeAll;
              return (
                <button
                  key={item.value || 'all'}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`dg-fw-tab ${selected ? 'active' : ''}`}
                  onClick={() => {
                    setProductType(item.value);
                    setPage(1);
                    trackFilterChange({ product_type: item.value || null });
                  }}
                >
                  {tabLabel}
                </button>
              );
            })}
          </div>

          <form
            className="catalog-search-row"
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = searchInput.trim();
              setDebouncedQuery(trimmed);
              setPage(1);
              if (trimmed) {
                lastSearchTrackedRef.current = trimmed;
                void track('search_used', { properties: { q: trimmed } });
              }
            }}
          >
            <div className="dg-input-icon-wrap">
              <Search size={16} className="dg-input-icon" />
              <input
                type="search"
                className="input dg-input-has-left"
                aria-label={c.searchBtn}
                placeholder={c.searchPlaceholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <select
              className="select"
              aria-label={c.anyBudget}
              value={maxPrice}
              onChange={(e) => {
                const val = e.target.value;
                setMaxPrice(val);
                setPage(1);
                trackFilterChange({ max_price: val ? Number(val) : null });
              }}
            >
              {MAX_PRICE_OPTIONS.map((opt) => (
                <option key={opt.value || 'any'} value={opt.value}>
                  {opt.value
                    ? c.underVnd(formatPrice(Number(opt.value)))
                    : c.anyBudget}
                </option>
              ))}
            </select>

            <select
              className="select"
              aria-label={c.sortNewest}
              value={sort}
              onChange={(e) => {
                const val = e.target.value as
                  | 'newest'
                  | 'price_asc'
                  | 'price_desc';
                setSort(val);
                setPage(1);
                trackFilterChange({ sort: val });
              }}
            >
              <option value="newest">{c.sortNewest}</option>
              <option value="price_asc">{c.sortPriceAsc}</option>
              <option value="price_desc">{c.sortPriceDesc}</option>
            </select>
          </form>

          <div className="catalog-filters-row">
            <div className="chip-row" role="group" aria-label={c.industryAll}>
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  className="chip"
                  aria-pressed={industry === ind}
                  onClick={() => {
                    setIndustry(ind);
                    setPage(1);
                    trackFilterChange({
                      industry: ind !== 'Tất cả' ? ind : null,
                    });
                  }}
                >
                  {ind === 'Tất cả' ? c.industryAll : getIndustryLabel(ind)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {hasOpenScenario && (
          <div className="callout callout--info" style={{ marginBottom: '20px' }}>
            <span>{c.surveyReturnBanner}</span>
          </div>
        )}

        {errorMessage && (
          <div
            className="callout callout--danger"
            role="alert"
            style={{ marginBottom: '24px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <span>{errorMessage}</span>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => void fetchProducts()}
              >
                {chrome.common.retry}
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="dg-showcase-grid">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="dg-panel dg-showcase-skeleton">
                <div
                  className="skeleton-box"
                  style={{ width: '100%', aspectRatio: '16 / 10' }}
                />
                <div
                  className="skeleton-box"
                  style={{ height: '24px', width: '75%' }}
                />
                <div
                  className="skeleton-box"
                  style={{ height: '42px', width: '100%' }}
                />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
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
            <EditorialEmptyIllustration title={c.emptyTitle} />
            <h2 className="type-h3" style={{ margin: 0 }}>
              {c.emptyTitle}
            </h2>
            <p className="type-body-sm" style={{ margin: 0, maxWidth: '42ch' }}>
              {c.emptyDesc}
            </p>
            <button
              type="button"
              className="dg-btn-purchase"
              onClick={handleResetFilters}
            >
              {c.filterReset}
            </button>
          </div>
        ) : (
          <>
            <div ref={spotlightGridRef} className="dg-showcase-grid">
              {products.map((product) => {
                const copy = getProductCopy(product);
                const sourceMeta = getSourceMeta(product.source_type);
                const isAdded = addedProductId === product.id;
                return (
                  <article
                    key={product.id}
                    className="dg-showcase-card dg-panel dg-spotlight-card"
                  >
                    <div className="dg-showcase-img-wrap">
                      <CatalogThumbnail product={product} />
                      <div className="dg-showcase-overlay">
                        <Link
                          href={`/products/${product.slug}`}
                          className="dg-btn-purchase"
                        >
                          <span>{c.details}</span>
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>

                    <div className="dg-showcase-body">
                      <div className="dg-showcase-meta-row">
                        <span className="dg-showcase-category">
                          {getProductTypeLabel(product.product_type)} •{' '}
                          {getIndustryLabel(product.industry)}
                        </span>
                        <span className={`badge badge--${sourceMeta.badgeTone}`}>
                          {sourceMeta.label}
                        </span>
                      </div>

                      <h2
                        className="text-line-clip"
                        style={{
                          fontSize: '1.08rem',
                          fontWeight: 700,
                          margin: '0 0 8px',
                        }}
                      >
                        <Link href={`/products/${product.slug}`}>
                          {copy.name}
                        </Link>
                      </h2>
                      <p>{copy.short_description}</p>

                      <div className="dg-showcase-footer">
                        <span className="type-price dg-showcase-price">
                          {formatPrice(product.price_vnd)}
                        </span>
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <Link
                            href={`/products/${product.slug}`}
                            className="btn btn--secondary btn--sm"
                          >
                            {c.details}
                          </Link>
                          <button
                            type="button"
                            className="dg-btn-purchase dg-btn-sm"
                            disabled={addingId === product.id}
                            onClick={() => void handleAddToCart(product.id)}
                          >
                            {isAdded ? (
                              <>
                                <CheckCircle2 size={14} />
                                <span>{c.added}</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag size={14} />
                                <span>
                                  {addingId === product.id
                                    ? chrome.common.loading
                                    : c.addToCart}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {hasOpenScenario && (
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm btn--block"
                          style={{ marginTop: '12px' }}
                          onClick={() =>
                            router.push(
                              `/experiment?selected_product_id=${encodeURIComponent(product.id)}`
                            )
                          }
                        >
                          <span>{c.surveySelectTip}</span>
                          <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {meta && meta.totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '32px',
                }}
              >
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {c.prevPage}
                </button>
                <span className="type-mono type-body-sm">
                  {c.pageOf(meta.page, meta.totalPages)}
                </span>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {c.nextPage}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default function ProductsCatalogPage() {
  return (
    <Suspense
      fallback={
        <section className="section section--compact">
          <div className="container">
            <div className="dg-showcase-grid">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="skeleton-box"
                  style={{ height: '320px' }}
                />
              ))}
            </div>
          </div>
        </section>
      }
    >
      <ProductsCatalogContent />
    </Suspense>
  );
}
