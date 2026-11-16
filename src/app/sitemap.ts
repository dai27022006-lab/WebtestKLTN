import type { MetadataRoute } from "next";

import { getStore } from "@/server/store";

export const dynamic = "force-dynamic";

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

function parseValidDate(
  value: string | null | undefined,
  fallback: Date
): Date {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/experiment`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const store = getStore();
    const { items } = await store.listProducts({
      limit: 100,
      page: 1,
      sort: "newest",
    });

    productRoutes = items
      .filter(
        (product) =>
          product.is_active &&
          product.deleted_at === null &&
          Boolean(product.slug?.trim())
      )
      .map((product) => ({
        url: `${baseUrl}/products/${encodeURIComponent(product.slug.trim())}`,
        lastModified: parseValidDate(
          product.updated_at || product.created_at,
          now
        ),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
  } catch (error) {
    console.warn(
      "[sitemap] Không thể đọc danh sách sản phẩm từ store:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }

  return [...staticRoutes, ...productRoutes];
}
