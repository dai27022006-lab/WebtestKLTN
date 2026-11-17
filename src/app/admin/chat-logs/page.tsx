'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
} from '@/components/icons/DreamIcons';
import {
  formatDateTimeVi,
  formatVnd,
  PRODUCT_TYPE_LABELS,
} from '@/components/shared/formatters';
import { adminExportDatasetJson, adminListChatLogs } from '@/services';
import type { AdminChatLogItemDto, AdminExportRagLogRow } from '@/types/api';

type ModelSourceFilter = 'all' | 'gemini' | 'stub';
type SuggestionFilter = 'all' | 'with_suggestions' | 'no_suggestions';

interface RagLookupMeta {
  prompt_version: string;
  retrieved_product_ids: string[];
}

function classifyModelSource(
  modelName: string | null | undefined
): 'gemini' | 'stub' {
  if (!modelName) return 'stub';
  return modelName.toLowerCase().includes('gemini') ? 'gemini' : 'stub';
}

function parseJsonStringArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === 'string')
      : [];
  } catch {
    return [];
  }
}

export default function AdminChatLogsPage() {
  const [sessions, setSessions] = useState<AdminChatLogItemDto[]>([]);
  const [ragLookup, setRagLookup] = useState<Record<string, RagLookupMeta>>({});
  const [includeSimulated, setIncludeSimulated] = useState(false);
  const [modelFilter, setModelFilter] = useState<ModelSourceFilter>('all');
  const [suggestionFilter, setSuggestionFilter] =
    useState<SuggestionFilter>('all');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadChatLogs = useCallback(
    async (simFlag: boolean, signal?: AbortSignal) => {
      setIsLoading(true);
      setErrorMessage(null);

      const [logsRes, ragExportRes] = await Promise.all([
        adminListChatLogs({ include_simulated: simFlag, limit: 40 }, signal),
        adminExportDatasetJson(
          { dataset: 'rag_logs', include_simulated: simFlag },
          signal
        ),
      ]);

      if (signal?.aborted) return;
      setIsLoading(false);

      if (!logsRes.ok) {
        setErrorMessage(logsRes.error.message);
        return;
      }

      setSessions(logsRes.data);
      setSelectedSessionId((prev) =>
        prev && logsRes.data.some((s) => s.session_id === prev)
          ? prev
          : logsRes.data[0]?.session_id ?? null
      );

      if (ragExportRes.ok) {
        const lookup: Record<string, RagLookupMeta> = {};
        for (const row of ragExportRes.data.rows as AdminExportRagLogRow[]) {
          lookup[row.message_id] = {
            prompt_version: row.prompt_version,
            retrieved_product_ids: parseJsonStringArray(
              row.retrieved_product_ids
            ),
          };
        }
        setRagLookup(lookup);
      } else {
        setRagLookup({});
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void loadChatLogs(includeSimulated, controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [includeSimulated, loadChatLogs]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const assistantMsgs = session.messages.filter(
        (m) => m.role === 'assistant'
      );

      if (modelFilter !== 'all') {
        const hasMatchModel = assistantMsgs.some(
          (m) => classifyModelSource(m.model_name) === modelFilter
        );
        if (!hasMatchModel) return false;
      }

      if (suggestionFilter === 'with_suggestions') {
        const hasSuggestions = assistantMsgs.some(
          (m) => m.suggested_products.length > 0
        );
        if (!hasSuggestions) return false;
      } else if (suggestionFilter === 'no_suggestions') {
        const allNoSuggestions = assistantMsgs.every(
          (m) => m.suggested_products.length === 0
        );
        if (!allNoSuggestions) return false;
      }

      return true;
    });
  }, [sessions, modelFilter, suggestionFilter]);

  const activeSession = useMemo(() => {
    if (filteredSessions.length === 0) return null;
    return (
      filteredSessions.find((s) => s.session_id === selectedSessionId) ??
      filteredSessions[0]
    );
  }, [filteredSessions, selectedSessionId]);

  const activeSessionTotals = useMemo(() => {
    if (!activeSession) {
      return { tokens: 0, cost: 0, assistantCount: 0 };
    }
    return activeSession.messages.reduce(
      (acc, msg) => {
        if (msg.role === 'assistant') {
          acc.assistantCount += 1;
          acc.tokens += msg.tokens_used ?? 0;
          acc.cost += msg.cost_usd ?? 0;
        }
        return acc;
      },
      { tokens: 0, cost: 0, assistantCount: 0 }
    );
  }, [activeSession]);

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Header */}
      <div
        className="surface-card dg-panel"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'grid', gap: '4px' }}>
          <span className="type-eyebrow">
            Nhật ký Trợ lý AI &amp; Kiểm định Grounding DB
          </span>
          <h1 className="type-h2" style={{ margin: 0 }}>
            Log Hội thoại RAG ({filteredSessions.length} phiên)
          </h1>
          <p className="type-body-sm" style={{ margin: 0 }}>
            Theo dõi <code className="type-mono">model_name</code> (Gemini LLM
            hay Stub/Fallback), độ trễ, chi phí USD, ID sản phẩm truy xuất và
            ID gợi ý đối chiếu DB (0 PII).
          </p>
        </div>

        <button
          type="button"
          className="btn btn--secondary btn--sm"
          disabled={isLoading}
          onClick={() => void loadChatLogs(includeSimulated)}
        >
          <RefreshCw size={14} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div
        className="surface-card dg-panel"
        style={{ display: 'grid', gap: '12px' }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <div className="chip-row" role="group" aria-label="Lọc theo nguồn model">
              {[
                { value: 'all', label: 'Tất cả model' },
                { value: 'gemini', label: 'Gemini LLM' },
                { value: 'stub', label: 'Stub/Fallback' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className="chip"
                  aria-pressed={modelFilter === item.value}
                  onClick={() =>
                    setModelFilter(item.value as ModelSourceFilter)
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>

            <select
              className="select"
              style={{ width: 'auto', minWidth: '200px' }}
              aria-label="Lọc theo kết quả gợi ý"
              value={suggestionFilter}
              onChange={(e) =>
                setSuggestionFilter(e.target.value as SuggestionFilter)
              }
            >
              <option value="all">Tất cả kết quả gợi ý</option>
              <option value="with_suggestions">Có gợi ý sản phẩm</option>
              <option value="no_suggestions">Không có gợi ý / Từ chối</option>
            </select>
          </div>

          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 600,
            }}
          >
            <input
              type="checkbox"
              checked={includeSimulated}
              onChange={(e) => setIncludeSimulated(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <span>Bao gồm phiên mô phỏng (is_simulated)</span>
          </label>
        </div>
      </div>

      {includeSimulated && (
        <div className="callout callout--warning" role="alert">
          <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={15} />
            <span>Đang gộp cả hội thoại mô phỏng (is_simulated = true)</span>
          </strong>
        </div>
      )}

      {errorMessage && (
        <div className="callout callout--danger" role="alert">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="skeleton-box" style={{ height: '360px' }} />
      ) : filteredSessions.length === 0 ? (
        <div className="surface-card dg-panel">
          <p className="type-body-sm" style={{ margin: 0 }}>
            Chưa có phiên hội thoại nào khớp bộ lọc hiện tại. Thử bật &ldquo;Bao
            gồm phiên mô phỏng&rdquo; hoặc trò chuyện với Trợ lý từ cửa hàng để
            sinh log mới.
          </p>
        </div>
      ) : (
        <div className="two-col-ops">
          {/* Master Session List */}
          <div
            className="surface-card dg-panel"
            style={{ display: 'grid', gap: '10px', alignContent: 'start' }}
          >
            <span className="type-eyebrow">
              Danh sách phiên ({filteredSessions.length})
            </span>
            <div style={{ display: 'grid', gap: '8px', maxHeight: '680px', overflowY: 'auto' }}>
              {filteredSessions.map((session) => {
                const isSelected = activeSession?.session_id === session.session_id;
                const firstUserMsg = session.messages.find(
                  (m) => m.role === 'user'
                );
                const lastAssistant = [...session.messages]
                  .reverse()
                  .find((m) => m.role === 'assistant');
                const source = classifyModelSource(lastAssistant?.model_name);

                return (
                  <button
                    key={session.session_id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedSessionId(session.session_id)}
                    style={{
                      textAlign: 'left',
                      display: 'grid',
                      gap: '6px',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${
                        isSelected ? 'var(--accent)' : 'var(--border-hairline)'
                      }`,
                      backgroundColor: isSelected
                        ? 'var(--accent-soft)'
                        : 'var(--bg-surface-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <strong className="type-mono" style={{ fontSize: '0.85rem' }}>
                        {session.participant_code}
                      </strong>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span
                          className={`badge ${
                            source === 'gemini' ? 'badge--success' : 'badge--info'
                          }`}
                        >
                          {source === 'gemini' ? 'Gemini LLM' : 'Stub/Fallback'}
                        </span>
                        {session.is_simulated && (
                          <span className="badge badge--warning">Mô phỏng</span>
                        )}
                      </div>
                    </div>

                    <div
                      className="type-body-sm"
                      style={{
                        color: 'var(--ink)',
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {firstUserMsg?.content ??
                        session.title ??
                        'Phiên tư vấn DreamTeam'}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <span className="type-caption type-mono">
                        {session.messages.length} tin nhắn
                      </span>
                      <span className="type-caption">
                        {formatDateTimeVi(session.created_at)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail Stream Panel */}
          {activeSession && (
            <div
              className="surface-card dg-panel"
              style={{ display: 'grid', gap: '16px', alignContent: 'start' }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--border-hairline)',
                }}
              >
                <div style={{ display: 'grid', gap: '4px' }}>
                  <span className="type-eyebrow">
                    Chi tiết phiên • {activeSession.participant_code}
                  </span>
                  <h2 className="type-h3" style={{ margin: 0 }}>
                    {activeSession.title ?? 'Luồng hội thoại Tư vấn AI'}
                  </h2>
                  <code className="type-caption type-mono">
                    session_id: {activeSession.session_id}
                  </code>
                </div>

                <div className="chip-row">
                  <span className="badge type-mono">
                    <Cpu size={12} />
                    <span>{activeSessionTotals.tokens} tokens</span>
                  </span>
                  <span className="badge badge--accent type-mono">
                    ${activeSessionTotals.cost.toFixed(6)} USD
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '14px' }}>
                {activeSession.messages.map((msg) => {
                  if (msg.role === 'user') {
                    return (
                      <div
                        key={msg.id}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-surface-subtle)',
                          border: '1px solid var(--border-hairline)',
                          display: 'grid',
                          gap: '6px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <span className="badge">
                            <MessageSquare size={12} />
                            <span>Người dùng hỏi</span>
                          </span>
                          <span className="type-caption">
                            {formatDateTimeVi(msg.created_at)}
                          </span>
                        </div>
                        <p className="type-body-sm" style={{ margin: 0, color: 'var(--ink)' }}>
                          {msg.content}
                        </p>
                      </div>
                    );
                  }

                  const source = classifyModelSource(msg.model_name);
                  const ragMeta = ragLookup[msg.id];
                  const retrievedIds = ragMeta?.retrieved_product_ids ?? [];

                  return (
                    <div
                      key={msg.id}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-strong)',
                        display: 'grid',
                        gap: '10px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                        }}
                      >
                        <div className="chip-row">
                          <span
                            className={`badge ${
                              source === 'gemini'
                                ? 'badge--success'
                                : 'badge--info'
                            }`}
                          >
                            {source === 'gemini' ? 'Gemini LLM' : 'Stub/Fallback'}
                          </span>
                          {msg.model_name && (
                            <code className="badge type-mono">
                              {msg.model_name}
                            </code>
                          )}
                          {ragMeta?.prompt_version && (
                            <code className="badge type-mono">
                              {ragMeta.prompt_version}
                            </code>
                          )}
                        </div>

                        <span className="type-caption type-mono">
                          {msg.latency_ms ?? 0}ms • {msg.tokens_used ?? 0} tok •
                          ${(msg.cost_usd ?? 0).toFixed(6)}
                        </span>
                      </div>

                      <p
                        className="type-body-sm"
                        style={{
                          margin: 0,
                          color: 'var(--ink)',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {msg.content}
                      </p>

                      {/* Grounding & Retrieved IDs */}
                      <div
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface-subtle)',
                          border: '1px solid var(--border-hairline)',
                          display: 'grid',
                          gap: '8px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                          }}
                        >
                          <span className="type-caption" style={{ fontWeight: 700 }}>
                            Kiểm định Grounding DB
                          </span>
                          {msg.suggested_products.length > 0 ? (
                            <span className="badge badge--success">
                              <ShieldCheck size={12} />
                              <span>
                                Đã đối chiếu DB ({msg.suggested_products.length}{' '}
                                gói)
                              </span>
                            </span>
                          ) : (
                            <span className="badge">
                              Không có sản phẩm gợi ý
                            </span>
                          )}
                        </div>

                        {retrievedIds.length > 0 && (
                          <div style={{ display: 'grid', gap: '4px' }}>
                            <span className="type-caption">
                              <code className="type-mono">
                                retrieved_product_ids
                              </code>{' '}
                              ({retrievedIds.length}):
                            </span>
                            <div className="chip-row">
                              {retrievedIds.map((pid) => (
                                <code key={pid} className="badge type-mono">
                                  {pid}
                                </code>
                              ))}
                            </div>
                          </div>
                        )}

                        {msg.suggested_products.length > 0 && (
                          <div style={{ display: 'grid', gap: '6px' }}>
                            <span className="type-caption">
                              <code className="type-mono">
                                suggested_products
                              </code>{' '}
                              đã khớp kho DB:
                            </span>
                            {msg.suggested_products.map((prod) => (
                              <div
                                key={prod.id}
                                style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '8px',
                                  padding: '8px 10px',
                                  borderRadius: 'var(--radius-xs)',
                                  backgroundColor: 'var(--bg-surface)',
                                  border: '1px solid var(--border-hairline)',
                                }}
                              >
                                <div style={{ display: 'grid', gap: '2px' }}>
                                  <strong style={{ fontSize: '0.84rem' }}>
                                    <CheckCircle2
                                      size={12}
                                      style={{
                                        color: 'var(--status-success)',
                                        display: 'inline',
                                        marginRight: '4px',
                                      }}
                                    />
                                    {prod.name}
                                  </strong>
                                  <span className="type-caption">
                                    {PRODUCT_TYPE_LABELS[prod.product_type]} •{' '}
                                    {prod.industry} •{' '}
                                    <strong className="type-mono">
                                      {formatVnd(prod.price_vnd)}
                                    </strong>
                                  </span>
                                  <code className="type-caption type-mono">
                                    id: {prod.id}
                                  </code>
                                </div>
                                <Link
                                  href={`/products/${prod.slug}`}
                                  className="btn btn--secondary btn--sm"
                                >
                                  <span>Mở gói</span>
                                  <ArrowUpRight size={13} />
                                </Link>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
