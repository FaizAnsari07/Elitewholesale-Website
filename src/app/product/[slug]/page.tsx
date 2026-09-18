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
  const attributeEntries = (product.attributes?.nodes ?? []).filter(
    (a) => a.options && a.options.length > 0,
  );
  const variations = product.variations?.nodes ?? [];
  const isVariable = variations.length > 0;
  const inStock = product.stockStatus === "IN_STOCK";
  const isNew = isNewProduct(product.date);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/shop" className="hover:text-accent">
          Shop
        </Link>
        {categories[0] && (
          <>
            {" / "}
            <Link
              href={`/product-category/${categories[0].slug}`}
              className="hover:text-accent"
            >
              {categories[0].name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <ProductGallery images={images} title={product.name} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {isNew && (
              <span className="rounded bg-success px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                New
              </span>
            )}
            <span
              className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase text-white ${
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
          <h1 className="mt-2 text-2xl font-extrabold text-brand sm:text-3xl">
            {product.name}
          </h1>

          <p className="mt-4 rounded-md bg-cream px-4 py-3 text-sm font-semibold text-brand">
            {WHOLESALE_PRICE_LABEL}
          </p>

          <dl className="mt-6 space-y-2 text-sm text-muted">
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

          {attributeEntries.length > 0 && (
            <div className="mt-6 space-y-3">
              {attributeEntries.map((attr) => (
                <div key={attr.name}>
                  <span className="text-sm font-semibold capitalize text-ink">
                    {attr.name.replace("pa_", "").replace(/_/g, " ")}:
                  </span>{" "}
                  <span className="text-sm text-muted">{attr.options.join(", ")}</span>
                </div>
              ))}
            </div>
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

          <div className="mt-6">
            <a
              href="/contact-us"
              className="inline-block text-sm font-semibold text-accent hover:underline"
            >
              Or contact us directly for wholesale access &rarr;
            </a>
          </div>

          {product.description && (
            <div
              className="mt-10 max-w-none text-sm text-muted [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-brand [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-brand"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
