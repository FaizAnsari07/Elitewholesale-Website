import "server-only";

const CATALOG_API_URL = process.env.CATALOG_API_URL || "http://localhost:8080";

// Revalidate every 60s so admin edits show up on the site without a rebuild.
const REVALIDATE_SECONDS = 60;

async function apiGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${CATALOG_API_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString(), { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new Error(`Catalog API request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export type ProductTerm = { name: string; slug: string };

export type ProductVariation = {
  id: string;
  sku: string | null;
  price: string | null;
  regularPrice: string | null;
  stockStatus: string | null;
  attributes: { nodes: { name: string; value: string }[] };
  image: { sourceUrl: string } | null;
};

export type Product = {
  id: string;
  databaseId: number;
  slug: string;
  name: string;
  date: string | null;
  description: string | null;
  shortDescription: string | null;
  image: { sourceUrl: string; altText: string } | null;
  galleryImages: { nodes: { sourceUrl: string }[] };
  productCategories: { nodes: ProductTerm[] };
  productBrands: { nodes: ProductTerm[] };
  sku?: string | null;
  stockStatus?: string | null;
  price?: string | null;
  regularPrice?: string | null;
  variations?: { nodes: ProductVariation[] } | null;
  attributes?: { nodes: { name: string; options: string[] }[] } | null;
};

export type Category = {
  databaseId: number;
  name: string;
  slug: string;
  count: number | null;
  description: string | null;
  image: { sourceUrl: string } | null;
};

export type Brand = {
  databaseId: number;
  name: string;
  slug: string;
  count: number | null;
};

export async function getAllProducts(): Promise<Product[]> {
  const data = await apiGet<{ products: Product[] }>("/products.php");
  return data.products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const data = await apiGet<{ product: Product | null }>("/products.php", { slug });
  return data.product;
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const data = await apiGet<{ products: Product[] }>("/products.php", { category: slug });
  return data.products;
}

export async function getProductsByBrand(slug: string): Promise<Product[]> {
  const data = await apiGet<{ products: Product[] }>("/products.php", { brand: slug });
  return data.products;
}

// Categories intentionally hidden site-wide (requested removal), independent
// of what actually exists in the database.
const HIDDEN_CATEGORY_SLUGS = new Set(["uncategorized", "kratom-extract-supplements"]);

export async function getAllCategories(): Promise<Category[]> {
  const data = await apiGet<{ productCategories: { nodes: Category[] } }>("/categories.php");
  return data.productCategories.nodes.filter((c) => !HIDDEN_CATEGORY_SLUGS.has(c.slug));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const data = await apiGet<{ productCategory: Category | null }>("/categories.php", { slug });
  return data.productCategory;
}

export async function getAllBrands(): Promise<Brand[]> {
  const data = await apiGet<{ productBrands: { nodes: Brand[] } }>("/brands.php");
  return data.productBrands.nodes.filter((b) => b.slug !== "uncategorized");
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const data = await apiGet<{ productBrand: Brand | null }>("/brands.php", { slug });
  return data.productBrand;
}

// A lightweight product image for brand cards -- avoids pulling the full
// product list just to show a thumbnail.
export async function getBrandSampleImage(slug: string): Promise<string | null> {
  const data = await apiGet<{ productBrand: (Brand & { sampleImage: string | null }) | null }>(
    "/brands.php",
    { slug, sample_image: "1" },
  );
  return data.productBrand?.sampleImage ?? null;
}

export type SearchResult = {
  slug: string;
  name: string;
  image: { sourceUrl: string; altText: string } | null;
};

// Lightweight product-name search for the header search box.
export async function searchProducts(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const data = await apiGet<{ products: SearchResult[] }>("/products.php", { search: query });
  return data.products;
}
