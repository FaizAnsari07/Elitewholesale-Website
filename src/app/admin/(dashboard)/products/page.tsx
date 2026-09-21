import Image from "next/image";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import DeleteButton from "@/components/admin/DeleteButton";
import { listProducts, type AdminProduct } from "@/lib/admin-api";
import { deleteProductAction } from "@/app/admin/actions";

type Show = "all" | "active" | "inactive";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string; brand?: string; show?: string }>;
}) {
  const { q, page, category, brand, show: showParam } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const categoryId = Number(category) || undefined;
  const brandId = Number(brand) || undefined;
  const show: Show = showParam === "active" || showParam === "inactive" ? showParam : "all";

  const all = await listProducts({ search: q });

  // Narrow to one category / brand when coming from those tables.
  const scoped = all.filter(
    (p) =>
      (!categoryId || p.categories.some((c) => c.id === categoryId)) &&
      (!brandId || p.brands.some((b) => b.id === brandId)),
  );
  const activeCount = scoped.filter((p) => p.stock_status === "instock").length;
  const inactiveCount = scoped.length - activeCount;
  const products = scoped.filter(
    (p) => show === "all" || (show === "active" ? p.stock_status === "instock" : p.stock_status !== "instock"),
  );

  const scopeName = categoryId
    ? { kind: "Category", name: all.flatMap((p) => p.categories).find((c) => c.id === categoryId)?.name }
    : brandId
      ? { kind: "Brand", name: all.flatMap((p) => p.brands).find((b) => b.id === brandId)?.name }
      : null;

  const hrefWith = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const base: Record<string, string | undefined> = {
      q,
      category: categoryId ? String(categoryId) : undefined,
      brand: brandId ? String(brandId) : undefined,
      show: show === "all" ? undefined : show,
      ...overrides,
    };
    for (const [k, v] of Object.entries(base)) if (v) params.set(k, v);
    const qs = params.toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  };

  const columns: DataTableColumn<AdminProduct>[] = [
    {
      key: "image",
      header: "",
      className: "w-16",
      render: (p) => (
        <div className="relative h-12 w-12 overflow-hidden rounded bg-foreground/5">
          {p.images[0] && (
            <Image src={p.images[0].src} alt={p.name} fill sizes="48px" className="object-contain" />
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (p) => (
        <div>
          <Link href={`/admin/products/${p.id}`} className="font-semibold text-primary hover:underline">
            {p.name}
          </Link>
          <p className="text-xs text-muted-foreground">
            {p.type === "variable" ? `${p.variations.length} flavors` : "Single product"}
          </p>
        </div>
      ),
    },
    { key: "sku", header: "SKU", render: (p) => p.sku || "—" },
    {
      key: "category",
      header: "Category",
      render: (p) => p.categories.map((c) => c.name).join(", ") || "—",
    },
    {
      key: "stock",
      header: "Availability",
      render: (p) => {
        const active = p.stock_status === "instock";
        return (
          <span
            className={`rounded px-2 py-1 text-xs font-bold uppercase ${
              active ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            }`}
          >
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (p) => <span className="capitalize text-muted-foreground">{p.status}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <div className="flex items-center gap-3">
          <Link href={`/admin/products/${p.id}`} className="text-sm font-semibold text-foreground hover:underline">
            View
          </Link>
          <Link href={`/admin/products/${p.id}/edit`} className="text-sm font-semibold text-primary hover:underline">
            Edit
          </Link>
          <DeleteButton action={deleteProductAction.bind(null, p.id)} />
        </div>
      ),
    },
  ];

  const tab = (value: Show, label: string, count: number) => (
    <Link
      key={value}
      href={hrefWith({ show: value === "all" ? undefined : value, page: undefined })}
      aria-current={show === value ? "page" : undefined}
      className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
        show === value
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
      }`}
    >
      {label} <span className="opacity-70">({count})</span>
    </Link>
  );

  return (
    <div>
      <AdminHeader title="Products" />
      <div className="p-4 sm:p-7">
        {scopeName && (
          <div className="glass mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3">
            <p className="text-sm">
              <span className="section-label mr-2">{scopeName.kind}</span>
              <span className="font-display text-lg font-extrabold">{scopeName.name ?? "Unknown"}</span>
              <span className="ml-2 text-muted-foreground">
                {scoped.length} product{scoped.length === 1 ? "" : "s"}
              </span>
            </p>
            <Link href="/admin/products" className="text-sm font-semibold text-primary hover:underline">
              Show all products
            </Link>
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <form className="flex gap-2">
            {categoryId && <input type="hidden" name="category" value={categoryId} />}
            {brandId && <input type="hidden" name="brand" value={brandId} />}
            {show !== "all" && <input type="hidden" name="show" value={show} />}
            <input type="search" name="q" defaultValue={q} placeholder="Search products..." className="field w-64" />
            <button type="submit" className="btn btn-secondary">
              Search
            </button>
          </form>
          <Link href="/admin/products/new" className="btn btn-primary">
            + Add Product
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {tab("all", "All", scoped.length)}
          {tab("active", "Active", activeCount)}
          {tab("inactive", "Inactive", inactiveCount)}
        </div>

        <DataTable
          columns={columns}
          rows={products}
          getRowId={(p) => p.id}
          emptyMessage="No products match."
          currentPage={currentPage}
          makeHref={(n) => hrefWith({ page: String(n) })}
        />
      </div>
    </div>
  );
}
