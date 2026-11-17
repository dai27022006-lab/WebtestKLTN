'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Timer,
  User,
} from '@/components/icons/DreamIcons';
import { useAuth } from '@/components/providers/AuthProvider';
import { DreamTeamBrandMark } from '@/components/visual/DreamTeamBrandMark';
import { login, register } from '@/services';

function evaluatePasswordStrength(pw: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  toneClass: string;
} {
  if (!pw) return { score: 0, label: 'Chưa nhập', toneClass: '' };
  let points = 0;
  if (pw.length >= 8) points += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) points += 1;
  if (/\d/.test(pw)) points += 1;
  if (/[^A-Za-z0-9]/.test(pw)) points += 1;

  if (points <= 1) return { score: 1, label: 'Yếu', toneClass: 'is-weak' };
  if (points === 2) return { score: 2, label: 'Trung bình', toneClass: 'is-fair' };
  if (points === 3) return { score: 3, label: 'Khá', toneClass: 'is-good' };
  return { score: 4, label: 'Mạnh', toneClass: 'is-strong' };
}

export default function AuthPage() {
  const router = useRouter();
  const { user, setUserDirect, logoutUser } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [shopCategory, setShopCategory] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const strength = evaluatePasswordStrength(password);

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
    <section className="dg-auth-split">
      {/* Left Column: Centered Auth Form */}
      <div className="dg-auth-form-col">
        <div className="dg-auth-form-inner">
          <div style={{ marginBottom: '20px' }}>
            <Link href="/" aria-label="Về trang chủ DreamTeam">
              <DreamTeamBrandMark
                size={34}
                showWordmark
                subtitle="Tài khoản Cửa hàng & Quản trị"
              />
            </Link>
          </div>

          <div className="callout callout--info" style={{ marginBottom: '20px' }}>
            <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Timer size={15} />
              <span>Tham gia thí nghiệm F11 không cần tạo tài khoản</span>
            </strong>
            <span>
              Người tham gia khảo sát A/B chỉ cần xác nhận đồng ý ẩn danh là có
              thể làm bài ngay.{' '}
              <Link
                href="/experiment"
                style={{ textDecoration: 'underline', fontWeight: 700 }}
              >
                Mở trang Thí nghiệm F11 →
              </Link>
            </span>
          </div>

          {user ? (
            <div className="surface-card dg-panel" style={{ display: 'grid', gap: '14px' }}>
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
                  <Link href="/admin/analytics" className="dg-btn-purchase dg-btn-sm">
                    <span>Mở Dashboard Admin</span>
                    <ArrowRight size={14} />
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
            <div className="surface-card dg-panel" style={{ display: 'grid', gap: '20px' }}>
              <div>
                <h1 className="type-h2" style={{ margin: 0 }}>
                  {tab === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản DreamTeam'}
                </h1>
                <p className="type-body-sm" style={{ margin: '6px 0 0' }}>
                  {tab === 'login'
                    ? 'Đăng nhập để theo dõi đơn Sandbox hoặc mở Dashboard Admin (F10).'
                    : 'Lưu lịch sử đơn tải file và hồ sơ shop nhỏ của bạn.'}
                </p>
              </div>

              <div
                className="dg-auth-tabs"
                role="tablist"
                aria-label="Chọn đăng nhập hoặc đăng ký"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'login'}
                  className={`dg-auth-tab ${tab === 'login' ? 'is-active' : ''}`}
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
                  className={`dg-auth-tab ${tab === 'register' ? 'is-active' : ''}`}
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
                    <div className="dg-input-icon-wrap">
                      <User size={16} className="dg-input-icon" />
                      <input
                        id="auth-fullname"
                        type="text"
                        className="input dg-input-has-left"
                        required
                        minLength={2}
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Lan Anh"
                      />
                    </div>
                    <span className="field__error">
                      Vui lòng nhập họ tên tối thiểu 2 ký tự.
                    </span>
                  </div>
                )}

                <div className="field">
                  <label htmlFor="auth-email" className="field__label">
                    Email
                  </label>
                  <div className="dg-input-icon-wrap">
                    <Mail size={16} className="dg-input-icon" />
                    <input
                      id="auth-email"
                      type="email"
                      className="input dg-input-has-left"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="demo@digitalstore.local"
                    />
                  </div>
                  <span className="field__error">
                    Vui lòng nhập đúng định dạng email.
                  </span>
                </div>

                <div className="field">
                  <label htmlFor="auth-password" className="field__label">
                    Mật khẩu
                  </label>
                  <div className="dg-input-icon-wrap">
                    <Lock size={16} className="dg-input-icon" />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      className="input dg-input-has-left dg-input-has-right"
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
                    <button
                      type="button"
                      className="dg-input-eye-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span className="field__error">
                    {tab === 'register'
                      ? 'Mật khẩu đăng ký cần tối thiểu 8 ký tự.'
                      : 'Mật khẩu cần tối thiểu 6 ký tự.'}
                  </span>

                  {tab === 'register' && (
                    <div className="dg-pw-strength" aria-live="polite">
                      <div className="dg-pw-bars">
                        {[1, 2, 3, 4].map((step) => (
                          <span
                            key={step}
                            className={`dg-pw-bar ${
                              strength.score >= step ? strength.toneClass : ''
                            }`}
                          />
                        ))}
                      </div>
                      <span className="dg-pw-label">
                        Độ mạnh: <strong>{strength.label}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {tab === 'register' && (
                  <div className="field">
                    <label htmlFor="auth-shop-cat" className="field__label">
                      Ngành hàng của shop (tùy chọn)
                    </label>
                    <div className="dg-input-icon-wrap">
                      <Building2 size={16} className="dg-input-icon" />
                      <input
                        id="auth-shop-cat"
                        type="text"
                        className="input dg-input-has-left"
                        value={shopCategory}
                        onChange={(e) => setShopCategory(e.target.value)}
                        placeholder="Mỹ phẩm, Thời trang, F&B..."
                      />
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="callout callout--danger" role="alert">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="dg-btn-purchase btn--block"
                  style={{ justifyContent: 'center', minHeight: '48px' }}
                  disabled={isSubmitting}
                >
                  <span>
                    {isSubmitting
                      ? 'Đang xác thực...'
                      : tab === 'login'
                        ? 'Đăng nhập'
                        : 'Tạo tài khoản'}
                  </span>
                  <ArrowRight size={15} />
                </button>
              </form>
            </div>
          )}

          {/* Dev Store Demo Accounts Box */}
          <div className="surface-card dg-panel" style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
            <span className="type-eyebrow">Tài khoản Demo (Dev Store)</span>
            <p className="type-body-sm" style={{ margin: 0 }}>
              Hai tài khoản <code className="type-mono">.local</code> điền nhanh bên dưới dùng
              được ngay trên <strong>Local Dev Store</strong> (xem số liệu A/B tại{' '}
              <code className="type-mono">/admin/analytics</code>), hoặc trên{' '}
              <strong>Supabase</strong> sau khi chạy{' '}
              <code className="type-mono" style={{ overflowWrap: 'anywhere' }}>
                node scripts/seed-supabase-demo-users.mjs
              </code>
              .
            </p>

            <div style={{ display: 'grid', gap: '8px' }}>
              <div className="dg-demo-acc-row">
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

              <div className="dg-demo-acc-row">
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

            <p className="type-caption" style={{ margin: 0 }}>
              Nếu đăng ký mới công khai trên Supabase, hãy dùng email thật (ví dụ{' '}
              <code className="type-mono">@gmail.com</code> — Supabase Auth từ chối tên miền{' '}
              <code className="type-mono">.local</code> khi tự đăng ký), rồi có thể nâng quyền
              Admin bằng script hoặc SQL{' '}
              <code className="type-mono" style={{ overflowWrap: 'anywhere' }}>
                UPDATE public.users SET role = &apos;admin&apos;
              </code>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Emerald Brand Panel (Hidden on <= 991px) */}
      <aside className="dg-auth-brand-col dg-dark-band" aria-label="Thông tin nền tảng DreamTeam">
        <div className="dg-auth-brand-pattern" aria-hidden="true" />
        <div className="dg-auth-brand-inner">
          <span className="dg-cta-dark-badge">
            <Sparkles size={13} />
            <span>DreamTeam • Shop Nhỏ 1–3 Người</span>
          </span>

          <h2>Mọi công cụ số tinh gọn cho chủ shop bán hàng đa kênh</h2>
          <p className="dg-auth-brand-lead">
            Kết hợp Template Website chuẩn mobile, Prompt Pack thực chiến và
            Trợ lý ảo RAG đối chiếu 100% cơ sở dữ liệu thật.
          </p>

          <ul className="dg-auth-benefits">
            <li>
              <CheckCircle2 size={18} />
              <span>
                Template &amp; Prompt tối ưu cho Shopee, TikTok Shop, Facebook
              </span>
            </li>
            <li>
              <CheckCircle2 size={18} />
              <span>
                Minh bạch bản quyền 3 cấp (original / adapted / licensed)
              </span>
            </li>
            <li>
              <CheckCircle2 size={18} />
              <span>
                Bàn giao file số qua token có thời hạn sau thanh toán Sandbox
              </span>
            </li>
          </ul>

          {/* Real F11 Scenario Preview Card (No fake testimonial!) */}
          <div className="dg-auth-scenario-card">
            <div className="dg-auth-scenario-head">
              <span className="badge badge--accent type-mono">Kịch bản mẫu SC-01</span>
              <span className="type-caption" style={{ color: 'rgba(255,255,255,0.72)' }}>
                Within-subject AB/BA
              </span>
            </div>
            <p className="dg-auth-scenario-text">
              &ldquo;Bạn vận hành shop mỹ phẩm 2 người trên TikTok Shop, ngân sách
              dưới 1.000.000đ. Hãy chọn gói landing page tối ưu 375px và tuân
              thủ chính sách không cam kết trị liệu.&rdquo;
            </p>
            <div className="dg-auth-scenario-foot">
              <span>
                <ShieldCheck size={14} /> Grounding 100% ID thật
              </span>
              <Link href="/experiment">
                <span>Thử ngay F11</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
