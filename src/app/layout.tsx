import type { Metadata } from 'next';
import { Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';

import '@/styles/tokens.css';
import '@/styles/themes.css';
import '@/styles/typography.css';
import './globals.css';

import { AdvisorChatDrawer } from '@/components/chat/AdvisorChatDrawer';
import { ScenarioContextBar } from '@/components/experiment/ScenarioContextBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { AppProviders } from '@/components/providers/AppProviders';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tiệm Số Thực Chiến — Giải pháp số & Trợ lý tư vấn cho chủ shop nhỏ',
  description:
    'Nền tảng sản phẩm số (Template Website, Prompt Pack, Workflow) dành cho chủ shop nhỏ 1–3 người, tích hợp thí nghiệm A/B trợ lý ảo tư vấn.',
};

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('dsa-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Chuyển thẳng tới nội dung chính
        </a>
        <AppProviders>
          <SiteHeader />
          <ScenarioContextBar />
          <main id="main-content" className="app-main">
            {children}
          </main>
          <SiteFooter />
          <AdvisorChatDrawer />
        </AppProviders>
      </body>
    </html>
  );
}
