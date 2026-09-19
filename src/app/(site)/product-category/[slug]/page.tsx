import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CatalogPage, { parsePage } from "@/components/CatalogPage";
import { getAllCategories, getCategoryBySlug, getProductsByCategory } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: `Shop wholesale ${category.name} at Elite Wholesale. ${category.count ?? 0} products available.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [items, categories] = await Promise.all([getProductsByCategory(slug), getAllCategories()]);

  return (
    <CatalogPage
      eyebrow="Category"
      title={category.name}
      description={`Browse all products currently listed in ${category.name}.`}
      items={items}
      categories={categories}
      basePath={`/product-category/${slug}`}
      page={parsePage(page)}
      emptyMessage="No published products are currently listed in this category."
    />
  );
}
