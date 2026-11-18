'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  LayoutDashboard,
  Lock,
  Menu,
  MessageSquare,
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

const ADMIN_NAV_ITEMS = [
  {
    href: '/admin/analytics',
    label: 'Phân tích chuyển đổi',
    description: 'KPI A/B, Phễu 14 sự kiện & Xuất dữ liệu',
    icon: BarChart3,
  },
  {
    href: '/admin/products',
    label: 'Quản lý sản phẩm',
    description: 'CRUD gói số, ảnh & gắn Live HTML Demo',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/orders',
    label: 'Quản lý đơn hàng',
    description: 'Đơn Sandbox & Quyền tải file 7 ngày',
    icon: ShoppingBag,
  },
  {
    href: '/admin/chat-logs',
    label: 'Nhật ký Trợ lý AI',
    description: 'Kiểm định Grounding, Model & Chi phí',
    icon: MessageSquare,
  },
] as const;

const DIALOG_LIGHT_DISMISS = {
  closedby: 'any',
} as unknown as React.DialogHTMLAttributes<HTMLDialogElement>;

interface AdminNavLinksProps {
  pathname: string;
  onNavigate?: () => void;
}

function AdminNavLinks({ pathname, onNavigate }: AdminNavLinksProps) {
  const { admin } = useLocale();
  const shellCopy = admin.shell;
  return (
    <nav className="admin-sidebar__nav" aria-label={shellCopy.navAria}>
      {ADMIN_NAV_ITEMS.map((item, idx) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const navText = shellCopy.navItems[idx]?.label ?? item.label;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-sidebar__link ${isActive ? 'is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={onNavigate}
          >
            <Icon size={17} />
            <span>{navText}</span>
          </Link>
        );
      })}
    </nav>
  );
}

interface AdminSidebarFooterProps {
  fullName: string | null;
  email: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNavigate?: () => void;
  onLogout: () => void;
}

function AdminSidebarFooter({
  fullName,
  email,
  theme,
  onToggleTheme,
  onNavigate,
  onLogout,
}: AdminSidebarFooterProps) {
  const { admin, chrome } = useLocale();
  const shellCopy = admin.shell;
  const commonCopy = chrome.common;
  return (
    <div className="admin-sidebar__foot">
      <div
        style={{
          display: 'grid',
          gap: '4px',
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-hairline)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--ink)',
          }}
        >
          <User size={14} />
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {fullName ?? shellCopy.fallbackName}
          </span>
        </div>
        <span
          className="type-caption type-mono"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {email}
        </span>
      </div>

      <button
        type="button"
        className="btn btn--secondary btn--sm btn--block"
        onClick={onToggleTheme}
        style={{ justifyContent: 'flex-start' }}
      >
        {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        <span>
          {theme === 'light'
            ? commonCopy.switchToDark
            : commonCopy.switchToLight}
        </span>
      </button>

      <Link
        href="/"
        className="btn btn--ghost btn--sm btn--block"
        style={{ justifyContent: 'space-between' }}
        onClick={onNavigate}
      >
        <span>{shellCopy.viewStorefront}</span>
        <ArrowUpRight size={14} />
      </Link>

      <button
        type="button"
        className="btn btn--ghost btn--sm btn--block"
        style={{
          justifyContent: 'flex-start',
          color: 'var(--status-danger)',
        }}
        onClick={onLogout}
      >
        {commonCopy.logout}
      </button>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: isAuthLoading, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { admin, chrome } = useLocale();
  const shellCopy = admin.shell;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const mobileDrawerRef = useRef<HTMLDialogElement | null>(null);

  const isAuthorized = Boolean(!isAuthLoading && user && user.role === 'admin');

  useEffect(() => {
    if (!isAuthorized) return;
    const dialog = mobileDrawerRef.current;
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
  }, [isAuthorized]);

  const openMobileDrawer = () => {
    const dialog = mobileDrawerRef.current;
    if (!dialog) return;
    if (!dialog.open) {
      dialog.showModal();
      setDrawerOpen(true);
    }
  };

  const closeMobileDrawer = () => {
    mobileDrawerRef.current?.close();
    setDrawerOpen(false);
  };

  const handleLogout = async () => {
    closeMobileDrawer();
    await logoutUser();
    router.push('/auth');
  };

  if (isAuthLoading) {
    return (
      <section className="section section--compact">
        <div className="container" style={{ display: 'grid', gap: '16px' }}>
          <div className="skeleton-box" style={{ height: '72px' }} />
          <div className="skeleton-box" style={{ height: '320px' }} />
        </div>
      </section>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <section className="section section--compact">
        <div className="container container--narrow">
          <div
            className="surface-card dg-panel"
            style={{ display: 'grid', gap: '16px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge--warning" style={{ width: 'fit-content' }}>
                <Lock size={13} />
                <span>{shellCopy.adminBadge}</span>
              </span>
              <LanguageSwitcher />
            </div>
            <h1 className="type-h2" style={{ margin: 0 }}>
              {shellCopy.deniedTitle}
            </h1>
            <p className="type-body-sm" style={{ margin: 0 }}>
              {user ? shellCopy.deniedDescNotAdmin : shellCopy.deniedDescLoggedOut}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <Link href="/auth" className="dg-btn-purchase">
                <span>{shellCopy.deniedLoginBtn}</span>
                <ArrowRight size={15} />
              </Link>
              <Link href="/" className="btn btn--secondary">
                <span>{shellCopy.deniedBackStoreBtn}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const activeIdx = Math.max(
    0,
    ADMIN_NAV_ITEMS.findIndex(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    )
  );
  const activeNavCopy = shellCopy.navItems[activeIdx] ?? shellCopy.navItems[0];

  return (
    <div className="admin-shell">
      {/* Desktop Sticky Sidebar */}
      <aside className="admin-sidebar" aria-label={shellCopy.navAria}>
        <div className="admin-sidebar__brand">
          <Link href="/admin/analytics" aria-label={shellCopy.topbarTitle}>
            <DreamTeamBrandMark
              size={30}
              showWordmark
              subtitle={shellCopy.sidebarSubtitle}
            />
          </Link>
          <span className="badge badge--accent type-mono">{shellCopy.adminBadge}</span>
        </div>

        <AdminNavLinks pathname={pathname} />
        <AdminSidebarFooter
          fullName={user.full_name}
          email={user.email}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={() => void handleLogout()}
        />
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <button
              type="button"
              className="icon-btn admin-mobile-menu-btn"
              onClick={openMobileDrawer}
              aria-label={shellCopy.openDrawerAria}
              aria-expanded={drawerOpen}
              aria-controls="admin-mobile-drawer"
            >
              <Menu size={18} />
            </button>

            <div style={{ display: 'grid', gap: '2px' }}>
              <span className="type-caption" style={{ fontWeight: 700 }}>
                {shellCopy.topbarTitle} • {activeNavCopy.label}
              </span>
              <span className="type-caption">{activeNavCopy.description}</span>
            </div>
          </div>

          <div className="admin-topbar__right">
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
            </button>
            <Link href="/" className="btn btn--secondary btn--sm">
              <span>{shellCopy.viewStorefront}</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </div>

      {/* Mobile Left Navigation Drawer */}
      <dialog
        id="admin-mobile-drawer"
        ref={mobileDrawerRef}
        className="admin-drawer admin-drawer--left"
        aria-labelledby="admin-mobile-drawer-title"
        {...DIALOG_LIGHT_DISMISS}
      >
        <div className="admin-drawer__head">
          <div id="admin-mobile-drawer-title">
            <DreamTeamBrandMark
              size={28}
              showWordmark
              subtitle={shellCopy.sidebarSubtitle}
            />
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={closeMobileDrawer}
            aria-label={shellCopy.closeDrawerAria}
            autoFocus
          >
            <X size={18} />
          </button>
        </div>

        <div className="admin-drawer__body">
          <AdminNavLinks pathname={pathname} onNavigate={closeMobileDrawer} />
          <LanguageSwitcher variant="inline" onSelectLocale={closeMobileDrawer} />
          <AdminSidebarFooter
            fullName={user.full_name}
            email={user.email}
            theme={theme}
            onToggleTheme={toggleTheme}
            onNavigate={closeMobileDrawer}
            onLogout={() => void handleLogout()}
          />
        </div>
      </dialog>
    </div>
  );
}
