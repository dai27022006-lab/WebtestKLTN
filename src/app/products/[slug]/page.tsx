import type { Metadata } from 'next';
import { cache } from 'react';

import { getSiteBaseUrl, JsonLdScript } from '@/components/seo/JsonLdScript';
import { ProductDetailClient } from '@/sections/products/ProductDetailClient';
import { getStore, type ProductRecord } from '@/server/store';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const getProductSafely = cache(
  async (slug: string): Promise<ProductRecord | null> => {
    try {
      return await getStore().findProductByIdOrSlug(slug);
    } catch {
      return null;
    }
  }
);

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductSafely(slug);

  if (!product) {
    return {
      title: 'Chi tiết sản phẩm | DreamTeam',
      description:
        'Xem cấu trúc giải pháp số, thông số kỹ thuật và bản quyền minh bạch trên DreamTeam.',
    };
  }

  return {
    title: `${product.name} | DreamTeam`,
    description: product.short_description,
    openGraph: {
      title: `${product.name} | DreamTeam`,
      description: product.short_description,
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductSafely(slug);
  const baseUrl = getSiteBaseUrl();

  const productJsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.short_description,
        category: product.industry,
        sku: product.slug,
        brand: {
          '@type': 'Brand',
          name: 'DreamTeam',
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'VND',
          price: product.price_vnd,
          availability: 'https://schema.org/InStock',
          url: `${baseUrl}/products/${encodeURIComponent(product.slug)}`,
        },
      }
    : null;

  return (
    <>
      {productJsonLd && <JsonLdScript data={productJsonLd} />}
      <ProductDetailClient slug={slug} />
    </>
  );
}
