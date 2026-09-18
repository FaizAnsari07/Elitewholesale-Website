import Image from "next/image";
import Link from "next/link";
import { getAllCategories } from "@/lib/wordpress";
import { siteConfig } from "@/lib/site";

export default async function Footer() {
  const year = new Date().getFullYear();
  const categories = await getAllCategories();
  const topCategories = categories
    .slice()
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .slice(0, 8);

  return (
    <footer className="mt-16 border-t border-black/10 bg-surface text-ink">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <Image
            src="/images/elite-wholesale-logo.png"
            alt="Elite Wholesale"
            width={200}
            height={92}
            className="h-12 w-auto"
          />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {siteConfig.description}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand">
            Categories
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {topCategories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/product-category/${c.slug}`}
                  className="hover:text-accent"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand">
            Company
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/about-us" className="hover:text-accent">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact-us" className="hover:text-accent">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-accent">
                Shop
              </Link>
            </li>
            <li>
              <Link href="/refund_returns" className="hover:text-accent">
                Refund &amp; Returns Policy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand">
            Get In Touch
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              {siteConfig.address.line1}
              <br />
              {siteConfig.address.line2}
            </li>
            <li>
              <a href={siteConfig.phoneHref} className="hover:text-accent">
                {siteConfig.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.email}`} className="hover:text-accent">
                {siteConfig.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 bg-ink py-6 text-center text-xs text-white/60">
        &copy; {year} Elite Wholesale. All rights reserved.
      </div>
    </footer>
  );
}
