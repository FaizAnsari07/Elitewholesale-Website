import type { AdminProduct } from "@/lib/admin-api";

export type ProductShow = "all" | "active" | "inactive";

export type ProductFilters = {
  q?: string | undefined;
  categoryId?: number | undefined;
  brandId?: number | undefined;
  show: ProductShow;
};

type RawParams = { q?: string | undefined; category?: string | undefined; brand?: string | undefined; show?: string | undefined };

// One place that reads the Products page's filters, so the list on screen and the
// Excel/PDF exports always contain exactly the same products.
export function parseProductFilters(params: RawParams): ProductFilters {
  return {
    q: params.q?.trim() || undefined,
    categoryId: Number(params.category) || undefined,
    brandId: Number(params.brand) || undefined,
    show: params.show === "active" || params.show === "inactive" ? params.show : "all",
  };
}

// Category / brand narrowing (the text search is done by the API).
export function scopeProducts(all: AdminProduct[], f: ProductFilters): AdminProduct[] {
  return all.filter(
    (p) =>
      (!f.categoryId || p.categories.some((c) => c.id === f.categoryId)) &&
      (!f.brandId || p.brands.some((b) => b.id === f.brandId)),
  );
}

export function isActive(p: AdminProduct): boolean {
  return p.stock_status === "instock";
}

// Applies the Active / Inactive tab on top of the category / brand scope.
export function applyShow(scoped: AdminProduct[], show: ProductShow): AdminProduct[] {
  return scoped.filter((p) => show === "all" || (show === "active" ? isActive(p) : !isActive(p)));
}

// Human-readable description of the active filters (used in export headers).
export function describeFilters(f: ProductFilters, names: { category?: string | undefined; brand?: string | undefined }): string[] {
  const parts: string[] = [];
  if (f.categoryId) parts.push(`Category: ${names.category ?? `#${f.categoryId}`}`);
  if (f.brandId) parts.push(`Brand: ${names.brand ?? `#${f.brandId}`}`);
  if (f.q) parts.push(`Search: \u201c${f.q}\u201d`);
  if (f.show !== "all") parts.push(`Status: ${f.show === "active" ? "Active only" : "Inactive only"}`);
  return parts;
}
