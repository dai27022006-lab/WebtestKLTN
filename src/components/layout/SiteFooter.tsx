import Link from 'next/link';

import { DreamTeamBrandMark } from '@/components/visual/DreamTeamBrandMark';

export function SiteFooter() {
  return (
    <footer className="dg-footer dg-dark-band">
      <div className="dg-footer-glow glow-a" aria-hidden="true" />
      <div className="dg-footer-glow glow-b" aria-hidden="true" />
      <div className="dg-footer-pattern" aria-hidden="true" />

      <div className="container dg-footer-inner">
        <div className="dg-footer-grid">
          <div className="dg-footer-brand">
            <Link href="/" aria-label="DreamTeam — Về trang chủ">
              <DreamTeamBrandMark
                size={34}
                showWordmark
                inverted
                subtitle="Giải pháp số cho chủ shop nhỏ"
              />
            </Link>
            <p>
              Nền tảng thương mại điện tử kinh doanh Template Website, Prompt Pack
              và Workflow tự động cho chủ shop 1–3 người trên Shopee, TikTok
              Shop, Facebook — tích hợp Trợ lý ảo RAG (F7) &amp; Thí nghiệm A/B
              (F11).
            </p>
            <div className="dg-footer-badges">
              <span className="dg-footer-pill">100% Grounding DB</span>
              <span className="dg-footer-pill">Within-subject AB/BA</span>
              <span className="dg-footer-pill">Sandbox F5–F6</span>
            </div>
          </div>

          <div>
            <h5>
              <span className="dg-footer-dot grad-emerald" aria-hidden="true" />
              Khám phá &amp; Mua sắm
            </h5>
            <ul className="dg-footer-links">
              <li>
                <Link href="/products">Toàn bộ gói giải pháp (F2)</Link>
              </li>
              <li>
                <Link href="/products?product_type=template">
                  Template Website bán hàng
                </Link>
              </li>
              <li>
                <Link href="/products?product_type=prompt_pack">
                  Prompt Pack viết bài &amp; video
                </Link>
              </li>
              <li>
                <Link href="/products?product_type=workflow">
                  Workflow tự động đồng bộ đơn
                </Link>
              </li>
              <li>
                <Link href="/cart">Giỏ hàng &amp; Checkout Sandbox</Link>
              </li>
            </ul>
          </div>

          <div>
            <h5>
              <span className="dg-footer-dot grad-copper" aria-hidden="true" />
              Nghiên cứu &amp; Quản trị
            </h5>
            <ul className="dg-footer-links">
              <li>
                <Link href="/experiment">Tham gia Thí nghiệm A/B (F11)</Link>
              </li>
              <li>
                <Link href="/admin/analytics">
                  Dashboard Phân tích &amp; RAG (F10)
                </Link>
              </li>
              <li>
                <Link href="/auth">Đăng nhập / Tài khoản Demo (F1)</Link>
              </li>
              <li>
                <Link href="/#faqs">Câu hỏi thường gặp &amp; Bản quyền</Link>
              </li>
              <li>
                <Link href="/api/health">Trạng thái hệ thống (/api/health)</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="dg-footer-bottom">
          <span>
            © 2026 DreamTeam • Đồ án Tốt nghiệp — Thanh toán trên hệ thống là
            chế độ Sandbox đo ý định mua, không thu tiền thật.
          </span>
          <div className="dg-footer-bottom-links">
            <Link href="/products">Danh mục</Link>
            <Link href="/experiment">Thí nghiệm F11</Link>
            <Link href="/checkout">Thanh toán Sandbox</Link>
            <Link href="/auth">Tài khoản</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
