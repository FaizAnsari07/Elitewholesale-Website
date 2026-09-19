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
      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/admin/products" className="text-sm font-semibold text-accent hover:underline">
            &larr; Back to Products
          </Link>
        </div>

        <div className="grid max-w-4xl grid-cols-1 gap-6 rounded-xl border border-black/10 bg-white p-6 md:grid-cols-[200px_1fr]">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-cream">
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
                className={`rounded px-2 py-1 text-xs font-bold uppercase text-white ${
                  product.stock_status === "instock" ? "bg-success" : "bg-ink"
                }`}
              >
                {product.stock_status === "instock" ? "In Stock" : "Out of Stock"}
              </span>
              <span className="rounded bg-cream px-2 py-1 text-xs font-semibold capitalize text-ink">
                {product.status}
              </span>
              <span className="rounded bg-cream px-2 py-1 text-xs font-semibold capitalize text-ink">
                {product.type}
              </span>
            </div>
            <h2 className="mt-3 text-xl font-bold text-brand">{product.name}</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="font-semibold text-ink">SKU:</dt>
                <dd className="text-muted">{product.sku || "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold text-ink">Price:</dt>
                <dd className="text-muted">{product.regular_price ? `$${product.regular_price}` : "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold text-ink">Category:</dt>
                <dd className="text-muted">{product.categories.map((c) => c.name).join(", ") || "—"}</dd>
              </div>
              {product.brands && product.brands.length > 0 && (
                <div className="flex gap-2">
                  <dt className="font-semibold text-ink">Brand:</dt>
                  <dd className="text-muted">{product.brands.map((b) => b.name).join(", ")}</dd>
                </div>
              )}
            </dl>

            {product.short_description && (
              <div
                className="mt-4 text-sm text-muted"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}

            {product.variations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Flavors / Options ({product.variations.length})
                </h3>
                <ul className="mt-2 max-h-72 divide-y divide-black/5 overflow-y-auto rounded-lg border border-black/10 text-sm">
                  {product.variations.map((v) => (
                    <li key={v.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className="truncate text-ink">{v.label}</span>
                      <span className={`text-xs font-semibold uppercase ${v.stock_status === "instock" ? "text-success" : "text-accent"}`}>
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
                className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
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
