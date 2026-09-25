import type { AdminProduct } from "@/lib/admin-api";
import { isActive } from "@/lib/admin-products-filter";

export type ExportFlavor = { label: string; active: boolean };

export type ExportRow = {
  name: string;
  category: string;
  brand: string;
  sku: string;
  price: string;
  status: "Active" | "Inactive";
  published: "Published" | "Draft";
  type: "With flavors" | "Single product";
  flavors: ExportFlavor[];
  added: string;
};

export type ExportData = {
  rows: ExportRow[];
  // A column is only exported when at least one product actually has data for it.
  columns: { brand: boolean; sku: boolean; price: boolean; added: boolean };
  totals: {
    products: number;
    active: number;
    inactive: number;
    withFlavors: number;
    flavors: number;
    activeFlavors: number;
    inactiveFlavors: number;
  };
};

export type ExportMeta = { generatedAt: Date; filters: string[] };

const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });
const compare = (a: string, b: string) => collator.compare(a, b);

export function flavorCounts(flavors: ExportFlavor[]): { active: number; total: number } {
  return { active: flavors.filter((f) => f.active).length, total: flavors.length };
}

// "Blue Razz Ice, Grape, Mango (Inactive)"
export function flavorsText(flavors: ExportFlavor[]): string {
  return flavors.map((f) => (f.active ? f.label : `${f.label} (Inactive)`)).join(", ");
}

export function buildExportData(products: AdminProduct[]): ExportData {
  const rows: ExportRow[] = products.map((p) => ({
    name: p.name.trim(),
    category: p.categories.map((c) => c.name).join(", "),
    brand: p.brands.map((b) => b.name).join(", "),
    sku: (p.sku ?? "").trim(),
    price: (p.regular_price ?? "").trim(),
    status: isActive(p) ? "Active" : "Inactive",
    published: p.status === "draft" ? "Draft" : "Published",
    type: p.variations.length > 0 ? "With flavors" : "Single product",
    flavors: p.variations
      .map((v) => ({ label: v.label.trim(), active: v.stock_status === "instock" }))
      .filter((f) => f.label !== "")
      .sort((a, b) => compare(a.label, b.label)),
    added: (p.date_created ?? "").slice(0, 10),
  }));

  // Grouped by category, then A-Z by name, like reading a catalogue.
  rows.sort((a, b) => compare(a.category || "￿", b.category || "￿") || compare(a.name, b.name));

  const allFlavors = rows.flatMap((r) => r.flavors);
  return {
    rows,
    columns: {
      brand: rows.some((r) => r.brand !== ""),
      sku: rows.some((r) => r.sku !== ""),
      price: rows.some((r) => r.price !== ""),
      added: rows.some((r) => r.added !== ""),
    },
    totals: {
      products: rows.length,
      active: rows.filter((r) => r.status === "Active").length,
      inactive: rows.filter((r) => r.status === "Inactive").length,
      withFlavors: rows.filter((r) => r.flavors.length > 0).length,
      flavors: allFlavors.length,
      activeFlavors: allFlavors.filter((f) => f.active).length,
      inactiveFlavors: allFlavors.filter((f) => !f.active).length,
    },
  };
}

export function formatGenerated(d: Date): string {
  return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })}, ${d
    .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC`;
}

export function fileStamp(d: Date): string {
  return d.toISOString().slice(0, 10);
}
