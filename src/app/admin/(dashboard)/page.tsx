import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { listProducts, listCategories, listBrands } from "@/lib/admin-api";

export default async function AdminDashboardPage() {
  const [products, categories, brands] = await Promise.all([
    listProducts(),
    listCategories(),
    listBrands(),
  ]);

  const stats = [
    { label: "Products", value: products.length, href: "/admin/products" },
    { label: "Categories", value: categories.length, href: "/admin/categories" },
    { label: "Brands", value: brands.length, href: "/admin/brands" },
  ];

  return (
    <div>
      <AdminHeader title="Dashboard" />
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="rounded-xl border border-black/10 bg-white p-6 transition hover:shadow-md"
            >
              <p className="text-3xl font-extrabold text-brand">{s.value}</p>
              <p className="mt-1 text-sm font-semibold text-muted">{s.label}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-black/10 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Quick Actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/admin/products/new"
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              + Add Product
            </Link>
            <Link
              href="/admin/categories/new"
              className="rounded-md border border-black/15 px-4 py-2 text-sm font-semibold text-ink hover:bg-cream"
            >
              + Add Category
            </Link>
            <Link
              href="/admin/brands/new"
              className="rounded-md border border-black/15 px-4 py-2 text-sm font-semibold text-ink hover:bg-cream"
            >
              + Add Brand
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
