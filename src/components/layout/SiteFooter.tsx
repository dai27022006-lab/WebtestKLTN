'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { DreamTeamBrandMark } from '@/components/visual/DreamTeamBrandMark';

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

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
                subtitle="Công cụ số cho shop nhỏ"
              />
            </Link>
            <p>
              Cửa hàng Template Website, Prompt Pack AI và Workflow tự động tối
              ưu cho chủ shop 1–3 người kinh doanh trên Shopee, TikTok Shop và
              Facebook — dễ cài đặt, minh bạch bản quyền và nhận file tức thì.
            </p>
            <div className="dg-footer-badges">
              <span className="dg-footer-pill">Tối ưu Mobile 375px</span>
              <span className="dg-footer-pill">Bản quyền minh bạch</span>
              <span className="dg-footer-pill">Tải file tức thì</span>
            </div>
          </div>

          <div>
            <h5>
              <span className="dg-footer-dot grad-emerald" aria-hidden="true" />
              Sản phẩm &amp; Hỗ trợ
            </h5>
            <ul className="dg-footer-links">
              <li>
                <Link href="/products">Toàn bộ sản phẩm số</Link>
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
                <Link href="/orders">Tra cứu đơn hàng &amp; Link tải</Link>
              </li>
              <li>
                <Link href="/#faqs">Hỏi đáp &amp; Bản quyền</Link>
              </li>
            </ul>
          </div>

          <div>
            <h5>
              <span className="dg-footer-dot grad-copper" aria-hidden="true" />
              Tài khoản &amp; Khảo sát
            </h5>
            <ul className="dg-footer-links">
              <li>
                <Link href="/auth">Đăng nhập / Đăng ký</Link>
              </li>
              <li>
                <Link href="/cart">Giỏ hàng của bạn</Link>
              </li>
              <li>
                <Link href="/experiment">Tham gia khảo sát trải nghiệm</Link>
              </li>
              <li>
                <Link href="/admin/analytics">Khu vực quản trị</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="dg-footer-bottom">
          <span>
            © 2026 DreamTeam • Cửa hàng sản phẩm số cho chủ shop nhỏ — Chế độ
            thanh toán thử nghiệm không thu tiền thật.
          </span>
          <div className="dg-footer-bottom-links">
            <Link href="/products">Sản phẩm</Link>
            <Link href="/orders">Đơn hàng</Link>
            <Link href="/#faqs">Hỏi đáp</Link>
            <Link href="/auth">Tài khoản</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
