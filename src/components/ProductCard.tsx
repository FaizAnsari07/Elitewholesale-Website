import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/wordpress";
import { WHOLESALE_PRICE_LABEL, isNewProduct } from "@/lib/site";

export default function ProductCard({ product }: { product: Product }) {
  const brand = product.productBrands.nodes[0]?.name;
  const inStock = product.stockStatus === "IN_STOCK";
  const isNew = isNewProduct(product.date);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white transition hover:shadow-lg"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-cream">
        {product.image ? (
          <Image
            src={product.image.sourceUrl}
            alt={product.image.altText || product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-4 transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            No image
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isNew && (
            <span className="rounded bg-success px-2 py-1 text-[10px] font-bold uppercase text-white">
              New
            </span>
          )}
          <span
            className={`rounded px-2 py-1 text-[10px] font-bold uppercase text-white ${
              inStock ? "bg-success" : "bg-ink"
            }`}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {brand && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-accent">
            {brand}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold text-brand">
          {product.name}
        </h3>
        <span className="mt-auto pt-2 text-xs font-medium text-muted">
          {WHOLESALE_PRICE_LABEL}
        </span>
      </div>
    </Link>
  );
}
