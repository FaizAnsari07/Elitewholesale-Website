import AdminHeader from "@/components/admin/AdminHeader";
import ProductForm from "@/components/admin/ProductForm";
import { listCategories } from "@/lib/woocommerce-admin";
import { createProductAction } from "@/app/admin/actions";

export default async function NewProductPage() {
  const categories = await listCategories();

  return (
    <div>
      <AdminHeader title="Add Product" />
      <div className="p-6">
        <ProductForm action={createProductAction} categories={categories} submitLabel="Create Product" />
      </div>
    </div>
  );
}
