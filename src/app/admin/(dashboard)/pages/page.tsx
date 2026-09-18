import AdminHeader from "@/components/admin/AdminHeader";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import { listPages, type WpPage } from "@/lib/woocommerce-admin";

export default async function AdminPagesPage() {
  const pages = await listPages();

  const columns: DataTableColumn<WpPage>[] = [
    { key: "title", header: "Title", render: (p) => <span className="font-semibold text-brand">{p.title.rendered}</span> },
    { key: "slug", header: "Slug", render: (p) => <span className="text-muted">/{p.slug}</span> },
    { key: "status", header: "Status", render: (p) => <span className="capitalize text-muted">{p.status}</span> },
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <div className="flex items-center gap-3">
          <a href={p.link} target="_blank" rel="noreferrer" className="text-sm font-semibold text-ink hover:underline">
            View
          </a>
          <a
            href={`http://localhost:8080/wp-admin/post.php?post=${p.id}&action=edit`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-brand hover:underline"
          >
            Edit in WordPress
          </a>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader title="Pages" />
      <div className="p-6">
        <p className="mb-4 max-w-2xl text-sm text-muted">
          Pages are listed here for reference. Full page-content editing
          (Elementor-style layouts) is handled in WordPress directly rather
          than reimplemented here.
        </p>
        <DataTable columns={columns} rows={pages} getRowId={(p) => p.id} />
      </div>
    </div>
  );
}
