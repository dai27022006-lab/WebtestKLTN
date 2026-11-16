'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import {
  CheckCircle2,
  Download,
  Lock,
  ShoppingBag,
} from '@/components/icons/DreamIcons';
import {
  formatDateTimeVi,
  formatVnd,
  ORDER_STATUS_META,
} from '@/components/shared/formatters';
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
            <strong>Không thể tải đơn hàng</strong>
            <span>{errorMessage ?? 'Đơn hàng không tồn tại.'}</span>
            <div style={{ marginTop: '8px' }}>
              <Link href="/cart" className="btn btn--secondary btn--sm">
                Quay lại Giỏ hàng
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const statusMeta = ORDER_STATUS_META[order.status];
  const itemNameMap = new Map(
    order.items.map((item) => [item.product_id, item.product_name_snapshot])
  );

  return (
    <section className="section section--compact">
      <div className="container container--narrow" style={{ display: 'grid', gap: '24px' }}>
        <div className="stepper" aria-label="Tiến trình giao dịch Sandbox">
          <div className="stepper__item stepper__item--done">
            <span className="badge badge--success">
              <ShoppingBag size={12} /> 1
            </span>
            <span>Giỏ hàng</span>
          </div>
          <div className="stepper__item stepper__item--done">
            <span className="badge badge--success">
              <Lock size={12} /> 2
            </span>
            <span>Thanh toán Sandbox</span>
          </div>
          <div className="stepper__item stepper__item--active">
            <span className="badge badge--accent">
              <Download size={12} /> 3
            </span>
            <span>Nhận file qua token</span>
          </div>
        </div>

        {/* Order Header */}
        <div className="surface-card dg-panel" style={{ display: 'grid', gap: '16px' }}>
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
              <span className="type-eyebrow">Đơn hàng giao hàng số (F6)</span>
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
              <div className="type-caption">Tổng giá trị Sandbox</div>
              <strong
                className="type-price"
                style={{ fontSize: '1.25rem', color: 'var(--accent)' }}
              >
                {formatVnd(order.total_vnd)}
              </strong>
            </div>
            <div>
              <div className="type-caption">Ngày tạo đơn</div>
              <span className="type-body-sm">
                {formatDateTimeVi(order.created_at)}
              </span>
            </div>
            <div>
              <div className="type-caption">Thời điểm thanh toán</div>
              <span className="type-body-sm">
                {formatDateTimeVi(order.paid_at)}
              </span>
            </div>
          </div>

          {order.status !== 'paid' && (
            <div className="callout callout--warning">
              <strong>Đơn hàng chưa ở trạng thái Đã thanh toán</strong>
              <span>
                Link tải file chỉ được phát hành khi đơn đạt trạng thái{' '}
                <code className="type-mono">paid</code>.
              </span>
              <div>
                <Link href="/checkout" className="dg-btn-purchase dg-btn-sm">
                  Quay lại Thanh toán Sandbox
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Download Grants */}
        {order.status === 'paid' && (
          <div className="surface-card dg-panel" style={{ display: 'grid', gap: '16px' }}>
            <h2 className="type-h3" style={{ margin: 0 }}>
              Kho tải gói sản phẩm đã cấp quyền
            </h2>

            {!order.download_grants || order.download_grants.length === 0 ? (
              <p className="type-body-sm" style={{ margin: 0 }}>
                Chưa có bản ghi cấp quyền tải xuống nào cho đơn hàng này.
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
                              'Gói sản phẩm số'}
                          </strong>
                          <span className="type-caption type-mono">
                            Đã tải: {grant.download_count} / {grant.max_downloads}{' '}
                            lượt • Hết hạn: {formatDateTimeVi(grant.expires_at)}
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
                              ? 'Đang cấp link...'
                              : isExpired
                                ? 'Link đã hết hạn'
                                : isExhausted
                                  ? 'Hết lượt tải'
                                  : 'Tải gói sản phẩm'}
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
                          <strong>
                            Đã cấp quyền tải file: {state.lastAccess.file_name}
                          </strong>
                          <span className="type-caption">
                            Số lượt tải còn lại:{' '}
                            <strong className="type-mono">
                              {state.lastAccess.remaining_downloads}
                            </strong>
                          </span>
                        </div>
                      )}

                      {state?.previewContent && (
                        <details>
                          <summary
                            className="type-body-sm"
                            style={{ cursor: 'pointer', fontWeight: 600 }}
                          >
                            Xem nội dung bàn giao JSON ({state.lastAccess?.file_name})
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
          <Link href="/products" className="btn btn--secondary">
            Tiếp tục xem sản phẩm
          </Link>
          <Link href="/experiment" className="btn btn--ghost">
            Về trang Thí nghiệm F11
          </Link>
        </div>
      </div>
    </section>
  );
}
