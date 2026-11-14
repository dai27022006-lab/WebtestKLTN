'use client';

import type { ProductType } from '@/types/api';

const MODES: Array<{
  type: ProductType;
  label: string;
  headline: string;
  detail: string;
  metrics: string[];
}> = [
  {
    type: 'template',
    label: 'Trang bán hàng',
    headline: 'Landing Page tối ưu 375px cho TikTok Shop & Shopee',
    detail:
      'Chuyển khách từ video ngắn sang trang đặt hàng gọn 1 màn hình, cài đặt trong 30 phút.',
    metrics: ['375px - 1440px', 'Chuẩn chính sách sàn', 'Mã nguồn sạch'],
  },
  {
    type: 'prompt_pack',
    label: 'Prompt viết bài',
    headline: 'Bộ Prompt mô tả sản phẩm & trả lời khách quen tay',
    detail:
      'Điền tên sản phẩm và tệp khách vào khung có sẵn, tránh từ ngữ vi phạm quảng cáo.',
    metrics: ['50-60 mẫu thực chiến', 'File Notion + PDF', 'Dùng ngay 10 phút'],
  },
  {
    type: 'workflow',
    label: 'Workflow chốt đơn',
    headline: 'Tự động ghi đơn về Google Sheets & báo Zalo/Telegram',
    detail:
      'Shop 1–3 người không sót đơn giờ cao điểm, nắm tồn kho ngay trên trang tính quen thuộc.',
    metrics: ['Nhập JSON 1 chạm', 'Google Sheets + Telegram', 'Không cần ERP'],
  },
];

export function WorkspaceShowcaseFrame({
  activeType,
  onSelectType,
}: {
  activeType: ProductType;
  onSelectType: (type: ProductType) => void;
}) {
  const current = MODES.find((m) => m.type === activeType) ?? MODES[0];

  return (
    <div className="showcase-stage" aria-label="Xem trước cấu trúc gói giải pháp">
      <div className="showcase-tabs" role="tablist" aria-label="Chọn loại giải pháp">
        {MODES.map((mode) => {
          const isSelected = mode.type === activeType;
          return (
            <button
              key={mode.type}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className="showcase-tab"
              onClick={() => onSelectType(mode.type)}
            >
              {mode.label}
            </button>
          );
        })}
      </div>

      <div className="showcase-viewport" key={current.type}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <span className="type-eyebrow">{current.label}</span>
          <span className="badge badge--accent">Giao hàng số tức thì</span>
        </div>

        <div style={{ display: 'grid', gap: '8px', marginBlock: 'auto', paddingBlock: '12px' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--text-h3)' }}>{current.headline}</h3>
          <p className="type-body-sm" style={{ margin: 0 }}>
            {current.detail}
          </p>

          {current.type === 'template' && (
            <div className="wireframe-browser" style={{ height: '120px', marginTop: '8px' }}>
              <div className="wireframe-dots">
                <i />
                <i />
                <i />
              </div>
              <div className="wireframe-body">
                <div className="wireframe-block wireframe-block--accent" />
                <div className="wireframe-block" />
              </div>
            </div>
          )}

          {current.type === 'prompt_pack' && (
            <div className="prompt-card-mini" style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className="prompt-token">{'{{nganh_my_pham}}'}</span>
                <span className="prompt-token">{'{{ngan_sach_1tr}}'}</span>
              </div>
              <span className="type-caption">
                &ldquo;Viết 3 hook video TikTok 15s nhấn mạnh bảng thành phần dịu nhẹ...&rdquo;
              </span>
            </div>
          )}

          {current.type === 'workflow' && (
            <div className="workflow-nodes" style={{ marginTop: '12px' }}>
              <div className="workflow-node">Webhook Đơn</div>
              <div className="workflow-arrow" />
              <div className="workflow-node workflow-node--accent">Google Sheets</div>
              <div className="workflow-arrow" />
              <div className="workflow-node">Cảnh báo tồn</div>
            </div>
          )}
        </div>

        <div className="chip-row" style={{ borderTop: '1px solid var(--border-hairline)', paddingTop: '12px' }}>
          {current.metrics.map((item) => (
            <span key={item} className="badge">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
