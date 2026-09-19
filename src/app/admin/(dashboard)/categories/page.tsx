import Image from "next/image";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import DeleteButton from "@/components/admin/DeleteButton";
import { listCategories, type AdminTerm } from "@/lib/admin-api";
import { deleteCategoryAction } from "@/app/admin/actions";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const categories = await listCategories();

  const columns: DataTableColumn<AdminTerm>[] = [
    {
      key: "image",
      header: "",
      className: "w-16",
      render: (c) => (
        <div className="relative h-12 w-12 overflow-hidden rounded bg-foreground/5">
          {c.image && (
            <Image src={c.image.src} alt={c.name} fill sizes="48px" className="object-cover" />
          )}
        </div>
      ),
    },
    { key: "name", header: "Name", render: (c) => <span className="font-semibold text-primary">{c.name}</span> },
    { key: "slug", header: "Slug", render: (c) => <span className="text-muted-foreground">{c.slug}</span> },
    { key: "count", header: "Products", render: (c) => c.count },
    {
      key: "actions",
      header: "Actions",
      render: (c) => (
        <div className="flex items-center gap-3">
          <Link href={`/admin/categories/${c.id}/edit`} className="text-sm font-semibold text-primary hover:underline">
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
      <div className="p-4 sm:p-7">
        <div className="mb-4 flex justify-end">
          <Link
            href="/admin/categories/new"
            className="btn btn-primary"
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
