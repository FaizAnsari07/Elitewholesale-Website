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
    <div className="page-shell py-12">
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_320px] lg:gap-16">
        <div className="space-y-5 text-muted-foreground">
          <div>
            <p className="section-label">About us</p>
            <h1 className="mt-3 text-4xl font-black text-foreground sm:text-5xl">Built for independent retail</h1>
          </div>
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
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[280px]">
          <Image
            src="/images/2025/02/vape_kit_mockup_02.png"
            alt="Elite Wholesale vape product kit"
            fill
            sizes="280px"
            className="object-contain"
          />
        </div>
      </div>

      <div className="glass-strong mt-16 rounded-3xl p-6 sm:p-10">
        <p className="section-label text-center">Trusted partners</p>
        <h2 className="mt-2 text-center font-display text-3xl font-black">Brands we carry</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-5">
          {partnerBrands.map((b) => (
            <a
              key={b.slug}
              href={`/brand/${b.slug}`}
              className="group flex w-[calc(50%-0.625rem)] items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-white to-slate-100 p-5 shadow-lg transition duration-300 sm:w-[calc(25%-0.95rem)] hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_oklch(0.81_0.14_210/50%)]"
            >
              <div className="relative h-16 w-full transition duration-300 group-hover:scale-105">
                <Image src={b.logo} alt={b.name} fill sizes="180px" className="object-contain" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
