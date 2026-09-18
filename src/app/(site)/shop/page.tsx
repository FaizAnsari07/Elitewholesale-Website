import Link from "next/link";
import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { getAllCategories, getAllProducts } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "Shop Wholesale Vapes, Lighters, Torches & Exotic Snacks",
  description:
    "Browse our complete collection of wholesale vapes, torches, lighters, exotic snacks, and smoke accessories. Bulk pricing and fast USA shipping.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);
  const query = q?.trim().toLowerCase() ?? "";
  const filtered = query
    ? products.filter((p) => p.name.toLowerCase().includes(query))
    : products;
  const sorted = filtered
    .slice()
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-brand sm:text-4xl">
        {query ? `Search results for "${q}"` : "Shop"}
      </h1>
      <p className="mt-2 text-muted">
        {sorted.length} product{sorted.length === 1 ? "" : "s"}
        {query ? " found" : " available"}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
            Categories
          </h2>
          <ul className="mt-4 space-y-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/product-category/${c.slug}`}
                  className="text-sm text-ink hover:text-accent"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {sorted.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {sorted.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-black/10 bg-surface p-12 text-center">
            <p className="text-lg font-semibold text-brand">No products found</p>
            <p className="mt-2 text-sm text-muted">
              Try a different search term, or browse a category from the sidebar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
