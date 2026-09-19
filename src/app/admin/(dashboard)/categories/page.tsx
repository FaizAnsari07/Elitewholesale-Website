import Image from "next/image";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import DeleteButton from "@/components/admin/DeleteButton";
import { listCategories, type WcTerm } from "@/lib/admin-api";
import { deleteCategoryAction } from "@/app/admin/actions";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const categories = await listCategories();

  const columns: DataTableColumn<WcTerm>[] = [
    {
      key: "image",
      header: "",
      className: "w-16",
      render: (c) => (
        <div className="relative h-12 w-12 overflow-hidden rounded bg-cream">
          {c.image && (
            <Image src={c.image.src} alt={c.name} fill sizes="48px" className="object-cover" />
          )}
        </div>
      ),
    },
    { key: "name", header: "Name", render: (c) => <span className="font-semibold text-brand">{c.name}</span> },
    { key: "slug", header: "Slug", render: (c) => <span className="text-muted">{c.slug}</span> },
    { key: "count", header: "Products", render: (c) => c.count },
    {
      key: "actions",
      header: "Actions",
      render: (c) => (
        <div className="flex items-center gap-3">
          <Link href={`/admin/categories/${c.id}/edit`} className="text-sm font-semibold text-brand hover:underline">
            Edit
          </Link>
          <DeleteButton action={deleteCategoryAction.bind(null, c.id)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader title="Categories" />
      <div className="p-6">
        <div className="mb-4 flex justify-end">
          <Link
            href="/admin/categories/new"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            + Add Category
          </Link>
        </div>
        <DataTable
          columns={columns}
          rows={categories}
          getRowId={(c) => c.id}
          currentPage={currentPage}
          makeHref={(n) => `/admin/categories?page=${n}`}
        />
      </div>
    </div>
  );
}
