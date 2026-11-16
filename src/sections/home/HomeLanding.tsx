'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  Download,
  Expand,
  FileCode2,
  HelpCircle,
  Layers,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Moon,
  Pause,
  Play,
  Plus,
  Quote,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Timer,
  X,
  Zap,
} from '@/components/icons/DreamIcons';
import {
  formatVnd,
  PRODUCT_TYPE_LABELS,
  SOURCE_TYPE_META,
} from '@/components/shared/formatters';
import {
  CtaPreviewMockup,
  HeroVisualStack,
  type InnerScreenKey,
  InnerPageVisual,
} from '@/components/visual/DreamTeamMockups';
import { ProductPlaceholderFrame } from '@/components/visual/ProductPlaceholderFrame';
import { initScrollReveals } from '@/motion/reveal';
import { useCountUp } from '@/motion/useCountUp';
import { useTypewriter } from '@/motion/useTypewriter';
import { listProducts } from '@/services';
import { useExperiment } from '@/state';
import type { ProductSummaryDto, ProductType } from '@/types/api';

const TYPEWRITER_WORDS = [
  'Web Bán Hàng',
  'Prompt Chốt Đơn',
  'Workflow Tự Động',
  'Phễu Chuyển Đổi',
  'Trợ Lý Tư Vấn',
] as const;

const CATEGORY_CARDS = [
  {
    title: 'Template Website',
    href: '/products?product_type=template',
    cta: 'Xem mẫu web',
    icon: LayoutDashboard,
    grad: 'dg-grad-1',
  },
  {
    title: 'Prompt Pack AI',
    href: '/products?product_type=prompt_pack',
    cta: 'Xem bộ prompt',
    icon: Sparkles,
    grad: 'dg-grad-2',
  },
  {
    title: 'Workflow Tự Động',
    href: '/products?product_type=workflow',
    cta: 'Xem luồng mẫu',
    icon: Zap,
    grad: 'dg-grad-3',
  },
  {
    title: 'Shop Mỹ Phẩm',
    href: `/products?industry=${encodeURIComponent('Mỹ phẩm')}`,
    cta: 'Lọc ngành mỹ phẩm',
    icon: ShoppingBag,
    grad: 'dg-grad-4',
  },
  {
    title: 'Shop Thời Trang',
    href: `/products?industry=${encodeURIComponent('Thời trang')}`,
    cta: 'Lọc ngành thời trang',
    icon: Building2,
    grad: 'dg-grad-5',
  },
  {
    title: 'Gia Dụng & F&B',
    href: `/products?industry=${encodeURIComponent('F&B')}`,
    cta: 'Lọc F&B & Quán nhỏ',
    icon: Rocket,
    grad: 'dg-grad-6',
  },
] as const;

const SHOWCASE_TABS: Array<{ value: '' | ProductType; label: string }> = [
  { value: '', label: 'Tất cả giải pháp' },
  { value: 'template', label: 'Template Website' },
  { value: 'prompt_pack', label: 'Prompt Pack' },
  { value: 'workflow', label: 'Workflow Tự Động' },
];

const CORE_FEATURES = [
  {
    title: 'Trợ lý RAG Gemini (F7)',
    desc: 'Gợi ý gói số dựa trên pgvector và đối chiếu 100% ID thật từ DB, từ chối trả lời khi thiếu dữ liệu.',
    icon: MessageSquare,
    grad: 'dg-grad-1',
  },
  {
    title: 'Phân nhánh AB/BA (F8)',
    desc: 'Thiết kế Within-subject đảo chéo giữa lượt có trợ lý ảo và lượt tự tìm kiếm để khử hiệu ứng quen tay.',
    icon: Layers,
    grad: 'dg-grad-2',
  },
  {
    title: 'Thẻ kịch bản F11',
    desc: 'Giao đề bài kinh doanh thực tế, bấm giờ tự động theo tabular-nums và thu điểm tự tin Likert 1–5.',
    icon: Timer,
    grad: 'dg-grad-3',
  },
  {
    title: 'Minh bạch bản quyền (F3)',
    desc: 'Công khai 3 phân loại nguồn gốc original, adapted, licensed kèm giấy phép chi tiết trên từng gói.',
    icon: ShieldCheck,
    grad: 'dg-grad-4',
  },
  {
    title: 'Thanh toán Sandbox (F5)',
    desc: 'Mock Webhook HMAC ổn định 100% giúp kiểm chứng ý định mua trong nghiên cứu mà không thu tiền thật.',
    icon: Lock,
    grad: 'dg-grad-5',
  },
  {
    title: 'Giao hàng Token (F6)',
    desc: 'Phát hành liên kết tải file riêng tư có hạn dùng expires_at và giới hạn lượt tải sau khi đơn paid.',
    icon: Download,
    grad: 'dg-grad-6',
  },
  {
    title: '14 Sự kiện Tracking (F10)',
    desc: 'Ghi nhận đồng bộ 14 sự kiện chuẩn vào Postgres cùng bộ 4 trường định danh để kiểm định thống kê.',
    icon: BarChart3,
    grad: 'dg-grad-1',
  },
  {
    title: 'Bộ Eval Tự Động (F12)',
    desc: 'Chạy đánh giá định kỳ Accuracy chọn đúng gói, Hallucination Rate, độ trễ P95 và chi phí mỗi truy vấn.',
    icon: CheckCircle2,
    grad: 'dg-grad-2',
  },
] as const;

const TECH_STACK_TILES = [
  { name: 'Next.js App Router', icon: Rocket, grad: 'dg-grad-1' },
  { name: 'TypeScript Strict', icon: FileCode2, grad: 'dg-grad-2' },
  { name: 'Supabase Postgres', icon: Database, grad: 'dg-grad-3' },
  { name: 'pgvector 768d', icon: Cpu, grad: 'dg-grad-4' },
  { name: 'Gemini Flash RAG', icon: Sparkles, grad: 'dg-grad-5' },
  { name: 'Zod Contract', icon: ShieldCheck, grad: 'dg-grad-6' },
  { name: 'HMAC Sandbox', icon: Lock, grad: 'dg-grad-1' },
  { name: 'Signed URL F6', icon: Download, grad: 'dg-grad-2' },
  { name: '14 Tracking Events', icon: BarChart3, grad: 'dg-grad-3' },
  { name: 'Eval Pipeline F12', icon: CheckCircle2, grad: 'dg-grad-4' },
  { name: 'Dark & Light Mode', icon: Moon, grad: 'dg-grad-5' },
  { name: 'Mobile 375px First', icon: Smartphone, grad: 'dg-grad-6' },
] as const;

const INNER_PAGES: Array<{
  screen: InnerScreenKey;
  category: string;
  title: string;
  href: string;
  desc: string;
  tags: [string, string];
}> = [
  {
    screen: 'catalog',
    category: 'Danh mục F2',
    title: 'Tìm kiếm & Lọc Đa Chiều',
    href: '/products',
    desc: 'Lọc tức thì theo loại gói số, ngành hàng, khoảng ngân sách và sắp xếp giá VND.',
    tags: ['Lọc 0ms', 'Ngữ cảnh F11'],
  },
  {
    screen: 'detail',
    category: 'Chi tiết gói F3',
    title: 'Preview 375px & Bản Quyền',
    href: '/products/landing-page-my-pham-tiktok-shop',
    desc: 'Chuyển đổi khung Desktop/Mobile và đối chiếu hộp minh bạch bản quyền 3 cấp.',
    tags: ['1280px ↔ 375px', 'License Box'],
  },
  {
    screen: 'experiment',
    category: 'Thí nghiệm F11',
    title: 'Phòng Thí Nghiệm AB/BA',
    href: '/experiment',
    desc: 'Quy trình 4 pha ẩn danh: Consent, bấm giờ kịch bản, chọn gói và chấm Likert 1–5.',
    tags: ['Miễn tạo TK', 'Timer Tabular'],
  },
  {
    screen: 'checkout',
    category: 'Thanh toán F4–F5',
    title: 'Giỏ Hàng & Mock Sandbox',
    href: '/cart',
    desc: 'Tính tiền trực tiếp từ DB server và mô phỏng kết quả Webhook Paid / Failed.',
    tags: ['Giá từ DB', 'Webhook HMAC'],
  },
  {
    screen: 'orders',
    category: 'Giao hàng số F6',
    title: 'Kho Bàn Giao Token Có Hạn',
    href: '/checkout',
    desc: 'Quản lý download_grants với giới hạn 5 lượt tải, thời hạn 7 ngày và xem trước JSON.',
    tags: ['Signed Token', 'Hạn 7 ngày'],
  },
  {
    screen: 'analytics',
    category: 'Quản trị F10 • F1',
    title: 'Dashboard A/B & Auth Split',
    href: '/admin/analytics',
    desc: 'Bảng so sánh chatbot_on/off, phễu 14 sự kiện, kinh tế RAG và tách dữ liệu mô phỏng.',
    tags: ['Include Simulated', 'RAG Cost/Query'],
  },
];

const SCENARIO_CARDS = [
  {
    code: 'SC-01',
    grad: 'grad-indigo',
    persona: 'Chủ shop Mỹ phẩm dưỡng da',
    channel: 'TikTok Shop • Quy mô 2 người',
    budget: 'Ngân sách ≤ 1.000.000đ',
    summary:
      'Cần mẫu landing page tối ưu màn hình điện thoại 375px, trình bày bảng thành phần dịu nhẹ và tuân thủ chính sách quảng cáo không cam kết trị liệu.',
    meta: 'Bài toán F11 • Ngành Mỹ phẩm',
  },
  {
    code: 'SC-02',
    grad: 'grad-cyan',
    persona: 'Chủ shop Thời trang local',
    channel: 'Instagram & Shopee • 2 người',
    budget: 'Ngân sách ≤ 700.000đ',
    summary:
      'Cần trang trưng bày bộ sưu tập lookbook kèm bảng quy đổi size trực quan cho khách xem livestream và form giữ đơn nhanh.',
    meta: 'Bài toán F11 • Ngành Thời trang',
  },
  {
    code: 'SC-03',
    grad: 'grad-emerald',
    persona: 'Quán đồ uống & Bếp nhỏ',
    channel: 'Quét QR tại quầy & Zalo • 2 người',
    budget: 'Ngân sách ≤ 600.000đ',
    summary:
      'Muốn khách quét mã QR xem menu điện tử, chọn topping ngọt/đá và gửi tóm tắt đơn thẳng qua Zalo thay vì nhắn hỏi từng món.',
    meta: 'Bài toán F11 • Ngành F&B',
  },
  {
    code: 'SC-04',
    grad: 'grad-copper',
    persona: 'Shop đa kênh giờ cao điểm',
    channel: 'Shopee, TikTok, FB • 1–3 người',
    budget: 'Ngân sách ≤ 700.000đ',
    summary:
      'Cần bộ kịch bản trả lời inbox nhanh hoặc luồng tự động ghi đơn mới về Google Sheets và báo Telegram tránh sót đơn.',
    meta: 'Bài toán F11 • Vận hành đa kênh',
  },
] as const;

const FAQ_ITEMS = [
  {
    q: 'Tham gia Thí nghiệm F11 có cần tạo tài khoản hay nhập email không?',
    a: 'Không. Để giảm ma sát cho người tham gia, hệ thống cấp ngay mã phiên ẩn danh (participant_code) sau khi bạn bấm xác nhận đồng ý (consent) tại trang /experiment mà không yêu cầu email hay mật khẩu.',
  },
  {
    q: 'Thanh toán Sandbox trên DreamTeam có trừ tiền thật không?',
    a: 'Hoàn toàn không. Luồng thanh toán sử dụng Mock Sandbox Webhook nội bộ (F5) chỉ nhằm đo lường ý định mua (purchase intent) trong nghiên cứu đồ án và kiểm thử cơ chế cấp link tải file (F6).',
  },
  {
    q: 'Ý nghĩa 3 nhãn bản quyền original, adapted và licensed là gì?',
    a: 'original là gói do nhóm đề tài tự thiết kế 100%; adapted là mẫu chuyển thể từ cấu trúc tham khảo mở và biên tập lại cho shop Việt Nam; licensed là tài nguyên sử dụng theo giấy phép thương mại hợp lệ.',
  },
  {
    q: 'Trợ lý ảo RAG lấy dữ liệu từ đâu để tư vấn sản phẩm?',
    a: 'Trợ lý chỉ truy xuất dữ liệu thật từ bảng products trong PostgreSQL/pgvector và bắt buộc server đối chiếu lại ID đang hoạt động (is_active = true). Khi không có gói phù hợp, trợ lý sẽ từ chối thay vì tự bịa giá hay tính năng.',
  },
  {
    q: 'Sau khi thanh toán Sandbox thành công, link tải file hoạt động thế nào?',
    a: 'Khi đơn chuyển sang trạng thái paid, server phát hành download_grants có mã token riêng, thời hạn mặc định 7 ngày và giới hạn 5 lượt tải qua endpoint bảo mật /api/downloads/[token].',
  },
  {
    q: 'Dữ liệu thí nghiệm và dữ liệu mô phỏng được tách bạch ra sao?',
    a: 'Mọi bản ghi thử nghiệm mẫu đều gắn cờ is_simulated = true. Trên Dashboard /admin/analytics, hệ thống mặc định chỉ tính các phiên thật (is_simulated = false) và hiển thị cảnh báo hổ phách nếu quản trị viên bật chế độ xem dữ liệu mô phỏng.',
  },
] as const;

export function HomeLanding() {
  const { track } = useExperiment();

  const heroSectionRef = useRef<HTMLElement | null>(null);
  const [heroShowcaseType, setHeroShowcaseType] =
    useState<ProductType>('template');
  const [activeFilter, setActiveFilter] = useState<'' | ProductType>('');
  const [products, setProducts] = useState<ProductSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [previewScreen, setPreviewScreen] = useState<
    (typeof INNER_PAGES)[number] | null
  >(null);
  const previewDialogRef = useRef<HTMLDialogElement | null>(null);

  // Carousel state (Section 7: 3-Card Scenario Carousel)
  const carouselTrackRef = useRef<HTMLDivElement | null>(null);
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isAutoPaused, setIsAutoPaused] = useState<boolean>(false);
  const [slideAnnouncement, setSlideAnnouncement] = useState<string>('');

  const { text: typewriterText, isReducedMotion } =
    useTypewriter(TYPEWRITER_WORDS);
  const { ref: countTypesRef, displayValue: countTypesDisplay } = useCountUp(
    3,
    900,
    0
  );
  const { ref: countGroundingRef, displayValue: countGroundingDisplay } =
    useCountUp(100, 1100, 0);

  useEffect(() => {
    const cleanupReveal = initScrollReveals();
    return cleanupReveal;
  }, []);

  // Load real products from GET /api/products
  const fetchShowcaseProducts = useCallback(
    async (filterType: '' | ProductType, signal?: AbortSignal) => {
      setLoadError(null);
      const res = await listProducts(
        {
          product_type: filterType || undefined,
          limit: 6,
          sort: 'newest',
        },
        signal
      );
      if (signal?.aborted) return;
      setIsLoading(false);
      if (res.ok) {
        setProducts(res.data.slice(0, 6));
      } else {
        setLoadError(res.error.message);
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void fetchShowcaseProducts(activeFilter, controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [activeFilter, fetchShowcaseProducts]);

  // Preview Modal (<dialog>) handlers
  useEffect(() => {
    const dialog = previewDialogRef.current;
    if (!dialog) return;

    const onClose = () => setPreviewScreen(null);
    let pressedOutside = false;

    const isOutside = (e: PointerEvent) => {
      const rect = dialog.getBoundingClientRect();
      return (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      );
    };

    const onDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) dialog.close();
    };

    dialog.addEventListener('close', onClose);
    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);

    return () => {
      dialog.removeEventListener('close', onClose);
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, []);

  const openScreenPreview = (item: (typeof INNER_PAGES)[number]) => {
    setPreviewScreen(item);
    previewDialogRef.current?.showModal();
  };

  // Carousel scroll helper
  const scrollToSlide = useCallback(
    (index: number, announce = true) => {
      const track = carouselTrackRef.current;
      const wrapped =
        ((index % SCENARIO_CARDS.length) + SCENARIO_CARDS.length) %
        SCENARIO_CARDS.length;
      setActiveSlide(wrapped);

      if (announce) {
        setSlideAnnouncement(
          `Kịch bản ${wrapped + 1} trên ${SCENARIO_CARDS.length}: ${SCENARIO_CARDS[wrapped].code}`
        );
      }

      if (!track) return;
      const slideEl = track.children[wrapped] as HTMLElement | undefined;
      if (!slideEl) return;

      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      const targetLeft =
        slideEl.offsetLeft - (track.clientWidth - slideEl.clientWidth) / 2;
      track.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: prefersReduced ? 'auto' : 'smooth',
      });
    },
    []
  );

  // Sync active slide on manual scroll (throttled via rAF)
  useEffect(() => {
    const track = carouselTrackRef.current;
    if (!track) return;

    let rafId = 0;

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const centerX = track.scrollLeft + track.clientWidth / 2;
        let closestIdx = 0;
        let minDistance = Number.POSITIVE_INFINITY;

        Array.from(track.children).forEach((child, idx) => {
          const el = child as HTMLElement;
          const elCenter = el.offsetLeft + el.clientWidth / 2;
          const dist = Math.abs(elCenter - centerX);
          if (dist < minDistance) {
            minDistance = dist;
            closestIdx = idx;
          }
        });

        setActiveSlide((prev) => (prev === closestIdx ? prev : closestIdx));
      });
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      track.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Optional gentle autoplay (respects Pause button & prefers-reduced-motion)
  useEffect(() => {
    if (isAutoPaused || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = setInterval(() => {
      scrollToSlide(activeSlide + 1, false);
    }, 5200);

    return () => clearInterval(timer);
  }, [activeSlide, isAutoPaused, scrollToSlide]);

  const handleSelectShowcaseTab = (nextType: '' | ProductType) => {
    setActiveFilter(nextType);
    void track('filter_applied', {
      properties: {
        source: 'home_showcase',
        product_type: nextType || null,
      },
    });
  };

  return (
    <>
      {/* 2. Atmospheric Hero Split + Typewriter + 3D Mockup Stack (0ms Instant Entry) */}
      <section ref={heroSectionRef} className="dg-hero dg-dark-band" id="hero">
        <div className="container">
          <div className="dg-hero-grid">
            <div className="dg-hero-copy">
              <div className="dg-hero-badge">
                <span className="dg-dot" aria-hidden="true" />
                <span>DÀNH CHO CHỦ SHOP NHỎ 1–3 NGƯỜI • SHOPEE / TIKTOK / FB</span>
                <span className="dg-hero-version">F1–F12</span>
              </div>

              <h1 className="text-line-clip">
                Vận hành nhanh hơn với{' '}
                <span className="dg-grad-text">DreamTeam</span>
                <br />
                Chọn đúng{' '}
                <span
                  className={`dg-typewriter ${
                    isReducedMotion ? 'is-static' : ''
                  }`}
                >
                  {typewriterText}
                </span>
              </h1>

              <p className="lead">
                Kho Template Website tự thiết kế, Prompt Pack chốt đơn và Workflow
                tự động minh bạch bản quyền — đi kèm Trợ lý ảo RAG đối chiếu 100%
                dữ liệu thật và Thí nghiệm đối chứng AB/BA.
              </p>

              <div className="dg-hero-cta">
                <Link href="/products" className="dg-btn-purchase">
                  <span>Khám phá gói giải pháp</span>
                  <ArrowRight size={17} />
                </Link>
                <Link href="/experiment" className="dg-btn-outline">
                  <Play size={16} />
                  <span>Tham gia Thí nghiệm F11</span>
                </Link>
              </div>

              <div className="dg-hero-trust-v2">
                <div className="dg-hero-trust-chip">
                  <LayoutDashboard size={16} />
                  <span>
                    <strong ref={countTypesRef}>{countTypesDisplay}</strong> Loại Gói Số
                  </span>
                </div>
                <div className="dg-hero-trust-chip">
                  <ShieldCheck size={16} />
                  <span>
                    <strong ref={countGroundingRef}>{countGroundingDisplay}%</strong> Grounding DB
                  </span>
                </div>
                <div className="dg-hero-trust-chip">
                  <Timer size={16} />
                  <span>
                    <strong>Miễn tạo TK</strong> khi làm F11
                  </span>
                </div>
              </div>
            </div>

            <HeroVisualStack
              activeType={heroShowcaseType}
              onSelectType={setHeroShowcaseType}
              interactionRef={heroSectionRef}
            />
          </div>
        </div>
        <a href="#categories" className="dg-hero-scroll-cue">
          <span>Cuộn để khám phá</span>
          <ChevronDown size={16} />
        </a>
      </section>

      {/* 3. 6 Nhóm Giải Pháp & Ngành Hàng (#categories) */}
      <section className="section-padding-lg dg-frameworks-section" id="categories">
        <div className="container">
          <div className="dg-section-heading">
            <div className="dg-sub-heading">
              <span className="dg-sub-heading-icon">
                <Layers size={13} />
              </span>
              <span>Danh Mục Thực Chiến</span>
            </div>
            <h2>
              Một Hệ Thống, <span className="dg-grad-text">Sáu Nhóm Giải Pháp</span>
            </h2>
            <p>
              Chọn đúng loại công cụ số hoặc lọc thẳng theo ngành hàng shop nhỏ
              1–3 người đang kinh doanh trên Shopee, TikTok Shop và Facebook.
            </p>
          </div>

          <div className="dg-categories-grid">
            {CATEGORY_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="dg-framework-card"
                >
                  <div className={`dg-framework-icon ${card.grad}`}>
                    <Icon size={26} />
                  </div>
                  <span className="dg-framework-name">{card.title}</span>
                  <span className="dg-framework-link">
                    <span>{card.cta}</span>
                    <ArrowUpRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. PEAK: Showcase Gallery + Filter Tabs (#showcase) */}
      <section className="section-padding-lg dg-bg-soft" id="showcase">
        <div className="container">
          <div className="dg-section-heading">
            <div className="dg-sub-heading">
              <span className="dg-sub-heading-icon">
                <LayoutDashboard size={13} />
              </span>
              <span>Kho Giải Pháp DreamTeam</span>
            </div>
            <h2>
              Sản Phẩm Sẵn Sàng <span className="dg-grad-text">Triển Khai Ngay</span>
            </h2>
            <p>
              Toàn bộ gói giải pháp được truy vấn trực tiếp từ cơ sở dữ liệu thật
              kèm giá niêm yết VND và phân loại bản quyền rõ ràng.
            </p>
          </div>

          <div
            className="dg-fw-tabs"
            role="tablist"
            aria-label="Lọc danh mục sản phẩm số"
          >
            {SHOWCASE_TABS.map((tab) => {
              const selected = activeFilter === tab.value;
              return (
                <button
                  key={tab.label}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`dg-fw-tab ${selected ? 'active' : ''}`}
                  onClick={() => handleSelectShowcaseTab(tab.value)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {loadError && (
            <div
              className="callout callout--danger"
              role="alert"
              style={{ marginBottom: '24px' }}
            >
              <span>{loadError}</span>
            </div>
          )}

          {isLoading ? (
            <div className="dg-showcase-grid">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="dg-panel dg-showcase-skeleton">
                  <div
                    className="skeleton-box"
                    style={{ width: '100%', aspectRatio: '16 / 10' }}
                  />
                  <div
                    className="skeleton-box"
                    style={{ height: '20px', width: '65%' }}
                  />
                  <div
                    className="skeleton-box"
                    style={{ height: '38px', width: '100%' }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="dg-showcase-grid">
              {products.map((product) => {
                const sourceMeta = SOURCE_TYPE_META[product.source_type];
                return (
                  <article
                    key={product.id}
                    className="dg-showcase-card dg-panel"
                  >
                    <div className="dg-showcase-img-wrap">
                      <ProductPlaceholderFrame
                        productType={product.product_type}
                        industry={product.industry}
                        sourceType={product.source_type}
                        aspect="16/10"
                        slug={product.slug}
                      />
                      <div className="dg-showcase-overlay">
                        <Link
                          href={`/products/${product.slug}`}
                          className="dg-btn-purchase"
                        >
                          <span>Xem chi tiết</span>
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>

                    <div className="dg-showcase-body">
                      <div className="dg-showcase-meta-row">
                        <span className="dg-showcase-category">
                          {PRODUCT_TYPE_LABELS[product.product_type]} •{' '}
                          {product.industry}
                        </span>
                        <span className={`badge badge--${sourceMeta.badgeTone}`}>
                          {sourceMeta.label}
                        </span>
                      </div>

                      <h3 className="text-line-clip">
                        <Link href={`/products/${product.slug}`}>
                          {product.name}
                        </Link>
                      </h3>
                      <p>{product.short_description}</p>

                      <div className="dg-showcase-footer">
                        <span className="type-price dg-showcase-price">
                          {formatVnd(product.price_vnd)}
                        </span>
                        <Link
                          href={`/products/${product.slug}`}
                          className="dg-btn-outline dg-btn-sm"
                        >
                          <span>Xem chi tiết</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="dg-showcase-more">
            <Link href="/products" className="dg-btn-purchase">
              <span>Mở toàn bộ danh mục &amp; bộ lọc nâng cao</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. 8 Trụ Cột Tính Năng Lõi F1–F12 (#features — Dark Band) */}
      <section
        className="section-padding-lg dg-features-section dg-dark-band dg-dark-bg editorial-reveal"
        id="features"
      >
        <div className="dg-features-glow glow-1" aria-hidden="true" />
        <div className="dg-features-glow glow-2" aria-hidden="true" />
        <div className="dg-features-pattern" aria-hidden="true" />

        <div className="container position-relative">
          <div className="dg-section-heading">
            <div className="dg-sub-heading">
              <span className="dg-sub-heading-icon">
                <Sparkles size={13} />
              </span>
              <span>Kiến Trúc Nghiệp Vụ F1–F12</span>
            </div>
            <h2>
              Đầy Đủ Hạ Tầng Cho{' '}
              <span className="dg-grad-text">Cửa Hàng Số &amp; Nghiên Cứu A/B</span>
            </h2>
            <p>
              Mỗi tính năng trong DreamTeam phục vụ trực tiếp cho luồng mua hàng
              sản phẩm số hoặc câu hỏi nghiên cứu định lượng về hiệu quả Trợ lý ảo
              RAG.
            </p>
          </div>

          <div className="dg-features-grid">
            {CORE_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <article key={feat.title} className="dg-feature-card dg-panel">
                  <div className={`dg-feature-icon ${feat.grad}`}>
                    <Icon size={24} />
                  </div>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. 12 Công Nghệ Nền Tảng (#stack) */}
      <section
        className="section-padding-lg dg-stack-section editorial-reveal"
        id="stack"
      >
        <div className="dg-stack-glow glow-1" aria-hidden="true" />
        <div className="dg-stack-glow glow-2" aria-hidden="true" />

        <div className="container position-relative">
          <div className="dg-section-heading">
            <div className="dg-sub-heading">
              <span className="dg-sub-heading-icon">
                <Cpu size={13} />
              </span>
              <span>Nền Tảng Kỹ Thuật</span>
            </div>
            <h2>
              Xây Dựng Trên <span className="dg-grad-text">Stack Tin Cậy</span>
            </h2>
            <p>
              100% thành phần công nghệ đang vận hành thực tế trong mã nguồn
              DreamTeam — kiểm chứng kiểu dữ liệu chặt chẽ từ schema đến UI.
            </p>
          </div>

          <div className="dg-stack-grid">
            {TECH_STACK_TILES.map((tile) => {
              const Icon = tile.icon;
              return (
                <div key={tile.name} className="dg-stack-tile">
                  <div className={`dg-stack-tile-icon ${tile.grad}`}>
                    <Icon size={22} />
                  </div>
                  <span>{tile.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Bản Đồ Các Màn Hình Nghiệp Vụ (#pages) */}
      <section
        className="section-padding-lg dg-bg-soft editorial-reveal"
        id="pages"
      >
        <div className="container">
          <div className="dg-section-heading">
            <div className="dg-sub-heading">
              <span className="dg-sub-heading-icon">
                <Layers size={13} />
              </span>
              <span>Luồng Trải Nghiệm Toàn Hệ Thống</span>
            </div>
            <h2>
              Khám Phá Các <span className="dg-grad-text">Màn Hình Nghiệp Vụ</span>
            </h2>
            <p>
              Mở trực tiếp từng màn hình từ danh mục, xem trước 375px, phòng thí
              nghiệm AB/BA đến thanh toán Sandbox và phân tích Admin.
            </p>
          </div>

          <div className="dg-inner-pages-grid">
            {INNER_PAGES.map((item) => (
              <article key={item.title} className="dg-ip2-card dg-panel">
                <div className="dg-ip2-media">
                  <InnerPageVisual screen={item.screen} />
                  <div className="dg-ip2-scrim" aria-hidden="true" />
                  <button
                    type="button"
                    className="dg-ip2-zoom"
                    onClick={() => openScreenPreview(item)}
                    aria-label={`Phóng to xem trước ${item.title}`}
                  >
                    <Expand size={15} />
                  </button>
                  <Link
                    href={item.href}
                    className="dg-ip2-live"
                    aria-label={`Mở trang ${item.title}`}
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                  <div className="dg-ip2-media-text">
                    <span className="dg-ip2-category">{item.category}</span>
                    <h3>{item.title}</h3>
                  </div>
                </div>

                <div className="dg-ip2-body">
                  <p>{item.desc}</p>
                  <div className="dg-ip2-tags">
                    {item.tags.map((tag) => (
                      <span key={tag} className="dg-ip2-tag">
                        <CheckCircle2 size={12} />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Carousel 3 Thẻ Kịch Bản Thực Tế F11 (#reviews / #scenarios) */}
      <section
        className="section-padding-lg editorial-reveal"
        id="scenarios"
        aria-roledescription="carousel"
        aria-label="Hồ sơ kịch bản thí nghiệm chủ shop F11"
      >
        <div className="container">
          <div className="dg-section-heading">
            <div className="dg-sub-heading">
              <span className="dg-sub-heading-icon">
                <Timer size={13} />
              </span>
              <span>Hồ Sơ Kịch Bản Thí Nghiệm F11</span>
            </div>
            <h2>
              Các Tình Huống <span className="dg-grad-text">Chủ Shop Thực Tế</span>
            </h2>
            <p>
              Người tham gia thí nghiệm đóng vai chủ shop 1–3 người xử lý những
              tình huống mua gói giải pháp dưới áp lực ngân sách thật.
            </p>
          </div>

          <div className="dg-testi-controls-bar">
            <div className="dg-testi-dots" role="group" aria-label="Chọn kịch bản">
              {SCENARIO_CARDS.map((card, idx) => (
                <button
                  key={card.code}
                  type="button"
                  className="dg-testi-dot-btn"
                  aria-label={`Xem kịch bản ${idx + 1}: ${card.code}`}
                  aria-current={activeSlide === idx ? 'true' : undefined}
                  onClick={() => scrollToSlide(idx)}
                />
              ))}
            </div>

            <button
              type="button"
              className="dg-btn-outline dg-btn-sm"
              onClick={() => setIsAutoPaused((prev) => !prev)}
            >
              {isAutoPaused ? <Play size={14} /> : <Pause size={14} />}
              <span>{isAutoPaused ? 'Tiếp tục chuyển' : 'Tạm dừng'}</span>
            </button>
          </div>

          <div className="dg-testi-nav-wrap">
            <button
              type="button"
              className="dg-testi-nav-btn dg-testi-prev"
              aria-label="Kịch bản trước"
              onClick={() => scrollToSlide(activeSlide - 1)}
            >
              <ChevronLeft size={18} />
            </button>

            <div
              ref={carouselTrackRef}
              className="dg-scenario-track"
              tabIndex={0}
              role="group"
              aria-label="Danh sách thẻ kịch bản F11"
            >
              {SCENARIO_CARDS.map((card, idx) => (
                <article
                  key={card.code}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${idx + 1} trên ${SCENARIO_CARDS.length}: ${card.persona}`}
                  className={`dg-testi2-card dg-panel ${card.grad} ${
                    activeSlide === idx ? 'is-active' : ''
                  }`}
                >
                  <div className="dg-testi2-top">
                    <div className="dg-testi2-user">
                      <div className="dg-testi2-avatar-wrap">
                        <span className="dg-scenario-avatar" aria-hidden="true">
                          {card.code}
                        </span>
                      </div>
                      <div className="dg-testi2-body">
                        <h5>
                          <span>{card.persona}</span>
                          <CheckCircle2 size={14} className="dg-testi-verified" />
                        </h5>
                        <span className="dg-testi2-role">{card.channel}</span>
                      </div>
                    </div>

                    <span className="dg-testi2-rating type-mono">
                      {card.budget}
                    </span>
                  </div>

                  <span className="dg-testi2-quote-bg" aria-hidden="true">
                    <Quote size={26} />
                  </span>
                  <p>{card.summary}</p>

                  <div className="dg-testi-meta">
                    <span>{card.meta}</span>
                    <Link href="/experiment" className="dg-scenario-cta">
                      <span>Làm bài tại /experiment</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="dg-testi-nav-btn dg-testi-next"
              aria-label="Kịch bản tiếp theo"
              onClick={() => scrollToSlide(activeSlide + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <p className="visually-hidden" role="status" aria-live="polite">
            {slideAnnouncement}
          </p>
        </div>
      </section>

      {/* 9. FAQ Accordion (#faqs) */}
      <section
        className="section-padding-lg dg-bg-soft dg-features-section editorial-reveal"
        id="faqs"
      >
        <div className="dg-features-glow glow-1" aria-hidden="true" />
        <div className="dg-features-glow glow-2" aria-hidden="true" />
        <div className="dg-features-pattern" aria-hidden="true" />

        <div className="container position-relative">
          <div className="dg-section-heading">
            <div className="dg-sub-heading">
              <span className="dg-sub-heading-icon">
                <HelpCircle size={13} />
              </span>
              <span>Hỏi Đáp Thường Gặp</span>
            </div>
            <h2>
              Giải Đáp Trước Khi{' '}
              <span className="dg-grad-text">Mua Gói &amp; Làm Thí Nghiệm</span>
            </h2>
            <p>
              Thông tin minh bạch về cách tính điểm F11, bản quyền 3 cấp, nguồn
              dữ liệu Trợ lý RAG và luồng Sandbox.
            </p>
          </div>

          <div className="dg-faq-grid">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              const panelId = `faq-answer-${idx}`;
              return (
                <div
                  key={item.q}
                  className={`dg-faq-item ${isOpen ? 'active' : ''}`}
                >
                  <button
                    type="button"
                    className="dg-faq-question"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  >
                    <span>
                      <em>Q.</em> {item.q}
                    </span>
                    <span className="dg-faq-toggle-icon" aria-hidden="true">
                      <Plus size={16} />
                    </span>
                  </button>
                  <div
                    id={panelId}
                    className="dg-faq-answer-grid"
                    data-open={isOpen ? 'true' : 'false'}
                  >
                    <div className="dg-faq-answer-clip">
                      <div className="dg-faq-answer-inner">{item.a}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="dg-faq-help dg-panel">
            <div className="dg-faq-help-main">
              <div className="dg-faq-help-icon" aria-hidden="true">
                <Sparkles size={24} />
              </div>
              <div>
                <h3>Đi thẳng tới tính năng bạn cần kiểm tra</h3>
                <p>
                  Lối tắt nhanh tới danh mục sản phẩm số, phòng thí nghiệm F11,
                  luồng thanh toán Sandbox và đăng nhập tài khoản Demo.
                </p>
              </div>
            </div>

            <div className="dg-faq-help-grid">
              <Link href="/products" className="dg-faq-help-tile">
                <div className="dg-faq-help-tile-icon grad-indigo">
                  <LayoutDashboard size={17} />
                </div>
                <h4>Danh mục F2</h4>
                <p>Tìm &amp; lọc theo ngành hàng, giá VND</p>
              </Link>

              <Link href="/experiment" className="dg-faq-help-tile">
                <div className="dg-faq-help-tile-icon grad-cyan">
                  <Timer size={17} />
                </div>
                <h4>Thí nghiệm F11</h4>
                <p>2 kịch bản AB/BA trong ~5 phút</p>
              </Link>

              <Link href="/cart" className="dg-faq-help-tile">
                <div className="dg-faq-help-tile-icon grad-emerald">
                  <ShoppingBag size={17} />
                </div>
                <h4>Sandbox F5–F6</h4>
                <p>Kiểm thử webhook &amp; nhận token tải</p>
              </Link>

              <Link href="/auth" className="dg-faq-help-tile">
                <div className="dg-faq-help-tile-icon grad-copper">
                  <Lock size={17} />
                </div>
                <h4>Tài khoản Demo</h4>
                <p>Đăng nhập nhanh Khách hoặc Admin</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Dark CTA Strip (.dg-cta-dark) */}
      <section className="section-padding-lg editorial-reveal">
        <div className="container">
          <div className="dg-cta-dark dg-dark-band">
            <div className="dg-cta-dark-pattern" aria-hidden="true" />
            <div className="dg-cta-dark-grid">
              <div className="dg-cta-dark-copy">
                <span className="dg-cta-dark-badge">
                  <Rocket size={14} />
                  <span>Sẵn sàng trải nghiệm ~5 phút</span>
                </span>
                <h2>
                  Bắt đầu chọn gói chuẩn cho shop nhỏ hoặc tham gia Thí nghiệm A/B
                </h2>
                <p>
                  Trải nghiệm trọn vẹn 2 lượt kịch bản Within-subject AB/BA không
                  cần tạo tài khoản, hoặc duyệt toàn bộ danh mục gói số ngay hôm
                  nay.
                </p>
                <div className="dg-hero-cta" style={{ marginBottom: 0 }}>
                  <Link href="/experiment" className="dg-btn-purchase">
                    <span>Tham gia Thí nghiệm F11</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/products" className="dg-btn-outline">
                    <Play size={15} />
                    <span>Xem toàn bộ gói số</span>
                  </Link>
                </div>
              </div>

              <div className="dg-cta-dark-aside">
                <CtaPreviewMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Native <dialog> Preview Modal for Inner Pages */}
      <dialog
        ref={previewDialogRef}
        className="editorial-dialog dg-preview-dialog"
        aria-labelledby="inner-preview-title"
      >
        {previewScreen && (
          <div className="dg-preview-dialog-body">
            <div className="dg-preview-dialog-head">
              <div>
                <span className="type-eyebrow">{previewScreen.category}</span>
                <h2 id="inner-preview-title" className="type-h3" style={{ margin: '4px 0 0' }}>
                  {previewScreen.title}
                </h2>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => previewDialogRef.current?.close()}
                aria-label="Đóng xem trước"
                autoFocus
              >
                <X size={18} />
              </button>
            </div>

            <div className="dg-preview-dialog-stage">
              <InnerPageVisual screen={previewScreen.screen} />
            </div>

            <p className="type-body-sm" style={{ margin: 0 }}>
              {previewScreen.desc}
            </p>

            <div className="dg-preview-dialog-actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => previewDialogRef.current?.close()}
              >
                Đóng
              </button>
              <Link
                href={previewScreen.href}
                className="dg-btn-purchase dg-btn-sm"
                onClick={() => previewDialogRef.current?.close()}
              >
                <span>Mở trang thực tế</span>
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
