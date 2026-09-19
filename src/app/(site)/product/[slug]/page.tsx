import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ChevronRight, ShieldCheck, Truck } from "lucide-react";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import ProductEnquirySelector, {
  SimpleProductEnquiryButton,
} from "@/components/ProductEnquirySelector";
import { getProductBySlug, getProductsByCategory } from "@/lib/catalog";
import { WHOLESALE_PRICE_LABEL, isNewProduct } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description:
      product.shortDescription?.replace(/<[^>]+>/g, "") ||
      `${product.name} — wholesale pricing available at Elite Wholesale.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const images = [
    product.image?.sourceUrl,
    ...product.galleryImages.nodes.map((n) => n.sourceUrl),
  ].filter((img): img is string => Boolean(img));

  const categories = product.productCategories.nodes;
  const brands = product.productBrands.nodes;
  const variations = product.variations?.nodes ?? [];
  const isVariable = variations.length > 0;
  const inStock = product.stockStatus === "IN_STOCK";
  const isNew = isNewProduct(product.date);

  const relatedProducts = categories[0]
    ? (await getProductsByCategory(categories[0].slug))
        .filter((p) => p.slug !== product.slug)
        .slice(0, 8)
    : [];

  return (
    <div className="page-shell py-8">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link href="/shop" className="hover:text-primary">Shop</Link>
        {categories[0] && (
          <>
            <ChevronRight className="size-3" />
            <Link href={`/product-category/${categories[0].slug}`} className="hover:text-primary">
              {categories[0].name}
            </Link>
          </>
        )}
        <ChevronRight className="size-3" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="mt-7 grid gap-8 lg:grid-cols-2">
        <ProductGallery images={images} title={product.name} />

        <section className="py-2 lg:py-8">
          {brands[0] && (
            <Link href={`/brand/${brands[0].slug}`} className="section-label">
              {brands[0].name}
              {categories[0] ? ` · ${categories[0].name}` : ""}
            </Link>
          )}
          <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">{product.name}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${
                inStock ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              }`}
            >
              <CheckCircle2 className="size-4" />
              {inStock ? "In Stock" : "Out of Stock"}
            </span>
            {isNew && (
              <span className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold uppercase text-primary">New</span>
            )}
          </div>

          <div className="mt-8 border-y border-border py-7">
            <p className="text-xl font-bold">{WHOLESALE_PRICE_LABEL}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Select available options and quantities, then add this product to your enquiry.
            </p>
            {(product.sku || categories.length > 0) && (
              <dl className="mt-5 grid gap-2 text-sm text-muted-foreground">
                {product.sku && (
                  <div className="flex gap-2">
                    <dt className="font-semibold text-foreground">SKU:</dt>
                    <dd>{product.sku}</dd>
                  </div>
                )}
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <dt className="font-semibold text-foreground">Category:</dt>
                    <dd>
                      {categories.map((c, i) => (
                        <span key={c.slug}>
                          <Link href={`/product-category/${c.slug}`} className="hover:text-primary">
                            {c.name}
                          </Link>
                          {i < categories.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>

          {isVariable ? (
            <ProductEnquirySelector
              productSlug={product.slug}
              productName={product.name}
              image={product.image?.sourceUrl ?? null}
              variations={variations}
            />
          ) : (
            <SimpleProductEnquiryButton
              productSlug={product.slug}
              productName={product.name}
              image={product.image?.sourceUrl ?? null}
              outOfStock={!inStock}
            />
          )}

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="glass rounded-xl p-4">
              <Truck className="size-5 text-primary" />
              <p className="mt-2 text-sm font-bold">Wholesale delivery</p>
            </div>
            <div className="glass rounded-xl p-4">
              <ShieldCheck className="size-5 text-primary" />
              <p className="mt-2 text-sm font-bold">Authentic products</p>
            </div>
          </div>

          {product.description && (
            <div
              className="mt-10 max-w-none border-t border-border pt-8 text-sm leading-7 text-muted-foreground [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-foreground [&_p]:mt-3"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}
        </section>
      </div>

      {relatedProducts.length > 0 && (
        <section className="py-20">
          <p className="section-label">More to explore</p>
          <h2 className="mt-2 text-3xl font-black">Related products</h2>
          <div className="product-grid mt-7">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
