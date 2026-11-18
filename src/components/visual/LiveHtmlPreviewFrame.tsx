'use client';

import { useEffect, useRef, useState } from 'react';

import {
  ArrowUpRight,
  CheckCircle2,
  Expand,
  LayoutDashboard,
  Lock,
  Smartphone,
  X,
} from '@/components/icons/DreamIcons';
import { useLocale } from '@/components/providers/LocaleProvider';
import { ProductPlaceholderFrame } from '@/components/visual/ProductPlaceholderFrame';
import type { ProductSourceType, ProductType } from '@/types/api';

export interface LiveHtmlPreviewFrameProps {
  demoUrl: string | null;
  thumbnailUrl: string | null;
  productType: ProductType;
  industry: string;
  sourceType?: ProductSourceType;
  slug: string;
  productName: string;
  shortDescription?: string;
  deliverables?: string[];
}

const DIALOG_LIGHT_DISMISS = {
  closedby: 'any',
} as unknown as React.DialogHTMLAttributes<HTMLDialogElement>;

function isSafeEmbeddableDemoUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('/products/')) return false;
  return (
    trimmed.startsWith('/demos/') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://')
  );
}

function DemoIframeCanvas({
  demoUrl,
  productName,
  viewportMode,
}: {
  demoUrl: string;
  productName: string;
  viewportMode: 'desktop' | 'mobile';
}) {
  const { chrome } = useLocale();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState<{ width: number; height: number }>({
    width: viewportMode === 'mobile' ? 375 : 700,
    height: 520,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setStageSize({ width: rect.width, height: rect.height });
      }
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setStageSize({ width, height });
      }
    });

    observer.observe(el);
    const rafId = requestAnimationFrame(updateSize);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [viewportMode]);

  const targetWidth = viewportMode === 'desktop' ? 1280 : 375;
  const scale =
    viewportMode === 'desktop'
      ? Math.min(1, stageSize.width / 1280)
      : stageSize.width < 375
        ? stageSize.width / 375
        : 1;
  const safeScale = Math.max(0.2, scale);
  const logicalHeight = Math.max(360, Math.round(stageSize.height / safeScale));

  return (
    <div ref={stageRef} className="viewport-iframe-stage">
      {!isLoaded && (
        <div className="viewport-skeleton" aria-hidden="true">
          <div className="viewport-skeleton__bar" style={{ width: '42%' }} />
          <div className="viewport-skeleton__hero" />
          <div className="viewport-skeleton__bar" style={{ width: '78%' }} />
          <div className="viewport-skeleton__bar" style={{ width: '64%' }} />
        </div>
      )}

      <div
        className="viewport-iframe-scaler"
        style={{
          width: `${targetWidth}px`,
          height: `${logicalHeight}px`,
          transform: `scale(${safeScale})`,
        }}
      >
        <iframe
          src={demoUrl}
          title={`${chrome.preview.fallbackEyebrow}: ${productName} (${
            viewportMode === 'desktop'
              ? chrome.preview.viewportDesktop
              : chrome.preview.viewportMobile
          })`}
          sandbox="allow-scripts allow-same-origin"
          className="viewport-iframe"
          style={{
            width: `${targetWidth}px`,
            height: `${logicalHeight}px`,
          }}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    </div>
  );
}

function FallbackMediaBody({
  thumbnailUrl,
  productType,
  industry,
  sourceType,
  slug,
  productName,
  shortDescription,
  deliverables,
}: Omit<LiveHtmlPreviewFrameProps, 'demoUrl'>) {
  const { chrome, getProductTypeLabel } = useLocale();
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="viewport-fallback">
      {thumbnailUrl && !imgFailed ? (
        <div className="viewport-thumb-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt={`${productName} (${getProductTypeLabel(productType)})`}
            width={960}
            height={600}
            onError={() => setImgFailed(true)}
          />
        </div>
      ) : (
        <ProductPlaceholderFrame
          productType={productType}
          industry={industry}
          sourceType={sourceType}
          aspect="16/10"
          slug={slug}
        />
      )}

      {deliverables && deliverables.length > 0 && (
        <div className="viewport-deliverables">
          <strong style={{ fontSize: '0.875rem' }}>
            {chrome.preview.deliverablesHeading}
          </strong>
          <ul className="viewport-deliverables__list">
            {deliverables.slice(0, 4).map((item) => (
              <li key={item} className="viewport-deliverables__item">
                <CheckCircle2
                  size={15}
                  style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '3px' }}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {shortDescription && (
        <div
          style={{
            display: 'grid',
            gap: '4px',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-hairline)',
          }}
        >
          <strong style={{ fontSize: '0.9rem' }}>{productName}</strong>
          <span className="type-body-sm">{shortDescription}</span>
        </div>
      )}
    </div>
  );
}

export function LiveHtmlPreviewFrame({
  demoUrl,
  thumbnailUrl,
  productType,
  industry,
  sourceType,
  slug,
  productName,
  shortDescription,
  deliverables,
}: LiveHtmlPreviewFrameProps) {
  const { chrome, getProductTypeLabel, getIndustryLabel } = useLocale();
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>(
    'desktop'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const previewDialogRef = useRef<HTMLDialogElement | null>(null);
  const embeddableDemoUrl = isSafeEmbeddableDemoUrl(demoUrl)
    ? demoUrl.trim()
    : null;

  useEffect(() => {
    const dialog = previewDialogRef.current;
    if (!dialog) return;

    const onClose = () => setIsModalOpen(false);
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

  const openModal = () => {
    const dialog = previewDialogRef.current;
    if (!dialog) return;
    setIsModalOpen(true);
    if (!dialog.open) {
      dialog.showModal();
    }
  };

  const closeModal = () => {
    previewDialogRef.current?.close();
    setIsModalOpen(false);
  };

  const renderViewportControls = (labelPrefix: string) => (
    <div
      className="chip-row"
      role="group"
      aria-label={`${labelPrefix}: Viewport`}
    >
      <button
        type="button"
        className="chip"
        aria-pressed={viewportMode === 'desktop'}
        onClick={() => setViewportMode('desktop')}
      >
        <LayoutDashboard size={14} style={{ marginRight: '6px' }} />
        <span>{chrome.preview.desktopBtn}</span>
      </button>
      <button
        type="button"
        className="chip"
        aria-pressed={viewportMode === 'mobile'}
        onClick={() => setViewportMode('mobile')}
      >
        <Smartphone size={14} style={{ marginRight: '6px' }} />
        <span>{chrome.preview.mobileBtn}</span>
      </button>
    </div>
  );

  const renderBrowserStage = (frameKey: string) => (
    <div
      className={`viewport-frame ${
        viewportMode === 'mobile'
          ? 'viewport-frame--mobile'
          : 'viewport-frame--desktop'
      }`}
    >
      <div className="dg-browser-frame-bar">
        <div className="dg-mac-dots">
          <span className="red" />
          <span className="yellow" />
          <span className="green" />
        </div>
        <div className="dg-browser-url">
          <Lock size={11} />
          <span>{embeddableDemoUrl ?? `dreamteam.vn/products/${slug}`}</span>
        </div>
        <span className="badge type-mono">
          {viewportMode === 'mobile' ? '375px' : '1280px'}
        </span>
      </div>

      {embeddableDemoUrl ? (
        <DemoIframeCanvas
          key={`${frameKey}:${embeddableDemoUrl}`}
          demoUrl={embeddableDemoUrl}
          productName={productName}
          viewportMode={viewportMode}
        />
      ) : (
        <FallbackMediaBody
          thumbnailUrl={thumbnailUrl}
          productType={productType}
          industry={industry}
          sourceType={sourceType}
          slug={slug}
          productName={productName}
          shortDescription={shortDescription}
          deliverables={deliverables}
        />
      )}
    </div>
  );

  return (
    <div className="viewport-stage dg-panel">
      <div className="viewport-stage__head">
        <div>
          <span className="type-eyebrow">
            {chrome.preview.fallbackEyebrow}
          </span>
          <div className="type-body-sm">
            {chrome.preview.sourceSafeNote}
          </div>
        </div>

        <div className="viewport-stage__controls">
          {renderViewportControls(chrome.preview.fallbackEyebrow)}
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={openModal}
          >
            <Expand size={14} />
            <span>{chrome.preview.zoomBtn}</span>
          </button>
          {embeddableDemoUrl && (
            <a
              href={embeddableDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--ghost btn--sm"
            >
              <span>{chrome.preview.openTabBtn}</span>
              <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </div>

      {renderBrowserStage('inline')}

      <dialog
        ref={previewDialogRef}
        className="editorial-dialog preview-dialog"
        aria-labelledby="live-preview-modal-title"
        {...DIALOG_LIGHT_DISMISS}
      >
        <div className="preview-dialog__body">
          <div className="preview-dialog__head">
            <div>
              <span className="type-eyebrow">
                {getProductTypeLabel(productType)} • {getIndustryLabel(industry)}
              </span>
              <h2
                id="live-preview-modal-title"
                className="type-h3"
                style={{ margin: '4px 0 0' }}
              >
                {productName}
              </h2>
            </div>

            <div className="viewport-stage__controls">
              {renderViewportControls(chrome.preview.zoomBtn)}
              {embeddableDemoUrl && (
                <a
                  href={embeddableDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--secondary btn--sm"
                >
                  <span>{chrome.preview.openTabBtn}</span>
                  <ArrowUpRight size={14} />
                </a>
              )}
              <button
                type="button"
                className="icon-btn"
                onClick={closeModal}
                aria-label={chrome.preview.closeZoomAria}
                autoFocus
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="preview-dialog__stage">
            {isModalOpen && renderBrowserStage('modal')}
          </div>
        </div>
      </dialog>
    </div>
  );
}
