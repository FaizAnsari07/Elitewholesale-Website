"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Category, Brand } from "@/lib/wordpress";
import { mainNav } from "@/lib/site";

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
    <header className="sticky top-0 z-50 border-b border-black/10 bg-cream">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0" onClick={() => setMobileOpen(false)}>
          <Image
            src="/images/elite-wholesale-logo.png"
            alt="Elite Wholesale"
            width={220}
            height={102}
            className="h-12 w-auto sm:h-14"
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
                            {c.name}{" "}
                            <span className="text-neutral-400">({c.count ?? 0})</span>
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
          <Link
            href="/my-account"
            className="rounded-md border border-brand px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-brand hover:text-white"
          >
            Wholesale Login
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-black/10 lg:hidden"
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

      {mobileOpen && (
        <div className="border-t border-black/10 bg-white lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
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
            <Link
              href="/my-account"
              className="mt-3 rounded-md bg-brand px-4 py-2 text-center text-sm font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Wholesale Login
            </Link>
          </nav>
        </div>
      )}
    </header>
    
  );
}
