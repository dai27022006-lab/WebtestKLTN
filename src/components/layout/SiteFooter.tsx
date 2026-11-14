import Link from 'next/link';

import { BrandMark } from '@/components/visual/BrandMark';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div style={{ display: 'grid', gap: '12px', alignContent: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BrandMark size={24} />
            <strong>Tiệm Số Thực Chiến — Digital Store Advisor</strong>
          </div>
          <p className="type-body-sm" style={{ margin: 0, maxWidth: '46ch' }}>
            Nền tảng bán sản phẩm số (Template Website, Prompt Pack, Workflow) cho
            chủ shop nhỏ 1–3 người trên TikTok Shop, Shopee và Facebook. Phục vụ
            nghiên cứu đánh giá hiệu quả trợ lý ảo tư vấn (F7, F8, F11).
          </p>
          <p className="type-caption" style={{ margin: 0 }}>
            © 2026 Digital Store Advisor • Đồ án Tốt nghiệp. Thanh toán trên hệ
            thống là chế độ Sandbox đo ý định mua, không thu tiền thật.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '10px', alignContent: 'start' }}>
          <span className="type-eyebrow">Khám phá & Mua sắm</span>
          <div className="site-footer__links">
            <Link href="/products">Danh mục gói giải pháp</Link>
            <Link href="/cart">Giỏ hàng của bạn</Link>
            <Link href="/checkout">Thanh toán Mock Sandbox</Link>
            <Link href="/auth">Đăng nhập / Tài khoản Demo</Link>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '10px', alignContent: 'start' }}>
          <span className="type-eyebrow">Nghiên cứu & Quản trị</span>
          <div className="site-footer__links">
            <Link href="/experiment">Tham gia Thí nghiệm A/B (F11)</Link>
            <Link href="/admin/analytics">Bảng số liệu Admin (F10)</Link>
            <Link href="/api/health">Trạng thái hệ thống (/api/health)</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
