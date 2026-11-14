'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  formatVnd,
  PRODUCT_TYPE_LABELS,
} from '@/components/shared/formatters';
import { ProductPlaceholderFrame } from '@/components/visual/ProductPlaceholderFrame';
import { getChatSessions, sendChatMessage } from '@/services';
import { useExperiment } from '@/state';
import type { ChatMessageDto } from '@/types/api';

const QUICK_PROMPTS = [
  'Shop mỹ phẩm 2 người trên TikTok Shop, ngân sách dưới 1 triệu cần landing page.',
  'Mình bán thời trang local cần trang lookbook kèm bảng size dưới 700k.',
  'Cần gói prompt trả lời inbox và chốt đơn đa kênh chi phí thấp.',
];

export function AdvisorChatDrawer() {
  const { visitorId, assignment, scenarioState, activeVariant, track } =
    useExperiment();

  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openedTrackedRunRef = useRef<string | null>(null);
  const streamEndRef = useRef<HTMLDivElement | null>(null);

  const isChatEnabled = activeVariant === 'chatbot_on';
  const drawerOpen = isChatEnabled && isOpen;
  const currentRunId = scenarioState?.scenario_run_id ?? undefined;

  const loadHistory = useCallback(async () => {
    if (!assignment || !visitorId) return;
    setIsLoadingHistory(true);
    setErrorMsg(null);
    const res = await getChatSessions({
      assignment_id: assignment.assignment_id,
      visitor_id: visitorId,
      scenario_run_id: currentRunId,
    });
    setIsLoadingHistory(false);

    if (!res.ok) {
      setErrorMsg(res.error.message);
      return;
    }

    const latestSession = res.data.sessions[res.data.sessions.length - 1];
    if (latestSession) {
      setSessionId(latestSession.id);
      setMessages(latestSession.messages);
    } else {
      setSessionId(undefined);
      setMessages([]);
    }
  }, [assignment, visitorId, currentRunId]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if (!assignment) return;

    const trackKey = `${assignment.assignment_id}:${currentRunId ?? 'free'}`;
    if (openedTrackedRunRef.current !== trackKey) {
      openedTrackedRunRef.current = trackKey;
      void track('chat_opened', {
        session_id: sessionId ?? null,
      });
    }
    void loadHistory();
  }, [assignment, currentRunId, loadHistory, sessionId, track]);

  useEffect(() => {
    if (!isChatEnabled) return;

    const onOpenEvent = () => {
      handleOpen();
    };
    window.addEventListener('dsa:open-chat', onOpenEvent);
    return () => {
      window.removeEventListener('dsa:open-chat', onOpenEvent);
    };
  }, [isChatEnabled, handleOpen]);

  useEffect(() => {
    if (drawerOpen) {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      streamEndRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
  }, [messages.length, drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  if (!isChatEnabled) {
    return null;
  }

  const latestAssistantModel = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant')?.model_name;
  const isStubMode =
    !latestAssistantModel ||
    latestAssistantModel.toLowerCase().includes('stub') ||
    latestAssistantModel.toLowerCase().includes('mock');

  const handleSend = async (textOverride?: string) => {
    const trimmed = (textOverride ?? inputText).trim();
    if (!trimmed || isSending) return;

    if (!assignment || !visitorId) {
      setErrorMsg(
        'Vui lòng xác nhận đồng ý tham gia tại trang Thí nghiệm F11 trước khi chat.'
      );
      return;
    }

    setErrorMsg(null);
    setIsSending(true);
    if (!textOverride) {
      setInputText('');
    }

    void track('chat_message_sent', {
      session_id: sessionId ?? null,
      properties: { length: trimmed.length },
    });

    const res = await sendChatMessage({
      session_id: sessionId,
      assignment_id: assignment.assignment_id,
      visitor_id: visitorId,
      scenario_run_id: currentRunId,
      message: trimmed,
    });

    setIsSending(false);

    if (!res.ok) {
      setErrorMsg(res.error.message);
      return;
    }

    setSessionId(res.data.session_id);
    setMessages((prev) => [
      ...prev,
      res.data.user_message,
      res.data.assistant_message,
    ]);

    if (res.data.assistant_message.suggested_products.length > 0) {
      void track('product_suggested', {
        session_id: res.data.session_id,
        properties: {
          suggested_ids: res.data.assistant_message.suggested_product_ids,
        },
      });
    }
  };

  return (
    <>
      {!drawerOpen && (
        <button
          type="button"
          className="chat-fab"
          onClick={handleOpen}
          aria-label="Mở Trợ lý ảo tư vấn gói sản phẩm"
        >
          <span aria-hidden="true">✦</span>
          <span>Trợ lý tư vấn</span>
        </button>
      )}

      {drawerOpen && (
        <aside
          className="chat-drawer"
          aria-label="Trợ lý ảo tư vấn sản phẩm số"
        >
          <div className="chat-drawer__head">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <div>
                <strong style={{ fontSize: '1rem' }}>
                  Trợ lý Tư vấn Gói Số
                </strong>
                <div className="type-caption">
                  Grounding 100% ID sản phẩm thật trong danh mục
                </div>
              </div>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng khung trợ lý ảo"
              >
                Đóng
              </button>
            </div>

            {isStubMode ? (
              <span className="badge badge--warning">
                Chế độ Chatbot Stub (Chưa kết nối Gemini API thật)
              </span>
            ) : (
              <span className="badge badge--success">
                AI RAG ({latestAssistantModel}) • Chỉ gợi ý gói có trong DB
              </span>
            )}
          </div>

          <div className="chat-drawer__messages">
            {isLoadingHistory && (
              <p className="type-body-sm" style={{ margin: 0 }}>
                Đang tải lịch sử hội thoại...
              </p>
            )}

            {messages.length === 0 && !isLoadingHistory && (
              <div style={{ display: 'grid', gap: '12px' }}>
                <div className="chat-bubble chat-bubble--assistant">
                  Chào bạn! Mình là trợ lý tư vấn giải pháp số cho chủ shop nhỏ.
                  Hãy cho mình biết ngành hàng, kênh bán và ngân sách dự kiến để
                  mình lọc đúng gói phù hợp trong danh mục.
                </div>

                <div style={{ display: 'grid', gap: '6px' }}>
                  <span className="type-caption">Gợi ý câu hỏi nhanh:</span>
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="btn btn--secondary btn--sm"
                      style={{
                        justifyContent: 'flex-start',
                        whiteSpace: 'normal',
                        height: 'auto',
                        paddingBlock: '8px',
                        textAlign: 'left',
                      }}
                      onClick={() => void handleSend(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  className={`chat-bubble ${
                    msg.role === 'user'
                      ? 'chat-bubble--user'
                      : 'chat-bubble--assistant'
                  }`}
                >
                  {msg.content}
                </div>

                {msg.role === 'assistant' &&
                  msg.suggested_products.slice(0, 3).map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="chat-suggestion-card"
                      style={{ width: '92%' }}
                      onClick={() => {
                        void track('suggestion_clicked', {
                          product_id: product.id,
                          session_id: msg.session_id,
                        });
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '76px 1fr',
                          gap: '10px',
                          alignItems: 'center',
                        }}
                      >
                        <ProductPlaceholderFrame
                          productType={product.product_type}
                          industry={product.industry}
                          compact
                        />
                        <div style={{ display: 'grid', gap: '4px' }}>
                          <span className="type-caption">
                            {PRODUCT_TYPE_LABELS[product.product_type]} •{' '}
                            {product.industry}
                          </span>
                          <strong style={{ fontSize: '0.875rem' }}>
                            {product.name}
                          </strong>
                          <span className="type-price" style={{ fontSize: '0.875rem' }}>
                            {formatVnd(product.price_vnd)}
                          </span>
                        </div>
                      </div>
                      <p
                        className="type-caption"
                        style={{ margin: 0, color: 'var(--ink-soft)' }}
                      >
                        {product.reason}
                      </p>
                    </Link>
                  ))}
              </div>
            ))}

            {isSending && (
              <div className="chat-bubble chat-bubble--assistant">
                Đang tra cứu danh mục sản phẩm...
              </div>
            )}

            {errorMsg && (
              <div className="callout callout--danger" role="alert">
                {errorMsg}
              </div>
            )}

            <div ref={streamEndRef} />
          </div>

          <form
            className="chat-drawer__composer"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
          >
            <label htmlFor="advisor-chat-input" className="type-caption">
              Mô tả nhu cầu & ngân sách của shop (tối đa 1.500 ký tự)
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <textarea
                id="advisor-chat-input"
                className="textarea"
                rows={2}
                maxLength={1500}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Ví dụ: Shop mỹ phẩm ngân sách 1 triệu cần trang bán hàng..."
                style={{ minHeight: '48px', maxHeight: '112px' }}
              />
              <button
                type="submit"
                className="btn btn--primary"
                disabled={isSending || !inputText.trim()}
              >
                Gửi
              </button>
            </div>
          </form>
        </aside>
      )}
    </>
  );
}
