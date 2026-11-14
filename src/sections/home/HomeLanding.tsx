'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  formatVnd,
  PRODUCT_TYPE_LABELS,
  SOURCE_TYPE_META,
} from '@/components/shared/formatters';
import { ProductPlaceholderFrame } from '@/components/visual/ProductPlaceholderFrame';
import { WorkspaceShowcaseFrame } from '@/components/visual/WorkspaceShowcaseFrame';
import { initScrollReveals } from '@/motion/reveal';
import { listProducts } from '@/services';
import type { ProductSummaryDto, ProductType } from '@/types/api';

const PAIN_ROWS: Array<{
  type: ProductType;
  painTitle: string;
  painDesc: string;
  solutionTag: string;
}> = [
  {
    type: 'template',
    painTitle: 'Làm website bán hàng tốn hàng chục triệu và khó tự sửa?',
    painDesc:
      'Chủ shop nhỏ cần trang đích rõ ràng, tải nhanh trên điện thoại khách xem từ TikTok/Facebook để chốt đơn ngay trong 30 phút.',
    solutionTag: 'Template Website Chuẩn Mobile',
  },
  {
    type: 'prompt_pack',
    painTitle: 'Viết mô tả sản phẩm và trả lời inbox lặp đi lặp lại mỗi tối?',
    painDesc:
      'Bộ khung Prompt theo từng ngành hàng giúp viết kịch bản ngắn, tránh từ ngữ vi phạm chính sách sàn và giữ giọng văn tự nhiên.',
    solutionTag: 'Prompt Pack Thực Chiến',
  },
  {
    type: 'workflow',
    painTitle: 'Bán đa kênh Shopee, TikTok, Facebook dễ sót đơn và lệch tồn kho?',
    painDesc:
      'Mẫu Workflow nhập 1 chạm tự ghi đơn mới vào Google Sheets và bắn thông báo Zalo/Telegram ngay khi có khách đặt.',
    solutionTag: 'Workflow Tự Động Hóa',
  },
];

export function HomeLanding() {
  const [showcaseType, setShowcaseType] = useState<ProductType>('template');
  const [featured, setFeatured] = useState<ProductSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const cleanupReveal = initScrollReveals();
    return cleanupReveal;
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    void listProducts({ limit: 3, sort: 'newest' }, controller.signal).then(
      (res) => {
        if (!active) return;
        setIsLoading(false);
        if (res.ok) {
          setFeatured(res.data.slice(0, 3));
          setLoadError(null);
        } else {
          setLoadError(res.error.message);
        }
      }
    );

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const leadProduct = featured[0] ?? null;
  const secondaryProducts = featured.slice(1, 3);

  return (
    <>
      {/* Chặng 1: Clarity — Asymmetric Editorial Hero Split */}
      <section className="section">
        <div className="container hero-split">
          <div className="hero-copy">
            <span className="type-eyebrow">
              Dành cho chủ shop nhỏ 1–3 người • Shopee • TikTok Shop • Facebook
            </span>
            <h1 className="type-display">
              Chọn đúng gói công cụ số cho shop nhỏ trong vài phút.
            </h1>
            <p className="type-lead">
              Kho template website tự thiết kế, bộ prompt viết bài và workflow
              chốt đơn minh bạch bản quyền — đi kèm trợ lý ảo tư vấn và thí
              nghiệm A/B đánh giá tốc độ ra quyết định thực tế.
            </p>

            <div className="hero-actions">
              <Link href="/products" className="btn btn--primary btn--lg">
                Khám phá gói giải pháp
              </Link>
              <Link href="/experiment" className="btn btn--secondary btn--lg">
                Tham gia Thí nghiệm F11
              </Link>
            </div>

            <div className="hero-meta-strip">
              <span>Minh bạch bản quyền 100%</span>
              <span>Không cần tài khoản khi làm F11</span>
              <span>Bàn giao file số qua token có hạn</span>
            </div>
          </div>

          <div>
            <WorkspaceShowcaseFrame
              activeType={showcaseType}
              onSelectType={setShowcaseType}
            />
          </div>
        </div>
      </section>

      {/* Chặng 2: Recognition — Sticky 2-Column Pain-to-Tool */}
      <section className="section section--subtle editorial-reveal">
        <div className="container sticky-split">
          <div className="sticky-split__pin">
            <span className="type-eyebrow">Bài toán vận hành hằng ngày</span>
            <h2 className="type-h1" style={{ margin: 0 }}>
              Shop 1–3 người cần công cụ gọn nhẹ, không cần hệ thống cồng kềnh.
            </h2>
            <p className="type-body" style={{ margin: 0 }}>
              Bấm chọn một nhu cầu bên cạnh để đổi nhanh chế độ xem trước cấu
              trúc gói giải pháp ngay trên trang.
            </p>
            <div>
              <Link href="/products" className="btn btn--secondary">
                Lọc theo nhu cầu & ngân sách
              </Link>
            </div>
          </div>

          <div className="pain-list">
            {PAIN_ROWS.map((row) => {
              const isSelected = showcaseType === row.type;
              return (
                <button
                  key={row.type}
                  type="button"
                  className="pain-row"
                  aria-pressed={isSelected}
                  onClick={() => setShowcaseType(row.type)}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span className="badge badge--accent">{row.solutionTag}</span>
                    {isSelected && (
                      <span className="type-caption" style={{ color: 'var(--accent)' }}>
                        Đang xem trước
                      </span>
                    )}
                  </div>
                  <h3 className="pain-row__title">{row.painTitle}</h3>
                  <p className="pain-row__desc">{row.painDesc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Chặng 3 (PEAK): Focused Discovery — Bento 1+2 Gói Giải Pháp Nổi Bật */}
      <section className="section editorial-reveal">
        <div className="container">
          <div className="section-header">
            <div className="section-header__copy">
              <span className="type-eyebrow">Danh mục chọn lọc</span>
              <h2 className="type-h1">Gói giải pháp nổi bật từ cơ sở dữ liệu</h2>
              <p className="type-body-sm">
                Mỗi gói đều niêm yết rõ nguồn gốc thiết kế, nền tảng tương thích
                và thời gian triển khai dự kiến.
              </p>
            </div>
            <Link href="/products" className="btn btn--secondary">
              Xem toàn bộ danh mục
            </Link>
          </div>

          {loadError && (
            <div className="callout callout--danger" role="alert">
              <span>{loadError}</span>
            </div>
          )}

          {isLoading ? (
            <div className="bento-1-2">
              <div className="skeleton-box" style={{ minHeight: '380px' }} />
              <div className="bento-stack">
                <div className="skeleton-box" style={{ minHeight: '180px' }} />
                <div className="skeleton-box" style={{ minHeight: '180px' }} />
              </div>
            </div>
          ) : (
            featured.length > 0 && (
              <div className="bento-1-2">
                {leadProduct && (
                  <article className="product-card">
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <ProductPlaceholderFrame
                        productType={leadProduct.product_type}
                        industry={leadProduct.industry}
                        sourceType={leadProduct.source_type}
                      />
                      <div className="product-card__body">
                        <div className="chip-row">
                          <span className="badge">
                            {PRODUCT_TYPE_LABELS[leadProduct.product_type]}
                          </span>
                          <span className="badge">{leadProduct.industry}</span>
                        </div>
                        <h3 className="product-card__title">
                          <Link href={`/products/${leadProduct.slug}`}>
                            {leadProduct.name}
                          </Link>
                        </h3>
                        <p className="product-card__desc">
                          {leadProduct.short_description}
                        </p>
                      </div>
                    </div>

                    <div className="product-card__footer">
                      <span className="type-price" style={{ fontSize: '1.25rem' }}>
                        {formatVnd(leadProduct.price_vnd)}
                      </span>
                      <Link
                        href={`/products/${leadProduct.slug}`}
                        className="btn btn--primary"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </article>
                )}

                <div className="bento-stack">
                  {secondaryProducts.map((item) => (
                    <article
                      key={item.id}
                      className="product-card product-card--horizontal"
                    >
                      <ProductPlaceholderFrame
                        productType={item.product_type}
                        industry={item.industry}
                        sourceType={item.source_type}
                      />
                      <div
                        style={{
                          display: 'grid',
                          gap: '12px',
                          alignContent: 'space-between',
                        }}
                      >
                        <div className="product-card__body">
                          <div className="chip-row">
                            <span className="badge">
                              {PRODUCT_TYPE_LABELS[item.product_type]}
                            </span>
                            <span className="badge">{item.industry}</span>
                          </div>
                          <h3 className="product-card__title">
                            <Link href={`/products/${item.slug}`}>
                              {item.name}
                            </Link>
                          </h3>
                          <p className="product-card__desc">
                            {item.short_description}
                          </p>
                        </div>

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
            )
          )}
        </div>
      </section>

      {/* Chặng 4: Research Invitation — Tham gia Thí nghiệm F11 */}
      <section className="section section--subtle editorial-reveal">
        <div className="container" style={{ display: 'grid', gap: '32px' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <div className="section-header__copy">
              <span className="type-eyebrow">Thí nghiệm có nhiệm vụ (F11)</span>
              <h2 className="type-h1">
                Trợ lý ảo có giúp chọn gói nhanh và tự tin hơn?
              </h2>
              <p className="type-body">
                Mời bạn trải nghiệm 2 tình huống kinh doanh thực tế trong khoảng
                5 phút. Dữ liệu chỉ gắn với mã người tham gia ẩn danh và không
                yêu cầu đăng ký tài khoản email.
              </p>
            </div>
            <Link href="/experiment" className="btn btn--primary btn--lg">
              Bắt đầu ngay (Không cần tạo tài khoản)
            </Link>
          </div>

          <div className="steps-3">
            <div className="surface-card" style={{ display: 'grid', gap: '8px' }}>
              <span className="type-eyebrow">Bước 1</span>
              <h3 style={{ margin: 0 }}>Xác nhận tham gia ẩn danh</h3>
              <p className="type-body-sm" style={{ margin: 0 }}>
                Hệ thống cấp mã phiên ngẫu nhiên (ví dụ <code className="type-mono">P-001</code>)
                và sắp xếp ngẫu nhiên thứ tự đảo chéo AB/BA.
              </p>
            </div>

            <div className="surface-card" style={{ display: 'grid', gap: '8px' }}>
              <span className="type-eyebrow">Bước 2</span>
              <h3 style={{ margin: 0 }}>Thực hiện 2 thẻ kịch bản</h3>
              <p className="type-body-sm" style={{ margin: 0 }}>
                Một lượt có Trợ lý ảo gợi ý theo danh mục thật; một lượt bạn tự
                tìm kiếm và lọc trực tiếp trên cửa hàng đối chứng.
              </p>
            </div>

            <div className="surface-card" style={{ display: 'grid', gap: '8px' }}>
              <span className="type-eyebrow">Bước 3</span>
              <h3 style={{ margin: 0 }}>Chốt gói & Chấm độ tự tin</h3>
              <p className="type-body-sm" style={{ margin: 0 }}>
                Chọn gói phù hợp nhất với đề bài, đánh giá mức độ chắc chắn
                theo thang Likert 1–5 và ghi nhận thời gian ra quyết định.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chặng 5: Calm Assurance — Bản quyền & Giao hàng số */}
      <section className="section editorial-reveal">
        <div className="container assurance-grid">
          <div className="surface-card" style={{ display: 'grid', gap: '12px' }}>
            <span className="type-eyebrow">Minh bạch bản quyền</span>
            <h2 className="type-h2" style={{ margin: 0 }}>
              Phân loại rõ nguồn gốc từng gói sản phẩm
            </h2>
            <p className="type-body-sm" style={{ margin: 0 }}>
              Mỗi sản phẩm đều công khai <code className="type-mono">source_type</code> và{' '}
              <code className="type-mono">license_note</code> theo quy ước kiểm
              soát bản quyền của đề tài:
            </p>
            <div className="chip-row">
              {(['original', 'adapted', 'licensed'] as const).map((key) => (
                <span
                  key={key}
                  className={`badge badge--${SOURCE_TYPE_META[key].badgeTone}`}
                >
                  {SOURCE_TYPE_META[key].label}
                </span>
              ))}
            </div>
          </div>

          <div className="surface-card" style={{ display: 'grid', gap: '12px' }}>
            <span className="type-eyebrow">Giao hàng số & Thanh toán Sandbox</span>
            <h2 className="type-h2" style={{ margin: 0 }}>
              Cấp token tải file có thời hạn sau khi xác nhận đơn
            </h2>
            <p className="type-body-sm" style={{ margin: 0 }}>
              Luồng thanh toán trên website sử dụng Mock Sandbox Webhook để kiểm
              chứng ý định mua trong nghiên cứu, tự động phát hành link tải có
              giới hạn lượt và hạn dùng (<code className="type-mono">F6</code>).
            </p>
            <div>
              <Link href="/cart" className="btn btn--secondary btn--sm">
                Xem luồng Giỏ hàng & Sandbox
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
