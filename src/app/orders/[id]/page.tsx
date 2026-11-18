'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import {
  CheckCircle2,
  ChevronLeft,
  Download,
  Lock,
  ShoppingBag,
} from '@/components/icons/DreamIcons';
import { useLocale } from '@/components/providers/LocaleProvider';
import { getOrderById, requestDownloadAccess } from '@/services';
import { useExperiment } from '@/state';
import type { DownloadAccessResponse, OrderDto } from '@/types/api';

interface GrantUiState {
  isLoading: boolean;
  errorMsg: string | null;
  lastAccess: DownloadAccessResponse | null;
  previewContent: string | null;
}

export default function OrderDetailPage() {
  const {
    commerce,
    chrome,
    formatPrice,
    formatDate,
    getOrderStatusMeta,
  } = useLocale();
  const od = commerce.orders;
  const ct = commerce.cart;
  const params = useParams<{ id: string }>();
  const orderId = params?.id ?? '';
  const { visitorId, track } = useExperiment();

  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loadedAtMs, setLoadedAtMs] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [grantStates, setGrantStates] = useState<Record<string, GrantUiState>>(
    {}
  );

  const loadOrder = useCallback(
    async (signal?: AbortSignal) => {
      if (!orderId) return;
      setIsLoading(true);
      setErrorMessage(null);
      const res = await getOrderById(
        orderId,
        visitorId || undefined,
        signal
      );
      if (signal?.aborted) return;
      setIsLoading(false);

      if (!res.ok) {
        setErrorMessage(res.error.message);
        setOrder(null);
        return;
      }
      setOrder(res.data);
      setLoadedAtMs(Date.now());
    },
    [orderId, visitorId]
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void loadOrder(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadOrder]);

  const handleDownload = async (token: string, productId: string) => {
    setGrantStates((prev) => ({
      ...prev,
      [token]: {
        isLoading: true,
        errorMsg: null,
        lastAccess: prev[token]?.lastAccess ?? null,
        previewContent: prev[token]?.previewContent ?? null,
      },
    }));

    const res = await requestDownloadAccess(token);

    if (!res.ok) {
      setGrantStates((prev) => ({
        ...prev,
        [token]: {
          isLoading: false,
          errorMsg: res.error.message,
          lastAccess: prev[token]?.lastAccess ?? null,
          previewContent: prev[token]?.previewContent ?? null,
        },
      }));
      return;
    }

    void track('download_completed', {
      product_id: productId,
      properties: {
        file_name: res.data.file_name,
        remaining_downloads: res.data.remaining_downloads,
      },
    });

    let previewText: string | null = null;
    try {
      const payloadRes = await fetch(res.data.download_url);
      if (payloadRes.ok) {
        previewText = await payloadRes.text();
      }
    } catch {
      // Fallback to direct anchor download only
    }

    const link = document.createElement('a');
    link.href = res.data.download_url;
    link.download = res.data.file_name;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();

    setGrantStates((prev) => ({
      ...prev,
      [token]: {
        isLoading: false,
        errorMsg: null,
        lastAccess: res.data,
        previewContent: previewText,
      },
    }));

    void loadOrder();
  };

  if (isLoading) {
    return (
      <section className="section section--compact">
        <div className="container container--narrow">
          <div className="skeleton-box" style={{ height: '320px' }} />
        </div>
      </section>
    );
  }

  if (errorMessage || !order) {
    return (
      <section className="section section--compact">
        <div className="container container--narrow">
          <div className="callout callout--danger" role="alert">
            <strong>{errorMessage ?? od.emptyAllTitle}</strong>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
              <Link href="/orders" className="btn btn--secondary btn--sm">
                <ChevronLeft size={14} />
                <span>{od.backToOrders}</span>
              </Link>
              <Link href="/cart" className="btn btn--ghost btn--sm">
                {chrome.common.cart}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const statusMeta = getOrderStatusMeta(order.status);
  const itemNameMap = new Map(
    order.items.map((item) => [item.product_id, item.product_name_snapshot])
  );

  return (
    <section className="section section--compact">
      <div
        className="container container--narrow"
        style={{ display: 'grid', gap: '24px' }}
      >
        <div className="stepper" aria-label={od.eyebrow}>
          <div className="stepper__item stepper__item--done">
            <span className="badge badge--success">
              <ShoppingBag size={12} /> 1
            </span>
            <span>{ct.step1}</span>
          </div>
          <div className="stepper__item stepper__item--done">
            <span className="badge badge--success">
              <Lock size={12} /> 2
            </span>
            <span>{ct.step2}</span>
          </div>
          <div className="stepper__item stepper__item--active">
            <span className="badge badge--accent">
              <Download size={12} /> 3
            </span>
            <span>{ct.step3}</span>
          </div>
        </div>

        {/* Order Header */}
        <div
          className="surface-card dg-panel"
          style={{ display: 'grid', gap: '16px' }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div>
              <span className="type-eyebrow">
                {od.detailTitle(order.order_code)}
              </span>
              <h1 className="type-h2 type-mono" style={{ margin: '4px 0 0' }}>
                {order.order_code}
              </h1>
            </div>
            <span className={`badge badge--${statusMeta.tone}`}>
              <CheckCircle2 size={13} />
              <span>{statusMeta.label}</span>
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-hairline)',
            }}
          >
            <div>
              <div className="type-caption">{od.totalOrderValue}</div>
              <strong
                className="type-price"
                style={{ fontSize: '1.25rem', color: 'var(--accent)' }}
              >
                {formatPrice(order.total_vnd)}
              </strong>
            </div>
            <div>
              <div className="type-caption">{od.createdAtLabel}</div>
              <span className="type-body-sm">
                {formatDate(order.created_at)}
              </span>
            </div>
            <div>
              <div className="type-caption">{od.paidAtLabel}</div>
              <span className="type-body-sm">
                {formatDate(order.paid_at)}
              </span>
            </div>
          </div>

          <p className="type-caption" style={{ margin: 0 }}>
            {od.sandboxNote}
          </p>

          {order.status !== 'paid' && (
            <div className="callout callout--warning">
              <strong>{statusMeta.label}</strong>
              <span>{commerce.checkout.sandboxHint}</span>
              <div>
                <Link href="/checkout" className="dg-btn-purchase dg-btn-sm">
                  {od.completePayTitle}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Secure Download Links */}
        {order.status === 'paid' && (
          <div
            className="surface-card dg-panel"
            style={{ display: 'grid', gap: '16px' }}
          >
            <h2 className="type-h3" style={{ margin: 0 }}>
              {od.downloadsTitle}
            </h2>

            {!order.download_grants || order.download_grants.length === 0 ? (
              <p className="type-body-sm" style={{ margin: 0 }}>
                {chrome.common.noData}
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '14px' }}>
                {order.download_grants.map((grant) => {
                  const state = grantStates[grant.token];
                  const isExpired =
                    loadedAtMs > 0 &&
                    new Date(grant.expires_at).getTime() <= loadedAtMs;
                  const isExhausted =
                    grant.download_count >= grant.max_downloads;
                  const disabled =
                    Boolean(state?.isLoading) || isExpired || isExhausted;

                  return (
                    <div
                      key={grant.id}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-strong)',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        display: 'grid',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'grid', gap: '4px' }}>
                          <strong>
                            {itemNameMap.get(grant.product_id) ??
                              od.itemsTitle}
                          </strong>
                          <span className="type-caption type-mono">
                            {od.downloadsUsed(grant.download_count, grant.max_downloads)}{' '}
                            • {od.expiresAt}: {formatDate(grant.expires_at)}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="dg-btn-purchase dg-btn-sm"
                          disabled={disabled}
                          onClick={() =>
                            void handleDownload(grant.token, grant.product_id)
                          }
                        >
                          <Download size={14} />
                          <span>
                            {state?.isLoading
                              ? od.downloadingBtn
                              : od.downloadBtn}
                          </span>
                        </button>
                      </div>

                      {state?.errorMsg && (
                        <div className="callout callout--danger" role="alert">
                          {state.errorMsg}
                        </div>
                      )}

                      {state?.lastAccess && (
                        <div className="callout callout--success">
                          <strong>{state.lastAccess.file_name}</strong>
                          <span className="type-caption">
                            <strong className="type-mono">
                              {state.lastAccess.remaining_downloads}
                            </strong>{' '}
                            / {grant.max_downloads}
                          </span>
                        </div>
                      )}

                      {state?.previewContent && (
                        <details>
                          <summary
                            className="type-body-sm"
                            style={{ cursor: 'pointer', fontWeight: 600 }}
                          >
                            {od.previewTitle} ({state.lastAccess?.file_name})
                          </summary>
                          <pre
                            className="type-mono"
                            style={{
                              marginTop: '8px',
                              padding: '12px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--bg-surface)',
                              border: '1px solid var(--border-hairline)',
                              fontSize: '0.75rem',
                              overflowX: 'auto',
                              maxHeight: '260px',
                            }}
                          >
                            {state.previewContent}
                          </pre>
                        </details>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/orders" className="btn btn--secondary">
            <ChevronLeft size={15} />
            <span>{od.backToOrders}</span>
          </Link>
          <Link href="/products" className="dg-btn-purchase">
            <span>{ct.browseBtn}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
