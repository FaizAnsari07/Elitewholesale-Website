import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllBrands, getBrandSampleImage } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Brands",
  description: "Browse all brands carried by Elite Wholesale.",
};

export default async function BrandsPage() {
  const brands = await getAllBrands();
  const active = brands
    .filter((b) => (b.count ?? 0) > 0)
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

  const withImages = await Promise.all(
    active.map(async (b) => ({ ...b, image: await getBrandSampleImage(b.slug) })),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-brand sm:text-4xl">Brands We Carry</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted">
          {active.length} trusted brands, all available for wholesale ordering.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {withImages.map((b) => (
          <Link
            key={b.slug}
            href={`/brand/${b.slug}`}
            className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:border-brand/30 hover:shadow-xl"
          >
            <div className="relative aspect-square w-full bg-gradient-to-br from-cream to-brand/10">
              {b.image ? (
                <Image
                  src={b.image}
                  alt={b.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-contain p-6 transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-brand/30">
                  {b.name}
                </div>
              )}
            </div>
            <div className="border-t border-black/5 p-4 text-center">
              <span className="text-sm font-bold text-brand">{b.name}</span>
              <span className="mt-1 inline-block rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                {b.count} products
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
