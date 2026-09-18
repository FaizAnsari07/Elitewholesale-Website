import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllCategories } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse all Elite Wholesale product categories.",
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-brand sm:text-4xl">Categories</h1>
      <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/product-category/${c.slug}`}
            className="group overflow-hidden rounded-xl border border-black/10 bg-surface"
          >
            <div className="relative aspect-[6/5] w-full bg-cream">
              {c.image ? (
                <Image
                  src={c.image.sourceUrl}
                  alt={c.name}
                  fill
                  sizes="300px"
                  className="object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted">
                  {c.name}
                </div>
              )}
            </div>
            <div className="p-4 text-center">
              <span className="text-sm font-semibold text-brand">{c.name}</span>
              <span className="block text-xs text-muted">{c.count ?? 0} products</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
