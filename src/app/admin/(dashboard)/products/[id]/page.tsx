import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import DeleteButton from "@/components/admin/DeleteButton";
import { getProduct } from "@/lib/admin-api";
import { deleteProductAction } from "@/app/admin/actions";

export default async function ProductViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(Number(id)).catch(() => null);
  if (!product) notFound();

  return (
    <div>
      <AdminHeader title={product.name} />
      <div className="p-4 sm:p-7">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/admin/products" className="text-sm font-semibold text-primary hover:underline">
            &larr; Back to Products
          </Link>
        </div>

        <div className="grid max-w-4xl grid-cols-1 gap-6 glass rounded-xl p-6 md:grid-cols-[200px_1fr]">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-foreground/5">
            {product.images[0] && (
              <Image
                src={product.images[0].src}
                alt={product.name}
                fill
                sizes="200px"
                className="object-contain p-2"
              />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded px-2 py-1 text-xs font-bold uppercase ${
                  product.stock_status === "instock" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                }`}
              >
                {product.stock_status === "instock" ? "In Stock" : "Out of Stock"}
              </span>
              <span className="rounded bg-foreground/5 px-2 py-1 text-xs font-semibold capitalize text-foreground">
                {product.status}
              </span>
              <span className="rounded bg-foreground/5 px-2 py-1 text-xs font-semibold capitalize text-foreground">
                {product.type}
              </span>
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold text-foreground">{product.name}</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="font-semibold text-foreground">SKU:</dt>
                <dd className="text-muted-foreground">{product.sku || "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold text-foreground">Price:</dt>
                <dd className="text-muted-foreground">{product.regular_price ? `$${product.regular_price}` : "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold text-foreground">Category:</dt>
                <dd className="text-muted-foreground">{product.categories.map((c) => c.name).join(", ") || "—"}</dd>
              </div>
              {product.brands && product.brands.length > 0 && (
                <div className="flex gap-2">
                  <dt className="font-semibold text-foreground">Brand:</dt>
                  <dd className="text-muted-foreground">{product.brands.map((b) => b.name).join(", ")}</dd>
                </div>
              )}
            </dl>

            {product.short_description && (
              <div
                className="mt-4 text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}

            {product.variations.length > 0 && (
              <div className="mt-6">
                <h3 className="label">
                  Flavors / Options ({product.variations.length})
                </h3>
                <ul className="mt-2 max-h-72 divide-y divide-border overflow-y-auto rounded-lg border border-border text-sm">
                  {product.variations.map((v) => (
                    <li key={v.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className="truncate text-foreground">{v.label}</span>
                      <span className={`text-xs font-semibold uppercase ${v.stock_status === "instock" ? "text-success" : "text-primary"}`}>
                        {v.stock_status === "instock" ? "In Stock" : "Out of Stock"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="btn btn-primary"
              >
                Edit Product
              </Link>
              <DeleteButton action={deleteProductAction.bind(null, product.id)} label="Delete Product" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
