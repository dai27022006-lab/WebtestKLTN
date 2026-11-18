'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useLocale } from '@/components/providers/LocaleProvider';
import { ShopDashboardPanel } from '@/components/analytics/ShopDashboardPanel';
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
import { listOrders, listProducts, login, register } from '@/services';
import { useExperiment } from '@/state';
import type { OrderDto, ProductSummaryDto } from '@/types/api';

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
  const {
    commerce,
    chrome,
    getIndustryLabel,
  } = useLocale();
  const au = commerce.auth;
  const sd = commerce.shopDashboard;
  const router = useRouter();
  const { user, isLoading: isAuthLoading, setUserDirect, logoutUser } = useAuth();
  const { visitorId } = useExperiment();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [shopCategory, setShopCategory] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [products, setProducts] = useState<ProductSummaryDto[]>([]);
  const [isDashLoading, setIsDashLoading] = useState(false);

  const strength = evaluatePasswordStrength(password);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setIsDashLoading(true);
      void Promise.all([
        listOrders(visitorId || undefined, controller.signal),
        listProducts({ limit: 50 }, controller.signal),
      ]).then(([ordersRes, productsRes]) => {
        if (controller.signal.aborted) return;
        setIsDashLoading(false);
        if (ordersRes.ok) {
          setOrders(ordersRes.data);
        }
        if (productsRes.ok) {
          setProducts(productsRes.data);
        }
      });
    }, 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [user, visitorId]);

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

  if (!isAuthLoading && user) {
    return (
      <section className="section section--compact">
        <div
          className="container"
          style={{ display: 'grid', gap: 'var(--space-6)' }}
        >
          <div
            className="surface-card dg-panel"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div style={{ display: 'grid', gap: '8px', minWidth: 0 }}>
              <span className="type-eyebrow">{au.accountEyebrow}</span>
              <h1 className="type-h1" style={{ margin: 0 }}>
                {user.full_name ?? user.email}
              </h1>
              <div className="chip-row">
                <span className="badge type-mono">{user.email}</span>
                <span className="badge badge--accent">
                  {user.role === 'admin' ? au.roleAdmin : au.roleCustomer}
                </span>
                {user.shop_category && (
                  <span className="badge">
                    {au.industryPrefix}: {getIndustryLabel(user.shop_category)}
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              {user.role === 'admin' && (
                <Link
                  href="/admin/analytics"
                  className="dg-btn-purchase dg-btn-sm"
                >
                  <span>{au.adminAreaBtn}</span>
                  <ArrowRight size={14} />
                </Link>
              )}
              <Link href="/orders" className="btn btn--secondary btn--sm">
                {au.ordersLibBtn}
              </Link>
              <Link href="/products" className="btn btn--secondary btn--sm">
                {au.catalogBtn}
              </Link>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => void logoutUser()}
              >
                {chrome.common.logout}
              </button>
            </div>
          </div>

          <ShopDashboardPanel
            orders={orders}
            products={products}
            isLoading={isDashLoading}
            title={sd.titleDefault}
            subtitle={sd.subtitleDefault}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="dg-auth-split">
      {/* Left Column: Centered Auth Form */}
      <div className="dg-auth-form-col">
        <div className="dg-auth-form-inner">
          <div style={{ marginBottom: '20px' }}>
            <Link href="/" aria-label={`DreamTeam — ${chrome.common.home}`}>
              <DreamTeamBrandMark
                size={34}
                showWordmark
                subtitle={chrome.common.brandSubtitle}
              />
            </Link>
          </div>

          <div className="callout callout--info" style={{ marginBottom: '20px' }}>
            <strong
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Timer size={15} />
              <span>{au.surveyBannerTitle}</span>
            </strong>
            <span>
              {au.surveyBannerDesc}{' '}
              <Link
                href="/experiment"
                style={{ textDecoration: 'underline', fontWeight: 700 }}
              >
                {au.surveyBannerLink}
              </Link>
            </span>
          </div>

          {isAuthLoading ? (
            <div className="skeleton-box" style={{ height: '320px' }} />
          ) : (
            <div
              className="surface-card dg-panel"
              style={{ display: 'grid', gap: '20px' }}
            >
              <div>
                <h1 className="type-h2" style={{ margin: 0 }}>
                  {tab === 'login' ? au.welcomeBack : au.createTitle}
                </h1>
                <p className="type-body-sm" style={{ margin: '6px 0 0' }}>
                  {tab === 'login' ? au.loginDesc : au.registerDesc}
                </p>
              </div>

              <div
                className="dg-auth-tabs"
                role="tablist"
                aria-label={au.accountEyebrow}
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
                  {au.tabLogin}
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
                  {au.tabRegister}
                </button>
              </div>

              <form
                onSubmit={(e) => void handleSubmit(e)}
                style={{ display: 'grid', gap: '14px' }}
              >
                {tab === 'register' && (
                  <div className="field">
                    <label htmlFor="auth-fullname" className="field__label">
                      {au.fullNameLabel}
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
                        placeholder={au.fullNamePlaceholder}
                      />
                    </div>
                  </div>
                )}

                <div className="field">
                  <label htmlFor="auth-email" className="field__label">
                    {au.emailLabel}
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
                </div>

                <div className="field">
                  <label htmlFor="auth-password" className="field__label">
                    {au.passwordLabel}
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
                      placeholder={tab === 'register' ? '••••••••' : '••••••'}
                    />
                    <button
                      type="button"
                      className="dg-input-eye-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={au.passwordLabel}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

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
                        {au.passwordStrength}: <strong>{strength.label}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {tab === 'register' && (
                  <div className="field">
                    <label htmlFor="auth-shop-cat" className="field__label">
                      {au.shopCategoryLabel}
                    </label>
                    <div className="dg-input-icon-wrap">
                      <Building2 size={16} className="dg-input-icon" />
                      <input
                        id="auth-shop-cat"
                        type="text"
                        className="input dg-input-has-left"
                        value={shopCategory}
                        onChange={(e) => setShopCategory(e.target.value)}
                        placeholder={au.shopCategoryPlaceholder}
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
                      ? au.submitting
                      : tab === 'login'
                        ? au.submitLogin
                        : au.submitRegister}
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
            <span className="type-eyebrow">{au.demoTitle}</span>
            <p className="type-body-sm" style={{ margin: 0 }}>
              {au.demoDesc}
            </p>

            <div style={{ display: 'grid', gap: '8px' }}>
              <div className="dg-demo-acc-row">
                <div>
                  <div
                    className="type-caption"
                    style={{ fontWeight: 700, color: 'var(--ink)' }}
                  >
                    {au.demoCustomerTitle}
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
                  {au.demoCustomerBtn}
                </button>
              </div>

              <div className="dg-demo-acc-row">
                <div>
                  <div
                    className="type-caption"
                    style={{ fontWeight: 700, color: 'var(--ink)' }}
                  >
                    {au.demoAdminTitle}
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
                  {au.demoAdminBtn}
                </button>
              </div>
            </div>

            <p className="type-caption" style={{ margin: 0 }}>
              {au.demoPersonalNote}
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Emerald Brand Panel (Hidden on <= 991px) */}
      <aside
        className="dg-auth-brand-col dg-dark-band"
        aria-label={au.brandBadge}
      >
        <div className="dg-auth-brand-pattern" aria-hidden="true" />
        <div className="dg-auth-brand-inner">
          <span className="dg-cta-dark-badge">
            <Sparkles size={13} />
            <span>{au.brandBadge}</span>
          </span>

          <h2>{au.brandHeading}</h2>
          <p className="dg-auth-brand-lead">{au.brandLead}</p>

          <ul className="dg-auth-benefits">
            {au.brandBenefits.map((benefit) => (
              <li key={benefit}>
                <CheckCircle2 size={18} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          {/* Pilot Case Study Card (Clearly labeled) */}
          <div className="dg-auth-scenario-card">
            <div className="dg-auth-scenario-head">
              <span className="badge badge--accent">{au.caseTag}</span>
              <span
                className="type-caption"
                style={{ color: 'rgba(255,255,255,0.78)' }}
              >
                {au.caseSub}
              </span>
            </div>
            <p className="dg-auth-scenario-text">{au.caseQuote}</p>
            <div className="dg-auth-scenario-foot">
              <span>
                <ShieldCheck size={14} /> {au.caseFoot}
              </span>
              <Link href="/products?industry=M%E1%BB%B9%20ph%E1%BA%A9m">
                <span>{au.caseLink}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
