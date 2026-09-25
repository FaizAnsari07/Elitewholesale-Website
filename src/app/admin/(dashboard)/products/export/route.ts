import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listBrands, listCategories, listProducts } from "@/lib/admin-api";
import { applyShow, describeFilters, parseProductFilters, scopeProducts } from "@/lib/admin-products-filter";
import { buildExportData, fileStamp } from "@/lib/product-export";
import { buildProductsWorkbook } from "@/lib/product-export-xlsx";
import { buildProductsPdf } from "@/lib/product-export-pdf";

export const dynamic = "force-dynamic";

// GET /admin/products/export?format=xlsx|pdf[&q=&category=&brand=&show=]
// Downloads the products that match the same filters as the Products page (all pages, not just one).
export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) return new NextResponse("Unauthorized", { status: 401 });

  const params = new URL(request.url).searchParams;
  const format = params.get("format");
  if (format !== "xlsx" && format !== "pdf") {
    return new NextResponse("Unknown format. Use format=xlsx or format=pdf.", { status: 400 });
  }

  const filters = parseProductFilters({
    q: params.get("q") ?? undefined,
    category: params.get("category") ?? undefined,
    brand: params.get("brand") ?? undefined,
    show: params.get("show") ?? undefined,
  });

  try {
    const [all, categories, brands] = await Promise.all([
      listProducts({ search: filters.q }),
      filters.categoryId ? listCategories() : Promise.resolve([]),
      filters.brandId ? listBrands() : Promise.resolve([]),
    ]);
    const products = applyShow(scopeProducts(all, filters), filters.show);
    const data = buildExportData(products);
    const generatedAt = new Date();
    const meta = {
      generatedAt,
      filters: describeFilters(filters, {
        category: categories.find((c) => c.id === filters.categoryId)?.name,
        brand: brands.find((b) => b.id === filters.brandId)?.name,
      }),
    };

    const file =
      format === "xlsx"
        ? {
            body: await buildProductsWorkbook(data, meta),
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }
        : { body: buildProductsPdf(data, meta), type: "application/pdf" };

    return new NextResponse(new Uint8Array(file.body), {
      headers: {
        "Content-Type": file.type,
        "Content-Disposition": `attachment; filename="elite-wholesale-products-${fileStamp(generatedAt)}.${format}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[export]", error instanceof Error ? error.message : error);
    return new NextResponse("Could not create the export. Please try again.", { status: 500 });
  }
}
