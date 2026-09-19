import Image from "next/image";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import DeleteButton from "@/components/admin/DeleteButton";
import { listProducts, type AdminProduct } from "@/lib/admin-api";
import { deleteProductAction } from "@/app/admin/actions";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const products = await listProducts({ search: q });

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
          <p className="text-xs text-muted-foreground">{p.type}</p>
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
      header: "Stock",
      render: (p) => (
        <span
          className={`rounded px-2 py-1 text-xs font-bold uppercase ${
            p.stock_status === "instock" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          }`}
        >
          {p.stock_status === "instock" ? "In Stock" : "Out of Stock"}
        </span>
      ),
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

  return (
    <div>
      <AdminHeader title="Products" />
      <div className="p-4 sm:p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <form className="flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search products..."
              className="field w-64"
            />
            <button
              type="submit"
              className="btn btn-secondary"
            >
              Search
            </button>
          </form>
          <Link
            href="/admin/products/new"
            className="btn btn-primary"
          >
            + Add Product
          </Link>
        </div>

        <DataTable
          columns={columns}
          rows={products}
          getRowId={(p) => p.id}
          currentPage={currentPage}
          makeHref={(n) =>
            `/admin/products?${new URLSearchParams({ ...(q ? { q } : {}), page: String(n) })}`
          }
        />
      </div>
    </div>
  );
}
