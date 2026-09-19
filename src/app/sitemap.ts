import type { MetadataRoute } from "next";
import { getAllBrands, getAllCategories, getAllProducts, orFallback } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const BASE_URL = "https://elitewholesale.online";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands] = await Promise.all([
    orFallback(getAllProducts(), []),
    orFallback(getAllCategories(), []),
    orFallback(getAllBrands(), []),
  ]);

  const staticPages = [
    "",
    "/shop",
    "/categories",
    "/brands",
    "/about-us",
    "/contact-us",
    "/refund_returns",
  ].map((path) => ({ url: `${BASE_URL}${path}` }));

  const categoryPages = categories.map((c) => ({
    url: `${BASE_URL}/product-category/${c.slug}`,
  }));

  const brandPages = brands
    .filter((b) => (b.count ?? 0) > 0)
    .map((b) => ({ url: `${BASE_URL}/brand/${b.slug}` }));

  const productPages = products.map((p) => ({
    url: `${BASE_URL}/product/${p.slug}`,
  }));

  return [...staticPages, ...categoryPages, ...brandPages, ...productPages];
}
