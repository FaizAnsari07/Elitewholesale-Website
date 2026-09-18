import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { getBrandBySlug, getProductsByBrand } from "@/lib/wordpress";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};
  return {
    title: `${brand.name} Wholesale`,
    description: `Shop wholesale ${brand.name} products at Elite Wholesale.`,
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const items = await getProductsByBrand(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-brand sm:text-4xl">{brand.name}</h1>
      <p className="mt-2 text-muted">{items.length} products</p>

      {items.length === 0 ? (
        <p className="mt-10 text-muted">
          No published products are currently listed for this brand.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
