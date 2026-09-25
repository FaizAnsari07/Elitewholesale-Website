import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { flavorCounts, flavorsText, formatGenerated, type ExportData, type ExportMeta } from "@/lib/product-export";

// jsPDF's built-in fonts only cover Windows-1252. Anything else would print as garbage,
// so replace unsupported characters instead.
const CP1252_EXTRA = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";
function pdfSafe(text: string): string {
  let out = "";
  for (const ch of text.normalize("NFC")) {
    const code = ch.codePointAt(0) ?? 0;
    const ok = (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || CP1252_EXTRA.includes(ch);
    out += ok ? ch : ch === "\n" ? " " : "?";
  }
  return out;
}

const NAVY: [number, number, number] = [31, 58, 95];
const GREEN: [number, number, number] = [21, 128, 61];
const RED: [number, number, number] = [185, 28, 28];

export function buildProductsPdf(data: ExportData, meta: ExportMeta): ArrayBuffer {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 10;

  // ---- Title block (first page) ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...NAVY);
  doc.text("Elite Wholesale", margin, 14);
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text("Products catalogue", margin, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  const t = data.totals;
  const summary =
    `${t.products} product${t.products === 1 ? "" : "s"}  |  ${t.active} active  |  ${t.inactive} inactive` +
    `  |  ${t.flavors} flavor${t.flavors === 1 ? "" : "s"}` +
    (t.inactiveFlavors > 0 ? ` (${t.inactiveFlavors} inactive)` : "");
  doc.text(pdfSafe(`Generated: ${formatGenerated(meta.generatedAt)}`), pageW - margin, 14, { align: "right" });
  doc.text(pdfSafe(summary), pageW - margin, 19, { align: "right" });
  const filterLine = meta.filters.length ? `Filters: ${meta.filters.join("  |  ")}` : "Filters: none (all products)";
  doc.text(pdfSafe(filterLine), margin, 26);

  // ---- Columns: only those that have data ----
  type Key = "no" | "name" | "category" | "brand" | "sku" | "price" | "count" | "flavors" | "status" | "published";
  const columns: { key: Key; header: string; width?: number; align?: "left" | "center" }[] = [
    { key: "no", header: "#", width: 9, align: "center" },
    { key: "name", header: "Product", width: 52 },
    { key: "category", header: "Category", width: 30 },
    ...(data.columns.brand ? [{ key: "brand" as Key, header: "Brand", width: 26 }] : []),
    ...(data.columns.sku ? [{ key: "sku" as Key, header: "SKU", width: 20 }] : []),
    ...(data.columns.price ? [{ key: "price" as Key, header: "Price", width: 16 }] : []),
    { key: "count", header: "Flavors\n(active/total)", width: 20, align: "center" },
    { key: "flavors", header: "Flavors / Options" }, // takes the remaining width
    { key: "status", header: "Status", width: 17, align: "center" },
    { key: "published", header: "Published", width: 19, align: "center" },
  ];

  const body = data.rows.map((r, i) => {
    const c = flavorCounts(r.flavors);
    return {
      no: String(i + 1),
      name: pdfSafe(r.name),
      category: pdfSafe(r.category || "—"),
      brand: pdfSafe(r.brand || "—"),
      sku: pdfSafe(r.sku || "—"),
      price: r.price ? pdfSafe(/^\d+(\.\d+)?$/.test(r.price) ? `$${r.price}` : r.price) : "—",
      count: c.total > 0 ? `${c.active} / ${c.total}` : "—",
      flavors: c.total > 0 ? pdfSafe(flavorsText(r.flavors)) : "—",
      status: r.status,
      published: r.published,
    };
  });

  autoTable(doc, {
    startY: 30,
    margin: { top: 12, left: margin, right: margin, bottom: 14 },
    columns: columns.map((c) => ({ header: c.header, dataKey: c.key })),
    body,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 1.8,
      overflow: "linebreak",
      valign: "top",
      lineColor: [214, 220, 229],
      lineWidth: 0.1,
      textColor: [30, 30, 30],
    },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold", halign: "left", valign: "middle" },
    alternateRowStyles: { fillColor: [247, 249, 252] },
    columnStyles: Object.fromEntries(
      columns.map((c) => [
        c.key,
        { ...(c.width ? { cellWidth: c.width } : {}), halign: c.align ?? "left" },
      ]),
    ),
    // Colour the Status cell and tint rows of inactive products.
    didParseCell: (hook) => {
      if (hook.section !== "body") return;
      const row = data.rows[hook.row.index];
      if (!row) return;
      if (row.status === "Inactive") hook.cell.styles.fillColor = [254, 242, 242];
      if (hook.column.dataKey === "status") {
        hook.cell.styles.fontStyle = "bold";
        hook.cell.styles.textColor = row.status === "Active" ? GREEN : RED;
      }
    },
  });

  // ---- Footer on every page ----
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Elite Wholesale - Products", margin, pageH - 6);
    doc.text(`Page ${p} of ${pages}`, pageW - margin, pageH - 6, { align: "right" });
  }

  return doc.output("arraybuffer");
}
