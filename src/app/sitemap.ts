import type { MetadataRoute } from "next";

import { getStore } from "@/server/store";

export const dynamic = "force-dynamic";

const DEFAULT_BASE_URL = "http://localhost:3000";

function normalizeHttpUrl(raw: string | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

function getBaseUrl(): string {
  const explicit = normalizeHttpUrl(process.env.NEXT_PUBLIC_APP_URL);
  if (explicit) return explicit;

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (process.env.VERCEL_ENV === "production" && vercelProd) {
    const normalized = normalizeHttpUrl(`https://${vercelProd}`);
    if (normalized) return normalized;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const normalized = normalizeHttpUrl(`https://${vercelUrl}`);
    if (normalized) return normalized;
  }

  return DEFAULT_BASE_URL;
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
    const products = await store.listAllActiveProducts();
    const seenSlugs = new Set<string>();

    productRoutes = products
      .filter((product) => {
        const slug = product.slug?.trim();
        if (!product.is_active || product.deleted_at !== null || !slug) {
          return false;
        }
        if (seenSlugs.has(slug)) {
          return false;
        }
        seenSlugs.add(slug);
        return true;
      })
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
