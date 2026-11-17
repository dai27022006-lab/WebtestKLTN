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
            <strong
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Timer size={15} />
              <span>Trải nghiệm mua sắm &amp; khảo sát không cần tạo tài khoản</span>
            </strong>
            <span>
              Bạn có thể xem mẫu, thêm vào giỏ hoặc tham gia đánh giá trải nghiệm
              ngay mà không cần đăng ký.{' '}
              <Link
                href="/experiment"
                style={{ textDecoration: 'underline', fontWeight: 700 }}
              >
                Tham gia khảo sát trải nghiệm →
              </Link>
            </span>
          </div>

          {user ? (
            <div
              className="surface-card dg-panel"
              style={{ display: 'grid', gap: '14px' }}
            >
              <span className="type-eyebrow">Phiên đăng nhập hiện tại</span>
              <h1 className="type-h2" style={{ margin: 0 }}>
                {user.full_name ?? user.email}
              </h1>
              <div className="chip-row">
                <span className="badge type-mono">{user.email}</span>
                <span className="badge badge--accent">
                  Vai trò:{' '}
                  {user.role === 'admin' ? 'Quản trị viên' : 'Chủ shop / Khách'}
                </span>
                {user.shop_category && (
                  <span className="badge">Ngành: {user.shop_category}</span>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  paddingTop: '8px',
                }}
              >
                {user.role === 'admin' && (
                  <Link
                    href="/admin/analytics"
                    className="dg-btn-purchase dg-btn-sm"
                  >
                    <span>Khu vực Quản trị</span>
                    <ArrowRight size={14} />
                  </Link>
                )}
                <Link href="/orders" className="btn btn--secondary">
                  Thư viện đơn hàng
                </Link>
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
            <div
              className="surface-card dg-panel"
              style={{ display: 'grid', gap: '20px' }}
            >
              <div>
                <h1 className="type-h2" style={{ margin: 0 }}>
                  {tab === 'login'
                    ? 'Chào mừng trở lại'
                    : 'Tạo tài khoản DreamTeam'}
                </h1>
                <p className="type-body-sm" style={{ margin: '6px 0 0' }}>
                  {tab === 'login'
                    ? 'Đăng nhập để quản lý thư viện đơn hàng đã mua hoặc mở khu vực quản trị cửa hàng.'
                    : 'Lưu lịch sử đơn tải file và thông tin ngành hàng của shop.'}
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
                        placeholder="Ví dụ: Tiệm Mỹ Phẩm An Nhiên"
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
                      placeholder="ban@shopcuaban.vn"
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

          {/* Demo Accounts Box */}
          <div
            className="surface-card dg-panel"
            style={{ display: 'grid', gap: '12px', marginTop: '16px' }}
          >
            <span className="type-eyebrow">Tài khoản dùng thử</span>
            <p className="type-body-sm" style={{ margin: 0 }}>
              Tài khoản dùng thử cho chủ shop / quản trị viên giúp bạn kiểm thử
              nhanh luồng đơn hàng và trang quản trị.
            </p>

            <div style={{ display: 'grid', gap: '8px' }}>
              <div className="dg-demo-acc-row">
                <div>
                  <div
                    className="type-caption"
                    style={{ fontWeight: 700, color: 'var(--ink)' }}
                  >
                    Chủ shop dùng thử
                  </div>
                  <div className="type-caption type-mono">
                    demo@digitalstore.local / Demo1234!
                  </div>
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
                <div>
                  <div
                    className="type-caption"
                    style={{ fontWeight: 700, color: 'var(--ink)' }}
                  >
                    Quản trị viên dùng thử
                  </div>
                  <div className="type-caption type-mono">
                    admin@digitalstore.local / Admin1234!
                  </div>
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
              Nếu muốn tạo tài khoản riêng ở tab Đăng ký, hãy sử dụng địa chỉ
              email cá nhân hợp lệ (ví dụ <code className="type-mono">@gmail.com</code>)
              để lưu trọn vẹn thư viện đơn hàng đã mua.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Emerald Brand Panel (Hidden on <= 991px) */}
      <aside
        className="dg-auth-brand-col dg-dark-band"
        aria-label="Thông tin nền tảng DreamTeam"
      >
        <div className="dg-auth-brand-pattern" aria-hidden="true" />
        <div className="dg-auth-brand-inner">
          <span className="dg-cta-dark-badge">
            <Sparkles size={13} />
            <span>DreamTeam • Shop Nhỏ 1–3 Người</span>
          </span>

          <h2>Mọi công cụ số tinh gọn cho chủ shop bán hàng đa kênh</h2>
          <p className="dg-auth-brand-lead">
            Kết hợp Template Website chuẩn di động 375px, bộ Prompt Pack thực
            chiến và Trợ lý tư vấn chọn gói từ kho sản phẩm thực tế.
          </p>

          <ul className="dg-auth-benefits">
            <li>
              <CheckCircle2 size={18} />
              <span>
                Template &amp; Prompt tối ưu sẵn cho Shopee, TikTok Shop,
                Facebook với hướng dẫn cài đặt 15–30 phút
              </span>
            </li>
            <li>
              <CheckCircle2 size={18} />
              <span>
                Minh bạch bản quyền 3 cấp rõ ràng (Thiết kế gốc, Điều chỉnh có
                nguồn, Bản quyền hợp lệ)
              </span>
            </li>
            <li>
              <CheckCircle2 size={18} />
              <span>
                Đặt hàng thử nghiệm không trừ tiền thật và mở kho link tải riêng
                tư thời hạn 7 ngày ngay lập tức
              </span>
            </li>
          </ul>

          {/* Pilot Case Study Card (Clearly labeled) */}
          <div className="dg-auth-scenario-card">
            <div className="dg-auth-scenario-head">
              <span className="badge badge--accent">
                Case Study mẫu thử nghiệm
              </span>
              <span
                className="type-caption"
                style={{ color: 'rgba(255,255,255,0.78)' }}
              >
                Từ đợt chạy thử nghiệm mẫu
              </span>
            </div>
            <p className="dg-auth-scenario-text">
              &ldquo;Tiệm Dưỡng Da An Nhiên (shop mỹ phẩm 2 nhân sự) chọn mẫu
              Landing Page chuẩn 375px hiển thị rõ số công bố sản phẩm và bảng
              thành phần dịu nhẹ — tự hoàn thiện trang bán hàng trong 25 phút và
              tăng 32% lượt bấm sang giỏ TikTok Shop.&rdquo;
            </p>
            <div className="dg-auth-scenario-foot">
              <span>
                <ShieldCheck size={14} /> Từ đợt chạy thử nghiệm mẫu • Quy mô 2
                người
              </span>
              <Link href="/products?industry=M%E1%BB%B9%20ph%E1%BA%A9m">
                <span>Xem gói Mỹ phẩm</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
