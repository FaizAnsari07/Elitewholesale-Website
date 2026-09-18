import Link from "next/link";
import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | "...")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("...");
    result.push(p);
    prev = p;
  }
  return result;
}

export default function DataTable<T>({
  columns,
  rows,
  getRowId,
  emptyMessage = "No records found.",
  pageSize = 15,
  currentPage = 1,
  makeHref,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string | number;
  emptyMessage?: string;
  pageSize?: number;
  /** Which page to display (1-indexed). Omit for an unpaginated table. */
  currentPage?: number;
  /** Builds the href for a given page number, e.g. (n) => `/admin/products?page=${n}`. Required to enable pagination controls. */
  makeHref?: (page: number) => string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-black/10 bg-white p-10 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  const totalPages = makeHref ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1;
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const pageRows = makeHref ? rows.slice((page - 1) * pageSize, page * pageSize) : rows;

  return (
    <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-black/10 bg-cream">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 font-semibold text-ink ${col.className ?? ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {pageRows.map((row) => (
              <tr key={getRowId(row)} className="hover:bg-cream/50">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 align-middle text-ink ${col.className ?? ""}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {makeHref && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 bg-cream/50 px-4 py-3">
          <p className="text-xs text-muted">
            Showing {(page - 1) * pageSize + 1}
            &ndash;{Math.min(page * pageSize, rows.length)} of {rows.length}
          </p>
          <div className="flex items-center gap-1">
            <PagerLink href={page > 1 ? makeHref(page - 1) : null} label="Previous page">
              &lsaquo;
            </PagerLink>
            {getPageNumbers(page, totalPages).map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-1.5 text-sm text-muted">
                  &hellip;
                </span>
              ) : (
                <Link
                  key={p}
                  href={makeHref(p)}
                  aria-current={p === page ? "page" : undefined}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold transition ${
                    p === page ? "bg-brand text-white" : "border border-black/15 text-ink hover:bg-white"
                  }`}
                >
                  {p}
                </Link>
              ),
            )}
            <PagerLink href={page < totalPages ? makeHref(page + 1) : null} label="Next page">
              &rsaquo;
            </PagerLink>
          </div>
        </div>
      )}
    </div>
  );
}

function PagerLink({
  href,
  label,
  children,
}: {
  href: string | null;
  label: string;
  children: ReactNode;
}) {
  if (!href) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-black/10 text-black/25">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-black/15 text-ink hover:bg-white"
    >
      {children}
    </Link>
  );
}
