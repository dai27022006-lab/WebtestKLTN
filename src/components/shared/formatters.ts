import type {
  OrderStatus,
  ProductSourceType,
  ProductType,
  ScenarioDifficulty,
} from '@/types/api';

const VND_FORMATTER = new Intl.NumberFormat('vi-VN');

export function formatVnd(amount: number): string {
  return `${VND_FORMATTER.format(Math.max(0, Math.round(amount)))}đ`;
}

export function formatDurationMmSs(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatDateTimeVi(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  template: 'Template Website',
  prompt_pack: 'Prompt Pack',
  workflow: 'Workflow Tự Động',
};

export const SOURCE_TYPE_META: Record<
  ProductSourceType,
  { label: string; badgeTone: 'success' | 'info' | 'accent'; summary: string }
> = {
  original: {
    label: 'Thiết kế gốc',
    badgeTone: 'success',
    summary: 'Nhóm đề tài tự thiết kế và biên soạn 100%, minh bạch bản quyền.',
  },
  adapted: {
    label: 'Điều chỉnh có nguồn',
    badgeTone: 'info',
    summary: 'Chuyển thể từ cấu trúc tham khảo mở, đã biên tập lại cho shop VN.',
  },
  licensed: {
    label: 'Bản quyền hợp lệ',
    badgeTone: 'accent',
    summary: 'Sử dụng theo giấy phép thương mại hợp lệ đi kèm hồ sơ.',
  },
};

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; tone: 'warning' | 'success' | 'danger' | 'info' }
> = {
  pending: { label: 'Chờ thanh toán Sandbox', tone: 'warning' },
  paid: { label: 'Đã thanh toán (Sandbox)', tone: 'success' },
  failed: { label: 'Thanh toán thất bại', tone: 'danger' },
  cancelled: { label: 'Đã hủy', tone: 'info' },
  refunded: { label: 'Đã hoàn tiền', tone: 'info' },
};

export const DIFFICULTY_LABELS: Record<ScenarioDifficulty, string> = {
  easy: 'Cơ bản',
  medium: 'Trung bình',
  hard: 'Nâng cao',
};
