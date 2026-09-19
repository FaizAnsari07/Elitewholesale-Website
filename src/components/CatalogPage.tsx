import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Category, Product } from "@/lib/catalog";

export const CATALOG_PAGE_SIZE = 24;

export function parsePage(value: string | undefined): number {
  return Math.max(1, Math.floor(Number(value)) || 1);
}

function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...keep].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (prev && n - prev > 1) out.push("…");
    out.push(n);
    prev = n;
  }
  return out;
}

function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (n: number) => string;
}) {
  if (totalPages <= 1) return null;
  const box =
    "grid h-9 min-w-9 place-items-center rounded-lg border border-border px-2 text-sm font-semibold transition";
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center gap-1.5">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} aria-label="Previous page" className={`${box} hover:border-primary hover:text-primary`}>
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={`${box} opacity-40`}><ChevronLeft className="size-4" /></span>
      )}
      {pageNumbers(page, totalPages).map((n, i) =>
        n === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground">…</span>
        ) : (
          <Link
            key={n}
            href={hrefFor(n)}
            aria-current={n === page ? "page" : undefined}
            className={`${box} ${
              n === page
                ? "border-primary bg-primary text-primary-foreground"
                : "hover:border-primary hover:text-primary"
            }`}
          >
            {n}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} aria-label="Next page" className={`${box} hover:border-primary hover:text-primary`}>
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={`${box} opacity-40`}><ChevronRight className="size-4" /></span>
      )}
    </nav>
  );
}

export default function CatalogPage({
  title,
  eyebrow = "Wholesale catalogue",
  description,
  items,
  categories,
  query,
  emptyMessage = "Try a different search or browse a department.",
  basePath,
  page = 1,
  queryParams = {},
}: {
  title: string;
  eyebrow?: string;
  description: string;
  items: Product[];
  categories: Category[];
  query?: string;
  emptyMessage?: string;
  /** Path used to build page links, e.g. "/shop". */
  basePath: string;
  page?: number;
  /** Extra query params kept on every page link (e.g. the search term). */
  queryParams?: Record<string, string>;
}) {
  const totalPages = Math.max(1, Math.ceil(items.length / CATALOG_PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * CATALOG_PAGE_SIZE;
  const pageItems = items.slice(start, start + CATALOG_PAGE_SIZE);
  const hrefFor = (n: number) => {
    const params = new URLSearchParams(queryParams);
    if (n > 1) params.set("page", String(n));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="page-shell py-12">
      <div className="max-w-3xl">
        <p className="section-label">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">{title}</h1>
        <p className="mt-4 text-muted-foreground">{description}</p>
      </div>

      <div className="mt-10 grid gap-7 lg:grid-cols-[220px_1fr]">
        <aside className="glass hidden h-fit rounded-xl p-3 lg:block">
          <p className="section-label px-2 py-2">Departments</p>
          <nav className="mt-2 grid gap-1">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/product-category/${c.slug}`}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              >
                <span className="truncate">{c.name}</span>
                {typeof c.count === "number" && <span className="text-xs">{c.count}</span>}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          {items.length ? (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                <p className="text-sm text-muted-foreground">
                  Showing {start + 1}–{start + pageItems.length} of {items.length} product
                  {items.length === 1 ? "" : "s"}
                  {query ? " found" : ""}
                </p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Pagination page={current} totalPages={totalPages} hrefFor={hrefFor} />
                  <Link href="/categories" className="text-sm font-semibold text-primary">
                    Browse categories <ArrowRight className="inline size-4" />
                  </Link>
                </div>
              </div>
              <div className="product-grid">
                {pageItems.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-10 flex justify-center">
                  <Pagination page={current} totalPages={totalPages} hrefFor={hrefFor} />
                </div>
              )}
            </>
          ) : (
            <div className="glass rounded-2xl p-14 text-center">
              <PackageSearch className="mx-auto size-12 text-primary" />
              <h2 className="mt-5 text-xl font-bold">No products found</h2>
              <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
