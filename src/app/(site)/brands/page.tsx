import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
    <div className="page-shell py-12">
      <p className="section-label">Brand directory</p>
      <h1 className="mt-3 text-4xl font-black sm:text-5xl">Brands we carry</h1>
      <p className="mt-4 text-muted-foreground">
        {active.length} trusted brands, all available for wholesale ordering.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {withImages.map((b) => (
          <Link
            key={b.slug}
            href={`/brand/${b.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.03] shadow-[0_18px_50px_-20px_rgba(0,0,0,.7)] transition duration-300 hover:-translate-y-1.5 hover:border-primary/70 hover:shadow-[0_28px_70px_-20px_oklch(0.81_0.14_210/45%)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-200">
              {b.image ? (
                <Image
                  src={b.image}
                  alt={b.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
                  className="object-contain p-6 transition duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="grid h-full place-items-center font-display text-6xl font-black text-slate-300">
                  {b.name.charAt(0)}
                </div>
              )}
              <span className="absolute right-3 top-3 rounded-full bg-background/85 px-3 py-1 text-[11px] font-bold text-primary shadow backdrop-blur">
                {b.count} products
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="line-clamp-1 font-display text-xl font-extrabold">{b.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">Wholesale catalogue</p>
              <span className="mt-5 inline-flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                View products
                <ArrowUpRight className="size-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
