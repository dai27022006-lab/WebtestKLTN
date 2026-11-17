'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  ArrowRight,
  Menu,
  Moon,
  ShoppingBag,
  Sun,
  User,
  X,
} from '@/components/icons/DreamIcons';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { DreamTeamBrandMark } from '@/components/visual/DreamTeamBrandMark';
import { useCart, useExperiment } from '@/state';

const NAV_ITEMS = [
  { href: '/', label: 'Trang chủ' },
  { href: '/products', label: 'Sản phẩm' },
  { href: '/orders', label: 'Đơn hàng' },
  { href: '/#faqs', label: 'Hỏi đáp' },
];

const DIALOG_LIGHT_DISMISS = {
  closedby: 'any',
} as unknown as React.DialogHTMLAttributes<HTMLDialogElement>;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, logoutUser } = useAuth();
  const { cart } = useCart();
  const { assignment, scenarioState, resetSession } = useExperiment();

  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCartPopping, setIsCartPopping] = useState(false);

  const mobileDialogRef = useRef<HTMLDialogElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const prevCartCountRef = useRef<number>(0);
  const cartHydratedRef = useRef<boolean>(false);

  const isAdminRoute = pathname.startsWith('/admin');
  const isExperimentRoute = pathname === '/experiment';

  // Fixed header scroll state + fallback for browsers without CSS scroll-driven animation-timeline
  useEffect(() => {
    if (typeof window === 'undefined' || isAdminRoute) return;

    const supportsScrollTimeline =
      typeof CSS !== 'undefined' &&
      CSS.supports('animation-timeline', 'scroll()');

    let rafId = 0;

    const syncScroll = () => {
      rafId = 0;
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolled(scrollY >= 24);

      if (!supportsScrollTimeline && progressBarRef.current) {
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        const ratio =
          maxScroll > 0 ? Math.max(0, Math.min(1, scrollY / maxScroll)) : 0;
        progressBarRef.current.style.transform = `scaleX(${ratio})`;
      }
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(syncScroll);
      }
    };

    syncScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isAdminRoute]);

  // Cart-pop micro-interaction when cart.item_count increases after initial load
  useEffect(() => {
    const settleTimer = setTimeout(() => {
      cartHydratedRef.current = true;
    }, 800);
    return () => clearTimeout(settleTimer);
  }, []);

  useEffect(() => {
    if (!cartHydratedRef.current) {
      if (cart.updated_at !== '') {
        cartHydratedRef.current = true;
        prevCartCountRef.current = cart.item_count;
      }
      return;
    }

    if (cart.item_count > prevCartCountRef.current) {
      prevCartCountRef.current = cart.item_count;
      const rafId = requestAnimationFrame(() => setIsCartPopping(true));
      const resetTimer = setTimeout(() => setIsCartPopping(false), 380);
      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(resetTimer);
      };
    }

    prevCartCountRef.current = cart.item_count;
  }, [cart.item_count, cart.updated_at]);

  // Native <dialog> light dismiss + sync aria-expanded state
  useEffect(() => {
    if (isAdminRoute || isExperimentRoute) return;
    const dialog = mobileDialogRef.current;
    if (!dialog) return;

    const onClose = () => setDrawerOpen(false);
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
      if (dialog.open && pressedOutside && isOutside(e)) {
        dialog.close();
      }
    };

    dialog.addEventListener('close', onClose);
    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);

    return () => {
      dialog.removeEventListener('close', onClose);
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, [isAdminRoute, isExperimentRoute]);

  if (isAdminRoute) {
    return null;
  }

  const openMobileMenu = () => {
    const dialog = mobileDialogRef.current;
    if (!dialog) return;
    if (!dialog.open) {
      dialog.showModal();
      setDrawerOpen(true);
    }
  };

  const closeMobileMenu = () => {
    mobileDialogRef.current?.close();
    setDrawerOpen(false);
  };

  const handleExitSurvey = () => {
    resetSession();
    router.push('/');
  };

  // Focus Mode Header on /experiment (zero P-code or variant leak)
  if (isExperimentRoute) {
    const stepLabel = assignment
      ? scenarioState?.is_finished
        ? 'Hoàn tất khảo sát'
        : `Nhiệm vụ ${scenarioState?.step_order ?? 1}/${scenarioState?.total_steps ?? 2}`
      : 'Chuẩn bị khảo sát';

    return (
      <header className={`dg-header ${isScrolled ? 'fixed' : ''}`}>
        <div
          ref={progressBarRef}
          className="dg-header-progress"
          aria-hidden="true"
        />
        <div className="container dg-header-inner">
          <div className="experiment-focus-bar">
            <div className="experiment-focus-meta">
              <Link
                href="/"
                className="brand-link"
                aria-label="Về trang chủ DreamTeam"
              >
                <DreamTeamBrandMark size={28} />
                <span className="brand-link__name">
                  Khảo sát Trải nghiệm Chọn Gói
                </span>
              </Link>
              <span className="badge badge--accent">{stepLabel}</span>
            </div>

            <div className="header-actions">
              <button
                type="button"
                className="icon-btn"
                onClick={toggleTheme}
                aria-label={
                  theme === 'light'
                    ? 'Chuyển sang giao diện Tối'
                    : 'Chuyển sang giao diện Sáng'
                }
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                <span className="desktop-only">
                  {theme === 'light' ? 'Tối' : 'Sáng'}
                </span>
              </button>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={handleExitSurvey}
              >
                Thoát khảo sát
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`dg-header ${isScrolled ? 'fixed' : ''}`}>
      <div
        ref={progressBarRef}
        className="dg-header-progress"
        aria-hidden="true"
      />
      <div className="container dg-header-inner">
        <div className="dg-header-row">
          <Link
            href="/"
            className="brand-link"
            aria-label="DreamTeam — Trang chủ"
          >
            <DreamTeamBrandMark
              size={32}
              showWordmark
              subtitle="Công cụ số cho shop nhỏ"
            />
          </Link>

          <nav className="dg-nav-desktop" aria-label="Điều hướng chính">
            <ul className="dg-nav">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : item.href.startsWith('/#')
                      ? false
                      : pathname.startsWith(item.href);
                return (
                  <li key={item.href} className={isActive ? 'active' : undefined}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="icon-btn dg-theme-btn"
              onClick={toggleTheme}
              aria-label={
                theme === 'light'
                  ? 'Chuyển sang giao diện Tối'
                  : 'Chuyển sang giao diện Sáng'
              }
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <Link
              href="/cart"
              className="icon-btn"
              aria-label={`Giỏ hàng (${cart.item_count} sản phẩm)`}
            >
              <ShoppingBag size={16} />
              <span className="dg-cart-label">Giỏ hàng</span>
              <span
                className={`cart-badge ${isCartPopping ? 'is-popping' : ''}`}
                onAnimationEnd={() => setIsCartPopping(false)}
              >
                {cart.item_count}
              </span>
            </Link>

            {user ? (
              <div className="dg-desktop-only dg-user-cluster">
                <Link
                  href="/auth"
                  className="dg-btn-outline dg-btn-sm"
                  aria-label={`Tài khoản: ${user.full_name ?? user.email}`}
                  title={user.full_name ?? user.email}
                >
                  <User size={15} />
                  <span className="dg-user-name">
                    {user.full_name ?? user.email}
                  </span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin/analytics"
                    className="btn btn--secondary btn--sm"
                  >
                    Quản trị
                  </Link>
                )}
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => void logoutUser()}
                >
                  Thoát
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="dg-btn-outline dg-btn-sm dg-desktop-only"
              >
                <User size={15} />
                <span>Tài khoản</span>
              </Link>
            )}

            <Link
              href="/products"
              className="dg-btn-purchase dg-btn-sm dg-desktop-only"
            >
              <span>{user ? 'Gói giải pháp' : 'Khám phá gói số'}</span>
            </Link>

            <button
              type="button"
              className="dg-mobile-toggle"
              onClick={openMobileMenu}
              aria-label="Mở menu điều hướng"
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-dialog"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      <dialog
        id="mobile-nav-dialog"
        ref={mobileDialogRef}
        className="nav-dialog"
        aria-labelledby="mobile-nav-title"
        {...DIALOG_LIGHT_DISMISS}
      >
        <div className="nav-dialog__head">
          <div id="mobile-nav-title">
            <DreamTeamBrandMark
              size={28}
              showWordmark
              subtitle="Công cụ số cho shop nhỏ"
            />
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={closeMobileMenu}
            aria-label="Đóng menu"
            autoFocus
          >
            <X size={18} />
          </button>
        </div>

        <nav className="nav-dialog__links" aria-label="Menu di động">
          <Link href="/" className="nav-dialog__link" onClick={closeMobileMenu}>
            <span>Trang chủ</span>
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/products"
            className="nav-dialog__link"
            onClick={closeMobileMenu}
          >
            <span>Sản phẩm</span>
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/orders"
            className="nav-dialog__link"
            onClick={closeMobileMenu}
          >
            <span>Đơn hàng</span>
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/cart"
            className="nav-dialog__link"
            onClick={closeMobileMenu}
          >
            <span>Giỏ hàng</span>
            <span className="cart-badge">{cart.item_count}</span>
          </Link>
          <Link
            href="/#faqs"
            className="nav-dialog__link"
            onClick={closeMobileMenu}
          >
            <span>Hỏi đáp &amp; Bản quyền</span>
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/auth"
            className="nav-dialog__link"
            onClick={closeMobileMenu}
          >
            <span>
              {user
                ? `Tài khoản: ${user.full_name ?? user.email}`
                : 'Đăng nhập / Đăng ký'}
            </span>
            <ArrowRight size={15} />
          </Link>
          {user?.role === 'admin' && (
            <Link
              href="/admin/analytics"
              className="nav-dialog__link"
              onClick={closeMobileMenu}
            >
              <span>Quản trị cửa hàng</span>
              <ArrowRight size={15} />
            </Link>
          )}
        </nav>

        <div className="nav-dialog__foot">
          <button
            type="button"
            className="btn btn--secondary btn--block"
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            <span>
              {theme === 'light'
                ? 'Chuyển sang Giao diện Tối'
                : 'Chuyển sang Giao diện Sáng'}
            </span>
          </button>

          {user && (
            <button
              type="button"
              className="btn btn--ghost btn--block"
              onClick={() => {
                void logoutUser();
                closeMobileMenu();
              }}
            >
              Đăng xuất
            </button>
          )}
        </div>
      </dialog>
    </header>
  );
}
