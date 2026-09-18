import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getAllCategories, getProductBySlug, type Product } from "@/lib/wordpress";

const HERO_SLUG = "lovmee-30k-lov30";

const NEW_FLAVORS_ELIQUIDS = [
  "coastal-clouds-tfn-salt-nic-30ml-nicotine-strength-35-mg",
  "coastal-clouds-tfn-salt-nic-30ml-nicotine-strength-50-mg",
  "ruthless-essentials-nic-salt-60ml-35-mg",
  "ruthless-essentials-nic-salt-60ml-50mg",
  "ruthless-loaded-nic-salts-60ml-35mg",
  "ruthless-loaded-nic-salts-60ml-50mg",
];

const NEW_PRODUCTS = [
  "spaceman-sp40000-40k",
  "pyne-pod-click-pods-40k-0",
  "pyne-pod-click-kits-40k-0",
  "pyne-pod-click-pods-80k",
  "pyne-pod-click-kits-80k",
  "pyne-pod-click-kits-40k",
  "off-stamp-crystal-pod-35k",
  "off-stamp-x-cube-pod-25k",
  "lost-mary-nera-pods-70k",
  "lost-mary-nera-kits-70k",
  "lost-mary-mt35k",
  "foger-switch-pro-kits-30k",
];

const NEW_FLAVORS_DISPOSABLES = [
  "geek-bar-clr-50k",
  "geek-bar-pulse2-hubba-edition",
  "geekbar-pulse-x2-50k",
  "off-stamp-x-cube-crystal-cube-kit-35k",
  "off-stamp-x-cube-pod-25k",
];

const NEW_THIS_SEASON = [
  "lost-mary-mt-turbo-35000-puffs-disposable",
  "suonon-donete-50k-disposable-vape",
];

const TOP_CATEGORY_SLUGS = ["torches-lighters", "exotic-snacks", "disposable-vapes"];

const MID_BANNER_SLUG = "pyne-pod-click-kit-40k-puffs";

const TOP_PRODUCTS = [
  "coastal-clouds-100ml",
  "japanes-e-hata-burst-bead-drink-200ml",
  "oreo-crispy-thin-biscuits-95g",
  "skittles-sour-bar-gummies-9g",
  "cheetos-corn-on-the-cob",
  "eavinwhip-640g-6-pcs-carton",
  "bic-3-tier-lighter-display",
];

const TOP_BRANDS = [
  { name: "Tre House", slug: "tre-house", logo: "/images/2025/11/Tre-house-rbg.png" },
  { name: "Coastal Clouds", slug: "coastal-clouds", logo: "/images/2025/11/coastal-clouds-rbg.png" },
  { name: "Ignitus", slug: "ignitus", logo: "/images/2025/04/lgnitus.jpg" },
  { name: "Nexa", slug: "nexa", logo: "/images/2025/03/nexa-png.png" },
  { name: "Geek Bar", slug: "geek-bar", logo: "/images/2025/03/geek-bar.png" },
];

async function resolveProducts(slugs: string[]): Promise<Product[]> {
  const results = await Promise.all(slugs.map(getProductBySlug));
  return results.filter((p): p is Product => Boolean(p));
}

function ProductRailItem({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex w-36 shrink-0 flex-col items-center text-center sm:w-44"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-cream">
        {product.image && (
          <Image
            src={product.image.sourceUrl}
            alt={product.image.altText || product.name}
            fill
            sizes="176px"
            className="object-contain p-3 transition group-hover:scale-105"
          />
        )}
      </div>
      <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-brand">
        {product.name}
      </h3>
    </Link>
  );
}

function NewProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex flex-col rounded-2xl bg-[#FFF5A8] p-4 text-center shadow-sm transition hover:-translate-y-1"
    >
      <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-[#FF4D7D] px-2.5 py-1 text-[10px] font-bold uppercase text-white">
        New!
      </span>
      <div className="relative aspect-square w-full">
        {product.image && (
          <Image
            src={product.image.sourceUrl}
            alt={product.image.altText || product.name}
            fill
            sizes="(max-width: 768px) 40vw, 220px"
            className="object-contain transition group-hover:scale-105"
          />
        )}
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-bold text-neutral-900">
        {product.name}
      </h3>
    </Link>
  );
}

export default async function Home() {
  const [
    heroProduct,
    newFlavorsEliquids,
    newProducts,
    newFlavorsDisposables,
    newThisSeason,
    categories,
    midBannerProduct,
    topProducts,
  ] = await Promise.all([
    getProductBySlug(HERO_SLUG),
    resolveProducts(NEW_FLAVORS_ELIQUIDS),
    resolveProducts(NEW_PRODUCTS),
    resolveProducts(NEW_FLAVORS_DISPOSABLES),
    resolveProducts(NEW_THIS_SEASON),
    getAllCategories(),
    getProductBySlug(MID_BANNER_SLUG),
    resolveProducts(TOP_PRODUCTS),
  ]);

  const topCategories = TOP_CATEGORY_SLUGS.map((slug) =>
    categories.find((c) => c.slug === slug),
  ).filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div>
      {/* Announcement bar */}
      <div className="overflow-hidden bg-ink py-2.5 text-xs font-semibold text-white sm:text-sm">
        <div className="marquee-track">
          <div className="marquee-content">
            {[0, 1].map((copy) => (
              <div key={copy} className="marquee-item" aria-hidden={copy === 1}>
                <span>Disclaimer: Flavors, Quantities and Brands May Vary.</span>
                <span className="text-accent">&bull;</span>
                <span>Free Delivery</span>
                <span className="text-accent">&bull;</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Video hero */}

      <section className="relative w-full overflow-hidden bg-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="h-[300px] w-full object-cover sm:h-[400px] lg:h-[900px]"
        >
          <source src="/assets/videos/Geek-Bar-Video.mp4" type="video/mp4" />
        </video>
      </section>

      {/* Hero product */}
      {heroProduct && (
        <section className="bg-cream">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-14 sm:px-6 md:grid-cols-2 lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-accent">
                Exclusive Distributor
              </p>
              <h1 className="mt-3 text-4xl font-extrabold leading-tight text-brand sm:text-5xl">
                {heroProduct.name}
              </h1>
              <div className="mt-8">
                <Link
                  href={`/product/${heroProduct.slug}`}
                  className="rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  Shop Now
                </Link>
              </div>
            </div>
            {heroProduct.image && (
              <div className="relative mx-auto aspect-square w-full max-w-sm">
                <Image
                  src={heroProduct.image.sourceUrl}
                  alt={heroProduct.image.altText || heroProduct.name}
                  fill
                  sizes="400px"
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* New Flavors: e-liquids */}
      {newFlavorsEliquids.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand">New Flavors</h2>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-accent">
            New Bigger Size
          </p>
          <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
            {newFlavorsEliquids.map((p) => (
              <ProductRailItem key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="bg-cream py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold text-[#0057FF]">
              New <span className="text-[#FF4D7D]">Products</span>
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {newProducts.map((p) => (
                <NewProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Flavors: disposables */}
      {newFlavorsDisposables.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand">
            New Flavors <span className="text-accent">NEW</span>
          </h2>
          <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
            {newFlavorsDisposables.map((p) => (
              <ProductRailItem key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* New This Season */}
      {newThisSeason.length > 0 && (
        <section className="bg-cream py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-brand">New This Season</h2>
            <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
              {newThisSeason.map((p) => (
                <ProductRailItem key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top categories */}
      {topCategories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand">Top Categories</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover transition group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-3 text-center">
                  <span className="text-sm font-semibold text-brand">
                    {c.name} ({c.count ?? 0})
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Mid banner */}
      {midBannerProduct && (
        <section className="bg-ink py-14">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 text-center sm:px-6 lg:flex-row lg:text-left lg:px-8">
            {midBannerProduct.image && (
              <div className="relative aspect-square w-full max-w-xs shrink-0">
                <Image
                  src={midBannerProduct.image.sourceUrl}
                  alt={midBannerProduct.image.altText || midBannerProduct.name}
                  fill
                  sizes="320px"
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                {midBannerProduct.name}
              </h2>
              <Link
                href={`/product/${midBannerProduct.slug}`}
                className="mt-6 inline-block rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Top Products */}
      {topProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand">Top Products</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {topProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Top Brands */}
      <section className="bg-cream py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-brand">Top Brands</h2>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-5">
            {TOP_BRANDS.map((b) => (
              <Link
                key={b.slug}
                href={`/brand/${b.slug}`}
                className="flex items-center justify-center rounded-lg border border-black/10 bg-white p-4"
              >
                <div className="relative h-16 w-full">
                  <Image src={b.logo} alt={b.name} fill sizes="180px" className="object-contain" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Prices That Satisfies You */}
      <section className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-brand sm:text-3xl">
          Prices That Satisfies You
        </h2>
        <p className="mt-3 text-muted">Have a question about our service?</p>
        <Link
          href="/contact-us"
          className="mt-6 inline-block rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Contact Us
        </Link>
      </section>

      {/* Reliable Company */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 rounded-2xl bg-ink p-10 text-white sm:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Reliable Company</h2>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              <li>Authentic products</li>
              <li>Speedy delivery service</li>
              <li>Lowest rates</li>
              <li>Family Owned and Operated</li>
            </ul>
            <Link
              href="/about-us"
              className="mt-8 inline-block rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
