import { notFound } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import ProductForm from "@/components/admin/ProductForm";
import { getProduct, listBrands, listCategories } from "@/lib/admin-api";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteProductAndReturnAction, updateProductAction } from "@/app/admin/actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  const [product, categories, brands] = await Promise.all([
    getProduct(productId).catch(() => null),
    listCategories(),
    listBrands(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <AdminHeader title={`Edit: ${product.name}`} />
      <div className="p-4 sm:p-7">
        <ProductForm
          action={updateProductAction.bind(null, productId)}
          product={product}
          categories={categories}
          brands={brands}
          submitLabel="Save Changes"
        />
        <div className="mt-6 max-w-2xl border-t border-border pt-5">
          <DeleteButton action={deleteProductAndReturnAction.bind(null, product.id)} label="Delete this product" />
        </div>
      </div>
    </div>
  );
}
