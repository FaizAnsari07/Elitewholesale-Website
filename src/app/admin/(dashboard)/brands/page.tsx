import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import DeleteButton from "@/components/admin/DeleteButton";
import { listBrands, type WcTerm } from "@/lib/woocommerce-admin";
import { deleteBrandAction } from "@/app/admin/actions";

export default async function AdminBrandsPage() {
  const brands = await listBrands();

  const columns: DataTableColumn<WcTerm>[] = [
    { key: "name", header: "Name", render: (b) => <span className="font-semibold text-brand">{b.name}</span> },
    { key: "slug", header: "Slug", render: (b) => <span className="text-muted">{b.slug}</span> },
    { key: "count", header: "Products", render: (b) => b.count },
    {
      key: "actions",
      header: "Actions",
      render: (b) => (
        <div className="flex items-center gap-3">
          <Link href={`/admin/brands/${b.id}/edit`} className="text-sm font-semibold text-brand hover:underline">
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
      <div className="p-6">
        <div className="mb-4 flex justify-end">
          <Link
            href="/admin/brands/new"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            + Add Brand
          </Link>
        </div>
        <DataTable columns={columns} rows={brands} getRowId={(b) => b.id} />
      </div>
    </div>
  );
}
