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
import { useLocale } from '@/components/providers/LocaleProvider';
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

  const { locale, home, chrome, formatPrice } = useLocale();
  const mt = home.heroMockupTabs;
  const activeTabMeta = mt[currentMode];
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

  const backPill1 =
    locale === 'en'
      ? '375px Live Preview'
      : locale === 'ru'
        ? 'Предпросмотр 375px • Live'
        : locale === 'zh'
          ? '375px 实时预览'
          : 'Xem thử 375px • Live';
  const backPill2 =
    locale === 'en'
      ? 'Budget & Channel Match'
      : locale === 'ru'
        ? 'Подбор под бюджет и канал'
        : locale === 'zh'
          ? '按预算与渠道智能筛选'
          : 'Phù hợp ngân sách & kênh bán';
  const shopContextTitle =
    locale === 'en'
      ? 'Solutions for 1–3 person shops'
      : locale === 'ru'
        ? 'Решения для команд 1–3 чел.'
        : locale === 'zh'
          ? '1–3 人小店专属数字方案'
          : 'Giải pháp cho shop 1–3 người';
  const workspaceMiniLabel =
    locale === 'en'
      ? 'Small shop setup'
      : locale === 'ru'
        ? 'Малый магазин'
        : locale === 'zh'
          ? '微型电商'
          : 'Bối cảnh shop nhỏ';
  const teamMiniLabel =
    locale === 'en'
      ? '1–3 staff'
      : locale === 'ru'
        ? '1–3 чел.'
        : locale === 'zh'
          ? '1–3人团队'
          : '1–3 người';
  const previewPrice = formatPrice(490000);

  void previewPrice;

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
            <div className="dg-browser-url">dreamteam.vn/products/preview</div>
          </div>
          <div className="dg-mini-back-body">
            <div className="dg-mini-back-pill">{backPill1}</div>
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
            <div className="dg-browser-url">dreamteam.vn/advisor</div>
          </div>
          <div className="dg-mini-back-body">
            <div className="dg-mini-back-pill">{backPill2}</div>
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
                aria-label={isDemoStopped ? mt.playTour : mt.pauseTour}
              >
                {isDemoStopped ? <Play size={11} /> : <Pause size={11} />}
                <span className="dg-hero-pause-label">
                  {isDemoStopped ? mt.resumeLabel : mt.pauseLabel}
                </span>
              </button>
              <span className="dg-hero-live-pill">
                <span className="dg-dot" />
                LIVE
              </span>
            </div>
          </div>

          <div className="dg-dt-app-shell">
            <aside className="dg-dt-sidebar" aria-label={chrome.common.solutions}>
              <div className="dg-dt-sidebar-brand">
                <DreamTeamBrandMark size={20} inverted />
                <span>DreamTeam</span>
              </div>

              <div
                className="dg-dt-sidebar-nav"
                role="tablist"
                aria-label={chrome.common.solutions}
              >
                {HERO_PREVIEW_TABS.map((item) => {
                  const selected = item.id === currentMode;
                  const tabCopy = mt[item.id];
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
                      <span>{tabCopy.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="dg-dt-sidebar-foot">
                <div className="dg-dt-sidebar-chip">
                  <MessageSquare size={12} />
                  <span>{mt.sidebarFooter1}</span>
                </div>
                <div className="dg-dt-sidebar-chip">
                  <Smartphone size={12} />
                  <span>{mt.sidebarFooter2}</span>
                </div>
              </div>
            </aside>

            <div className="dg-dt-workspace">
              <div key={activeTab.id} className="dg-dt-ws-body">
                <div className="dg-dt-ws-head">
                  <div>
                    <span className="dg-dt-ws-eyebrow">
                      {shopContextTitle}
                    </span>
                    <strong>{activeTabMeta.highlightTitle}</strong>
                  </div>
                  <span className="dg-dt-ws-badge">
                    <ShieldCheck size={12} />
                    <span>{mt.brandBadge}</span>
                  </span>
                </div>

                <div className="dg-dt-kpi-strip">
                  {activeTabMeta.kpis.map((kpi) => (
                    <div key={kpi.label} className="dg-dt-kpi-box">
                      <span>{kpi.label}</span>
                      <strong>{kpi.value}</strong>
                    </div>
                  ))}
                </div>

                <div className="dg-dt-ws-grid">
                  <div className="dg-dt-chart-card">
                    <div className="dg-dt-chart-head">
                      <span>{activeTabMeta.chartTitle}</span>
                      <span className="dg-dt-chart-tag">
                        {activeTabMeta.highlightMeta}
                      </span>
                    </div>
                    <svg
                      viewBox="0 0 220 72"
                      className="dg-dt-chart-svg"
                      role="img"
                      aria-label={`${activeTabMeta.chartTitle} — ${activeTabMeta.label}`}
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
                        alt={workspaceMiniLabel}
                        width={1280}
                        height={720}
                        fetchPriority="high"
                        className="dg-hero-workspace-img"
                      />
                      <div className="dg-hero-workspace-caption">
                        <span>{workspaceMiniLabel}</span>
                        <span>{teamMiniLabel}</span>
                      </div>
                    </div>
                    <div className="dg-dt-rag-head">
                      <Sparkles size={13} />
                      <span>{backPill2}</span>
                    </div>
                    <p className="dg-dt-rag-copy">{activeTabMeta.advisorCopy}</p>
                    <div className="dg-dt-rag-pill">{activeTabMeta.advisorTip}</div>
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
  const { locale, formatPrice } = useLocale();

  const pills =
    locale === 'en'
      ? ['All', 'Web UI', 'AI Prompts', 'Workflows']
      : locale === 'ru'
        ? ['Все', 'Веб-макеты', 'Промпты AI', 'Автопотоки']
        : locale === 'zh'
          ? ['全部', '网页模板', 'AI 提示词', '自动化流程']
          : ['Tất cả', 'Giao diện Web', 'Prompt AI', 'Luồng Tự Động'];

  const copy =
    locale === 'en'
      ? {
          origin: 'Original',
          cartSummary: '2 bundles',
          steps: ['1. Cart', '2. Confirm', '3. Download'],
          sandbox: 'Sandbox mode',
          done: 'Paid',
          downloads: '5 downloads',
          expiry: '7-day link',
          shopOwner: 'Shop Account',
          orderSync: 'Order Sync',
          purchased: 'Purchases',
          security: 'Protected',
        }
      : locale === 'ru'
        ? {
            origin: 'Оригинал',
            cartSummary: '2 пакета',
            steps: ['1. Корзина', '2. Оплата', '3. Файлы'],
            sandbox: 'Тестовый режим',
            done: 'Оплачено',
            downloads: '5 скачиваний',
            expiry: 'Срок 7 дн.',
            shopOwner: 'Кабинет магазина',
            orderSync: 'Синхрон заказов',
            purchased: 'Покупки',
            security: 'Защита',
          }
        : locale === 'zh'
          ? {
              origin: '原创设计',
              cartSummary: '已选 2 套',
              steps: ['1. 购物车', '2. 确认支付', '3. 获取文件'],
              sandbox: '沙盒测试',
              done: '已完成',
              downloads: '限下载 5 次',
              expiry: '7 天有效',
              shopOwner: '店主账户',
              orderSync: '订单同步',
              purchased: '已购套件',
              security: '安全访问',
            }
          : {
              origin: 'Thiết kế gốc',
              cartSummary: '2 gói đã chọn',
              steps: ['1. Giỏ hàng', '2. Xác nhận', '3. Nhận file'],
              sandbox: 'Thử nghiệm',
              done: 'Hoàn tất',
              downloads: '5 lượt tải',
              expiry: 'Hạn 7 ngày',
              shopOwner: 'Tài khoản chủ shop',
              orderSync: 'Đồng bộ đơn',
              purchased: 'Đơn đã mua',
              security: 'Bảo mật',
            };

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
              <span className="is-active">{pills[0]}</span>
              <span>{pills[1]}</span>
              <span>{pills[2]}</span>
              <span>{pills[3]}</span>
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
              <span className="dg-mock-badge-sm">{copy.origin}</span>
              <span className="dg-mock-price-line">{formatPrice(490000)}</span>
              <span className="dg-mock-cta-bar" />
            </div>
          </div>
        )}

        {screen === 'cart' && (
          <div className="dg-mock-layout">
            <div className="dg-mock-ab-banner">
              <span>{copy.cartSummary}</span>
              <span>{formatPrice(780000)}</span>
            </div>
            <div className="dg-mock-grant-row">
              <ShoppingBag size={14} />
              <span className="dg-mock-line w-70" />
              <span className="dg-mock-badge-sm">{formatPrice(490000)}</span>
            </div>
            <div className="dg-mock-grant-row">
              <Sparkles size={14} />
              <span className="dg-mock-line w-60" />
              <span className="dg-mock-badge-sm">{formatPrice(290000)}</span>
            </div>
          </div>
        )}

        {screen === 'checkout' && (
          <div className="dg-mock-layout">
            <div className="dg-mock-steps">
              <span className="is-done">{copy.steps[0]}</span>
              <span className="is-active">{copy.steps[1]}</span>
              <span>{copy.steps[2]}</span>
            </div>
            <div className="dg-mock-split">
              <div className="dg-mock-card" style={{ padding: '10px' }}>
                <span className="dg-mock-line w-80" />
                <span className="dg-mock-line w-55" />
              </div>
              <div className="dg-mock-dock">
                <span className="dg-mock-badge-sm">{copy.sandbox}</span>
                <span className="dg-mock-cta-bar" />
              </div>
            </div>
          </div>
        )}

        {screen === 'orders' && (
          <div className="dg-mock-layout">
            <div className="dg-mock-ab-banner">
              <span>DT-202611-001</span>
              <span className="is-paid">{copy.done}</span>
            </div>
            <div className="dg-mock-grant-row">
              <Download size={14} />
              <span className="dg-mock-line w-70" />
              <span className="dg-mock-badge-sm">{copy.downloads}</span>
            </div>
            <div className="dg-mock-grant-row">
              <ShieldCheck size={14} />
              <span className="dg-mock-line w-60" />
              <span className="dg-mock-badge-sm">{copy.expiry}</span>
            </div>
          </div>
        )}

        {screen === 'auth' && (
          <div className="dg-mock-layout">
            <div className="dg-mock-ab-banner">
              <span>{copy.shopOwner}</span>
              <span>{copy.orderSync}</span>
            </div>
            <div className="dg-mock-grant-row">
              <User size={14} />
              <span className="dg-mock-line w-75" />
              <span className="dg-mock-badge-sm">{copy.purchased}</span>
            </div>
            <div className="dg-mock-grant-row">
              <Lock size={14} />
              <span className="dg-mock-line w-60" />
              <span className="dg-mock-badge-sm">{copy.security}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CtaPreviewMockup() {
  const { locale, home } = useLocale();
  const c =
    locale === 'en'
      ? {
          tag: 'Beauty • TikTok Shop',
          timer: '~30 min setup',
          title: 'Preview live on Desktop 1280px & Mobile 375px before download',
          chip1: 'Desktop 1280px',
          chip2: 'Mobile 375px',
          chip3: home.heroMockupTabs.brandBadge,
          foot1: home.heroMockupTabs.sidebarFooter2,
          foot2: 'Instant files',
          floatChip: `${home.heroMockupTabs.sidebarFooter2} • Instant files`,
        }
      : locale === 'ru'
        ? {
            tag: 'Косметика • TikTok Shop',
            timer: '~30 мин запуск',
            title: 'Предпросмотр на Desktop 1280px и Mobile 375px до покупки',
            chip1: 'Desktop 1280px',
            chip2: 'Mobile 375px',
            chip3: home.heroMockupTabs.brandBadge,
            foot1: home.heroMockupTabs.sidebarFooter2,
            foot2: 'Сразу после оплаты',
            floatChip: `${home.heroMockupTabs.sidebarFooter2} • Мгновенная выдача`,
          }
        : locale === 'zh'
          ? {
              tag: '美妆护肤 • TikTok Shop',
              timer: '约 30 分钟上线',
              title: '购买前直接预览 1280px 桌面端与 375px 手机端实时效果',
              chip1: '桌面 1280px',
              chip2: '手机 375px',
              chip3: home.heroMockupTabs.brandBadge,
              foot1: home.heroMockupTabs.sidebarFooter2,
              foot2: '下单即得文件',
              floatChip: `${home.heroMockupTabs.sidebarFooter2} • 立即下载`,
            }
          : {
              tag: 'Mỹ phẩm • TikTok Shop',
              timer: '~30 phút',
              title:
                'Xem thử trực tiếp trên Desktop 1280px & Mobile 375px trước khi tải',
              chip1: 'Desktop 1280px',
              chip2: 'Mobile 375px',
              chip3: 'Bản quyền rõ',
              foot1: 'Xem thử 375px',
              foot2: 'Nhận file tức thì',
              floatChip: 'Xem thử 375px • Nhận file tức thì',
            };

  return (
    <div className="dg-cta-dark-visual-wrap">
      <div className="dg-cta-dark-visual" data-surface="light">
        <div className="dg-browser-frame-bar">
          <div className="dg-mac-dots">
            <span className="red" />
            <span className="yellow" />
            <span className="green" />
          </div>
          <div className="dg-browser-url">dreamteam.vn/products/beauty-kit</div>
          <span className="dg-hero-live-pill">
            <span className="dg-dot" />
            375px
          </span>
        </div>

        <div className="dg-cta-mock-body">
          <div className="dg-cta-mock-row">
            <span className="dg-cta-mock-tag">{c.tag}</span>
            <span className="dg-cta-mock-timer">{c.timer}</span>
          </div>
          <p className="dg-cta-mock-title">{c.title}</p>
          <div className="dg-mock-toggle-row">
            <span className="is-active">{c.chip1}</span>
            <span>{c.chip2}</span>
            <span>{c.chip3}</span>
          </div>
          <div className="dg-cta-mock-footer">
            <span>
              <CheckCircle2 size={13} /> {c.foot1}
            </span>
            <span>
              <ShoppingBag size={13} /> {c.foot2}
            </span>
          </div>
        </div>
      </div>

      <div className="dg-cta-dark-chip chip-a">
        <Layers size={14} />
        <span>{c.floatChip}</span>
      </div>
    </div>
  );
}
