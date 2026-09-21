import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import DeleteButton from "@/components/admin/DeleteButton";
import { listBrands, type AdminTerm } from "@/lib/admin-api";
import { deleteBrandAction } from "@/app/admin/actions";

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const brands = await listBrands();

  const columns: DataTableColumn<AdminTerm>[] = [
    {
      key: "name",
      header: "Name",
      render: (b) => (
        <Link
          href={`/admin/products?brand=${b.id}`}
          title={`View products by ${b.name}`}
          className="font-semibold text-primary hover:underline"
        >
          {b.name}
        </Link>
      ),
    },
    { key: "slug", header: "Slug", render: (b) => <span className="text-muted-foreground">{b.slug}</span> },
    {
      key: "count",
      header: "Products",
      render: (b) => (
        <Link
          href={`/admin/products?brand=${b.id}`}
          title={`View products by ${b.name}`}
          className="inline-flex min-w-9 justify-center rounded-lg border border-border px-2.5 py-1 text-sm font-bold hover:border-primary hover:text-primary"
        >
          {b.count}
        </Link>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (b) => (
        <div className="flex items-center gap-3">
          <Link href={`/admin/brands/${b.id}/edit`} className="text-sm font-semibold text-primary hover:underline">
            Edit
          </Link>
          <DeleteButton action={deleteBrandAction.bind(null, b.id)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader title="Brands" />
      <div className="p-4 sm:p-7">
        <div className="mb-4 flex justify-end">
          <Link
            href="/admin/brands/new"
            className="btn btn-primary"
          >
            + Add Brand
          </Link>
        </div>
        <DataTable
          columns={columns}
          rows={brands}
          getRowId={(b) => b.id}
          currentPage={currentPage}
          makeHref={(n) => `/admin/brands?page=${n}`}
        />
      </div>
    </div>
  );
}
