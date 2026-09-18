import "server-only";

const WORDPRESS_GRAPHQL_URL =
  process.env.WORDPRESS_GRAPHQL_URL || "http://localhost:8080/graphql";

// Revalidate every 60s so edits made in wp-admin show up on the site
// without needing a full rebuild.
const REVALIDATE_SECONDS = 60;

async function wpFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(WORDPRESS_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`WordPress GraphQL request failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`WordPress GraphQL error: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
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

const PRODUCT_FIELDS = `
  id
  databaseId
  slug
  name
  date
  description
  shortDescription
  image { sourceUrl altText }
  galleryImages { nodes { sourceUrl } }
  productCategories { nodes { name slug } }
  productBrands { nodes { name slug } }
  ... on SimpleProduct {
    sku
    stockStatus
    price
    regularPrice
    attributes { nodes { name options } }
  }
  ... on VariableProduct {
    sku
    stockStatus
    attributes { nodes { name options } }
    variations(first: 100) {
      nodes {
        id
        sku
        price
        regularPrice
        stockStatus
        attributes { nodes { name value } }
        image { sourceUrl }
      }
    }
  }
`;

export async function getAllProducts(): Promise<Product[]> {
  const all: Product[] = [];
  let after: string | null = null;
  for (;;) {
    const data: {
      products: { nodes: Product[]; pageInfo: { hasNextPage: boolean; endCursor: string } };
    } = await wpFetch(
      `query Products($after: String) {
        products(first: 100, after: $after, where: { status: "publish" }) {
          nodes { ${PRODUCT_FIELDS} }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { after },
    );
    all.push(...data.products.nodes);
    if (!data.products.pageInfo.hasNextPage) break;
    after = data.products.pageInfo.endCursor;
  }
  return all;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const data = await wpFetch<{ product: Product | null }>(
    `query Product($slug: ID!) {
      product(id: $slug, idType: SLUG) { ${PRODUCT_FIELDS} }
    }`,
    { slug },
  );
  return data.product;
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const data = await wpFetch<{ products: { nodes: Product[] } }>(
    `query ProductsByCategory($slug: String!) {
      products(first: 100, where: { status: "publish", category: $slug }) {
        nodes { ${PRODUCT_FIELDS} }
      }
    }`,
    { slug },
  );
  return data.products.nodes;
}

export async function getProductsByBrand(slug: string): Promise<Product[]> {
  const data = await wpFetch<{ products: { nodes: Product[] } }>(
    `query ProductsByBrand($slug: [String]) {
      products(
        first: 100
        where: { status: "publish", taxonomyFilter: { filters: [{ taxonomy: PRODUCT_BRAND, terms: $slug }] } }
      ) {
        nodes { ${PRODUCT_FIELDS} }
      }
    }`,
    { slug: [slug] },
  );
  return data.products.nodes;
}

export async function getAllCategories(): Promise<Category[]> {
  const data = await wpFetch<{ productCategories: { nodes: Category[] } }>(
    `{
      productCategories(first: 100, where: { hideEmpty: false }) {
        nodes { databaseId name slug count description image { sourceUrl } }
      }
    }`,
  );
  return data.productCategories.nodes.filter((c) => c.slug !== "uncategorized");
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const data = await wpFetch<{ productCategory: Category | null }>(
    `query Category($slug: ID!) {
      productCategory(id: $slug, idType: SLUG) {
        databaseId name slug count description image { sourceUrl }
      }
    }`,
    { slug },
  );
  return data.productCategory;
}

export async function getAllBrands(): Promise<Brand[]> {
  const data = await wpFetch<{ productBrands: { nodes: Brand[] } }>(
    `{
      productBrands(first: 100, where: { hideEmpty: false }) {
        nodes { databaseId name slug count }
      }
    }`,
  );
  return data.productBrands.nodes.filter((b) => b.slug !== "uncategorized");
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const data = await wpFetch<{ productBrand: Brand | null }>(
    `query Brand($slug: ID!) {
      productBrand(id: $slug, idType: SLUG) { databaseId name slug count }
    }`,
    { slug },
  );
  return data.productBrand;
}
