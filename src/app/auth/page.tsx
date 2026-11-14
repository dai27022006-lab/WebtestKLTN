'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/components/providers/AuthProvider';
import { login, register } from '@/services';

export default function AuthPage() {
  const router = useRouter();
  const { user, setUserDirect, logoutUser } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [shopCategory, setShopCategory] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    if (tab === 'login') {
      const res = await login({ email: email.trim(), password });
      setIsSubmitting(false);
      if (!res.ok) {
        setErrorMessage(res.error.message);
        return;
      }
      setUserDirect(res.data.user);
      if (res.data.user.role === 'admin') {
        router.push('/admin/analytics');
      } else {
        router.push('/products');
      }
      return;
    }

    const res = await register({
      email: email.trim(),
      password,
      full_name: fullName.trim(),
      shop_category: shopCategory.trim() || undefined,
    });
    setIsSubmitting(false);
    if (!res.ok) {
      setErrorMessage(res.error.message);
      return;
    }
    setUserDirect(res.data.user);
    router.push('/products');
  };

  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setTab('login');
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage(null);
  };

  return (
    <section className="section section--compact">
      <div
        className="container"
        style={{ maxWidth: '480px', display: 'grid', gap: '20px' }}
      >
        <div className="callout callout--info">
          <strong>Tham gia thí nghiệm F11 không cần tạo tài khoản</strong>
          <span>
            Người tham gia khảo sát A/B chỉ cần xác nhận đồng ý ẩn danh là có
            thể làm bài ngay.{' '}
            <Link
              href="/experiment"
              style={{ textDecoration: 'underline', fontWeight: 600 }}
            >
              Mở trang Thí nghiệm F11 →
            </Link>
          </span>
        </div>

        {user ? (
          <div className="surface-card" style={{ display: 'grid', gap: '14px' }}>
            <span className="type-eyebrow">Phiên đăng nhập hiện tại</span>
            <h1 className="type-h2" style={{ margin: 0 }}>
              {user.full_name ?? user.email}
            </h1>
            <div className="chip-row">
              <span className="badge type-mono">{user.email}</span>
              <span className="badge badge--accent">
                Vai trò: {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
              </span>
              {user.shop_category && (
                <span className="badge">Ngành: {user.shop_category}</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '8px' }}>
              {user.role === 'admin' && (
                <Link href="/admin/analytics" className="btn btn--primary">
                  Mở Dashboard Admin
                </Link>
              )}
              <Link href="/products" className="btn btn--secondary">
                Xem danh mục
              </Link>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => void logoutUser()}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        ) : (
          <div className="surface-card" style={{ display: 'grid', gap: '20px' }}>
            <div
              role="tablist"
              aria-label="Chọn đăng nhập hoặc đăng ký"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'login'}
                className={`chip ${tab === 'login' ? 'chip--active' : ''}`}
                style={{ justifyContent: 'center' }}
                onClick={() => {
                  setTab('login');
                  setErrorMessage(null);
                }}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'register'}
                className={`chip ${tab === 'register' ? 'chip--active' : ''}`}
                style={{ justifyContent: 'center' }}
                onClick={() => {
                  setTab('register');
                  setErrorMessage(null);
                }}
              >
                Đăng ký
              </button>
            </div>

            <form
              onSubmit={(e) => void handleSubmit(e)}
              style={{ display: 'grid', gap: '14px' }}
            >
              {tab === 'register' && (
                <div className="field">
                  <label htmlFor="auth-fullname" className="field__label">
                    Họ và tên / Tên shop
                  </label>
                  <input
                    id="auth-fullname"
                    type="text"
                    className="input"
                    required
                    minLength={2}
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Lan Anh"
                  />
                  <span className="field__error">
                    Vui lòng nhập họ tên tối thiểu 2 ký tự.
                  </span>
                </div>
              )}

              <div className="field">
                <label htmlFor="auth-email" className="field__label">
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  className="input"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@digitalstore.local"
                />
                <span className="field__error">
                  Vui lòng nhập đúng định dạng email.
                </span>
              </div>

              <div className="field">
                <label htmlFor="auth-password" className="field__label">
                  Mật khẩu
                </label>
                <input
                  id="auth-password"
                  type="password"
                  className="input"
                  required
                  minLength={tab === 'register' ? 8 : 6}
                  autoComplete={
                    tab === 'login' ? 'current-password' : 'new-password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    tab === 'register'
                      ? 'Tối thiểu 8 ký tự'
                      : 'Tối thiểu 6 ký tự'
                  }
                />
                <span className="field__error">
                  {tab === 'register'
                    ? 'Mật khẩu đăng ký cần tối thiểu 8 ký tự.'
                    : 'Mật khẩu cần tối thiểu 6 ký tự.'}
                </span>
              </div>

              {tab === 'register' && (
                <div className="field">
                  <label htmlFor="auth-shop-cat" className="field__label">
                    Ngành hàng của shop (tùy chọn)
                  </label>
                  <input
                    id="auth-shop-cat"
                    type="text"
                    className="input"
                    value={shopCategory}
                    onChange={(e) => setShopCategory(e.target.value)}
                    placeholder="Mỹ phẩm, Thời trang, F&B..."
                  />
                </div>
              )}

              {errorMessage && (
                <div className="callout callout--danger" role="alert">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="btn btn--primary btn--lg btn--block"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Đang xác thực...'
                  : tab === 'login'
                    ? 'Đăng nhập'
                    : 'Tạo tài khoản'}
              </button>
            </form>
          </div>
        )}

        {/* Dev Store Demo Accounts Box */}
        <div className="surface-card" style={{ display: 'grid', gap: '12px' }}>
          <span className="type-eyebrow">Tài khoản Demo (Dev Store)</span>
          <p className="type-body-sm" style={{ margin: 0 }}>
            Dùng nhanh để kiểm thử luồng khách hàng hoặc quyền quản trị viên
            xem số liệu A/B tại <code className="type-mono">/admin/analytics</code>:
          </p>

          <div style={{ display: 'grid', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <div className="type-caption type-mono">
                demo@digitalstore.local / Demo1234!
              </div>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() =>
                  fillDemoAccount('demo@digitalstore.local', 'Demo1234!')
                }
              >
                Điền nhanh Khách
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <div className="type-caption type-mono">
                admin@digitalstore.local / Admin1234!
              </div>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() =>
                  fillDemoAccount('admin@digitalstore.local', 'Admin1234!')
                }
              >
                Điền nhanh Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
