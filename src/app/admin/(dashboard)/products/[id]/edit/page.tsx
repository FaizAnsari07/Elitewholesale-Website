import { notFound } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import ProductForm from "@/components/admin/ProductForm";
import { getProduct, listCategories } from "@/lib/admin-api";
import { updateProductAction } from "@/app/admin/actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  const [product, categories] = await Promise.all([
    getProduct(productId).catch(() => null),
    listCategories(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <AdminHeader title={`Edit: ${product.name}`} />
      <div className="p-6">
        <ProductForm
          action={updateProductAction.bind(null, productId)}
          product={product}
          categories={categories}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
