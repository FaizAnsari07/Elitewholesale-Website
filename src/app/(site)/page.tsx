import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Store, Tag, Truck } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getAllCategories, getProductBySlug, orFallback, type Product } from "@/lib/catalog";

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
  { name: "Ignitus", slug: "ignitus", logo: "/images/2025/04/Ignitus-Icon.jpg" },
  { name: "Nexa", slug: "nexa", logo: "/images/2025/03/nexa-png.png" },
  { name: "Geek Bar", slug: "geek-bar", logo: "/images/2025/03/geek-bar.png" },
];

const RELIABLE_COMPANY_FEATURES = [
  { label: "Authentic products", path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Speedy delivery service", path: "M13 10V3L4 14h7v7l9-11h-7z" },
  {
    label: "Lowest rates",
    path: "M7 7h.01M7 3h5.586a1 1 0 01.707.293l6.414 6.414a1 1 0 010 1.414l-7.586 7.586a1 1 0 01-1.414 0L3.293 12.293A1 1 0 013 11.586V6a3 3 0 013-3z",
  },
  {
    label: "Family Owned and Operated",
    path: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
];

async function resolveProducts(slugs: string[]): Promise<Product[]> {
  const results = await orFallback(Promise.all(slugs.map(getProductBySlug)), []);
  return results.filter((p): p is Product => Boolean(p));
}

function Rail({ items }: { items: Product[] }) {
  return (
    <div className="-mx-1 mt-7 flex gap-4 overflow-x-auto px-1 pb-3">
      {items.map((p) => (
        <div key={p.id} className="w-56 shrink-0 sm:w-64">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}

function Heading({ label, title, href }: { label: string; title: string; href?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="section-label">{label}</p>
        <h2 className="mt-2 text-3xl font-black">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="hidden text-sm font-semibold text-primary sm:block">
          View all <ArrowRight className="inline size-4" />
        </Link>
      )}
    </div>
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
    orFallback(getProductBySlug(HERO_SLUG), null),
    resolveProducts(NEW_FLAVORS_ELIQUIDS),
    resolveProducts(NEW_PRODUCTS),
    resolveProducts(NEW_FLAVORS_DISPOSABLES),
    resolveProducts(NEW_THIS_SEASON),
    orFallback(getAllCategories(), []),
    orFallback(getProductBySlug(MID_BANNER_SLUG), null),
    resolveProducts(TOP_PRODUCTS),
  ]);

  const topCategories = TOP_CATEGORY_SLUGS.map((slug) =>
    categories.find((c) => c.slug === slug),
  ).filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div>
      {/* Announcement bar: 12 items in two identical halves, animated by -50%, so
          the message fills the full width and loops without a gap. */}
      <div className="surface-dark mx-3 overflow-hidden rounded-xl py-2.5 text-xs font-semibold sm:mx-5 sm:text-sm">
        <div className="marquee-track">
          <div className="marquee-content">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="marquee-item" aria-hidden={i > 0}>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-primary-foreground">
                  <Truck className="size-3.5" />
                  Free Delivery
                </span>
                <span className="text-foreground/80">
                  Disclaimer: Flavors, Quantities and Brands May Vary.
                </span>
                <span className="size-1.5 shrink-0 rounded-full bg-primary/60" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero: text on the left, video on the right */}
      <section className="page-shell grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-20">
        <div>
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase text-foreground/80">
            <span className="size-2 rounded-full bg-primary" />
            Gas station · convenience · smoke shop supply
          </span>
          <h1 className="mt-7 font-display text-5xl font-black leading-[.92] sm:text-7xl xl:text-8xl">
            Wholesale,
            <br />
            <em className="text-primary">without</em> the wait.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-7 text-muted-foreground">
            Explore our catalogue of trusted products for independent retailers and build an enquiry in minutes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn btn-primary">
              Browse catalogue <ArrowRight className="size-4" />
            </Link>
            <Link href="/enquiry" className="btn btn-secondary">
              Build an enquiry
            </Link>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[
              { Icon: Truck, label: "Free delivery" },
              { Icon: ShieldCheck, label: "Authentic products" },
              { Icon: Store, label: "Family operated" },
            ].map(({ Icon, label }) => (
              <div key={label} className="border-l border-border pl-3">
                <Icon className="size-5 text-primary" />
                <p className="mt-2 text-xs font-semibold text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="glass-strong overflow-hidden rounded-3xl p-2.5 shadow-2xl sm:p-3">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="aspect-[4/3] w-full rounded-2xl object-cover lg:aspect-[5/4]"
            >
              <source src="/assets/videos/Geek-Bar-Video.mp4" type="video/mp4" />
            </video>
          </div>
          {heroProduct && (
            <Link
              href={`/product/${heroProduct.slug}`}
              className="surface-dark absolute -bottom-4 left-4 rounded-xl p-4 transition hover:border-primary/50 sm:left-6"
            >
              <p className="section-label">Exclusive distributor</p>
              <p className="mt-1 max-w-52 font-display font-bold">{heroProduct.name}</p>
            </Link>
          )}
        </div>
      </section>

      {/* New Flavors: e-liquids */}
      {newFlavorsEliquids.length > 0 && (
        <section className="page-shell py-16">
          <Heading label="New bigger size" title="New flavors" />
          <Rail items={newFlavorsEliquids} />
        </section>
      )}

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="page-shell py-16">
          <Heading label="Just landed" title="New products" href="/shop" />
          <div className="product-grid mt-7">
            {newProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* New Flavors: disposables */}
      {newFlavorsDisposables.length > 0 && (
        <section className="page-shell py-16">
          <Heading label="Disposables" title="New flavors" href="/product-category/disposable-vapes" />
          <Rail items={newFlavorsDisposables} />
        </section>
      )}

      {/* New This Season */}
      {newThisSeason.length > 0 && (
        <section className="page-shell py-16">
          <Heading label="Seasonal" title="New this season" />
          <Rail items={newThisSeason} />
        </section>
      )}

      {/* Top categories */}
      {topCategories.length > 0 && (
        <section className="page-shell py-16">
          <p className="section-label">Departments</p>
          <h2 className="mt-2 text-3xl font-black">Top categories</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/product-category/${c.slug}`}
                className="glass group grid grid-cols-[1fr_7rem] items-center overflow-hidden rounded-2xl p-5 transition hover:border-primary/50"
              >
                <div>
                  <Tag className="size-5 text-primary" />
                  <h3 className="mt-8 text-lg font-bold">{c.name}</h3>
                  {typeof c.count === "number" && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.count} catalogue item{c.count === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
                <div className="relative aspect-square w-full">
                  {c.image && (
                    <Image
                      src={c.image.sourceUrl}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-contain transition group-hover:scale-105"
                    />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Mid banner */}
      {midBannerProduct && (
        <section className="page-shell py-16">
          <div className="glass-strong grid items-center gap-8 rounded-2xl p-6 sm:p-10 lg:grid-cols-[18rem_1fr]">
            {midBannerProduct.image && (
              <div className="relative mx-auto aspect-square w-full max-w-xs">
                <Image
                  src={midBannerProduct.image.sourceUrl}
                  alt={midBannerProduct.image.altText || midBannerProduct.name}
                  fill
                  sizes="320px"
                  className="object-contain"
                />
              </div>
            )}
            <div className="text-center lg:text-left">
              <p className="section-label">Featured line</p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">{midBannerProduct.name}</h2>
              <Link href={`/product/${midBannerProduct.slug}`} className="btn btn-primary mt-6">
                Shop now <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Top Products */}
      {topProducts.length > 0 && (
        <section className="page-shell py-16">
          <Heading label="Catalogue" title="Top products" href="/shop" />
          <div className="product-grid mt-7">
            {topProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Top Brands */}
      <section className="page-shell py-16">
        <div className="glass-strong rounded-2xl p-6 sm:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-label">Brands</p>
              <h2 className="mt-2 text-3xl font-black">Names on our shelves</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                The trusted names our wholesale customers stock again and again.
              </p>
            </div>
            <Link href="/brands" className="text-sm font-semibold text-primary">
              All brands
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {TOP_BRANDS.map((b) => (
              <Link
                key={b.slug}
                href={`/brand/${b.slug}`}
                className="rounded-xl border border-border bg-foreground/5 p-4 text-center transition hover:border-primary/50"
              >
                <div className="relative mx-auto h-24 w-full max-w-40 rounded-lg bg-white">
                  <Image src={b.logo} alt="" fill sizes="160px" className="object-contain p-2" />
                </div>
                <h3 className="mt-3 text-sm font-bold">{b.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Prices + Reliable Company, sharing one smoke video background */}
      <section className="relative overflow-hidden py-20">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/assets/videos/smoke.mp4" type="video/mp4" />
        </video>

        <div className="page-shell relative">
          <div className="text-center">
            <p className="section-label !text-white drop-shadow">Wholesale pricing</p>
            <h2 className="mt-2 text-3xl font-black drop-shadow-lg">Prices that satisfy you</h2>
            <p className="mt-3 font-medium text-white drop-shadow-md">Have a question about our service?</p>
            <Link href="/contact-us" className="btn btn-primary mt-6">
              Contact us
            </Link>
          </div>

          <div className="mx-auto mt-16 max-w-4xl border-t border-border pt-16 text-center">
            <h2 className="text-3xl font-black drop-shadow-lg">Reliable company</h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {RELIABLE_COMPANY_FEATURES.map((f) => (
                <div key={f.label} className="flex flex-col border border-white/25 bg-white/15 backdrop-blur-sm items-center gap-3 rounded-xl p-5 text-center">
                  <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
                    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={f.path} />
                    </svg>
                  </span>
                  <span className="text-sm font-semibold">{f.label}</span>
                </div>
              ))}
            </div>
            <Link href="/about-us" className="btn btn-primary mt-10">
              Get started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
