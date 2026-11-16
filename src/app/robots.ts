import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/products", "/experiment"],
      disallow: ["/api/", "/admin/", "/cart", "/checkout", "/orders/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
