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
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { DreamTeamBrandMark } from '@/components/visual/DreamTeamBrandMark';
import { useCart, useExperiment } from '@/state';

const DIALOG_LIGHT_DISMISS = {
  closedby: 'any',
} as unknown as React.DialogHTMLAttributes<HTMLDialogElement>;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { chrome } = useLocale();
  const { user, logoutUser } = useAuth();
  const { cart } = useCart();
  const { assignment, scenarioState, resetSession } = useExperiment();

  const navItems = [
    { href: '/', label: chrome.common.home },
    { href: '/products', label: chrome.common.products },
    { href: '/orders', label: chrome.common.orders },
    { href: '/#faqs', label: chrome.common.faq },
  ];

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
    return (
      <a href="#main-content" className="skip-link">
        {chrome.common.skipToContent}
      </a>
    );
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
        ? chrome.header.expDone
        : chrome.header.expStep(
            scenarioState?.step_order ?? 1,
            scenarioState?.total_steps ?? 2
          )
      : chrome.header.expPrep;

    return (
      <>
        <a href="#main-content" className="skip-link">
          {chrome.common.skipToContent}
        </a>
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
                  aria-label={`DreamTeam — ${chrome.common.home}`}
                >
                  <DreamTeamBrandMark size={28} />
                  <span className="brand-link__name">
                    {chrome.header.expTitle}
                  </span>
                </Link>
                <span className="badge badge--accent">{stepLabel}</span>
              </div>

              <div className="header-actions">
                <LanguageSwitcher />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={toggleTheme}
                  aria-label={
                    theme === 'light'
                      ? chrome.common.switchToDark
                      : chrome.common.switchToLight
                  }
                >
                  {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  <span className="desktop-only">
                    {theme === 'light'
                      ? chrome.common.shortDark
                      : chrome.common.shortLight}
                  </span>
                </button>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={handleExitSurvey}
                >
                  {chrome.header.expExit}
                </button>
              </div>
            </div>
          </div>
        </header>
      </>
    );
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        {chrome.common.skipToContent}
      </a>
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
              aria-label={`DreamTeam — ${chrome.common.home}`}
            >
              <DreamTeamBrandMark
                size={32}
                showWordmark
                subtitle={chrome.common.brandSubtitle}
              />
            </Link>

            <nav className="dg-nav-desktop" aria-label={chrome.header.navAria}>
              <ul className="dg-nav">
                {navItems.map((item) => {
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
              <LanguageSwitcher />
              <button
                type="button"
                className="icon-btn dg-theme-btn"
                onClick={toggleTheme}
                aria-label={
                  theme === 'light'
                    ? chrome.common.switchToDark
                    : chrome.common.switchToLight
                }
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              <Link
                href="/cart"
                className="icon-btn"
                aria-label={chrome.header.cartCountAria(cart.item_count)}
              >
                <ShoppingBag size={16} />
                <span className="dg-cart-label">{chrome.common.cart}</span>
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
                    aria-label={`${chrome.header.accountPrefix}: ${user.full_name ?? user.email}`}
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
                      {chrome.common.admin}
                    </Link>
                  )}
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => void logoutUser()}
                  >
                    {chrome.common.exit}
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="dg-btn-outline dg-btn-sm dg-desktop-only"
                >
                  <User size={15} />
                  <span>{chrome.common.account}</span>
                </Link>
              )}

              <Link
                href="/products"
                className="dg-btn-purchase dg-btn-sm dg-desktop-only"
              >
                <span>
                  {user
                    ? chrome.common.solutions
                    : chrome.common.explorePackages}
                </span>
              </Link>

              <button
                type="button"
                className="dg-mobile-toggle"
                onClick={openMobileMenu}
                aria-label={chrome.header.mobileMenuOpen}
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
                subtitle={chrome.common.brandSubtitle}
              />
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={closeMobileMenu}
              aria-label={chrome.header.mobileMenuClose}
              autoFocus
            >
              <X size={18} />
            </button>
          </div>

          <nav className="nav-dialog__links" aria-label={chrome.header.mobileNavAria}>
            <Link href="/" className="nav-dialog__link" onClick={closeMobileMenu}>
              <span>{chrome.common.home}</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/products"
              className="nav-dialog__link"
              onClick={closeMobileMenu}
            >
              <span>{chrome.common.products}</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/orders"
              className="nav-dialog__link"
              onClick={closeMobileMenu}
            >
              <span>{chrome.common.orders}</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/cart"
              className="nav-dialog__link"
              onClick={closeMobileMenu}
            >
              <span>{chrome.common.cart}</span>
              <span className="cart-badge">{cart.item_count}</span>
            </Link>
            <Link
              href="/#faqs"
              className="nav-dialog__link"
              onClick={closeMobileMenu}
            >
              <span>{chrome.header.faqAndLicense}</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/auth"
              className="nav-dialog__link"
              onClick={closeMobileMenu}
            >
              <span>
                {user
                  ? `${chrome.header.accountPrefix}: ${user.full_name ?? user.email}`
                  : chrome.header.loginOrRegister}
              </span>
              <ArrowRight size={15} />
            </Link>
            {user?.role === 'admin' && (
              <Link
                href="/admin/analytics"
                className="nav-dialog__link"
                onClick={closeMobileMenu}
              >
                <span>{chrome.header.storeAdmin}</span>
                <ArrowRight size={15} />
              </Link>
            )}
          </nav>

          <div className="nav-dialog__foot">
            <LanguageSwitcher variant="inline" onSelectLocale={closeMobileMenu} />

            <button
              type="button"
              className="btn btn--secondary btn--block"
              onClick={toggleTheme}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              <span>
                {theme === 'light'
                  ? chrome.common.switchToDark
                  : chrome.common.switchToLight}
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
                {chrome.common.logout}
              </button>
            )}
          </div>
        </dialog>
      </header>
    </>
  );
}
