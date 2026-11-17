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
import { useAuth } from '@/components/providers/AuthProvider';
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
  return (
    <nav className="admin-sidebar__nav" aria-label="Điều hướng khu vực quản trị">
      {ADMIN_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-sidebar__link ${isActive ? 'is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={onNavigate}
          >
            <Icon size={17} />
            <span>{item.label}</span>
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
            {fullName ?? 'Quản trị viên'}
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
            ? 'Đổi Giao diện Tối'
            : 'Đổi Giao diện Sáng'}
        </span>
      </button>

      <Link
        href="/"
        className="btn btn--ghost btn--sm btn--block"
        style={{ justifyContent: 'space-between' }}
        onClick={onNavigate}
      >
        <span>Xem Mặt tiền Cửa hàng</span>
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
        Đăng xuất
      </button>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: isAuthLoading, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
            <span className="badge badge--warning" style={{ width: 'fit-content' }}>
              <Lock size={13} />
              <span>Khu vực Bảo vệ • Chỉ dành cho Quản trị viên</span>
            </span>
            <h1 className="type-h2" style={{ margin: 0 }}>
              Yêu cầu đăng nhập tài khoản Quản trị
            </h1>
            <p className="type-body-sm" style={{ margin: 0 }}>
              Không gian điều hành <code className="type-mono">/admin/*</code>{' '}
              (phân tích A/B, CRUD sản phẩm, đơn hàng và nhật ký Trợ lý AI) chỉ
              mở cho tài khoản có quyền quản trị viên.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <Link href="/auth" className="dg-btn-purchase">
                <span>Đi tới trang Đăng nhập</span>
                <ArrowRight size={15} />
              </Link>
              <Link href="/" className="btn btn--secondary">
                <span>Xem Mặt tiền Cửa hàng</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const activeNav =
    ADMIN_NAV_ITEMS.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    ) ?? ADMIN_NAV_ITEMS[0];

  return (
    <div className="admin-shell">
      {/* Desktop Sticky Sidebar */}
      <aside className="admin-sidebar" aria-label="Thanh bên quản trị">
        <div className="admin-sidebar__brand">
          <Link href="/admin/analytics" aria-label="DreamTeam Admin">
            <DreamTeamBrandMark
              size={30}
              showWordmark
              subtitle="Buồng điều hành"
            />
          </Link>
          <span className="badge badge--accent type-mono">Admin</span>
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
              aria-label="Mở menu điều hướng quản trị"
              aria-expanded={drawerOpen}
              aria-controls="admin-mobile-drawer"
            >
              <Menu size={18} />
            </button>

            <div style={{ display: 'grid', gap: '2px' }}>
              <span className="type-caption" style={{ fontWeight: 700 }}>
                DreamTeam Admin • {activeNav.label}
              </span>
              <span className="type-caption">{activeNav.description}</span>
            </div>
          </div>

          <div className="admin-topbar__right">
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
            </button>
            <Link href="/" className="btn btn--secondary btn--sm">
              <span>Xem Mặt tiền Cửa hàng</span>
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
              subtitle="Buồng điều hành"
            />
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={closeMobileDrawer}
            aria-label="Đóng menu quản trị"
            autoFocus
          >
            <X size={18} />
          </button>
        </div>

        <div className="admin-drawer__body">
          <AdminNavLinks pathname={pathname} onNavigate={closeMobileDrawer} />
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
