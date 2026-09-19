"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Category, Brand } from "@/lib/catalog";
import { mainNav, siteConfig } from "@/lib/site";
import SearchBox from "@/components/SearchBox";
import EnquiryCartBadge from "@/components/EnquiryCartBadge";

export default function HeaderClient({
  categories,
  brands,
}: {
  categories: Category[];
  brands: Brand[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"categories" | "brands" | null>(null);

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Utility bar */}
      <div className="hidden bg-brand text-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs font-medium sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <a href={siteConfig.phoneHref} className="flex items-center gap-1.5 hover:text-white/80">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 00-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97a1.125 1.125 0 00.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                />
              </svg>
              {siteConfig.phone}
            </a>
            <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-1.5 hover:text-white/80">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              {siteConfig.email}
            </a>
          </div>
          <span className="text-white/85">Mon&ndash;Fri: 9:00 AM &ndash; 6:00 PM &bull; Wholesale orders only</span>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-brand/15 bg-gradient-to-b from-cream to-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0" onClick={() => setMobileOpen(false)}>
          <Image
            src="/images/elite-wholesale-logo.png"
            alt="Elite Wholesale"
            width={320}
            height={149}
            className="h-14 w-auto sm:h-[4.5rem] lg:h-20"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {mainNav.map((item) => {
            if (item.label === "Categories") {
              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setOpenMenu("categories")}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <Link
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm font-semibold text-brand hover:text-ink"
                  >
                    Categories
                  </Link>
                  {openMenu === "categories" && (
                    <div className="absolute left-1/2 top-full w-[560px] -translate-x-1/2 rounded-b-lg border border-black/10 bg-white p-4 shadow-xl">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {categories.map((c) => (
                          <Link
                            key={c.slug}
                            href={`/product-category/${c.slug}`}
                            className="rounded px-2 py-1.5 text-sm text-neutral-700 hover:bg-cream hover:text-brand-dark"
                          >
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            if (item.label === "Brands") {
              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setOpenMenu("brands")}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <Link
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm font-semibold text-brand hover:text-ink"
                  >
                    Brands
                  </Link>
                  {openMenu === "brands" && (
                    <div className="absolute left-1/2 top-full max-h-[420px] w-[640px] -translate-x-1/2 overflow-y-auto rounded-b-lg border border-black/10 bg-white p-4 shadow-xl">
                      <div className="grid grid-cols-3 gap-x-6 gap-y-1">
                        {brands
                          .filter((b) => (b.count ?? 0) > 0)
                          .map((b) => (
                            <Link
                              key={b.slug}
                              href={`/brand/${b.slug}`}
                              className="truncate rounded px-2 py-1.5 text-sm text-neutral-700 hover:bg-cream hover:text-brand-dark"
                            >
                              {b.name}
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-semibold text-brand hover:text-ink"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="w-56">
            <SearchBox />
          </div>
          <EnquiryCartBadge />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <EnquiryCartBadge />
          <button
            type="button"
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-black/10"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-black/10 bg-white lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
            <div className="pb-3">
              <SearchBox />
            </div>
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-black/5 py-3 text-sm font-semibold text-brand"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <div className="h-[3px] w-full bg-gradient-to-r from-brand via-accent to-brand" />
    </header>
  );
}
