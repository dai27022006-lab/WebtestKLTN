'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  CheckCircle2,
  Eye,
  LayoutDashboard,
  Plus,
  RefreshCw,
  Search,
  Smartphone,
  X,
} from '@/components/icons/DreamIcons';
import { useLocale } from '@/components/providers/LocaleProvider';
import { LiveHtmlPreviewFrame } from '@/components/visual/LiveHtmlPreviewFrame';
import { ProductPlaceholderFrame } from '@/components/visual/ProductPlaceholderFrame';
import {
  adminCreateProduct,
  adminListProducts,
  adminUpdateProduct,
} from '@/services';
import type {
  AdminCreateProductRequest,
  ProductDetailDto,
  ProductSourceType,
  ProductType,
} from '@/types/api';

type StatusFilter = 'all' | 'active' | 'inactive';

const THUMBNAIL_PRESETS = [
  { label: 'Template', path: '/images/cat-template.webp' },
  { label: 'Prompt Pack', path: '/images/cat-prompt.webp' },
  { label: 'Workflow', path: '/images/cat-workflow.webp' },
] as const;

const DIALOG_LIGHT_DISMISS = {
  closedby: 'any',
} as unknown as React.DialogHTMLAttributes<HTMLDialogElement>;

const DIALOG_DIRTY_SAFE = {
  closedby: 'closerequest',
} as unknown as React.DialogHTMLAttributes<HTMLDialogElement>;

interface ProductFormState {
  name: string;
  slug: string;
  product_type: ProductType;
  industry: string;
  price_vnd: string;
  short_description: string;
  description: string;
  demo_url: string;
  thumbnail_url: string;
  source_type: ProductSourceType;
  license_note: string;
  target_shop_size: string;
  setup_time_minutes: string;
  platforms: string;
  deliverables: string;
  tech_stack: string;
  guide_summary: string;
  is_active: boolean;
}

const EMPTY_FORM: ProductFormState = {
  name: '',
  slug: '',
  product_type: 'template',
  industry: 'Mỹ phẩm',
  price_vnd: '490000',
  short_description: '',
  description: '',
  demo_url: '',
  thumbnail_url: '/images/cat-template.webp',
  source_type: 'original',
  license_note:
    'Sản phẩm do đội ngũ DreamTeam tự thiết kế 100%, cấp quyền sử dụng thương mại cho 1 cửa hàng.',
  target_shop_size: '1-3 người',
  setup_time_minutes: '25',
  platforms: 'TikTok Shop, Shopee, Facebook',
  deliverables:
    'Source code template responsive 375px - 1440px\nTài liệu hướng dẫn chỉnh sửa nhanh trong 25 phút',
  tech_stack: 'HTML5, CSS3, Next.js',
  guide_summary: 'Thay logo, nội dung sản phẩm và gắn link chốt đơn để chạy ngay.',
  is_active: true,
};

function slugifyVietnamese(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function splitCommaList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLineList(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formStateFromProduct(product: ProductDetailDto): ProductFormState {
  return {
    name: product.name,
    slug: product.slug,
    product_type: product.product_type,
    industry: product.industry,
    price_vnd: String(product.price_vnd),
    short_description: product.short_description,
    description: product.description,
    demo_url: product.demo_url ?? '',
    thumbnail_url: product.thumbnail_url ?? '',
    source_type: product.source_type,
    license_note: product.license_note,
    target_shop_size: product.specs.target_shop_size ?? '1-3 người',
    setup_time_minutes:
      typeof product.specs.setup_time_minutes === 'number'
        ? String(product.specs.setup_time_minutes)
        : '20',
    platforms: Array.isArray(product.specs.platforms)
      ? product.specs.platforms.join(', ')
      : '',
    deliverables: Array.isArray(product.specs.deliverables)
      ? product.specs.deliverables.join('\n')
      : '',
    tech_stack: Array.isArray(product.specs.tech_stack)
      ? product.specs.tech_stack.join(', ')
      : '',
    guide_summary: product.specs.guide_summary ?? '',
    is_active: product.is_active,
  };
}

function TableThumbnail({ product }: { product: ProductDetailDto }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!product.thumbnail_url || imgFailed) {
    return (
      <div style={{ width: '72px', aspectRatio: '16 / 10' }}>
        <ProductPlaceholderFrame
          productType={product.product_type}
          industry={product.industry}
          compact
          aspect="16/10"
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: '72px',
        aspectRatio: '16 / 10',
        borderRadius: 'var(--radius-xs)',
        overflow: 'hidden',
        border: '1px solid var(--border-hairline)',
        backgroundColor: 'var(--bg-surface-subtle)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.thumbnail_url}
        alt={product.name}
        width={144}
        height={90}
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={() => setImgFailed(true)}
      />
    </div>
  );
}

export default function AdminProductsPage() {
  const {
    admin,
    chrome,
    formatPrice,
    getProductCopy,
    getProductTypeLabel,
    getSourceMeta,
    getIndustryLabel,
  } = useLocale();
  const ap = admin.products;
  const [products, setProducts] = useState<ProductDetailDto[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | ProductType>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Create/Edit modal state
  const [editingProduct, setEditingProduct] = useState<ProductDetailDto | null>(
    null
  );
  const [formState, setFormState] = useState<ProductFormState>(EMPTY_FORM);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [showInlinePreview, setShowInlinePreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [thumbPreviewError, setThumbPreviewError] = useState(false);

  // Standalone Live Preview modal state
  const [livePreviewProduct, setLivePreviewProduct] =
    useState<ProductDetailDto | null>(null);

  const formDialogRef = useRef<HTMLDialogElement | null>(null);
  const previewDialogRef = useRef<HTMLDialogElement | null>(null);

  const loadProducts = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await adminListProducts({ limit: 50, sort: 'newest' }, signal);
    if (signal?.aborted) return;
    setIsLoading(false);

    if (!res.ok) {
      setErrorMessage(res.error.message);
      return;
    }

    setProducts(res.data);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void loadProducts(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadProducts]);

  // Light-dismiss fallback for Preview modal only (Form modal preserves dirty edits)
  useEffect(() => {
    const dialog = previewDialogRef.current;
    if (!dialog) return;

    const onClose = () => setLivePreviewProduct(null);
    let pressedOutside = false;

    const isOutside = (e: PointerEvent) => {
      const rect = dialog.getBoundingClientRect();
      return (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      );
    };

    const onDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onUp = (e: PointerEvent) => {
      if (dialog.open && pressedOutside && isOutside(e)) {
        dialog.close();
      }
    };

    dialog.addEventListener('close', onClose);
    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);

    return () => {
      dialog.removeEventListener('close', onClose);
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    return products.filter((item) => {
      if (typeFilter && item.product_type !== typeFilter) return false;
      if (statusFilter === 'active' && !item.is_active) return false;
      if (statusFilter === 'inactive' && item.is_active) return false;
      if (q) {
        const match =
          item.name.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q) ||
          item.industry.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [products, searchInput, typeFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormState(EMPTY_FORM);
    setSlugManuallyEdited(false);
    setShowInlinePreview(false);
    setFormError(null);
    setThumbPreviewError(false);
    formDialogRef.current?.showModal();
  };

  const openEditModal = (product: ProductDetailDto) => {
    setEditingProduct(product);
    setFormState(formStateFromProduct(product));
    setSlugManuallyEdited(true);
    setShowInlinePreview(false);
    setFormError(null);
    setThumbPreviewError(false);
    formDialogRef.current?.showModal();
  };

  const closeFormModal = () => {
    formDialogRef.current?.close();
  };

  const openLivePreviewModal = (product: ProductDetailDto) => {
    setLivePreviewProduct(product);
    previewDialogRef.current?.showModal();
  };

  const closeLivePreviewModal = () => {
    previewDialogRef.current?.close();
    setLivePreviewProduct(null);
  };

  const handleToggleActive = async (product: ProductDetailDto) => {
    if (togglingId === product.id) return;
    setTogglingId(product.id);
    setActionFeedback(null);
    setErrorMessage(null);

    const res = await adminUpdateProduct({
      id: product.id,
      is_active: !product.is_active,
    });

    setTogglingId(null);

    if (!res.ok) {
      setErrorMessage(res.error.message);
      return;
    }

    setProducts((prev) =>
      prev.map((item) => (item.id === product.id ? res.data : item))
    );
    setActionFeedback(
      `Đã cập nhật trạng thái "${res.data.name}" → ${
        res.data.is_active ? 'Đang bán' : 'Đang ẩn'
      }.`
    );
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setFormError(null);
    setActionFeedback(null);

    const trimmedSlug = formState.slug.trim();
    if (!/^[a-z0-9-]+$/.test(trimmedSlug) || trimmedSlug.length < 3) {
      setFormError(
        'Slug tối thiểu 3 ký tự và chỉ gồm chữ thường a-z, số 0-9 và dấu gạch ngang (-).'
      );
      return;
    }

    const parsedPrice = Math.max(0, Math.round(Number(formState.price_vnd)));
    if (Number.isNaN(parsedPrice)) {
      setFormError('Giá VND không hợp lệ.');
      return;
    }

    const setupMinutes = Math.max(
      0,
      Math.round(Number(formState.setup_time_minutes) || 0)
    );
    const trimmedDemoUrl = formState.demo_url.trim();
    const trimmedThumbUrl = formState.thumbnail_url.trim();

    const payload: AdminCreateProductRequest = {
      name: formState.name.trim(),
      slug: trimmedSlug,
      product_type: formState.product_type,
      industry: formState.industry.trim(),
      price_vnd: parsedPrice,
      short_description: formState.short_description.trim(),
      description: formState.description.trim(),
      demo_url: trimmedDemoUrl ? trimmedDemoUrl : null,
      thumbnail_url: trimmedThumbUrl ? trimmedThumbUrl : null,
      source_type: formState.source_type,
      license_note: formState.license_note.trim(),
      specs: {
        target_shop_size: formState.target_shop_size.trim() || '1-3 người',
        setup_time_minutes: setupMinutes,
        platforms: splitCommaList(formState.platforms),
        deliverables: splitLineList(formState.deliverables),
        tech_stack: splitCommaList(formState.tech_stack),
        guide_summary: formState.guide_summary.trim(),
      },
      is_active: formState.is_active,
    };

    setIsSaving(true);
    const res = editingProduct
      ? await adminUpdateProduct({ id: editingProduct.id, ...payload })
      : await adminCreateProduct(payload);
    setIsSaving(false);

    if (!res.ok) {
      const firstFieldErr = res.error.fieldErrors
        ? Object.values(res.error.fieldErrors).flat()[0]
        : null;
      setFormError(firstFieldErr ?? res.error.message);
      return;
    }

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((item) => (item.id === res.data.id ? res.data : item))
      );
      setActionFeedback(`Đã lưu cập nhật gói "${res.data.name}".`);
    } else {
      setProducts((prev) => [res.data, ...prev]);
      setActionFeedback(`Đã tạo mới sản phẩm "${res.data.name}".`);
    }

    closeFormModal();
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Page Header */}
      <div
        className="surface-card dg-panel"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'grid', gap: '4px' }}>
          <span className="type-eyebrow">CRUD &amp; Live HTML Demo</span>
          <h1 id="admin-products-table-title" className="type-h2" style={{ margin: 0 }}>
            {ap.title} ({products.length})
          </h1>
          <p className="type-body-sm" style={{ margin: 0 }}>
            {ap.subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            disabled={isLoading}
            onClick={() => void loadProducts()}
          >
            <RefreshCw size={14} />
            <span>{chrome.common.refresh}</span>
          </button>
          <button
            type="button"
            className="dg-btn-purchase dg-btn-sm"
            onClick={openCreateModal}
          >
            <Plus size={15} />
            <span>{ap.addBtn}</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div
        className="surface-card dg-panel"
        style={{ display: 'grid', gap: '14px' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: '12px',
          }}
        >
          <div className="dg-input-icon-wrap">
            <Search size={16} className="dg-input-icon" />
            <input
              type="search"
              className="input dg-input-has-left"
              aria-label={ap.searchPlaceholder}
              placeholder={ap.searchPlaceholder}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <select
            className="select"
            aria-label={ap.colTypeIndustry}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as '' | ProductType)}
          >
            <option value="">{chrome.common.all}</option>
            <option value="template">{getProductTypeLabel('template')}</option>
            <option value="prompt_pack">{getProductTypeLabel('prompt_pack')}</option>
            <option value="workflow">{getProductTypeLabel('workflow')}</option>
          </select>

          <div
            className="chip-row"
            role="group"
            aria-label={ap.colStatus}
          >
            {[
              { value: 'all', label: ap.statusAll },
              { value: 'active', label: ap.statusActive },
              { value: 'inactive', label: ap.statusHidden },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                className="chip"
                aria-pressed={statusFilter === item.value}
                onClick={() => setStatusFilter(item.value as StatusFilter)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {actionFeedback && (
        <div className="callout callout--success" role="status">
          <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={15} />
            <span>{actionFeedback}</span>
          </strong>
        </div>
      )}

      {errorMessage && (
        <div className="callout callout--danger" role="alert">
          {errorMessage}
        </div>
      )}

      {/* Products Table */}
      {isLoading ? (
        <div className="skeleton-box" style={{ height: '320px' }} />
      ) : (
        <div
          tabIndex={0}
          role="region"
          aria-labelledby="admin-products-table-title"
          className="admin-table-wrap dg-panel"
        >
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col" style={{ padding: '10px 6px 10px 10px' }}>
                  Preview
                </th>
                <th scope="col" style={{ padding: '10px 6px' }}>
                  {ap.colProduct}
                </th>
                <th scope="col" style={{ padding: '10px 6px' }}>
                  {ap.colTypeIndustry}
                </th>
                <th scope="col" style={{ padding: '10px 6px' }}>
                  {ap.colPrice}
                </th>
                <th scope="col" style={{ padding: '10px 6px' }}>
                  {ap.modalEditTitle}
                </th>
                <th scope="col" style={{ padding: '10px 6px' }}>
                  {ap.colDemo}
                </th>
                <th scope="col" style={{ padding: '10px 6px' }}>
                  {ap.colStatus}
                </th>
                <th scope="col" style={{ padding: '10px 10px 10px 6px' }}>
                  {ap.colActions}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                    {chrome.common.noData}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item) => {
                  const pCopy = getProductCopy(item);
                  const sourceMeta = getSourceMeta(item.source_type);
                  const compactBadgeStyle: React.CSSProperties = {
                    fontSize: '0.7rem',
                    padding: '3px 7px',
                    whiteSpace: 'nowrap',
                  };
                  const compactBtnStyle: React.CSSProperties = {
                    padding: '0 8px',
                    minHeight: '32px',
                    fontSize: '0.75rem',
                    gap: '4px',
                  };

                  return (
                    <tr key={item.id}>
                      <td style={{ padding: '10px 6px 10px 10px' }}>
                        <TableThumbnail product={item} />
                      </td>
                      <td
                        style={{
                          padding: '10px 6px',
                          maxWidth: '195px',
                        }}
                      >
                        <strong
                          style={{
                            display: 'block',
                            color: 'var(--ink)',
                            fontSize: '0.83rem',
                            lineHeight: 1.35,
                          }}
                        >
                          {pCopy.name}
                        </strong>
                        <code
                          className="type-caption type-mono"
                          style={{
                            display: 'block',
                            fontSize: '0.7rem',
                            overflowWrap: 'anywhere',
                            marginTop: '2px',
                          }}
                        >
                          {item.slug}
                        </code>
                      </td>
                      <td style={{ padding: '10px 6px', fontSize: '0.8rem' }}>
                        <span
                          style={{
                            display: 'block',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {getProductTypeLabel(item.product_type)}
                        </span>
                        <span className="type-caption">
                          {getIndustryLabel(item.industry)}
                        </span>
                      </td>
                      <td
                        className="type-price"
                        style={{
                          padding: '10px 6px',
                          fontSize: '0.83rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatPrice(item.price_vnd)}
                      </td>
                      <td style={{ padding: '10px 6px' }}>
                        <span
                          className={`badge badge--${sourceMeta.badgeTone}`}
                          style={compactBadgeStyle}
                        >
                          {sourceMeta.label}
                        </span>
                      </td>
                      <td style={{ padding: '10px 6px' }}>
                        {item.demo_url ? (
                          <span
                            className="badge badge--success"
                            style={compactBadgeStyle}
                          >
                            HTML Demo
                          </span>
                        ) : (
                          <span className="badge" style={compactBadgeStyle}>
                            —
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 6px' }}>
                        <span
                          className={`badge ${
                            item.is_active ? 'badge--success' : 'badge--warning'
                          }`}
                          style={compactBadgeStyle}
                        >
                          {item.is_active ? ap.statusOn : ap.statusOff}
                        </span>
                      </td>
                      <td style={{ padding: '10px 10px 10px 6px' }}>
                        <div
                          style={{
                            display: 'flex',
                            gap: '4px',
                            flexWrap: 'nowrap',
                            alignItems: 'center',
                          }}
                        >
                          <button
                            type="button"
                            className="btn btn--secondary btn--sm"
                            style={compactBtnStyle}
                            onClick={() => openEditModal(item)}
                          >
                            {ap.editBtn}
                          </button>
                          <button
                            type="button"
                            className="btn btn--secondary btn--sm"
                            style={compactBtnStyle}
                            aria-label={`${ap.previewBtn} ${pCopy.name}`}
                            title={ap.previewBtn}
                            onClick={() => openLivePreviewModal(item)}
                          >
                            <Eye size={12} />
                            <span>{ap.previewBtn}</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            style={compactBtnStyle}
                            disabled={togglingId === item.id}
                            onClick={() => void handleToggleActive(item)}
                          >
                            {togglingId === item.id
                              ? '...'
                              : item.is_active
                                ? ap.toggleHideBtn
                                : ap.toggleActiveBtn}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal (<dialog className="editorial-dialog">) */}
      <dialog
        ref={formDialogRef}
        className="editorial-dialog"
        style={{
          maxWidth: 'min(920px, calc(100vw - 24px))',
          maxHeight: 'calc(100dvh - 24px)',
          overflowY: 'auto',
        }}
        aria-labelledby="admin-product-modal-title"
        {...DIALOG_DIRTY_SAFE}
      >
        <form
          onSubmit={(e) => void handleSubmitForm(e)}
          style={{ padding: '24px', display: 'grid', gap: '20px' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-hairline)',
            }}
          >
            <div>
              <span className="type-eyebrow">
                {editingProduct ? ap.modalEditTitle : ap.modalCreateTitle}
              </span>
              <h2
                id="admin-product-modal-title"
                className="type-h3"
                style={{ margin: '4px 0 0' }}
              >
                {editingProduct
                  ? getProductCopy(editingProduct).name
                  : ap.modalCreateTitle}
              </h2>
            </div>

            <button
              type="button"
              className="icon-btn"
              onClick={closeFormModal}
              aria-label={chrome.common.close}
            >
              <X size={18} />
            </button>
          </div>

          {/* Group 1: Basic Info */}
          <div style={{ display: 'grid', gap: '14px' }}>
            <strong className="type-body-sm" style={{ color: 'var(--accent)' }}>
              1. Thông tin cơ bản
            </strong>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                gap: '12px',
              }}
            >
              <div className="field">
                <label htmlFor="prod-name" className="field__label">
                  Tên sản phẩm
                </label>
                <input
                  id="prod-name"
                  type="text"
                  className="input"
                  required
                  maxLength={160}
                  value={formState.name}
                  onChange={(e) => {
                    const nextName = e.target.value;
                    setFormState((prev) => ({
                      ...prev,
                      name: nextName,
                      slug:
                        !editingProduct && !slugManuallyEdited
                          ? slugifyVietnamese(nextName)
                          : prev.slug,
                    }));
                  }}
                  placeholder="Ví dụ: Template Landing Page Mỹ Phẩm..."
                  autoFocus
                />
                <span className="field__error">Vui lòng nhập tên sản phẩm.</span>
              </div>

              <div className="field">
                <label htmlFor="prod-slug" className="field__label">
                  Slug đường dẫn (a-z, 0-9, -)
                </label>
                <input
                  id="prod-slug"
                  type="text"
                  className="input type-mono"
                  required
                  minLength={3}
                  maxLength={120}
                  pattern="^[a-z0-9-]+$"
                  value={formState.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setFormState((prev) => ({ ...prev, slug: e.target.value }));
                  }}
                  placeholder="landing-page-my-pham"
                />
                <span className="field__error">
                  Slug tối thiểu 3 ký tự, chỉ dùng chữ thường, số và dấu gạch ngang.
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                gap: '12px',
              }}
            >
              <div className="field">
                <label htmlFor="prod-type" className="field__label">
                  Loại sản phẩm
                </label>
                <select
                  id="prod-type"
                  className="select"
                  value={formState.product_type}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      product_type: e.target.value as ProductType,
                    }))
                  }
                >
                  <option value="template">Template Website</option>
                  <option value="prompt_pack">Prompt Pack</option>
                  <option value="workflow">Workflow Tự Động</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="prod-industry" className="field__label">
                  Ngành hàng
                </label>
                <input
                  id="prod-industry"
                  type="text"
                  list="admin-industry-suggestions"
                  className="input"
                  required
                  maxLength={80}
                  value={formState.industry}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, industry: e.target.value }))
                  }
                  placeholder="Mỹ phẩm, Thời trang, F&B, Đa ngành"
                />
                <datalist id="admin-industry-suggestions">
                  <option value="Mỹ phẩm" />
                  <option value="Thời trang" />
                  <option value="F&B" />
                  <option value="Đa ngành" />
                </datalist>
              </div>

              <div className="field">
                <label htmlFor="prod-price" className="field__label">
                  Giá niêm yết (VND)
                </label>
                <input
                  id="prod-price"
                  type="number"
                  className="input type-mono"
                  required
                  min={0}
                  max={100000000}
                  step={1000}
                  value={formState.price_vnd}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      price_vnd: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="prod-short-desc" className="field__label">
                Mô tả ngắn (tối đa 300 ký tự)
              </label>
              <input
                id="prod-short-desc"
                type="text"
                className="input"
                required
                maxLength={300}
                value={formState.short_description}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    short_description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="field">
              <label htmlFor="prod-desc" className="field__label">
                Mô tả chi tiết
              </label>
              <textarea
                id="prod-desc"
                className="textarea"
                rows={3}
                required
                maxLength={8000}
                value={formState.description}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* Group 2: Live HTML Demo & Thumbnail */}
          <div
            style={{
              display: 'grid',
              gap: '14px',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-hairline)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <strong className="type-body-sm" style={{ color: 'var(--accent)' }}>
                2. Gắn Live HTML Demo &amp; Ảnh đại diện
              </strong>
              <span className="type-caption">
                Đặt HTML tại{' '}
                <code className="type-mono">
                  public/demos/&lt;slug&gt;/index.html
                </code>{' '}
                và ảnh tại <code className="type-mono">public/images/</code>.
              </span>
            </div>

            <div className="field">
              <label htmlFor="prod-demo-url" className="field__label">
                Đường dẫn Demo HTML (<code className="type-mono">demo_url</code>)
              </label>
              <input
                id="prod-demo-url"
                type="text"
                className="input type-mono"
                value={formState.demo_url}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, demo_url: e.target.value }))
                }
                placeholder="/demos/landing-page-my-pham-tiktok-shop/index.html"
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => {
                    const slug = formState.slug.trim() || 'sample-demo';
                    setFormState((prev) => ({
                      ...prev,
                      demo_url: `/demos/${slug}/index.html`,
                    }));
                  }}
                >
                  <LayoutDashboard size={13} />
                  <span>Gợi ý /demos/&lt;slug&gt;/index.html</span>
                </button>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => setShowInlinePreview((prev) => !prev)}
                >
                  <Smartphone size={13} />
                  <span>
                    {showInlinePreview
                      ? 'Ẩn khung xem thử'
                      : 'Xem thử khung 1280px ↔ 375px'}
                  </span>
                </button>
                {formState.demo_url && (
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() =>
                      setFormState((prev) => ({ ...prev, demo_url: '' }))
                    }
                  >
                    Xóa Demo URL
                  </button>
                )}
              </div>
            </div>

            {showInlinePreview && (
              <LiveHtmlPreviewFrame
                demoUrl={formState.demo_url.trim() || null}
                thumbnailUrl={formState.thumbnail_url.trim() || null}
                productType={formState.product_type}
                industry={formState.industry || 'Shop nhỏ'}
                sourceType={formState.source_type}
                slug={formState.slug.trim() || 'preview'}
                productName={formState.name.trim() || 'Bản xem trước sản phẩm'}
                shortDescription={formState.short_description}
                deliverables={splitLineList(formState.deliverables)}
              />
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) 144px',
                gap: '12px',
                alignItems: 'start',
              }}
            >
              <div className="field">
                <label htmlFor="prod-thumb-url" className="field__label">
                  Đường dẫn ảnh đại diện (
                  <code className="type-mono">thumbnail_url</code>)
                </label>
                <input
                  id="prod-thumb-url"
                  type="text"
                  className="input type-mono"
                  value={formState.thumbnail_url}
                  onChange={(e) => {
                    setThumbPreviewError(false);
                    setFormState((prev) => ({
                      ...prev,
                      thumbnail_url: e.target.value,
                    }));
                  }}
                  placeholder="/images/cat-template.webp"
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {THUMBNAIL_PRESETS.map((preset) => (
                    <button
                      key={preset.path}
                      type="button"
                      className="chip"
                      style={{ minHeight: '32px', padding: '0 12px', fontSize: '0.78rem' }}
                      aria-pressed={formState.thumbnail_url === preset.path}
                      onClick={() => {
                        setThumbPreviewError(false);
                        setFormState((prev) => ({
                          ...prev,
                          thumbnail_url: preset.path,
                        }));
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  width: '144px',
                  aspectRatio: '16 / 10',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-strong)',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                {formState.thumbnail_url.trim() && !thumbPreviewError ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={formState.thumbnail_url.trim()}
                    alt="Xem trước ảnh sản phẩm"
                    width={288}
                    height={180}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setThumbPreviewError(true)}
                  />
                ) : (
                  <ProductPlaceholderFrame
                    productType={formState.product_type}
                    industry={formState.industry || 'Shop nhỏ'}
                    compact
                    aspect="16/10"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Group 3: License & Technical Specs */}
          <div style={{ display: 'grid', gap: '14px' }}>
            <strong className="type-body-sm" style={{ color: 'var(--accent)' }}>
              3. Bản quyền &amp; Thông số kỹ thuật
            </strong>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                gap: '12px',
              }}
            >
              <div className="field">
                <label htmlFor="prod-source-type" className="field__label">
                  Phân loại bản quyền
                </label>
                <select
                  id="prod-source-type"
                  className="select"
                  value={formState.source_type}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      source_type: e.target.value as ProductSourceType,
                    }))
                  }
                >
                  <option value="original">Thiết kế gốc (original)</option>
                  <option value="adapted">Điều chỉnh có nguồn (adapted)</option>
                  <option value="licensed">Bản quyền hợp lệ (licensed)</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="prod-shop-size" className="field__label">
                  Quy mô shop mục tiêu
                </label>
                <input
                  id="prod-shop-size"
                  type="text"
                  className="input"
                  maxLength={100}
                  value={formState.target_shop_size}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      target_shop_size: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="field">
                <label htmlFor="prod-setup-mins" className="field__label">
                  Thời gian cài đặt (phút)
                </label>
                <input
                  id="prod-setup-mins"
                  type="number"
                  className="input type-mono"
                  min={0}
                  max={10000}
                  value={formState.setup_time_minutes}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      setup_time_minutes: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="prod-license-note" className="field__label">
                Ghi chú bản quyền
              </label>
              <input
                id="prod-license-note"
                type="text"
                className="input"
                required
                maxLength={500}
                value={formState.license_note}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    license_note: e.target.value,
                  }))
                }
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                gap: '12px',
              }}
            >
              <div className="field">
                <label htmlFor="prod-platforms" className="field__label">
                  Kênh hỗ trợ (cách nhau bởi dấu phẩy)
                </label>
                <input
                  id="prod-platforms"
                  type="text"
                  className="input"
                  value={formState.platforms}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      platforms: e.target.value,
                    }))
                  }
                  placeholder="TikTok Shop, Shopee, Facebook"
                />
              </div>

              <div className="field">
                <label htmlFor="prod-tech" className="field__label">
                  Công nghệ / Định dạng (cách nhau bởi dấu phẩy)
                </label>
                <input
                  id="prod-tech"
                  type="text"
                  className="input"
                  value={formState.tech_stack}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      tech_stack: e.target.value,
                    }))
                  }
                  placeholder="HTML5, CSS3, Next.js"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="prod-deliverables" className="field__label">
                Thành phần bàn giao (mỗi dòng 1 mục)
              </label>
              <textarea
                id="prod-deliverables"
                className="textarea"
                rows={3}
                value={formState.deliverables}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    deliverables: e.target.value,
                  }))
                }
              />
            </div>

            <div className="field">
              <label htmlFor="prod-guide" className="field__label">
                Tóm tắt hướng dẫn sử dụng
              </label>
              <input
                id="prod-guide"
                type="text"
                className="input"
                maxLength={1000}
                value={formState.guide_summary}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    guide_summary: e.target.value,
                  }))
                }
              />
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={formState.is_active}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    is_active: e.target.checked,
                  }))
                }
                style={{ width: '18px', height: '18px' }}
              />
              <span className="type-body-sm" style={{ fontWeight: 600 }}>
                Mở bán công khai trên Mặt tiền Cửa hàng (is_active = true)
              </span>
            </label>
          </div>

          {formError && (
            <div className="callout callout--danger" role="alert">
              {formError}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              flexWrap: 'wrap',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-hairline)',
            }}
          >
            <button
              type="button"
              className="btn btn--secondary"
              onClick={closeFormModal}
            >
              {ap.cancelBtn}
            </button>
            <button
              type="submit"
              className="dg-btn-purchase"
              disabled={isSaving}
            >
              <span>{isSaving ? ap.savingBtn : ap.saveBtn}</span>
            </button>
          </div>
        </form>
      </dialog>

      {/* Live HTML Preview Modal */}
      <dialog
        ref={previewDialogRef}
        className="editorial-dialog preview-dialog"
        aria-labelledby="admin-live-preview-title"
        {...DIALOG_LIGHT_DISMISS}
      >
        <div className="preview-dialog__body">
          <div className="preview-dialog__head">
            <div>
              <span className="type-eyebrow">{ap.previewBtn}</span>
              <h2
                id="admin-live-preview-title"
                className="type-h3"
                style={{ margin: '4px 0 0' }}
              >
                {livePreviewProduct
                  ? getProductCopy(livePreviewProduct).name
                  : ap.previewBtn}
              </h2>
            </div>

            <button
              type="button"
              className="icon-btn"
              onClick={closeLivePreviewModal}
              aria-label={chrome.common.close}
              autoFocus
            >
              <X size={18} />
            </button>
          </div>

          {livePreviewProduct && (
            <LiveHtmlPreviewFrame
              demoUrl={livePreviewProduct.demo_url}
              thumbnailUrl={livePreviewProduct.thumbnail_url}
              productType={livePreviewProduct.product_type}
              industry={livePreviewProduct.industry}
              sourceType={livePreviewProduct.source_type}
              slug={livePreviewProduct.slug}
              productName={getProductCopy(livePreviewProduct).name}
              shortDescription={
                getProductCopy(livePreviewProduct).short_description
              }
              deliverables={livePreviewProduct.specs.deliverables}
            />
          )}
        </div>
      </dialog>
    </div>
  );
}
