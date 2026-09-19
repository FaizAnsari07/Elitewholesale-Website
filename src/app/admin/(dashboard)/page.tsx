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
      <div className="p-4 sm:p-7">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="glass rounded-xl p-6 transition hover:border-primary/50"
            >
              <p className="text-3xl font-black text-foreground">{s.value}</p>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">{s.label}</p>
            </Link>
          ))}
        </div>

        <div className="glass mt-8 rounded-xl p-6">
          <h2 className="section-label">Quick actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/admin/products/new"
              className="btn btn-primary"
            >
              + Add Product
            </Link>
            <Link
              href="/admin/categories/new"
              className="btn btn-secondary"
            >
              + Add Category
            </Link>
            <Link
              href="/admin/brands/new"
              className="btn btn-secondary"
            >
              + Add Brand
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
