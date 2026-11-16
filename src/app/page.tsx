import { getSiteBaseUrl, JsonLdScript } from '@/components/seo/JsonLdScript';
import { HomeLanding } from '@/sections/home/HomeLanding';

const SITE_DESCRIPTION =
  'Nền tảng sản phẩm số (Template Website, Prompt Pack, Workflow tự động) dành cho chủ shop nhỏ 1–3 người, tích hợp Trợ lý ảo RAG và Thí nghiệm đối chứng A/B.';

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
