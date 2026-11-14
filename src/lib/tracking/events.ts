export const EVENT_NAMES = [
  'page_viewed',
  'product_viewed',
  'search_used',
  'filter_applied',
  'scenario_started',
  'scenario_completed',
  'chat_opened',
  'chat_message_sent',
  'product_suggested',
  'suggestion_clicked',
  'add_to_cart',
  'checkout_started',
  'purchase',
  'download_completed',
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

export const EVENT_VARIANTS = ['chatbot_on', 'chatbot_off'] as const;

export type EventVariant = (typeof EVENT_VARIANTS)[number];

export const EXPERIMENT_VARIANTS = [
  'chatbot_on',
  'chatbot_off',
  'abba_on_first',
  'abba_off_first',
] as const;

export type ExperimentVariant = (typeof EXPERIMENT_VARIANTS)[number];

export const CHAT_ONLY_EVENTS = [
  'chat_opened',
  'chat_message_sent',
  'product_suggested',
] as const satisfies readonly EventName[];

export type ChatOnlyEventName = (typeof CHAT_ONLY_EVENTS)[number];

export interface TrackEventInput {
  visitor_id: string;
  assignment_id: string;
  variant: EventVariant;
  event_name: EventName;
  created_at: string;
  scenario_run_id?: string | null;
  session_id?: string | null;
  product_id?: string | null;
  properties?: Record<string, unknown>;
  is_simulated?: boolean;
}

export interface EventDefinition {
  name: EventName;
  trigger: string;
  chatOnly: boolean;
}

export const EVENT_CATALOG: Record<EventName, EventDefinition> = {
  page_viewed: {
    name: 'page_viewed',
    trigger: 'Mở hoặc chuyển trang',
    chatOnly: false,
  },
  product_viewed: {
    name: 'product_viewed',
    trigger: 'Xem trang chi tiết sản phẩm',
    chatOnly: false,
  },
  search_used: {
    name: 'search_used',
    trigger: 'Gửi từ khóa tìm kiếm',
    chatOnly: false,
  },
  filter_applied: {
    name: 'filter_applied',
    trigger: 'Lọc theo ngành / loại / giá',
    chatOnly: false,
  },
  scenario_started: {
    name: 'scenario_started',
    trigger: 'Bắt đầu 1 thẻ kịch bản (F11)',
    chatOnly: false,
  },
  scenario_completed: {
    name: 'scenario_completed',
    trigger: 'Chốt gói cho kịch bản kèm độ tự tin (F11)',
    chatOnly: false,
  },
  chat_opened: {
    name: 'chat_opened',
    trigger: 'Mở khung chat (chỉ chatbot_on)',
    chatOnly: true,
  },
  chat_message_sent: {
    name: 'chat_message_sent',
    trigger: 'Gửi tin nhắn cho bot (chỉ chatbot_on)',
    chatOnly: true,
  },
  product_suggested: {
    name: 'product_suggested',
    trigger: 'Bot trả về gợi ý sản phẩm (chỉ chatbot_on)',
    chatOnly: true,
  },
  suggestion_clicked: {
    name: 'suggestion_clicked',
    trigger: 'Người dùng bấm vào card sản phẩm bot gợi ý',
    chatOnly: false,
  },
  add_to_cart: {
    name: 'add_to_cart',
    trigger: 'Thêm sản phẩm vào giỏ',
    chatOnly: false,
  },
  checkout_started: {
    name: 'checkout_started',
    trigger: 'Bắt đầu trang thanh toán sandbox',
    chatOnly: false,
  },
  purchase: {
    name: 'purchase',
    trigger: 'Hoàn tất thanh toán sandbox (ý định mua)',
    chatOnly: false,
  },
  download_completed: {
    name: 'download_completed',
    trigger: 'Tải file thành công từ đơn paid',
    chatOnly: false,
  },
};

export function isChatOnlyEvent(eventName: EventName): boolean {
  return EVENT_CATALOG[eventName].chatOnly;
}
