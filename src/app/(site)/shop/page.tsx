import type { Metadata } from "next";
import CatalogPage, { parsePage } from "@/components/CatalogPage";
import { getAllCategories, getAllProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop Wholesale Vapes, Lighters, Torches & Exotic Snacks",
  description:
    "Browse our complete collection of wholesale vapes, torches, lighters, exotic snacks, and smoke accessories. Bulk pricing and fast USA shipping.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);
  const query = q?.trim().toLowerCase() ?? "";
  const filtered = query
    ? products.filter((p) => p.name.toLowerCase().includes(query))
    : products;
  const sorted = filtered
    .slice()
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());

  return (
    <CatalogPage
      title={query ? `Results for “${q}”` : "Shop the catalogue"}
      description="Browse current products and select any line to review options or add it to your enquiry."
      items={sorted}
      categories={categories}
      basePath="/shop"
      page={parsePage(page)}
      queryParams={q?.trim() ? { q: q.trim() } : {}}
      {...(query ? { query } : {})}
      emptyMessage="Try a different search term, or browse a department from the sidebar."
    />
  );
}
