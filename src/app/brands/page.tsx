import Link from "next/link";
import type { Metadata } from "next";
import { getAllBrands } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "Brands",
  description: "Browse all brands carried by Elite Wholesale.",
};

export default async function BrandsPage() {
  const brands = await getAllBrands();
  const active = brands
    .filter((b) => (b.count ?? 0) > 0)
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  const inactive = brands
    .filter((b) => !b.count)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-brand sm:text-4xl">Brands</h1>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {active.map((b) => (
          <Link
            key={b.slug}
            href={`/brand/${b.slug}`}
            className="rounded-lg border border-black/10 bg-surface px-4 py-3 text-center text-sm font-semibold text-brand hover:border-brand hover:text-accent"
          >
            {b.name}
            <span className="block text-xs font-normal text-muted">
              {b.count} products
            </span>
          </Link>
        ))}
      </div>
      {inactive.length > 0 && (
        <div className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
            More Brands
          </h2>
          <p className="mt-3 flex flex-wrap gap-2 text-sm text-muted">
            {inactive.map((b) => b.name).join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}
