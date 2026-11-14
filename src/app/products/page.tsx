'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  formatVnd,
  PRODUCT_TYPE_LABELS,
  SOURCE_TYPE_META,
} from '@/components/shared/formatters';
import { EditorialEmptyIllustration } from '@/components/visual/EditorialEmptyIllustration';
import { ProductPlaceholderFrame } from '@/components/visual/ProductPlaceholderFrame';
import { listProducts } from '@/services';
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

export default function ProductsCatalogPage() {
  const router = useRouter();
  const { addItem } = useCart();
  const { scenarioState, track } = useExperiment();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [productType, setProductType] = useState<'' | ProductType>('');
  const [industry, setIndustry] = useState('Tất cả');
  const [maxPrice, setMaxPrice] = useState('');
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

  const hasOpenScenario = Boolean(
    scenarioState?.scenario_run_id && !scenarioState.is_finished
  );
  const lastSearchTrackedRef = useRef<string>('');

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

  return (
    <section className="section section--compact">
      <div className="container">
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <div className="section-header__copy">
            <span className="type-eyebrow">Danh mục giải pháp số (F2)</span>
            <h1 className="type-h1">Tìm kiếm & Lọc theo nhu cầu shop</h1>
            <p className="type-body-sm">
              Lọc theo loại sản phẩm, ngành hàng và mức ngân sách để so sánh
              nhanh từng gói.
            </p>
          </div>
          {meta && (
            <span className="badge type-mono">
              Tìm thấy {meta.total} gói sản phẩm
            </span>
          )}
        </div>

        {/* Sticky Filter Ribbon */}
        <div className="catalog-toolbar">
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
            <input
              type="search"
              className="input"
              aria-label="Tìm kiếm gói giải pháp theo tên hoặc mô tả"
              placeholder="Tìm theo từ khóa (vd: mỹ phẩm, TikTok Shop, bảng size, Google Sheets)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <select
              className="select"
              aria-label="Lọc mức ngân sách tối đa"
              value={maxPrice}
              onChange={(e) => {
                const val = e.target.value;
                setMaxPrice(val);
                setPage(1);
                trackFilterChange({ max_price: val ? Number(val) : null });
              }}
            >
              {MAX_PRICE_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              className="select"
              aria-label="Sắp xếp kết quả"
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
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </form>

          <div className="catalog-filters-row">
            <div className="chip-row" role="group" aria-label="Loại sản phẩm">
              {PRODUCT_TYPES.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="chip"
                  aria-pressed={productType === item.value}
                  onClick={() => {
                    setProductType(item.value);
                    setPage(1);
                    trackFilterChange({ product_type: item.value || null });
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="chip-row" role="group" aria-label="Ngành hàng">
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
                  {ind}
                </button>
              ))}
            </div>
          </div>
        </div>

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
                Thử tải lại
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="catalog-grid">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="surface-card"
                style={{ display: 'grid', gap: '16px' }}
              >
                <div
                  className="skeleton-box"
                  style={{ width: '100%', aspectRatio: '4 / 3' }}
                />
                <div className="skeleton-box" style={{ height: '24px', width: '75%' }} />
                <div className="skeleton-box" style={{ height: '42px', width: '100%' }} />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div
            className="surface-card"
            style={{
              textAlign: 'center',
              paddingBlock: '48px',
              display: 'grid',
              gap: '16px',
              justifyItems: 'center',
            }}
          >
            <EditorialEmptyIllustration title="Không tìm thấy gói phù hợp" />
            <h2 className="type-h3" style={{ margin: 0 }}>
              Chưa tìm thấy gói phù hợp với bộ lọc hiện tại
            </h2>
            <p className="type-body-sm" style={{ margin: 0, maxWidth: '42ch' }}>
              Thử nới mức ngân sách tối đa hoặc xóa từ khóa tìm kiếm để xem toàn
              bộ sản phẩm đang mở bán.
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleResetFilters}
            >
              Xóa toàn bộ bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className="catalog-grid">
              {products.map((product, index) => {
                const sourceMeta = SOURCE_TYPE_META[product.source_type];
                const isFeaturedLead =
                  index === 0 && products.length >= 4 && page === 1;
                return (
                  <article
                    key={product.id}
                    className={`product-card ${
                      isFeaturedLead ? 'catalog-card-featured' : ''
                    }`}
                  >
                    <div style={{ display: 'grid', gap: '14px' }}>
                      <ProductPlaceholderFrame
                        productType={product.product_type}
                        industry={product.industry}
                        sourceType={product.source_type}
                      />
                      <div className="product-card__body">
                        <div className="chip-row">
                          <span className="badge">
                            {PRODUCT_TYPE_LABELS[product.product_type]}
                          </span>
                          <span className="badge">{product.industry}</span>
                          <span
                            className={`badge badge--${sourceMeta.badgeTone}`}
                          >
                            {sourceMeta.label}
                          </span>
                        </div>
                        <h2 className="product-card__title">
                          <Link href={`/products/${product.slug}`}>
                            {product.name}
                          </Link>
                        </h2>
                        <p className="product-card__desc">
                          {product.short_description}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div className="product-card__footer">
                        <span
                          className="type-price"
                          style={{ fontSize: '1.125rem' }}
                        >
                          {formatVnd(product.price_vnd)}
                        </span>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <Link
                            href={`/products/${product.slug}`}
                            className="btn btn--secondary btn--sm"
                          >
                            Xem chi tiết
                          </Link>
                          <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            disabled={addingId === product.id}
                            onClick={() => void handleAddToCart(product.id)}
                          >
                            {addedProductId === product.id
                              ? 'Đã thêm'
                              : addingId === product.id
                                ? 'Đang thêm...'
                                : 'Thêm vào giỏ'}
                          </button>
                        </div>
                      </div>

                      {hasOpenScenario && (
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm btn--block"
                          onClick={() =>
                            router.push(
                              `/experiment?selected_product_id=${encodeURIComponent(product.id)}`
                            )
                          }
                        >
                          Chọn gói này cho kịch bản F11 →
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
                  Trang trước
                </button>
                <span className="type-mono type-body-sm">
                  Trang {meta.page} / {meta.totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Trang sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
