'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
  Search,
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
  InnerPageVisual,
  type InnerScreenKey,
} from '@/components/visual/DreamTeamMockups';
import { ProductPlaceholderFrame } from '@/components/visual/ProductPlaceholderFrame';
import { initScrollReveals } from '@/motion/reveal';
import { useCountUp } from '@/motion/useCountUp';
import { useSpecularSpotlight } from '@/motion/useSpecularSpotlight';
import { useTypewriter } from '@/motion/useTypewriter';
import { listProducts } from '@/services';
import { useCart, useExperiment } from '@/state';
import type { ProductSummaryDto, ProductType } from '@/types/api';

const TYPEWRITER_WORDS = [
  'Web Bán Hàng',
  'Prompt Chốt Đơn',
  'Workflow Tự Động',
  'Trang Lookbook',
  'Kịch Bản Bán Hàng',
] as const;

const DEFAULT_THUMBNAIL_BY_TYPE: Record<ProductType, string> = {
  template: '/images/cat-template.webp',
  prompt_pack: '/images/cat-prompt.webp',
  workflow: '/images/cat-workflow.webp',
};

const CATEGORY_CARDS: Array<{
  title: string;
  href: string;
  cta: string;
  image?: string;
  imageAlt?: string;
  icon: typeof LayoutDashboard;
  grad: string;
}> = [
  {
    title: 'Template Website',
    href: '/products?product_type=template',
    cta: 'Xem mẫu web',
    image: '/images/cat-template.webp',
    imageAlt:
      'Laptop hiển thị cấu trúc bố cục giao diện website bán hàng tối giản',
    icon: LayoutDashboard,
    grad: 'dg-grad-1',
  },
  {
    title: 'Prompt Pack AI',
    href: '/products?product_type=prompt_pack',
    cta: 'Xem bộ prompt',
    image: '/images/cat-prompt.webp',
    imageAlt: 'Sổ tay và bộ thẻ biên tập tối giản đại diện cho bộ prompt bán hàng',
    icon: Sparkles,
    grad: 'dg-grad-2',
  },
  {
    title: 'Workflow Tự Động',
    href: '/products?product_type=workflow',
    cta: 'Xem luồng mẫu',
    image: '/images/cat-workflow.webp',
    imageAlt:
      'Các khối mô-đun kết nối tối giản minh họa quy trình tự động hóa đơn hàng',
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
];

const SHOWCASE_TABS: Array<{ value: '' | ProductType; label: string }> = [
  { value: '', label: 'Tất cả giải pháp' },
  { value: 'template', label: 'Template Website' },
  { value: 'prompt_pack', label: 'Prompt Pack' },
  { value: 'workflow', label: 'Workflow Tự Động' },
];

const SHOP_BENEFITS = [
  {
    title: 'Tư vấn chọn gói theo ngân sách',
    desc: 'Trợ lý tư vấn lọc đúng gói theo ngành hàng, kênh bán và mức ngân sách dự kiến của shop.',
    icon: MessageSquare,
    grad: 'dg-grad-1',
  },
  {
    title: 'Xem thử giao diện sống 1280px ↔ 375px',
    desc: 'Kiểm tra trực tiếp bố cục thật trên cả màn hình máy tính và điện thoại ngay tại trang sản phẩm.',
    icon: Smartphone,
    grad: 'dg-grad-2',
  },
  {
    title: 'Minh bạch bản quyền 3 cấp',
    desc: 'Mỗi gói đều ghi rõ phân loại thiết kế gốc, điều chỉnh có nguồn hoặc bản quyền hợp lệ.',
    icon: ShieldCheck,
    grad: 'dg-grad-3',
  },
  {
    title: 'Đặt hàng thử nghiệm không rủi ro',
    desc: 'Kiểm tra trọn vẹn quy trình giỏ hàng, tạo đơn và bàn giao file ở chế độ thử nghiệm miễn phí.',
    icon: Lock,
    grad: 'dg-grad-4',
  },
  {
    title: 'Nhận file tức thì qua link riêng',
    desc: 'Ngay khi đơn được xác nhận, hệ thống cấp liên kết tải riêng tư thời hạn 7 ngày và 5 lượt tải.',
    icon: Download,
    grad: 'dg-grad-5',
  },
  {
    title: 'Hướng dẫn cài đặt 15–30 phút',
    desc: 'Kèm tài liệu từng bước ngắn gọn để chủ shop tự thay nội dung và đưa vào bán hàng ngay.',
    icon: Timer,
    grad: 'dg-grad-6',
  },
  {
    title: 'Tối ưu cho team 1–3 người',
    desc: 'Tinh gọn thao tác rườm rà, tập trung vào các nút bấm chốt đơn và mẫu nội dung hay dùng nhất.',
    icon: Layers,
    grad: 'dg-grad-1',
  },
  {
    title: 'Đồng bộ Shopee · TikTok · Facebook',
    desc: 'Bố cục và kịch bản bán hàng được viết sẵn theo thói quen mua hàng của khách Việt đa kênh.',
    icon: Rocket,
    grad: 'dg-grad-2',
  },
] as const;

const QUALITY_STANDARDS = [
  { name: 'Tốc độ tải tức thì', icon: Zap, grad: 'dg-grad-1' },
  { name: 'Chuẩn Mobile 375px', icon: Smartphone, grad: 'dg-grad-2' },
  { name: 'Giao diện Sáng & Tối', icon: Moon, grad: 'dg-grad-3' },
  { name: 'Trợ lý Tư vấn AI', icon: Sparkles, grad: 'dg-grad-4' },
  { name: 'Tìm kiếm theo nhu cầu', icon: Search, grad: 'dg-grad-5' },
  { name: 'Cấu trúc Sạch Chuẩn SEO', icon: FileCode2, grad: 'dg-grad-6' },
  { name: 'Link tải bảo mật 7 ngày', icon: Download, grad: 'dg-grad-1' },
  { name: 'Bản quyền Minh bạch', icon: ShieldCheck, grad: 'dg-grad-2' },
  { name: 'Cài đặt Nhanh 15 phút', icon: Timer, grad: 'dg-grad-3' },
  { name: 'Dễ sửa Không Cần Code Sâu', icon: LayoutDashboard, grad: 'dg-grad-4' },
  { name: 'Tối ưu Đa kênh Bán hàng', icon: Layers, grad: 'dg-grad-5' },
  { name: 'Thanh toán Thử nghiệm An toàn', icon: Lock, grad: 'dg-grad-6' },
] as const;

const STOREFRONT_SCREENS: Array<{
  screen: InnerScreenKey;
  category: string;
  title: string;
  href: string;
  desc: string;
  tags: [string, string];
}> = [
  {
    screen: 'catalog',
    category: 'Danh mục sản phẩm',
    title: 'Tìm Kiếm & Lọc Theo Ngành',
    href: '/products',
    desc: 'Lọc nhanh theo loại sản phẩm số, ngành hàng, mức ngân sách và sắp xếp theo giá VND.',
    tags: ['Lọc đa chiều', 'Ngân sách rõ'],
  },
  {
    screen: 'detail',
    category: 'Chi tiết sản phẩm',
    title: 'Xem Thử 1280px ↔ 375px',
    href: '/products/landing-page-my-pham-tiktok-shop',
    desc: 'Tương tác trực tiếp với giao diện mẫu trên Desktop, Mobile 375px và đối chiếu thông tin bản quyền.',
    tags: ['Live HTML', 'Phóng to toàn khung'],
  },
  {
    screen: 'cart',
    category: 'Giỏ hàng',
    title: 'Quản Lý Gói Đã Chọn',
    href: '/cart',
    desc: 'Cộng dồn chính xác tổng tiền VND theo từng gói sản phẩm trước khi chuyển qua bước xác nhận đơn.',
    tags: ['Tổng hợp tức thì', 'Dễ chỉnh sửa'],
  },
  {
    screen: 'checkout',
    category: 'Thanh toán thử nghiệm',
    title: 'Xác Nhận Đơn Không Rủi Ro',
    href: '/checkout',
    desc: 'Kiểm chứng toàn bộ luồng đặt hàng 3 bước ở chế độ thử nghiệm miễn phí trước khi tải tài nguyên.',
    tags: ['Không thu tiền thật', 'Xác nhận 1 chạm'],
  },
  {
    screen: 'orders',
    category: 'Đơn hàng & Kho tải',
    title: 'Kho Link Tải File 7 Ngày',
    href: '/orders',
    desc: 'Theo dõi lịch sử đơn đã tạo và tải trực tiếp gói tài nguyên với giới hạn 5 lượt trong 7 ngày.',
    tags: ['Link tải riêng', 'Hạn 7 ngày'],
  },
  {
    screen: 'auth',
    category: 'Tài khoản shop',
    title: 'Quản Lý Đơn & Tải Lại Dễ Dàng',
    href: '/auth',
    desc: 'Đăng ký hoặc đăng nhập gọn nhẹ để đồng bộ giỏ hàng và tra cứu lại các gói đã mua bất cứ lúc nào.',
    tags: ['Đồng bộ đơn', 'Bảo mật phiên'],
  },
];

const PILOT_FEEDBACK_CASES = [
  {
    code: 'MP',
    grad: 'grad-indigo',
    persona: 'Chủ shop Mỹ phẩm dưỡng da',
    channel: 'TikTok Shop • Quy mô 2 người',
    budget: 'Ngân sách ≤ 1.000.000đ',
    summary:
      'Ưu tiên mẫu landing page chuẩn mobile 375px, hiển thị rõ số công bố sản phẩm và bảng thành phần dịu nhẹ để gắn link từ video ngắn mà không bị vướng từ cấm.',
    industryFilter: 'Mỹ phẩm',
    ctaLabel: 'Xem gói ngành Mỹ phẩm',
  },
  {
    code: 'TT',
    grad: 'grad-cyan',
    persona: 'Chủ shop Thời trang local',
    channel: 'Instagram & Shopee • 2 người',
    budget: 'Ngân sách ≤ 700.000đ',
    summary:
      'Cần trang trưng bày bộ sưu tập lookbook kèm bảng quy đổi size trực quan để gửi cho khách đang xem livestream, giúp giảm thời gian nhắn hỏi số đo.',
    industryFilter: 'Thời trang',
    ctaLabel: 'Xem gói ngành Thời trang',
  },
  {
    code: 'FB',
    grad: 'grad-emerald',
    persona: 'Quán đồ uống & Bếp nhỏ',
    channel: 'Quét QR tại quầy & Zalo • 2 người',
    budget: 'Ngân sách ≤ 600.000đ',
    summary:
      'Khách tại bàn quét mã QR xem thực đơn trên điện thoại, chọn mức đường đá và gửi tóm tắt đơn thẳng sang Zalo thay vì phải chờ nhắn hỏi từng món.',
    industryFilter: 'F&B',
    ctaLabel: 'Xem gói ngành F&B',
  },
  {
    code: 'ĐK',
    grad: 'grad-copper',
    persona: 'Shop đa kênh giờ cao điểm',
    channel: 'Shopee, TikTok, Facebook • 1–3 người',
    budget: 'Ngân sách ≤ 700.000đ',
    summary:
      'Dùng bộ prompt trả lời tin nhắn nhanh kết hợp luồng tự động gom đơn về Google Sheets và báo tin Telegram để không bỏ sót đơn vào khung giờ cao điểm.',
    industryFilter: 'Đa ngành',
    ctaLabel: 'Xem gói Đa ngành',
  },
] as const;

const FAQ_ITEMS = [
  {
    q: 'Sau khi tải gói sản phẩm về, shop nhỏ có thể dùng ngay như thế nào?',
    a: 'Mỗi gói đều đi kèm tài liệu hướng dẫn triển khai 15–30 phút bằng tiếng Việt. Với Template Website bạn chỉ cần thay logo, ảnh sản phẩm và link sàn; với Prompt Pack có sẵn mẫu điền thông tin trên Notion/PDF; với Workflow có sẵn file JSON để nhập 1 chạm.',
  },
  {
    q: 'Thanh toán thử nghiệm (Sandbox) trên hệ thống có trừ tiền thật không?',
    a: 'Hoàn toàn không. Cửa hàng hiện đang bật chế độ thanh toán thử nghiệm để bạn tự kiểm tra trọn vẹn quy trình tạo đơn, xác nhận thanh toán và nhận link tải file mà không thu tiền thật.',
  },
  {
    q: 'Ý nghĩa 3 cấp bản quyền Thiết kế gốc, Điều chỉnh có nguồn và Bản quyền hợp lệ là gì?',
    a: 'Thiết kế gốc là gói do đội ngũ DreamTeam tự xây dựng 100%; Điều chỉnh có nguồn là mẫu tham khảo mở được Việt hóa và tối ưu lại cho shop nhỏ; Bản quyền hợp lệ là tài nguyên có giấy phép thương mại rõ ràng đi kèm hồ sơ.',
  },
  {
    q: 'Trợ lý tư vấn DreamTeam lấy gợi ý sản phẩm từ đâu?',
    a: 'Trợ lý đối chiếu trực tiếp với các gói sản phẩm đang bán trong cửa hàng theo ngành hàng, kênh bán và mức ngân sách bạn mô tả, giúp tránh gợi ý sai giá hoặc sai tên gói.',
  },
  {
    q: 'Quyền tải file trong 7 ngày và giới hạn 5 lượt tải hoạt động ra sao?',
    a: 'Sau khi đơn hàng chuyển sang trạng thái hoàn tất, hệ thống cấp cho mỗi gói một liên kết tải riêng tư. Bạn có thể vào mục Đơn hàng để tải lại tối đa 5 lần trong vòng 7 ngày kể từ lúc mua.',
  },
  {
    q: 'Làm sao xem thử giao diện trước khi mua trên màn hình Mobile 375px?',
    a: 'Tại trang chi tiết của từng Template Website, bạn bấm chuyển giữa chế độ Desktop 1280px và Mobile 375px ngay trong khung xem thử hoặc bấm Phóng to để soi từng phần tử trên màn hình điện thoại.',
  },
] as const;

const DIALOG_LIGHT_DISMISS = {
  closedby: 'any',
} as unknown as React.DialogHTMLAttributes<HTMLDialogElement>;

function ShowcaseThumbnail({
  product,
}: {
  product: ProductSummaryDto;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const src =
    product.thumbnail_url || DEFAULT_THUMBNAIL_BY_TYPE[product.product_type];

  if (!src || imgFailed) {
    return (
      <ProductPlaceholderFrame
        productType={product.product_type}
        industry={product.industry}
        sourceType={product.source_type}
        aspect="16/10"
        slug={product.slug}
      />
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={`Ảnh đại diện ${product.name} (${PRODUCT_TYPE_LABELS[product.product_type]})`}
      width={960}
      height={600}
      loading="lazy"
      className="dg-showcase-thumb-img"
      onError={() => setImgFailed(true)}
    />
  );
}

export function HomeLanding() {
  const { addItem } = useCart();
  const { assignment, scenarioState, activeVariant, track } = useExperiment();

  const heroSectionRef = useRef<HTMLElement | null>(null);
  const showcaseGridRef = useSpecularSpotlight<HTMLDivElement>();
  const featuresGridRef = useSpecularSpotlight<HTMLDivElement>();

  const [heroShowcaseType, setHeroShowcaseType] =
    useState<ProductType>('template');
  const [activeFilter, setActiveFilter] = useState<'' | ProductType>('');
  const [products, setProducts] = useState<ProductSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [previewScreen, setPreviewScreen] = useState<
    (typeof STOREFRONT_SCREENS)[number] | null
  >(null);
  const previewDialogRef = useRef<HTMLDialogElement | null>(null);

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
  const { ref: countResponsiveRef, displayValue: countResponsiveDisplay } =
    useCountUp(100, 1100, 0);

  const isInExperimentOff = Boolean(
    assignment?.consent_given &&
      scenarioState?.scenario_run_id &&
      !scenarioState.is_finished &&
      activeVariant === 'chatbot_off'
  );

  useEffect(() => {
    const cleanupReveal = initScrollReveals();
    return cleanupReveal;
  }, []);

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
      if (dialog.open && pressedOutside && isOutside(e)) dialog.close();
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

  const openScreenPreview = (item: (typeof STOREFRONT_SCREENS)[number]) => {
    setPreviewScreen(item);
    previewDialogRef.current?.showModal();
  };

  const scrollToSlide = useCallback(
    (index: number, announce = true) => {
      const track = carouselTrackRef.current;
      const wrapped =
        ((index % PILOT_FEEDBACK_CASES.length) + PILOT_FEEDBACK_CASES.length) %
        PILOT_FEEDBACK_CASES.length;
      setActiveSlide(wrapped);

      if (announce) {
        setSlideAnnouncement(
          `Trường hợp ${wrapped + 1} trên ${PILOT_FEEDBACK_CASES.length}: ${PILOT_FEEDBACK_CASES[wrapped].persona}`
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

  const handleQuickAddToCart = async (productId: string) => {
    if (addingId === productId) return;
    setAddingId(productId);
    const ok = await addItem(productId, 1);
    setAddingId(null);
    if (ok) {
      void track('add_to_cart', { product_id: productId });
      setAddedId(productId);
      setTimeout(() => {
        setAddedId((curr) => (curr === productId ? null : curr));
      }, 1800);
    }
  };

  return (
    <>
      {/* 1. Hero + 3D Mockup Stack + Typewriter (#hero) */}
      <section ref={heroSectionRef} className="dg-hero dg-dark-band" id="hero">
        <div className="container">
          <div className="dg-hero-grid">
            <div className="dg-hero-copy">
              <div className="dg-hero-badge">
                <span className="dg-dot" aria-hidden="true" />
                <span>
                  DÀNH CHO CHỦ SHOP 1–3 NGƯỜI • SHOPEE / TIKTOK / FACEBOOK
                </span>
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
                Kho Template Website tinh gọn, bộ Prompt Pack chốt đơn và
                Workflow tự động hóa minh bạch bản quyền — đi kèm Trợ lý tư vấn
                lọc đúng gói theo ngành hàng và ngân sách.
              </p>

              <div className="dg-hero-cta">
                <Link href="/products" className="dg-btn-purchase">
                  <span>Khám phá kho sản phẩm</span>
                  <ArrowRight size={17} />
                </Link>
                <Link href="/#showcase" className="dg-btn-outline">
                  <Play size={16} />
                  <span>Xem mẫu nổi bật</span>
                </Link>
              </div>

              <div className="dg-hero-trust-v2">
                <div className="dg-hero-trust-chip">
                  <LayoutDashboard size={16} />
                  <span>
                    <strong ref={countTypesRef}>{countTypesDisplay}</strong>{' '}
                    Nhóm giải pháp
                  </span>
                </div>
                <div className="dg-hero-trust-chip">
                  <Smartphone size={16} />
                  <span>
                    <strong ref={countResponsiveRef}>
                      {countResponsiveDisplay}%
                    </strong>{' '}
                    Chuẩn Mobile 375px
                  </span>
                </div>
                <div className="dg-hero-trust-chip">
                  <ShieldCheck size={16} />
                  <span>
                    <strong>Bản quyền 3 cấp</strong> rõ ràng
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
      </section>

      {/* 2. 6 Nhóm Giải Pháp & Ngành Hàng (#categories) */}
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
              Một Hệ Thống,{' '}
              <span className="dg-grad-text">Sáu Lựa Chọn Nhanh</span>
            </h2>
            <p>
              Chọn đúng loại công cụ số hoặc lọc thẳng theo ngành hàng của shop
              nhỏ 1–3 người đang bán trên Shopee, TikTok Shop và Facebook.
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
                  {card.image ? (
                    <div className="dg-framework-media">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={card.image}
                        alt={card.imageAlt ?? card.title}
                        width={960}
                        height={600}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className={`dg-framework-icon ${card.grad}`}>
                      <Icon size={26} />
                    </div>
                  )}
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

      {/* 3. PEAK: Showcase Gallery + Filter Tabs + GPU Spotlight (#showcase) */}
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
              Sản Phẩm Sẵn Sàng{' '}
              <span className="dg-grad-text">Triển Khai Ngay</span>
            </h2>
            <p>
              Lọc nhanh từng nhóm sản phẩm số kèm giá niêm yết VND, phân loại bản
              quyền minh bạch và nút thêm vào giỏ tức thì.
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
            <div ref={showcaseGridRef} className="dg-showcase-grid">
              {products.map((product) => {
                const sourceMeta = SOURCE_TYPE_META[product.source_type];
                const isAdding = addingId === product.id;
                const isAdded = addedId === product.id;

                return (
                  <article
                    key={product.id}
                    className="dg-showcase-card dg-panel dg-spotlight-card"
                  >
                    <div className="dg-showcase-img-wrap">
                      <ShowcaseThumbnail product={product} />
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
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <Link
                            href={`/products/${product.slug}`}
                            className="dg-btn-outline dg-btn-sm"
                          >
                            <span>Xem chi tiết</span>
                          </Link>
                          <button
                            type="button"
                            className="dg-btn-purchase dg-btn-sm"
                            disabled={isAdding}
                            onClick={() => void handleQuickAddToCart(product.id)}
                          >
                            <ShoppingBag size={14} />
                            <span>
                              {isAdded
                                ? 'Đã thêm'
                                : isAdding
                                  ? 'Đang thêm...'
                                  : 'Thêm vào giỏ'}
                            </span>
                          </button>
                        </div>
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

      {/* 4. 8 Lợi Ích Vận Hành Cho Shop Nhỏ (#features — Dark Band + Spotlight) */}
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
              <span>Lợi Ích Cho Chủ Shop</span>
            </div>
            <h2>
              Giải Pháp Thực Tiễn Cho{' '}
              <span className="dg-grad-text">Cửa Hàng 1–3 Người</span>
            </h2>
            <p>
              Tập trung vào những công cụ giúp shop bán nhanh hơn trên di động,
              giảm thời gian soạn nội dung và hạn chế sót đơn đa kênh.
            </p>
          </div>

          <div ref={featuresGridRef} className="dg-features-grid">
            {SHOP_BENEFITS.map((feat) => {
              const Icon = feat.icon;
              return (
                <article
                  key={feat.title}
                  className="dg-feature-card dg-panel dg-spotlight-card"
                >
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

      {/* 5. 12 Tiêu Chuẩn Nền Tảng (#stack) */}
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
                <ShieldCheck size={13} />
              </span>
              <span>Tiêu Chuẩn Triển Khai</span>
            </div>
            <h2>
              12 Cam Kết Chất Lượng{' '}
              <span className="dg-grad-text">Trên Từng Gói Số</span>
            </h2>
            <p>
              Mỗi sản phẩm trên DreamTeam đều được chuẩn hóa từ bố cục điện
              thoại 375px đến hướng dẫn cài đặt nhanh và link tải an toàn.
            </p>
          </div>

          <div className="dg-stack-grid">
            {QUALITY_STANDARDS.map((tile) => {
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

      {/* 6. Trải Nghiệm Màn Hình Mua Hàng (#pages) */}
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
              <span>Hành Trình Mua Sắm</span>
            </div>
            <h2>
              Trải Nghiệm Mượt Mà{' '}
              <span className="dg-grad-text">Từ Chọn Gói Đến Nhận File</span>
            </h2>
            <p>
              Xem nhanh 6 bước mua hàng thực tế trên DreamTeam: tìm theo ngành,
              xem thử 1280px ↔ 375px, giỏ hàng, xác nhận đơn và tải file ngay.
            </p>
          </div>

          <div className="dg-inner-pages-grid">
            {STOREFRONT_SCREENS.map((item) => (
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

      {/* 7. Phản Hồi Từ Đợt Chạy Thử Nghiệm Mẫu (#reviews) */}
      <section
        className="section-padding-lg editorial-reveal"
        id="reviews"
        aria-roledescription="carousel"
        aria-label="Phản hồi từ đợt chạy thử nghiệm mẫu"
      >
        <div className="container">
          <div className="dg-section-heading">
            <div className="dg-sub-heading">
              <span className="dg-sub-heading-icon">
                <MessageSquare size={13} />
              </span>
              <span>Phản Hồi Từ Đợt Chạy Thử Nghiệm Mẫu</span>
            </div>
            <h2>
              Các Trường Hợp{' '}
              <span className="dg-grad-text">Chủ Shop Thử Nghiệm Mẫu</span>
            </h2>
            <p>
              Tổng hợp trải nghiệm từ các chủ shop &amp; người dùng thử nghiệm
              mẫu quy mô 1–3 người theo từng ngành hàng; đây là phản hồi từ đợt
              chạy thử nghiệm mẫu, không phải đánh giá thương mại tự phát.
            </p>
          </div>

          <div className="dg-testi-controls-bar">
            <div
              className="dg-testi-dots"
              role="group"
              aria-label="Chọn trường hợp thử nghiệm"
            >
              {PILOT_FEEDBACK_CASES.map((card, idx) => (
                <button
                  key={card.persona}
                  type="button"
                  className="dg-testi-dot-btn"
                  aria-label={`Xem trường hợp ${idx + 1}: ${card.persona}`}
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
              aria-label="Trường hợp trước"
              onClick={() => scrollToSlide(activeSlide - 1)}
            >
              <ChevronLeft size={18} />
            </button>

            <div
              ref={carouselTrackRef}
              className="dg-scenario-track"
              tabIndex={0}
              role="group"
              aria-label="Danh sách phản hồi thử nghiệm mẫu"
            >
              {PILOT_FEEDBACK_CASES.map((card, idx) => (
                <article
                  key={card.persona}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${idx + 1} trên ${PILOT_FEEDBACK_CASES.length}: ${card.persona}`}
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
                    <span className="badge">Phản hồi từ đợt chạy thử nghiệm mẫu</span>
                    <Link
                      href={`/products?industry=${encodeURIComponent(card.industryFilter)}`}
                      className="dg-scenario-cta"
                    >
                      <span>{card.ctaLabel}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="dg-testi-nav-btn dg-testi-next"
              aria-label="Trường hợp tiếp theo"
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

      {/* 8. FAQ Accordion (#faqs) */}
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
              Giải Đáp Nhanh{' '}
              <span className="dg-grad-text">Trước Khi Chọn Gói</span>
            </h2>
            <p>
              Thông tin rõ ràng về cách sử dụng sau khi tải, bản quyền 3 cấp,
              xem thử Mobile 375px và chế độ đặt hàng thử nghiệm không thu tiền.
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
                <h3>Đi thẳng tới khu vực bạn cần</h3>
                <p>
                  Lối tắt nhanh tới danh mục sản phẩm số, tra cứu đơn hàng &amp;
                  kho link tải, giỏ hàng và tài khoản của bạn.
                </p>
              </div>
            </div>

            <div className="dg-faq-help-grid">
              <Link href="/products" className="dg-faq-help-tile">
                <div className="dg-faq-help-tile-icon grad-indigo">
                  <LayoutDashboard size={17} />
                </div>
                <h4>Kho sản phẩm</h4>
                <p>Lọc theo ngành hàng &amp; giá VND</p>
              </Link>

              <Link href="/orders" className="dg-faq-help-tile">
                <div className="dg-faq-help-tile-icon grad-cyan">
                  <Download size={17} />
                </div>
                <h4>Đơn hàng &amp; Link tải</h4>
                <p>Xem lại đơn và tải file trong 7 ngày</p>
              </Link>

              <Link href="/cart" className="dg-faq-help-tile">
                <div className="dg-faq-help-tile-icon grad-emerald">
                  <ShoppingBag size={17} />
                </div>
                <h4>Giỏ hàng của bạn</h4>
                <p>Kiểm tra gói đã chọn trước khi đặt</p>
              </Link>

              <Link href="/auth" className="dg-faq-help-tile">
                <div className="dg-faq-help-tile-icon grad-copper">
                  <Lock size={17} />
                </div>
                <h4>Tài khoản cửa hàng</h4>
                <p>Đăng nhập hoặc tạo tài khoản mới</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Dark CTA Strip (.dg-cta-dark) */}
      <section className="section-padding-lg editorial-reveal">
        <div className="container">
          <div className="dg-cta-dark dg-dark-band">
            <div className="dg-cta-dark-pattern" aria-hidden="true" />
            <div className="dg-cta-dark-grid">
              <div className="dg-cta-dark-copy">
                <span className="dg-cta-dark-badge">
                  <Rocket size={14} />
                  <span>Triển khai nhanh 15–30 phút</span>
                </span>
                <h2>
                  Sẵn sàng chọn bộ công cụ số phù hợp cho shop nhỏ của bạn?
                </h2>
                <p>
                  Xem thử trực tiếp giao diện trên máy tính 1280px và điện thoại
                  375px trước khi quyết định, hoặc nhờ Trợ lý tư vấn gợi ý theo
                  đúng ngân sách.
                </p>
                <div className="dg-hero-cta" style={{ marginBottom: 0 }}>
                  <Link href="/products" className="dg-btn-purchase">
                    <span>Khám phá toàn bộ sản phẩm</span>
                    <ArrowRight size={16} />
                  </Link>
                  {!isInExperimentOff ? (
                    <button
                      type="button"
                      className="dg-btn-outline"
                      onClick={() =>
                        window.dispatchEvent(new CustomEvent('dsa:open-chat'))
                      }
                    >
                      <MessageSquare size={15} />
                      <span>Mở Trợ lý tư vấn</span>
                    </button>
                  ) : (
                    <Link href="/products?sort=newest" className="dg-btn-outline">
                      <Play size={15} />
                      <span>Xem gói mới nhất</span>
                    </Link>
                  )}
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
        {...DIALOG_LIGHT_DISMISS}
      >
        {previewScreen && (
          <div className="dg-preview-dialog-body">
            <div className="dg-preview-dialog-head">
              <div>
                <span className="type-eyebrow">{previewScreen.category}</span>
                <h2
                  id="inner-preview-title"
                  className="type-h3"
                  style={{ margin: '4px 0 0' }}
                >
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
