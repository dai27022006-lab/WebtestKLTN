'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useLocale } from '@/components/providers/LocaleProvider';
import { DreamTeamBrandMark } from '@/components/visual/DreamTeamBrandMark';

export function SiteFooter() {
  const pathname = usePathname();
  const { chrome } = useLocale();
  const f = chrome.footer;
  const c = chrome.common;

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="dg-footer" id="footer">
      <div className="container">
        <div className="dg-footer-grid">
          <div className="dg-footer-brand">
            <DreamTeamBrandMark
              size={30}
              showWordmark
              subtitle={c.brandSubtitle}
            />
            <p className="dg-footer-lead">{f.lead}</p>
            <div className="chip-row" style={{ marginTop: '4px' }}>
              <span className="badge badge--accent">{f.pillMobile}</span>
              <span className="badge">{f.pillLicense}</span>
              <span className="badge">{f.pillInstant}</span>
            </div>
          </div>

          <div className="dg-footer-col">
            <h4>{f.headingProducts}</h4>
            <ul className="dg-footer-links">
              <li>
                <Link href="/products">{f.allDigitalProducts}</Link>
              </li>
              <li>
                <Link href="/products?type=template">{f.templatesLink}</Link>
              </li>
              <li>
                <Link href="/products?type=prompt_pack">{f.promptsLink}</Link>
              </li>
              <li>
                <Link href="/products?type=workflow">{f.workflowsLink}</Link>
              </li>
              <li>
                <Link href="/orders">{f.ordersLink}</Link>
              </li>
              <li>
                <Link href="/#faqs">{f.faqLink}</Link>
              </li>
            </ul>
          </div>

          <div className="dg-footer-col">
            <h4>{f.headingAccount}</h4>
            <ul className="dg-footer-links">
              <li>
                <Link href="/auth">{f.authLink}</Link>
              </li>
              <li>
                <Link href="/cart">{f.cartLink}</Link>
              </li>
              <li>
                <Link href="/experiment">{f.surveyLink}</Link>
              </li>
              <li>
                <Link href="/admin/analytics">{f.adminLink}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="dg-footer-bottom">
          <span>{f.copyright}</span>
          <div className="dg-footer-bottom-links">
            <Link href="/products">{c.products}</Link>
            <Link href="/orders">{c.orders}</Link>
            <Link href="/#faqs">{c.faq}</Link>
            <Link href="/auth">{c.account}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
