import ExcelJS from "exceljs";
import { flavorCounts, flavorsText, formatGenerated, type ExportData, type ExportMeta } from "@/lib/product-export";

const HEADER_FILL = "FF1F3A5F";
const GREEN = "FF15803D";
const RED = "FFB91C1C";
const INACTIVE_ROW_FILL = "FFFEF2F2";

type Col = { header: string; key: string; width: number; wrap?: boolean; center?: boolean };

function styleHeader(ws: ExcelJS.Worksheet, withFilter = true) {
  const row = ws.getRow(1);
  row.height = 24;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });
  ws.views = [{ state: "frozen", ySplit: 1 }];
  if (withFilter) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };
}

function styleBody(ws: ExcelJS.Worksheet, cols: Col[], statusKey: string, inactiveRows: Set<number>) {
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    cols.forEach((col, i) => {
      const cell = row.getCell(i + 1);
      cell.alignment = {
        vertical: "top",
        horizontal: col.center ? "center" : "left",
        wrapText: col.wrap ?? false,
      };
      cell.border = { bottom: { style: "hair", color: { argb: "FFCBD5E1" } } };
      if (inactiveRows.has(rowNumber)) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: INACTIVE_ROW_FILL } };
      if (col.key === statusKey) {
        cell.font = { bold: true, color: { argb: cell.value === "Active" ? GREEN : RED } };
      }
    });
  });
}

export async function buildProductsWorkbook(data: ExportData, meta: ExportMeta): Promise<ArrayBuffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Elite Wholesale";
  wb.created = meta.generatedAt;

  // ---- Sheet 1: Products (one row per product) ----
  const ws = wb.addWorksheet("Products");
  const cols: Col[] = [
    { header: "No.", key: "no", width: 6, center: true },
    { header: "Product Name", key: "name", width: 44, wrap: true },
    { header: "Category", key: "category", width: 26, wrap: true },
    ...(data.columns.brand ? [{ header: "Brand", key: "brand", width: 22, wrap: true }] : []),
    ...(data.columns.sku ? [{ header: "SKU", key: "sku", width: 16 }] : []),
    ...(data.columns.price ? [{ header: "Price", key: "price", width: 12 }] : []),
    { header: "Type", key: "type", width: 16 },
    { header: "Flavors (Active / Total)", key: "count", width: 14, center: true },
    { header: "Flavors", key: "flavors", width: 70, wrap: true },
    { header: "Status", key: "status", width: 11, center: true },
    { header: "Published", key: "published", width: 12, center: true },
    ...(data.columns.added ? [{ header: "Date Added", key: "added", width: 13, center: true }] : []),
  ];
  ws.columns = cols.map(({ header, key, width }) => ({ header, key, width }));

  const inactiveRows = new Set<number>();
  data.rows.forEach((r, i) => {
    const c = flavorCounts(r.flavors);
    ws.addRow({
      no: i + 1,
      name: r.name,
      category: r.category || "—",
      brand: r.brand || "—",
      sku: r.sku || "—",
      price: r.price === "" ? "—" : Number.isFinite(Number(r.price)) ? Number(r.price) : r.price,
      type: r.type,
      count: c.total > 0 ? `${c.active} / ${c.total}` : "—",
      flavors: c.total > 0 ? flavorsText(r.flavors) : "—",
      status: r.status,
      published: r.published,
      added: r.added || "—",
    });
    if (r.status === "Inactive") inactiveRows.add(i + 2);
  });
  styleHeader(ws);
  styleBody(ws, cols, "status", inactiveRows);
  if (data.columns.price) {
    const idx = cols.findIndex((c) => c.key === "price") + 1;
    ws.getColumn(idx).numFmt = "$#,##0.00";
  }

  // ---- Sheet 2: Flavors (one row per flavor, easy to filter) ----
  const fs = wb.addWorksheet("Flavors");
  const fcols: Col[] = [
    { header: "Product Name", key: "name", width: 44, wrap: true },
    { header: "Category", key: "category", width: 26, wrap: true },
    ...(data.columns.brand ? [{ header: "Brand", key: "brand", width: 22, wrap: true }] : []),
    { header: "Flavor / Option", key: "flavor", width: 36, wrap: true },
    { header: "Status", key: "status", width: 11, center: true },
  ];
  fs.columns = fcols.map(({ header, key, width }) => ({ header, key, width }));
  const inactiveFlavorRows = new Set<number>();
  let n = 1;
  for (const r of data.rows) {
    for (const f of r.flavors) {
      n += 1;
      fs.addRow({
        name: r.name,
        category: r.category || "—",
        brand: r.brand || "—",
        flavor: f.label,
        status: f.active ? "Active" : "Inactive",
      });
      if (!f.active) inactiveFlavorRows.add(n);
    }
  }
  styleHeader(fs);
  styleBody(fs, fcols, "status", inactiveFlavorRows);

  // ---- Sheet 3: Summary ----
  const ss = wb.addWorksheet("Summary");
  ss.columns = [
    { header: "Item", key: "k", width: 30 },
    { header: "Value", key: "v", width: 60 },
  ];
  const t = data.totals;
  const lines: [string, string | number][] = [
    ["Report", "Elite Wholesale – Products"],
    ["Generated", formatGenerated(meta.generatedAt)],
    ["Filters", meta.filters.length ? meta.filters.join("  |  ") : "None (all products)"],
    ["Total products", t.products],
    ["Active products", t.active],
    ["Inactive products", t.inactive],
    ["Products with flavors", t.withFlavors],
    ["Total flavors / options", t.flavors],
    ["Active flavors", t.activeFlavors],
    ["Inactive flavors", t.inactiveFlavors],
  ];
  lines.forEach(([k, v]) => ss.addRow({ k, v }));
  styleHeader(ss, false);
  ss.eachRow((row, i) => {
    if (i === 1) return;
    row.getCell(1).font = { bold: true };
    row.getCell(2).alignment = { horizontal: "left", wrapText: true, vertical: "top" };
  });

  return (await wb.xlsx.writeBuffer()) as ArrayBuffer;
}
