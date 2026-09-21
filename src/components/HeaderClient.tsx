"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { Category, Brand } from "@/lib/catalog";
import { mainNav } from "@/lib/site";
import SearchBox from "@/components/SearchBox";
import EnquiryCartBadge from "@/components/EnquiryCartBadge";

export function Wordmark({ className = "h-14 sm:h-16" }: { className?: string }) {
  return (
    <Image
      src="/images/elite-wholesale-logo.png"
      alt="Elite Wholesale"
      width={731}
      height={341}
      priority
      className={`w-auto ${className}`}
    />
  );
}

const linkClass =
  "rounded-lg px-3 py-2 text-sm font-extrabold uppercase tracking-wide text-foreground hover:bg-white/15 hover:text-foreground";

export default function HeaderClient({
  categories,
  brands,
}: {
  categories: Category[];
  brands: Brand[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"categories" | "brands" | null>(null);
  const pathname = usePathname();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const cls = (href: string) => `${linkClass} ${isActive(href) ? "bg-white/25 text-white" : ""}`;

  return (
    <header className="sticky top-0 z-40 p-3 sm:p-5">
      <div className="header-gradient page-shell rounded-2xl">
        <div className="flex min-h-16 items-center gap-3 py-3 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <Link href="/" className="min-w-0" onClick={() => setMobileOpen(false)} aria-label="Elite Wholesale home">
            <Wordmark />
          </Link>

          <nav className="hidden items-center justify-center gap-1 lg:flex">
            {mainNav.map((item) => {
              if (item.label === "Categories" || item.label === "Brands") {
                const key = item.label === "Categories" ? "categories" : "brands";
                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setOpenMenu(key)}
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    <Link href={item.href} className={cls(item.href)}>
                      {item.label}
                    </Link>
                    {openMenu === key && (
                      <div
                        className={`menu-solid absolute left-1/2 top-full z-50 -translate-x-1/2 rounded-xl p-3 ${
                          key === "categories" ? "w-[560px]" : "max-h-[420px] w-[640px] overflow-y-auto"
                        }`}
                      >
                        <div
                          className={`grid gap-x-4 gap-y-1 ${key === "categories" ? "grid-cols-2" : "grid-cols-3"}`}
                        >
                          {key === "categories"
                            ? categories.map((c) => (
                                <Link
                                  key={c.slug}
                                  href={`/product-category/${c.slug}`}
                                  onClick={() => setOpenMenu(null)}
                                  className="rounded-lg px-2.5 py-2 text-sm text-foreground/85 hover:bg-primary/15 hover:text-primary"
                                >
                                  {c.name}
                                </Link>
                              ))
                            : brands
                                .filter((b) => (b.count ?? 0) > 0)
                                .map((b) => (
                                  <Link
                                    key={b.slug}
                                    href={`/brand/${b.slug}`}
                                    onClick={() => setOpenMenu(null)}
                                    className="truncate rounded-lg px-2.5 py-2 text-sm text-foreground/85 hover:bg-primary/15 hover:text-primary"
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
                <Link key={item.href} href={item.href} className={cls(item.href)}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 justify-self-end lg:flex">
            <div className="w-44 xl:w-64">
              <SearchBox />
            </div>
            <EnquiryCartBadge />
          </div>

          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <EnquiryCartBadge />
            <button
              type="button"
              aria-label="Toggle menu"
              className="btn btn-secondary size-10 min-h-0 p-0"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-border py-4 lg:hidden">
            <SearchBox />
            <nav className="mt-3 grid gap-1">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-extrabold uppercase tracking-wide hover:bg-foreground/10"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
