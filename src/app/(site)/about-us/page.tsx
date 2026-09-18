import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Elite Wholesale provides top-quality wholesale vapes, torches, lighters, exotic snacks, and smoking accessories across the USA.",
};

const partnerBrands = [
  { name: "Geek Bar", slug: "geek-bar", logo: "/images/2025/03/geek-bar.png" },
  { name: "Coastal Clouds", slug: "coastal-clouds", logo: "/images/2025/03/coastal-clouds.png" },
  { name: "O.P.M.S", slug: "o-p-m-s", logo: "/images/2025/03/opms.png" },
  { name: "Tre House", slug: "tre-house", logo: "/images/2025/03/house.png" },
  { name: "Off Stamp", slug: "off-stamp", logo: "/images/2025/03/off-stamp.png" },
  { name: "PrivBar", slug: "privbar", logo: "/images/2025/03/priv-bar.png" },
  { name: "Pyne Pod", slug: "pyne-pod", logo: "/images/2025/03/pyne-pod.png" },
];

export default function AboutUsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-brand sm:text-4xl">About Us</h1>

      <div className="mt-10 grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_320px]">
        <div className="space-y-5 text-muted">
          <p>
            Established in 2024, Elite Wholesale is a premier wholesaler
            located in Portland, Oregon, focused on providing a wide range of
            electronic cigarette products, and everything else that is
            related to the industry.
          </p>
          <p>
            We cater to convenience stores, gas stations, liquor stores, vape
            shops, and smoke shops. Elite Wholesale serves as a comprehensive
            sales platform, allowing you to browse and order the latest and
            most popular disposables, vape devices, kratom, e-liquids, glass,
            and other accessories.
          </p>
          <p>
            We have also established long-term relationships with renowned
            brands such as SMOK, SPACEMAN, PynePod, EAVINWHIP, and Natures
            Organix, aiming to provide competitive prices and the best
            service for all our customers.
          </p>
        </div>
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[260px]">
          <Image
            src="/images/2025/02/vape_kit_mockup_02.png"
            alt="Elite Wholesale vape product kit"
            fill
            sizes="260px"
            className="object-contain"
          />
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-accent">
          Brands We Carry
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {partnerBrands.map((b) => (
            <a
              key={b.slug}
              href={`/brand/${b.slug}`}
              className="flex items-center justify-center rounded-lg border border-black/10 bg-surface p-4"
            >
              <div className="relative h-16 w-full">
                <Image src={b.logo} alt={b.name} fill sizes="180px" className="object-contain" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
