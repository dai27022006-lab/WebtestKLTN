'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  ArrowRight,
  Menu,
  Moon,
  ShoppingBag,
  Sparkles,
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
  { href: '/experiment', label: 'Thí nghiệm F11' },
  { href: '/admin/analytics', label: 'Phân tích Admin' },
  { href: '/#faqs', label: 'Hỏi đáp' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logoutUser } = useAuth();
  const { cart } = useCart();
  const { assignment, scenarioState, activeVariant } = useExperiment();

  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mobileDialogRef = useRef<HTMLDialogElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const isExperimentRoute = pathname === '/experiment';

  // Fixed header scroll state + fallback for browsers without CSS scroll-driven animation-timeline
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const supportsScrollTimeline =
      typeof CSS !== 'undefined' &&
      CSS.supports('animation-timeline', 'scroll()');

    let rafId = 0;

    const syncScroll = () => {
      rafId = 0;
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolled(scrollY >= 32);

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
  }, []);

  // Native <dialog> light dismiss + sync aria-expanded state
  useEffect(() => {
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
      if (pressedOutside && isOutside(e)) {
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
  }, []);

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

  // Focus Mode Header when inside /experiment with an active assignment
  if (isExperimentRoute && assignment) {
    const stepLabel = scenarioState?.is_finished
      ? 'Hoàn tất'
      : `Lượt ${scenarioState?.step_order ?? 1}/${scenarioState?.total_steps ?? 2}`;

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
                <span className="brand-link__name">Thí nghiệm F11</span>
              </Link>
              <span className="badge type-mono">{assignment.participant_code}</span>
              <span className="badge badge--accent">{stepLabel}</span>
              <span
                className={`badge ${
                  activeVariant === 'chatbot_on' ? 'badge--success' : 'badge--info'
                }`}
              >
                {activeVariant === 'chatbot_on'
                  ? 'Có trợ lý ảo'
                  : 'Không trợ lý ảo'}
              </span>
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
                title={
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
              <Link href="/products" className="btn btn--secondary btn--sm">
                Danh mục
              </Link>
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
              subtitle="Cửa hàng số & RAG"
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
              title={
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
              <span className="cart-badge">{cart.item_count}</span>
            </Link>

            {user ? (
              <div className="dg-desktop-only dg-user-cluster">
                <Link href="/auth" className="dg-btn-outline dg-btn-sm">
                  <User size={15} />
                  <span>{user.full_name ?? user.email}</span>
                </Link>
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
              href="/experiment"
              className="dg-btn-purchase dg-btn-sm dg-desktop-only"
            >
              <Sparkles size={15} />
              <span>Thử F11</span>
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
      >
        <div className="nav-dialog__head">
          <div id="mobile-nav-title">
            <DreamTeamBrandMark size={28} showWordmark />
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
            <span>Trang chủ DreamTeam</span>
            <span className="type-caption">/</span>
          </Link>
          <Link
            href="/products"
            className="nav-dialog__link"
            onClick={closeMobileMenu}
          >
            <span>Danh mục gói số (F2)</span>
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/experiment"
            className="nav-dialog__link"
            onClick={closeMobileMenu}
          >
            <span>Thí nghiệm A/B (F11)</span>
            <span className="badge badge--accent">~5 phút</span>
          </Link>
          <Link
            href="/cart"
            className="nav-dialog__link"
            onClick={closeMobileMenu}
          >
            <span>Giỏ hàng &amp; Sandbox</span>
            <span className="cart-badge">{cart.item_count}</span>
          </Link>
          <Link
            href="/admin/analytics"
            className="nav-dialog__link"
            onClick={closeMobileMenu}
          >
            <span>Phân tích Admin (F10)</span>
            <ArrowRight size={15} />
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
                : 'Đăng nhập / Demo (F1)'}
            </span>
            <ArrowRight size={15} />
          </Link>
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
                ? 'Chuyển sang Dark Mode'
                : 'Chuyển sang Light Mode'}
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
