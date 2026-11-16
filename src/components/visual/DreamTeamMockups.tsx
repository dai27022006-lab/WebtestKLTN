'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type RefObject,
} from 'react';

import {
  BarChart3,
  CheckCircle2,
  Download,
  Layers,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Pause,
  Play,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Timer,
  Zap,
} from '@/components/icons/DreamIcons';
import { DreamTeamBrandMark } from '@/components/visual/DreamTeamBrandMark';
import { useHeroTilt } from '@/motion/useHeroTilt';
import type { ProductType } from '@/types/api';

type HeroPreviewMode = ProductType;

interface HeroKpiTile {
  label: string;
  value: string;
}

interface HeroPreviewTab {
  id: HeroPreviewMode;
  label: string;
  url: string;
  highlightTitle: string;
  highlightMeta: string;
  chartTitle: string;
  chartLinePath: string;
  chartAreaPath: string;
  chartDots: [{ cx: number; cy: number }, { cx: number; cy: number }];
  kpis: [HeroKpiTile, HeroKpiTile, HeroKpiTile, HeroKpiTile];
  ragCopy: string;
  ragTip: string;
}

const HERO_AUTO_TOUR_MS = 4200;

const HERO_PREVIEW_TABS: HeroPreviewTab[] = [
  {
    id: 'template',
    label: 'Template Web',
    url: 'dreamteam.vn/store-advisor',
    highlightTitle: 'Landing Page Mỹ Phẩm TikTok Shop',
    highlightMeta: '375px Mobile First • Cài đặt ~30 phút',
    chartTitle: 'Tăng trưởng chuyển đổi mobile',
    chartLinePath:
      'M4 58 C 36 52, 54 42, 82 40 C 110 38, 128 24, 158 20 C 180 17, 198 11, 216 8',
    chartAreaPath:
      'M4 58 C 36 52, 54 42, 82 40 C 110 38, 128 24, 158 20 C 180 17, 198 11, 216 8 L 216 68 L 4 68 Z',
    chartDots: [
      { cx: 82, cy: 40 },
      { cx: 158, cy: 20 },
    ],
    kpis: [
      { label: 'Danh mục', value: '6 mẫu' },
      { label: 'Cài đặt', value: '~30 phút' },
      { label: 'Tối ưu', value: '375px' },
      { label: 'Mức giá', value: '450k–650k' },
    ],
    ragCopy: 'Khớp ngân sách & kênh TikTok Shop / Shopee.',
    ragTip: 'Grounding DB: #2c5a98b1 • 490.000đ',
  },
  {
    id: 'prompt_pack',
    label: 'Prompt Pack',
    url: 'dreamteam.vn/prompts-chot-don',
    highlightTitle: '60 Prompt Kịch Bản & Mô Tả Chuẩn Sàn',
    highlightMeta: 'Tránh từ cấm • Notion + PDF tải ngay',
    chartTitle: 'Tăng tốc lên nội dung sàn TMĐT',
    chartLinePath:
      'M4 60 C 26 54, 42 34, 68 28 C 96 22, 114 19, 142 16 C 168 13, 192 10, 216 8',
    chartAreaPath:
      'M4 60 C 26 54, 42 34, 68 28 C 96 22, 114 19, 142 16 C 168 13, 192 10, 216 8 L 216 68 L 4 68 Z',
    chartDots: [
      { cx: 68, cy: 28 },
      { cx: 142, cy: 16 },
    ],
    kpis: [
      { label: 'Danh mục', value: '4 bộ' },
      { label: 'Lên bài', value: '~15 phút' },
      { label: 'Thư viện', value: '60+ câu' },
      { label: 'Mức giá', value: '250k–350k' },
    ],
    ragCopy: 'Soạn mô tả & kịch bản live đúng chuẩn sàn.',
    ragTip: 'Grounding DB: #7a9c11d2 • 290.000đ',
  },
  {
    id: 'workflow',
    label: 'Workflow',
    url: 'dreamteam.vn/workflow-dong-bo',
    highlightTitle: 'Đồng Bộ Đơn Hàng Về Sheets & Zalo',
    highlightMeta: 'Nhập JSON 1 chạm • Cảnh báo tồn kho',
    chartTitle: 'Tự động hóa đơn đa kênh',
    chartLinePath:
      'M4 54 C 34 52, 62 49, 92 46 C 120 43, 130 33, 152 26 C 174 19, 194 12, 216 8',
    chartAreaPath:
      'M4 54 C 34 52, 62 49, 92 46 C 120 43, 130 33, 152 26 C 174 19, 194 12, 216 8 L 216 68 L 4 68 Z',
    chartDots: [
      { cx: 92, cy: 46 },
      { cx: 152, cy: 26 },
    ],
    kpis: [
      { label: 'Danh mục', value: '2 luồng' },
      { label: 'Nền tảng', value: 'n8n / Make' },
      { label: 'Kết nối', value: 'Sheets+Zalo' },
      { label: 'Mức giá', value: '640k–690k' },
    ],
    ragCopy: 'Gom đơn Shopee, TikTok, FB tránh sót đơn.',
    ragTip: 'Grounding DB: #6a9e55b6 • 690.000đ',
  },
];

export function HeroVisualStack({
  activeType,
  onSelectType,
  interactionRef,
}: {
  activeType?: ProductType;
  onSelectType?: (type: ProductType) => void;
  interactionRef?: RefObject<HTMLElement | null>;
}) {
  const [internalMode, setInternalMode] = useState<HeroPreviewMode>('template');
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [hasUserSelectedTab, setHasUserSelectedTab] = useState(false);
  const [hasUserForcedMotion, setHasUserForcedMotion] = useState(false);
  const [isPointerOrFocusInside, setIsPointerOrFocusInside] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);
  const [isHeroInViewport, setIsHeroInViewport] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const areaGradId = useId();
  const onSelectTypeRef = useRef(onSelectType);
  useEffect(() => {
    onSelectTypeRef.current = onSelectType;
  }, [onSelectType]);

  const currentMode = activeType ?? internalMode;
  const setMode = (next: HeroPreviewMode) => {
    setInternalMode(next);
    onSelectTypeRef.current?.(next);
  };

  const { containerRef, targetRef } = useHeroTilt<
    HTMLDivElement,
    HTMLDivElement
  >({
    interactionRef,
    forceMotion: hasUserForcedMotion,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPref = () => setPrefersReducedMotion(mq.matches);
    const timer = setTimeout(syncMotionPref, 0);
    mq.addEventListener('change', syncMotionPref);
    return () => {
      clearTimeout(timer);
      mq.removeEventListener('change', syncMotionPref);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const syncVisibility = () => {
      setIsDocumentHidden(document.visibilityState === 'hidden');
    };
    const timer = setTimeout(syncVisibility, 0);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, []);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }
    const observedEl =
      interactionRef?.current ??
      document.getElementById('hero') ??
      containerRef.current;
    if (!observedEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsHeroInViewport(entry.isIntersecting);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(observedEl);
    return () => observer.disconnect();
  }, [interactionRef, containerRef]);

  const isMotionAllowed = !prefersReducedMotion || hasUserForcedMotion;
  const isDemoStopped =
    isUserPaused || hasUserSelectedTab || !isMotionAllowed;
  const isMotionActive =
    prefersReducedMotion && hasUserForcedMotion && !isUserPaused;
  const canRunAutoTour =
    !isDemoStopped &&
    !isDocumentHidden &&
    !isPointerOrFocusInside &&
    isHeroInViewport;

  useEffect(() => {
    if (!canRunAutoTour) return;
    const timer = setTimeout(() => {
      const idx = HERO_PREVIEW_TABS.findIndex((item) => item.id === currentMode);
      const nextTab =
        HERO_PREVIEW_TABS[(idx + 1) % HERO_PREVIEW_TABS.length] ??
        HERO_PREVIEW_TABS[0];
      setInternalMode(nextTab.id);
      onSelectTypeRef.current?.(nextTab.id);
    }, HERO_AUTO_TOUR_MS);
    return () => clearTimeout(timer);
  }, [canRunAutoTour, currentMode]);

  const handleSelectSidebarTab = (next: HeroPreviewMode) => {
    setHasUserSelectedTab(true);
    setMode(next);
  };

  const handleToggleDemo = () => {
    if (isDemoStopped) {
      if (prefersReducedMotion) {
        setHasUserForcedMotion(true);
      }
      setIsUserPaused(false);
      setHasUserSelectedTab(false);
    } else {
      setHasUserForcedMotion(false);
      setIsUserPaused(true);
    }
  };

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsPointerOrFocusInside(false);
    }
  };

  const activeTab =
    HERO_PREVIEW_TABS.find((item) => item.id === currentMode) ??
    HERO_PREVIEW_TABS[0];

  const heroVisualClassName = [
    'dg-hero-visual',
    isMotionActive ? 'is-motion-active' : '',
    isUserPaused ? 'is-motion-paused' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={containerRef}
      className={heroVisualClassName}
      onMouseEnter={() => setIsPointerOrFocusInside(true)}
      onMouseLeave={() => setIsPointerOrFocusInside(false)}
      onFocus={() => setIsPointerOrFocusInside(true)}
      onBlur={handleBlur}
    >
      <div className="dg-hero-visual-glow glow-1" aria-hidden="true" />
      <div className="dg-hero-visual-glow glow-2" aria-hidden="true" />

      <div ref={targetRef} className="dg-hero-stack">
        {/* Back Card 2 (-6deg) */}
        <div
          className="dg-hero-stack-card back-2"
          data-surface="light"
          aria-hidden="true"
        >
          <div className="dg-browser-frame-bar">
            <div className="dg-mac-dots">
              <span className="red" />
              <span className="yellow" />
              <span className="green" />
            </div>
            <div className="dg-browser-url">dreamteam.vn/experiment</div>
          </div>
          <div className="dg-mini-back-body">
            <div className="dg-mini-back-pill">Thí nghiệm AB/BA • F11</div>
            <div className="dg-mini-back-bars">
              <span style={{ width: '82%' }} />
              <span style={{ width: '64%' }} />
              <span style={{ width: '90%' }} />
            </div>
          </div>
        </div>

        {/* Back Card 1 (+4deg) */}
        <div
          className="dg-hero-stack-card back-1"
          data-surface="light"
          aria-hidden="true"
        >
          <div className="dg-browser-frame-bar">
            <div className="dg-mac-dots">
              <span className="red" />
              <span className="yellow" />
              <span className="green" />
            </div>
            <div className="dg-browser-url">dreamteam.vn/admin/analytics</div>
          </div>
          <div className="dg-mini-back-body">
            <div className="dg-mini-back-pill">Đo lường 14 Events • F10</div>
            <div className="dg-mini-back-kpis">
              <div />
              <div />
              <div />
            </div>
          </div>
        </div>

        {/* Front Main Browser Mockup Frame */}
        <div className="dg-hero-mockup-frame" data-surface="light">
          <div className="dg-browser-frame-bar">
            <div className="dg-mac-dots">
              <span className="red" />
              <span className="yellow" />
              <span className="green" />
            </div>
            <div className="dg-browser-url">
              <Lock size={11} />
              <span>{activeTab.url}</span>
            </div>
            <div className="dg-browser-bar-actions">
              <button
                type="button"
                className="dg-hero-pause-btn"
                onClick={handleToggleDemo}
                aria-label={
                  isDemoStopped
                    ? 'Chạy demo xem nhanh giải pháp'
                    : 'Tạm dừng demo xem nhanh giải pháp'
                }
              >
                {isDemoStopped ? <Play size={11} /> : <Pause size={11} />}
                <span className="dg-hero-pause-label">
                  {isDemoStopped ? 'Chạy demo' : 'Tạm dừng'}
                </span>
              </button>
              <span className="dg-hero-live-pill">
                <span className="dg-dot" />
                LIVE
              </span>
            </div>
          </div>

          {/* Crisp DreamTeam Mini-App Interface */}
          <div className="dg-dt-app-shell">
            {/* Dark Emerald Sidebar */}
            <aside className="dg-dt-sidebar" aria-label="Xem nhanh danh mục">
              <div className="dg-dt-sidebar-brand">
                <DreamTeamBrandMark size={20} inverted />
                <span>DreamTeam</span>
              </div>

              <div
                className="dg-dt-sidebar-nav"
                role="tablist"
                aria-label="Chuyển xem nhanh giải pháp"
              >
                {HERO_PREVIEW_TABS.map((item) => {
                  const selected = item.id === currentMode;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      className={`dg-dt-sidebar-item ${selected ? 'is-active' : ''}`}
                      onClick={() => handleSelectSidebarTab(item.id)}
                    >
                      {item.id === 'template' && <LayoutDashboard size={13} />}
                      {item.id === 'prompt_pack' && <Sparkles size={13} />}
                      {item.id === 'workflow' && <Zap size={13} />}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="dg-dt-sidebar-foot">
                <div className="dg-dt-sidebar-chip">
                  <MessageSquare size={12} />
                  <span>Trợ lý RAG F7</span>
                </div>
                <div className="dg-dt-sidebar-chip">
                  <Timer size={12} />
                  <span>Đo A/B F11</span>
                </div>
              </div>
            </aside>

            {/* Main Light Workspace */}
            <div className="dg-dt-workspace">
              <div key={activeTab.id} className="dg-dt-ws-body">
                <div className="dg-dt-ws-head">
                  <div>
                    <span className="dg-dt-ws-eyebrow">
                      Cửa hàng số chủ shop 1–3 người
                    </span>
                    <strong>{activeTab.highlightTitle}</strong>
                  </div>
                  <span className="dg-dt-ws-badge">
                    <ShieldCheck size={12} />
                    <span>100% DB</span>
                  </span>
                </div>

                {/* 4 Mini KPI Tiles */}
                <div className="dg-dt-kpi-strip">
                  {activeTab.kpis.map((kpi) => (
                    <div key={kpi.label} className="dg-dt-kpi-box">
                      <span>{kpi.label}</span>
                      <strong>{kpi.value}</strong>
                    </div>
                  ))}
                </div>

                {/* Dynamic Preview + SVG Growth Line Chart */}
                <div className="dg-dt-ws-grid">
                  <div className="dg-dt-chart-card">
                    <div className="dg-dt-chart-head">
                      <span>{activeTab.chartTitle}</span>
                      <span className="dg-dt-chart-tag">
                        {activeTab.highlightMeta}
                      </span>
                    </div>
                    <svg
                      viewBox="0 0 220 72"
                      className="dg-dt-chart-svg"
                      role="img"
                      aria-label={`Biểu đồ ${activeTab.chartTitle} cho nhóm ${activeTab.label}`}
                    >
                      <defs>
                        <linearGradient id={areaGradId} x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#187f65" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#187f65" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      <path
                        d={activeTab.chartAreaPath}
                        fill={`url(#${areaGradId})`}
                        className="dg-dt-chart-area"
                      />
                      <path
                        d={activeTab.chartLinePath}
                        fill="none"
                        stroke="#187f65"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        pathLength={100}
                        className="dg-dt-chart-line"
                      />
                      <circle
                        cx={activeTab.chartDots[0].cx}
                        cy={activeTab.chartDots[0].cy}
                        r="3"
                        fill="#48b594"
                      />
                      <circle
                        cx={activeTab.chartDots[1].cx}
                        cy={activeTab.chartDots[1].cy}
                        r="3"
                        fill="#187f65"
                      />
                      <circle
                        cx="216"
                        cy="8"
                        r="3.5"
                        fill="none"
                        stroke="#e8830f"
                        strokeWidth="1.5"
                        className="dg-chart-peak-ring"
                      />
                      <circle cx="216" cy="8" r="3.5" fill="#e8830f" />
                    </svg>
                  </div>

                  <div className="dg-dt-rag-card">
                    <div className="dg-dt-rag-head">
                      <Sparkles size={13} />
                      <span>Gợi ý Trợ lý RAG</span>
                    </div>
                    <p className="dg-dt-rag-copy">{activeTab.ragCopy}</p>
                    <div className="dg-dt-rag-pill">{activeTab.ragTip}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export type InnerScreenKey =
  | 'catalog'
  | 'detail'
  | 'experiment'
  | 'checkout'
  | 'orders'
  | 'analytics';

export function InnerPageVisual({ screen }: { screen: InnerScreenKey }) {
  return (
    <div className="dg-inner-mock" aria-hidden="true">
      <div className="dg-inner-mock-bar">
        <div className="dg-mac-dots">
          <span className="red" />
          <span className="yellow" />
          <span className="green" />
        </div>
        <span className="dg-inner-mock-route">
          {screen === 'catalog' && '/products'}
          {screen === 'detail' && '/products/[slug]'}
          {screen === 'experiment' && '/experiment'}
          {screen === 'checkout' && '/cart • /checkout'}
          {screen === 'orders' && '/orders/[id]'}
          {screen === 'analytics' && '/admin/analytics • /auth'}
        </span>
      </div>

      <div className="dg-inner-mock-stage">
        {screen === 'catalog' && (
          <div className="dg-mock-layout">
            <div className="dg-mock-pills">
              <span className="is-active">Tất cả</span>
              <span>Template</span>
              <span>Prompt</span>
              <span>Workflow</span>
            </div>
            <div className="dg-mock-cards-3">
              <div className="dg-mock-card">
                <i className="dg-mock-thumb is-emerald" />
                <span className="dg-mock-line w-80" />
                <span className="dg-mock-line w-55" />
              </div>
              <div className="dg-mock-card">
                <i className="dg-mock-thumb is-copper" />
                <span className="dg-mock-line w-75" />
                <span className="dg-mock-line w-50" />
              </div>
              <div className="dg-mock-card">
                <i className="dg-mock-thumb is-mint" />
                <span className="dg-mock-line w-85" />
                <span className="dg-mock-line w-60" />
              </div>
            </div>
          </div>
        )}

        {screen === 'detail' && (
          <div className="dg-mock-split">
            <div className="dg-mock-preview-box">
              <div className="dg-mock-toggle-row">
                <span className="is-active">1280px</span>
                <span>375px</span>
              </div>
              <div className="dg-mock-wire-hero" />
              <div className="dg-mock-wire-rows">
                <span />
                <span />
              </div>
            </div>
            <div className="dg-mock-dock">
              <span className="dg-mock-badge-sm">original</span>
              <span className="dg-mock-price-line">490.000đ</span>
              <span className="dg-mock-cta-bar" />
            </div>
          </div>
        )}

        {screen === 'experiment' && (
          <div className="dg-mock-layout">
            <div className="dg-mock-ab-banner">
              <span>AB/BA • P-018</span>
              <span>02:14</span>
            </div>
            <div className="dg-mock-card" style={{ padding: '10px' }}>
              <span className="dg-mock-line w-85" />
              <span className="dg-mock-line w-70" />
            </div>
            <div className="dg-mock-likert">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span className="is-active">4</span>
              <span>5</span>
            </div>
          </div>
        )}

        {screen === 'checkout' && (
          <div className="dg-mock-layout">
            <div className="dg-mock-steps">
              <span className="is-done">1. Giỏ</span>
              <span className="is-active">2. Sandbox</span>
              <span>3. File</span>
            </div>
            <div className="dg-mock-split">
              <div className="dg-mock-card" style={{ padding: '10px' }}>
                <span className="dg-mock-line w-80" />
                <span className="dg-mock-line w-55" />
              </div>
              <div className="dg-mock-dock">
                <span className="dg-mock-badge-sm">Paid</span>
                <span className="dg-mock-cta-bar" />
              </div>
            </div>
          </div>
        )}

        {screen === 'orders' && (
          <div className="dg-mock-layout">
            <div className="dg-mock-ab-banner">
              <span>ORD-202611-001</span>
              <span className="is-paid">PAID</span>
            </div>
            <div className="dg-mock-grant-row">
              <Download size={14} />
              <span className="dg-mock-line w-70" />
              <span className="dg-mock-badge-sm">5/5 lượt</span>
            </div>
            <div className="dg-mock-grant-row">
              <ShieldCheck size={14} />
              <span className="dg-mock-line w-60" />
              <span className="dg-mock-badge-sm">7 ngày</span>
            </div>
          </div>
        )}

        {screen === 'analytics' && (
          <div className="dg-mock-layout">
            <div className="dg-mock-kpis-4">
              <div />
              <div />
              <div />
              <div />
            </div>
            <div className="dg-mock-table-rows">
              <span>
                <BarChart3 size={12} /> chatbot_on vs chatbot_off
              </span>
              <span className="dg-mock-line w-85" />
              <span className="dg-mock-line w-75" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CtaPreviewMockup() {
  return (
    <div className="dg-cta-dark-visual-wrap">
      <div className="dg-cta-dark-visual" data-surface="light">
        <div className="dg-browser-frame-bar">
          <div className="dg-mac-dots">
            <span className="red" />
            <span className="yellow" />
            <span className="green" />
          </div>
          <div className="dg-browser-url">dreamteam.vn/experiment</div>
          <span className="dg-hero-live-pill">
            <span className="dg-dot" />
            F11
          </span>
        </div>

        <div className="dg-cta-mock-body">
          <div className="dg-cta-mock-row">
            <span className="dg-cta-mock-tag">SC-01 • Mỹ phẩm</span>
            <span className="dg-cta-mock-timer">01:48</span>
          </div>
          <p className="dg-cta-mock-title">
            So sánh tốc độ &amp; độ tự tin khi chọn gói có Trợ lý RAG
          </p>
          <div className="dg-cta-mock-likert">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={n === 5 ? 'is-active' : undefined}>
                {n}
              </span>
            ))}
          </div>
          <div className="dg-cta-mock-footer">
            <span>
              <CheckCircle2 size={13} /> Đo Likert 1–5
            </span>
            <span>
              <ShoppingBag size={13} /> Ý định Sandbox
            </span>
          </div>
        </div>
      </div>

      <div className="dg-cta-dark-chip chip-a">
        <Layers size={14} />
        <span>Within-subject AB/BA • Miễn tạo tài khoản</span>
      </div>
    </div>
  );
}
