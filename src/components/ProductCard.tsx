import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { WHOLESALE_PRICE_LABEL, isNewProduct } from "@/lib/site";

export default function ProductCard({ product }: { product: Product }) {
  const brand = product.productBrands.nodes[0]?.name;
  const inStock = product.stockStatus === "IN_STOCK";
  const isNew = isNewProduct(product.date);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="glass group flex min-w-0 flex-col overflow-hidden rounded-2xl transition duration-200 hover:-translate-y-1 hover:border-primary/50"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-foreground/5">
        {product.image ? (
          <Image
            src={product.image.sourceUrl}
            alt={product.image.altText || product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-5 transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1">
          {isNew && (
            <span className="rounded-md bg-primary px-2 py-1 text-[10px] font-bold uppercase text-primary-foreground">
              New
            </span>
          )}
          <span
            className={`rounded-md bg-background/80 px-2 py-1 text-[10px] font-bold uppercase backdrop-blur ${
              inStock ? "text-success" : "text-destructive"
            }`}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        {brand && <p className="section-label truncate">{brand}</p>}
        <h3 className="mt-2 line-clamp-2 min-h-11 text-base font-bold leading-snug">{product.name}</h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <span className="text-xs text-muted-foreground">{WHOLESALE_PRICE_LABEL}</span>
          <ArrowUpRight className="size-4 shrink-0 text-primary" />
        </div>
      </div>
    </Link>
  );
}
