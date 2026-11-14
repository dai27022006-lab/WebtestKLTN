'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useAuth } from '@/components/providers/AuthProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { BrandMark } from '@/components/visual/BrandMark';
import { useCart, useExperiment } from '@/state';

export function SiteHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logoutUser } = useAuth();
  const { cart } = useCart();
  const { assignment, scenarioState, activeVariant } = useExperiment();
  const mobileDialogRef = useRef<HTMLDialogElement | null>(null);

  const isExperimentRoute = pathname === '/experiment';

  useEffect(() => {
    const dialog = mobileDialogRef.current;
    if (!dialog) return;
    if (!('closedBy' in HTMLDialogElement.prototype)) {
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
      dialog.addEventListener('pointerdown', onDown);
      dialog.addEventListener('pointerup', onUp);
      return () => {
        dialog.removeEventListener('pointerdown', onDown);
        dialog.removeEventListener('pointerup', onUp);
      };
    }
    return undefined;
  }, []);

  const openMobileMenu = () => {
    mobileDialogRef.current?.showModal();
  };

  const closeMobileMenu = () => {
    mobileDialogRef.current?.close();
  };

  if (isExperimentRoute && assignment) {
    const stepLabel = scenarioState?.is_finished
      ? 'Hoàn tất'
      : `Lượt ${scenarioState?.step_order ?? 1}/${scenarioState?.total_steps ?? 2}`;

    return (
      <header className="site-header">
        <div className="container site-header__inner">
          <div className="experiment-focus-bar">
            <div className="experiment-focus-meta">
              <Link href="/" className="brand-link" aria-label="Về trang chủ">
                <BrandMark size={24} />
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
                aria-label="Đổi giao diện Sáng/Tối"
                title={theme === 'light' ? 'Chuyển sang giao diện Tối' : 'Chuyển sang giao diện Sáng'}
              >
                {theme === 'light' ? 'Tối' : 'Sáng'}
              </button>
              <Link href="/products" className="btn btn--ghost btn--sm">
                Danh mục
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  const navItems = [
    { href: '/products', label: 'Sản phẩm' },
    { href: '/experiment', label: 'Thí nghiệm F11' },
    { href: '/admin/analytics', label: 'Phân tích Admin' },
  ];

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="brand-link">
          <BrandMark />
          <span className="brand-link__text">
            <span className="brand-link__name">Tiệm Số Thực Chiến</span>
            <span className="brand-link__sub">Digital Store Advisor</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Điều hướng chính">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="site-nav__link"
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label="Đổi giao diện Sáng/Tối"
            title={theme === 'light' ? 'Chuyển sang giao diện Tối' : 'Chuyển sang giao diện Sáng'}
          >
            <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
            <span className="desktop-only">
              {theme === 'light' ? 'Tối' : 'Sáng'}
            </span>
          </button>

          <Link
            href="/cart"
            className="icon-btn"
            aria-label={`Giỏ hàng (${cart.item_count} sản phẩm)`}
          >
            <span>Giỏ hàng</span>
            <span className="cart-badge">{cart.item_count}</span>
          </Link>

          {user ? (
            <div className="desktop-only" style={{ gap: '8px', alignItems: 'center' }}>
              <Link href="/auth" className="btn btn--ghost btn--sm">
                {user.full_name ?? user.email}
              </Link>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => void logoutUser()}
              >
                Thoát
              </button>
            </div>
          ) : (
            <Link href="/auth" className="btn btn--primary btn--sm desktop-only">
              Tài khoản
            </Link>
          )}

          <button
            type="button"
            className="icon-btn mobile-menu-btn"
            onClick={openMobileMenu}
            aria-label="Mở menu điều hướng"
          >
            Menu
          </button>
        </div>
      </div>

      <dialog
        ref={mobileDialogRef}
        className="nav-dialog"
        aria-labelledby="mobile-nav-title"
      >
        <div className="nav-dialog__head">
          <strong id="mobile-nav-title">Điều hướng</strong>
          <button
            type="button"
            className="icon-btn"
            onClick={closeMobileMenu}
            aria-label="Đóng menu"
          >
            Đóng
          </button>
        </div>

        <nav className="nav-dialog__links" aria-label="Menu di động">
          <Link href="/" className="nav-dialog__link" onClick={closeMobileMenu}>
            <span>Trang chủ</span>
            <span className="type-caption">/</span>
          </Link>
          <Link
            href="/products"
            className="nav-dialog__link"
            onClick={closeMobileMenu}
          >
            <span>Danh mục gói số</span>
            <span className="type-caption">F2</span>
          </Link>
          <Link
            href="/experiment"
            className="nav-dialog__link"
            onClick={closeMobileMenu}
          >
            <span>Thí nghiệm A/B (F11)</span>
            <span className="type-caption">~5 phút</span>
          </Link>
          <Link
            href="/cart"
            className="nav-dialog__link"
            onClick={closeMobileMenu}
          >
            <span>Giỏ hàng & Sandbox</span>
            <span className="cart-badge">{cart.item_count}</span>
          </Link>
          <Link
            href="/admin/analytics"
            className="nav-dialog__link"
            onClick={closeMobileMenu}
          >
            <span>Phân tích Admin</span>
            <span className="type-caption">F10</span>
          </Link>
          <Link
            href="/auth"
            className="nav-dialog__link"
            onClick={closeMobileMenu}
          >
            <span>{user ? `Tài khoản: ${user.full_name ?? user.email}` : 'Đăng nhập / Demo'}</span>
            <span className="type-caption">F1</span>
          </Link>
        </nav>

        {user && (
          <button
            type="button"
            className="btn btn--secondary btn--block"
            onClick={() => {
              void logoutUser();
              closeMobileMenu();
            }}
          >
            Đăng xuất
          </button>
        )}
      </dialog>
    </header>
  );
}
