import type { MetadataRoute } from "next";

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

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/cart", "/checkout", "/orders/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
