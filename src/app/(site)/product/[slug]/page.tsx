import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import ProductEnquirySelector, {
  SimpleProductEnquiryButton,
} from "@/components/ProductEnquirySelector";
import { getProductBySlug } from "@/lib/wordpress";
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

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" className="mx-1.5 inline h-3 w-3 text-black/25" fill="currentColor">
      <path d="M9.29 6.71a1 1 0 000 1.41L13.17 12l-3.88 3.88a1 1 0 101.41 1.41l4.59-4.59a1 1 0 000-1.41L10.7 6.71a1 1 0 00-1.41 0z" />
    </svg>
  );
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <nav className="mb-6 flex items-center text-sm text-muted">
        <Link href="/shop" className="hover:text-accent">
          Shop
        </Link>
        {categories[0] && (
          <>
            <Chevron />
            <Link href={`/product-category/${categories[0].slug}`} className="hover:text-accent">
              {categories[0].name}
            </Link>
          </>
        )}
        <Chevron />
        <span className="truncate text-ink">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <ProductGallery images={images} title={product.name} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {isNew && (
              <span className="rounded bg-success px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                New
              </span>
            )}
            <span
              className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white ${
                inStock ? "bg-success" : "bg-ink"
              }`}
            >
              {inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          {brands[0] && (
            <Link
              href={`/brand/${brands[0].slug}`}
              className="mt-3 inline-block text-xs font-semibold uppercase tracking-wide text-accent"
            >
              {brands[0].name}
            </Link>
          )}
          <h1 className="mt-2 text-2xl font-extrabold leading-tight text-brand sm:text-3xl">
            {product.name}
          </h1>

          <p className="mt-4 flex items-center gap-2 rounded-md border border-brand/15 bg-cream px-4 py-3 text-sm font-semibold text-brand">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            {WHOLESALE_PRICE_LABEL}
          </p>

          {(product.sku || categories.length > 0) && (
            <dl className="mt-5 space-y-2 rounded-lg border border-black/10 bg-white p-4 text-sm text-muted">
              {product.sku && (
                <div className="flex gap-2">
                  <dt className="font-semibold text-ink">SKU:</dt>
                  <dd>{product.sku}</dd>
                </div>
              )}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <dt className="font-semibold text-ink">Category:</dt>
                  <dd>
                    {categories.map((c, i) => (
                      <span key={c.slug}>
                        <Link href={`/product-category/${c.slug}`} className="hover:text-accent">
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

          {product.description && (
            <div
              className="mt-10 max-w-none border-t border-black/10 pt-8 text-sm leading-relaxed text-muted [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-brand [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-brand"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
