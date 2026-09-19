import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllCategories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse all Elite Wholesale product categories.",
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-brand sm:text-4xl">Shop by Category</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted">
          {categories.length} categories of vapes, e-liquids, and smoke shop supplies stocked for
          wholesale.
        </p>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/product-category/${c.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:border-brand/30 hover:shadow-xl"
          >
            <div className="relative aspect-[6/5] w-full overflow-hidden bg-gradient-to-br from-cream to-brand/10">
              {c.image ? (
                <Image
                  src={c.image.sourceUrl}
                  alt={c.name}
                  fill
                  sizes="300px"
                  className="object-cover transition duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-brand/25">
                  {c.name}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-transparent" />
              {typeof c.count === "number" && (
                <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                  {c.count} products
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 p-4 text-base font-bold text-white drop-shadow-sm">
                {c.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
