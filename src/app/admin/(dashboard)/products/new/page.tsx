import AdminHeader from "@/components/admin/AdminHeader";
import ProductForm from "@/components/admin/ProductForm";
import { listBrands, listCategories } from "@/lib/admin-api";
import { createProductAction } from "@/app/admin/actions";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([listCategories(), listBrands()]);

  return (
    <div>
      <AdminHeader title="Add Product" />
      <div className="p-6">
        <ProductForm action={createProductAction} categories={categories}
          brands={brands} submitLabel="Create Product" />
      </div>
    </div>
  );
}
