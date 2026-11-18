import type { Metadata } from 'next';
import { JetBrains_Mono, Noto_Sans, Plus_Jakarta_Sans } from 'next/font/google';

import '@/styles/tokens.css';
import '@/styles/themes.css';
import '@/styles/typography.css';
import './globals.css';

import { GoogleTagManager } from '@/components/analytics/GoogleTagManager';
import { AdvisorChatDrawer } from '@/components/chat/AdvisorChatDrawer';
import { ScenarioContextBar } from '@/components/experiment/ScenarioContextBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { AppProviders } from '@/components/providers/AppProviders';
import { getSiteBaseUrl } from '@/components/seo/JsonLdScript';
import { BackToTopProgress } from '@/motion/BackToTopProgress';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['vietnamese', 'latin', 'cyrillic-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

const notoSans = Noto_Sans({
  subsets: ['cyrillic', 'vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['vietnamese', 'latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const SITE_TITLE =
  'DreamTeam — Cửa Hàng Sản Phẩm Số & Trợ Lý Tư Vấn Cho Chủ Shop Nhỏ';
const SITE_DESCRIPTION =
  'Cửa hàng Template Website, Prompt Pack AI và Workflow tự động dành cho chủ shop nhỏ 1–3 người trên Shopee, TikTok Shop và Facebook, kèm Trợ lý tư vấn chọn gói phù hợp.';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteBaseUrl()),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: 'DreamTeam',
    locale: 'vi_VN',
    type: 'website',
  },
};

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('dsa-theme');document.documentElement.setAttribute('data-theme',(t==='light'||t==='dark')?t:'light');var l=localStorage.getItem('dsa-locale');if(l==='vi'||l==='en'||l==='ru'||l==='zh'){document.documentElement.lang=l;document.documentElement.setAttribute('data-locale',l);}else{document.documentElement.setAttribute('data-locale','vi');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${plusJakartaSans.variable} ${notoSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <AppProviders>
          <SiteHeader />
          <ScenarioContextBar />
          <main id="main-content" className="app-main">
            {children}
          </main>
          <SiteFooter />
          <AdvisorChatDrawer />
          <BackToTopProgress />
        </AppProviders>
        <GoogleTagManager />
      </body>
    </html>
  );
}
