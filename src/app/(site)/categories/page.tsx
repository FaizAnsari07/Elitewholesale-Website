import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { getAllCategories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse all Elite Wholesale product categories.",
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();
  return (
    <div className="page-shell py-12">
      <p className="section-label">Catalogue departments</p>
      <h1 className="mt-3 text-4xl font-black sm:text-5xl">Shop by category</h1>
      <p className="mt-4 text-muted-foreground">
        {categories.length} categories of vapes, e-liquids, and smoke shop supplies stocked for wholesale.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {categories.map((c) => (
          <Link key={c.slug} href={`/product-category/${c.slug}`} className="glass group overflow-hidden rounded-2xl">
            <div className="relative aspect-[5/4] bg-foreground/5">
              {c.image ? (
                <Image
                  src={c.image.sourceUrl}
                  alt={c.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-contain p-5 transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary/25">
                  {c.name}
                </div>
              )}
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold">{c.name}</h2>
                {typeof c.count === "number" && (
                  <p className="mt-1 text-xs text-muted-foreground">{c.count} products</p>
                )}
              </div>
              <ArrowUpRight className="size-5 text-primary" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
