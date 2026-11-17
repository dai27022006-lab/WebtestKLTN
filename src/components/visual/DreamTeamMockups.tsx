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
  Smartphone,
  Sparkles,
  User,
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
  advisorCopy: string;
  advisorTip: string;
}

const HERO_AUTO_TOUR_MS = 4200;

const HERO_PREVIEW_TABS: HeroPreviewTab[] = [
  {
    id: 'template',
    label: 'Giao diện Web',
    url: 'dreamteam.vn/products/template',
    highlightTitle: 'Landing Page Mỹ Phẩm TikTok Shop',
    highlightMeta: 'Chuẩn Mobile 375px • Cài đặt ~30 phút',
    chartTitle: 'Tỷ lệ bấm mua trên di động',
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
    advisorCopy: 'Phù hợp ngân sách & kênh bán TikTok Shop, Shopee.',
    advisorTip: 'Gợi ý nổi bật • 490.000đ',
  },
  {
    id: 'prompt_pack',
    label: 'Bộ Prompt AI',
    url: 'dreamteam.vn/products/prompt-pack',
    highlightTitle: '60 Prompt Kịch Bản & Mô Tả Chuẩn Sàn',
    highlightMeta: 'Tránh từ cấm • Notion + PDF tải ngay',
    chartTitle: 'Tốc độ lên bài bán hàng mỗi ngày',
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
    advisorCopy: 'Soạn mô tả & kịch bản live đúng quy chuẩn sàn TMĐT.',
    advisorTip: 'Gợi ý nổi bật • 290.000đ',
  },
  {
    id: 'workflow',
    label: 'Luồng Tự Động',
    url: 'dreamteam.vn/products/workflow',
    highlightTitle: 'Đồng Bộ Đơn Hàng Về Sheets & Zalo',
    highlightMeta: 'Nhập JSON 1 chạm • Cảnh báo tồn kho',
    chartTitle: 'Hiệu suất xử lý đơn đa kênh',
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
    advisorCopy: 'Gom đơn Shopee, TikTok, Facebook tránh sót đơn giờ cao điểm.',
    advisorTip: 'Gợi ý nổi bật • 690.000đ',
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
            <div className="dg-browser-url">dreamteam.vn/products/xem-thu</div>
          </div>
          <div className="dg-mini-back-body">
            <div className="dg-mini-back-pill">Xem thử 375px • Live</div>
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
            <div className="dg-browser-url">dreamteam.vn/tro-ly-tu-van</div>
          </div>
          <div className="dg-mini-back-body">
            <div className="dg-mini-back-pill">
              Phù hợp ngân sách &amp; kênh bán
            </div>
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

          <div className="dg-dt-app-shell">
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
                  <span>Trợ lý tư vấn</span>
                </div>
                <div className="dg-dt-sidebar-chip">
                  <Smartphone size={12} />
                  <span>Xem thử 375px</span>
                </div>
              </div>
            </aside>

            <div className="dg-dt-workspace">
              <div key={activeTab.id} className="dg-dt-ws-body">
                <div className="dg-dt-ws-head">
                  <div>
                    <span className="dg-dt-ws-eyebrow">
                      Giải pháp cho shop 1–3 người
                    </span>
                    <strong>{activeTab.highlightTitle}</strong>
                  </div>
                  <span className="dg-dt-ws-badge">
                    <ShieldCheck size={12} />
                    <span>Bản quyền rõ</span>
                  </span>
                </div>

                <div className="dg-dt-kpi-strip">
                  {activeTab.kpis.map((kpi) => (
                    <div key={kpi.label} className="dg-dt-kpi-box">
                      <span>{kpi.label}</span>
                      <strong>{kpi.value}</strong>
                    </div>
                  ))}
                </div>

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
                    <div className="dg-hero-workspace-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/hero-workspace.webp"
                        alt="Góc bàn làm việc gọn gàng của chủ shop kinh doanh trực tuyến theo tông màu xanh ngọc và xám slate"
                        width={1280}
                        height={720}
                        fetchPriority="high"
                        className="dg-hero-workspace-img"
                      />
                      <div className="dg-hero-workspace-caption">
                        <span>Bối cảnh shop nhỏ</span>
                        <span>1–3 người</span>
                      </div>
                    </div>
                    <div className="dg-dt-rag-head">
                      <Sparkles size={13} />
                      <span>Phù hợp ngân sách &amp; kênh bán</span>
                    </div>
                    <p className="dg-dt-rag-copy">{activeTab.advisorCopy}</p>
                    <div className="dg-dt-rag-pill">{activeTab.advisorTip}</div>
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
  | 'cart'
  | 'checkout'
  | 'orders'
  | 'auth';

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
          {screen === 'cart' && '/cart'}
          {screen === 'checkout' && '/checkout'}
          {screen === 'orders' && '/orders/[id]'}
          {screen === 'auth' && '/auth'}
        </span>
      </div>

      <div className="dg-inner-mock-stage">
        {screen === 'catalog' && (
          <div className="dg-mock-layout">
            <div className="dg-mock-pills">
              <span className="is-active">Tất cả</span>
              <span>Giao diện Web</span>
              <span>Prompt AI</span>
              <span>Luồng Tự Động</span>
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
              <span className="dg-mock-badge-sm">Thiết kế gốc</span>
              <span className="dg-mock-price-line">490.000đ</span>
              <span className="dg-mock-cta-bar" />
            </div>
          </div>
        )}

        {screen === 'cart' && (
          <div className="dg-mock-layout">
            <div className="dg-mock-ab-banner">
              <span>2 gói đã chọn</span>
              <span>780.000đ</span>
            </div>
            <div className="dg-mock-grant-row">
              <ShoppingBag size={14} />
              <span className="dg-mock-line w-70" />
              <span className="dg-mock-badge-sm">490.000đ</span>
            </div>
            <div className="dg-mock-grant-row">
              <Sparkles size={14} />
              <span className="dg-mock-line w-60" />
              <span className="dg-mock-badge-sm">290.000đ</span>
            </div>
          </div>
        )}

        {screen === 'checkout' && (
          <div className="dg-mock-layout">
            <div className="dg-mock-steps">
              <span className="is-done">1. Giỏ hàng</span>
              <span className="is-active">2. Xác nhận</span>
              <span>3. Nhận file</span>
            </div>
            <div className="dg-mock-split">
              <div className="dg-mock-card" style={{ padding: '10px' }}>
                <span className="dg-mock-line w-80" />
                <span className="dg-mock-line w-55" />
              </div>
              <div className="dg-mock-dock">
                <span className="dg-mock-badge-sm">Thử nghiệm</span>
                <span className="dg-mock-cta-bar" />
              </div>
            </div>
          </div>
        )}

        {screen === 'orders' && (
          <div className="dg-mock-layout">
            <div className="dg-mock-ab-banner">
              <span>DT-202611-001</span>
              <span className="is-paid">Hoàn tất</span>
            </div>
            <div className="dg-mock-grant-row">
              <Download size={14} />
              <span className="dg-mock-line w-70" />
              <span className="dg-mock-badge-sm">5 lượt tải</span>
            </div>
            <div className="dg-mock-grant-row">
              <ShieldCheck size={14} />
              <span className="dg-mock-line w-60" />
              <span className="dg-mock-badge-sm">Hạn 7 ngày</span>
            </div>
          </div>
        )}

        {screen === 'auth' && (
          <div className="dg-mock-layout">
            <div className="dg-mock-ab-banner">
              <span>Tài khoản chủ shop</span>
              <span>Đồng bộ đơn</span>
            </div>
            <div className="dg-mock-grant-row">
              <User size={14} />
              <span className="dg-mock-line w-75" />
              <span className="dg-mock-badge-sm">Đơn đã mua</span>
            </div>
            <div className="dg-mock-grant-row">
              <Lock size={14} />
              <span className="dg-mock-line w-60" />
              <span className="dg-mock-badge-sm">Bảo mật</span>
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
          <div className="dg-browser-url">dreamteam.vn/products/my-pham</div>
          <span className="dg-hero-live-pill">
            <span className="dg-dot" />
            375px
          </span>
        </div>

        <div className="dg-cta-mock-body">
          <div className="dg-cta-mock-row">
            <span className="dg-cta-mock-tag">Mỹ phẩm • TikTok Shop</span>
            <span className="dg-cta-mock-timer">~30 phút</span>
          </div>
          <p className="dg-cta-mock-title">
            Xem thử trực tiếp trên Desktop 1280px &amp; Mobile 375px trước khi tải
          </p>
          <div className="dg-mock-toggle-row">
            <span className="is-active">Desktop 1280px</span>
            <span>Mobile 375px</span>
            <span>Bản quyền rõ</span>
          </div>
          <div className="dg-cta-mock-footer">
            <span>
              <CheckCircle2 size={13} /> Xem thử 375px
            </span>
            <span>
              <ShoppingBag size={13} /> Nhận file tức thì
            </span>
          </div>
        </div>
      </div>

      <div className="dg-cta-dark-chip chip-a">
        <Layers size={14} />
        <span>Xem thử 375px • Nhận file tức thì</span>
      </div>
    </div>
  );
}
