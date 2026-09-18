import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getAllCategories, getProductBySlug } from "@/lib/wordpress";

const FEATURED_SLUGS = [
  "lovmee-30k-lov30",
  "coastal-clouds-tfn-salt-nic-30ml-nicotine-strength-35-mg",
  "coastal-clouds-tfn-salt-nic-30ml-nicotine-strength-50-mg",
  "ruthless-essentials-nic-salt-60ml-35-mg",
  "geek-bar-pulse-15k-puffs-5-pcs-box",
  "geek-bar-pulse-25k-puffs-5-pcs-box",
  "coastal-clouds-100ml",
  "japanes-e-hata-burst-bead-drink-200ml",
];

const TOP_CATEGORY_SLUGS = [
  "disposable-vapes",
  "exotic-snacks",
  "torches-lighters",
  "merchandise",
  "glass",
  "e-liquid",
];

export default async function Home() {
  const [featuredResults, categories] = await Promise.all([
    Promise.all(FEATURED_SLUGS.map(getProductBySlug)),
    getAllCategories(),
  ]);
  const featured = featuredResults.filter((p): p is NonNullable<typeof p> => Boolean(p));
  const topCategories = TOP_CATEGORY_SLUGS.map((slug) =>
    categories.find((c) => c.slug === slug),
  ).filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div>
      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="h-[250px] w-full object-cover sm:h-[400px] lg:h-[600px]"
        >
          <source
            src="/videos/Geek-Bar-Video.mp4"
            type="video/mp4"
          />
        </video>
      </section>
      <section className="bg-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-14 sm:px-6 md:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-accent">
              Exclusive Distributor
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight text-brand sm:text-5xl">
              Wholesale Vapes, Torches, Lighters &amp; Exotic Snacks
            </h1>
            <p className="mt-4 max-w-lg text-muted">
              {"Serving convenience stores, gas stations, liquor stores, vape shops, and smoke shops across the USA with top brands and fast shipping."}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Shop Now
              </Link>
              <Link
                href="/product/lovmee-30k-lov30"
                className="rounded-md border border-neutral-300 px-6 py-3 text-sm font-semibold text-ink hover:bg-white"
              >
                New: LovMee 30K Puffs
              </Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-sm">
            <Image
              src="/images/2025/12/LovMee_30K.png"
              alt="LovMee 30K Puffs disposable vape"
              fill
              sizes="400px"
              className="object-contain"
              priority
            />
          </div>
        </div>
      </section>

      {/* Top categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-brand">Top Categories</h2>
          <Link href="/categories" className="text-sm font-semibold text-accent hover:underline">
            View all categories &rarr;
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {topCategories.map((c) => (
            <Link
              key={c.slug}
              href={`/product-category/${c.slug}`}
              className="group overflow-hidden rounded-xl border border-black/10 bg-surface"
            >
              <div className="relative aspect-[6/5] w-full">
                {c.image && (
                  <Image
                    src={c.image.sourceUrl}
                    alt={c.name}
                    fill
                    sizes="200px"
                    className="object-cover transition group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-3 text-center">
                <span className="text-sm font-semibold text-brand">
                  {c.name}
                </span>
                <span className="block text-xs text-muted">
                  {c.count} products
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-cream py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-brand">New Flavors &amp; Top Products</h2>
            <Link href="/shop" className="text-sm font-semibold text-accent hover:underline">
              Shop all products &rarr;
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Wholesale CTA */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 rounded-2xl bg-ink p-10 text-center text-white sm:grid-cols-3 sm:text-left">
          <div>
            <h3 className="text-lg font-bold">Wholesale Pricing</h3>
            <p className="mt-2 text-sm text-white/60">
              Create a wholesale account to unlock bulk pricing on our full catalog.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold">Fast Shipping</h3>
            <p className="mt-2 text-sm text-white/60">
              Reliable, fast fulfillment for convenience stores and smoke shops nationwide.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold">Trusted Brands</h3>
            <p className="mt-2 text-sm text-white/60">
              Geek Bar, Spaceman, Pyne Pod, Coastal Clouds, Lost Mary, and 50+ more.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
