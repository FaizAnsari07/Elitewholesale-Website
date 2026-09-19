import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CatalogPage, { parsePage } from "@/components/CatalogPage";
import { getAllCategories, getBrandBySlug, getProductsByBrand } from "@/lib/catalog";

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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const [items, categories] = await Promise.all([getProductsByBrand(slug), getAllCategories()]);

  return (
    <CatalogPage
      eyebrow="Brand"
      title={brand.name}
      description={`Explore all ${brand.name} products in the current catalogue.`}
      items={items}
      categories={categories}
      basePath={`/brand/${slug}`}
      page={parsePage(page)}
      emptyMessage="No published products are currently listed for this brand."
    />
  );
}
