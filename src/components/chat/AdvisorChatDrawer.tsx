'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  X,
} from '@/components/icons/DreamIcons';
import { useLocale } from '@/components/providers/LocaleProvider';
import { ProductPlaceholderFrame } from '@/components/visual/ProductPlaceholderFrame';
import { getChatSessions, sendChatMessage } from '@/services';
import { useExperiment } from '@/state';
import type { ChatMessageDto } from '@/types/api';

interface AdvisorChatDrawerInnerProps {
  isSurveyActive: boolean;
  assignmentId?: string;
  visitorId: string;
  currentRunId?: string;
  track: ReturnType<typeof useExperiment>['track'];
}

function AdvisorChatDrawerInner({
  isSurveyActive,
  assignmentId,
  visitorId,
  currentRunId,
  track,
}: AdvisorChatDrawerInnerProps) {
  const {
    locale,
    chrome,
    getProductCopy,
    getProductTypeLabel,
    getIndustryLabel,
    formatPrice,
  } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openedTrackedRunRef = useRef<string | null>(null);
  const streamEndRef = useRef<HTMLDivElement | null>(null);

  const loadHistory = useCallback(async () => {
    if (!isSurveyActive || !assignmentId || !visitorId) return;
    setIsLoadingHistory(true);
    setErrorMsg(null);
    const res = await getChatSessions({
      assignment_id: assignmentId,
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
  }, [isSurveyActive, assignmentId, visitorId, currentRunId]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if (!isSurveyActive || !assignmentId) return;

    const trackKey = `${assignmentId}:${currentRunId ?? 'free'}`;
    if (openedTrackedRunRef.current !== trackKey) {
      openedTrackedRunRef.current = trackKey;
      void track('chat_opened', {
        session_id: sessionId ?? null,
      });
    }
    void loadHistory();
  }, [isSurveyActive, assignmentId, currentRunId, loadHistory, sessionId, track]);

  useEffect(() => {
    const onOpenEvent = () => {
      handleOpen();
    };
    window.addEventListener('dsa:open-chat', onOpenEvent);
    return () => {
      window.removeEventListener('dsa:open-chat', onOpenEvent);
    };
  }, [handleOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    streamEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [messages.length, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const handleSend = async (textOverride?: string) => {
    const trimmed = (textOverride ?? inputText).trim();
    if (!trimmed || isSending) return;

    setErrorMsg(null);
    setIsSending(true);
    if (!textOverride) {
      setInputText('');
    }

    if (isSurveyActive && assignmentId) {
      void track('chat_message_sent', {
        session_id: sessionId ?? null,
        properties: { length: trimmed.length },
      });
    }

    const res = await sendChatMessage(
      isSurveyActive && assignmentId && visitorId
        ? {
            session_id: sessionId,
            assignment_id: assignmentId,
            visitor_id: visitorId,
            scenario_run_id: currentRunId,
            message: trimmed,
            locale,
          }
        : {
            session_id: sessionId,
            message: trimmed,
            locale,
          }
    );

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

    if (
      isSurveyActive &&
      assignmentId &&
      res.data.assistant_message.suggested_products.length > 0
    ) {
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
      {!isOpen && (
        <button
          type="button"
          className="chat-fab"
          onClick={handleOpen}
          aria-label={chrome.chat.fabAria}
        >
          <Sparkles size={17} />
          <span>{chrome.chat.fabLabel}</span>
        </button>
      )}

      {isOpen && (
        <aside
          className="chat-drawer"
          aria-label={chrome.chat.drawerAria}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="chat-drawer__icon-chip" aria-hidden="true">
                  <MessageSquare size={16} />
                </span>
                <div>
                  <strong style={{ fontSize: '0.95rem', display: 'block' }}>
                    {chrome.chat.title}
                  </strong>
                  <div className="type-caption">
                    {isSurveyActive
                      ? chrome.chat.subtitleSurvey
                      : chrome.chat.subtitleStorefront}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setIsOpen(false)}
                aria-label={chrome.chat.closeAria}
              >
                <X size={18} />
              </button>
            </div>

            <span className="badge badge--success">
              <ShieldCheck size={12} />
              <span>{chrome.chat.subtitleStorefront}</span>
            </span>
          </div>

          <div className="chat-drawer__messages">
            {isLoadingHistory && (
              <p className="type-body-sm" style={{ margin: 0 }}>
                {chrome.chat.loadingHistory}
              </p>
            )}

            {messages.length === 0 && !isLoadingHistory && (
              <div style={{ display: 'grid', gap: '12px' }}>
                <div className="chat-bubble chat-bubble--assistant">
                  <strong>{chrome.chat.emptyTitle}</strong>{' '}
                  {chrome.chat.emptyDesc}
                </div>

                <div style={{ display: 'grid', gap: '6px' }}>
                  <span className="type-caption">{chrome.chat.suggestedHeading}</span>
                  {chrome.chat.quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="btn btn--secondary btn--sm"
                      style={{
                        justifyContent: 'flex-start',
                        whiteSpace: 'normal',
                        height: 'auto',
                        paddingBlock: '9px',
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
                  msg.suggested_products.slice(0, 3).map((product) => {
                    const localizedProduct = getProductCopy({
                      slug: product.slug,
                      name: product.name,
                      short_description: product.reason,
                    });
                    return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="chat-suggestion-card"
                      style={{ width: '92%' }}
                      onClick={() => {
                        if (isSurveyActive && assignmentId) {
                          void track('suggestion_clicked', {
                            product_id: product.id,
                            session_id: msg.session_id,
                          });
                        }
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
                        {product.thumbnail_url ? (
                          <div
                            style={{
                              width: '76px',
                              aspectRatio: '16 / 10',
                              borderRadius: 'var(--radius-xs)',
                              overflow: 'hidden',
                              border: '1px solid var(--border-hairline)',
                              backgroundColor: 'var(--bg-surface-subtle)',
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={product.thumbnail_url}
                              alt={localizedProduct.name}
                              width={76}
                              height={48}
                              loading="lazy"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          </div>
                        ) : (
                          <ProductPlaceholderFrame
                            productType={product.product_type}
                            industry={product.industry}
                            compact
                          />
                        )}
                        <div style={{ display: 'grid', gap: '4px', minWidth: 0 }}>
                          <span className="type-caption">
                            {getProductTypeLabel(product.product_type)} •{' '}
                            {getIndustryLabel(product.industry)}
                          </span>
                          <strong style={{ fontSize: '0.875rem' }}>
                            {localizedProduct.name}
                          </strong>
                          <span
                            className="type-price"
                            style={{ fontSize: '0.875rem', color: 'var(--accent)' }}
                          >
                            {formatPrice(product.price_vnd)}
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
                    );
                  })}
              </div>
            ))}

            {isSending && (
              <div className="chat-bubble chat-bubble--assistant">
                {chrome.chat.thinking}
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
              {chrome.chat.inputPlaceholder}
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
                placeholder={chrome.chat.inputPlaceholder}
                style={{ minHeight: '48px', maxHeight: '112px' }}
              />
              <button
                type="submit"
                className="dg-btn-purchase dg-btn-sm"
                style={{ minHeight: '48px', paddingInline: '16px' }}
                disabled={isSending || !inputText.trim()}
              >
                <span>{isSending ? chrome.chat.sending : chrome.chat.send}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </aside>
      )}
    </>
  );
}

export function AdvisorChatDrawer() {
  const pathname = usePathname();
  const {
    visitorId,
    assignment,
    scenarioState,
    activeVariant,
    isScenarioSynced,
    track,
  } = useExperiment();

  const isAdminRoute = pathname.startsWith('/admin');
  const isSurveyActive = Boolean(
    assignment?.consent_given &&
      scenarioState?.scenario_run_id &&
      !scenarioState.is_finished
  );
  const isSyncingSurvey = Boolean(assignment && !isScenarioSynced);

  // Hide chat completely on /admin/* and during an active survey turn without assistant
  if (
    isAdminRoute ||
    isSyncingSurvey ||
    (isSurveyActive && activeVariant === 'chatbot_off')
  ) {
    return null;
  }

  const contextKey = isSurveyActive
    ? `${assignment?.assignment_id ?? ''}:${scenarioState?.scenario_run_id ?? ''}`
    : 'storefront';

  return (
    <AdvisorChatDrawerInner
      key={contextKey}
      isSurveyActive={isSurveyActive}
      assignmentId={assignment?.assignment_id}
      visitorId={visitorId}
      currentRunId={scenarioState?.scenario_run_id ?? undefined}
      track={track}
    />
  );
}
