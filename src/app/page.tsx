import { getSiteBaseUrl, JsonLdScript } from '@/components/seo/JsonLdScript';
import { HomeLanding } from '@/sections/home/HomeLanding';

const SITE_DESCRIPTION =
  'Cửa hàng Template Website, Prompt Pack AI và Workflow tự động dành cho chủ shop nhỏ 1–3 người trên Shopee, TikTok Shop và Facebook, kèm Trợ lý tư vấn chọn gói phù hợp.';

export default function HomePage() {
  const baseUrl = getSiteBaseUrl();

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DreamTeam',
    url: baseUrl,
    inLanguage: 'vi-VN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/products?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DreamTeam',
    url: baseUrl,
    description: SITE_DESCRIPTION,
  };

  return (
    <>
      <JsonLdScript data={websiteJsonLd} />
      <JsonLdScript data={organizationJsonLd} />
      <HomeLanding />
    </>
  );
}
