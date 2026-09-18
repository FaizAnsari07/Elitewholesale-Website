import Link from "next/link";
import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { getAllCategories, getAllProducts } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "Shop Wholesale Vapes, Lighters, Torches & Exotic Snacks",
  description:
    "Browse our complete collection of wholesale vapes, torches, lighters, exotic snacks, and smoke accessories. Bulk pricing and fast USA shipping.",
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);
  const sorted = products
    .slice()
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-brand sm:text-4xl">Shop</h1>
      <p className="mt-2 text-muted">{products.length} products available</p>

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
                  {c.name} <span className="text-muted">({c.count ?? 0})</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {sorted.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
