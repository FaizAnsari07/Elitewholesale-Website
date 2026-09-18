import "server-only";

function baseUrl(): string {
  const url = process.env.WORDPRESS_API_URL;
  if (!url) throw new Error("WORDPRESS_API_URL is not set");
  return url.replace(/\/$/, "");
}

function authHeader(): string {
  const user = process.env.WORDPRESS_APP_USER;
  const pass = process.env.WORDPRESS_APP_PASSWORD;
  if (!user || !pass) throw new Error("WORDPRESS_APP_USER/WORDPRESS_APP_PASSWORD are not set");
  return "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
}

async function wpRest<T>(
  path: string,
  options: { method?: string; body?: unknown; searchParams?: Record<string, string> } = {},
): Promise<T> {
  const url = new URL(`${baseUrl()}${path}`);
  for (const [key, value] of Object.entries(options.searchParams ?? {})) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = data?.message || `${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return data as T;
}

// ---- Products (WooCommerce REST v3) ----

export type WcProduct = {
  id: number;
  name: string;
  slug: string;
  type: "simple" | "variable" | "grouped" | "external";
  status: "publish" | "draft" | "pending" | "private";
  sku: string;
  regular_price: string;
  sale_price: string;
  price: string;
  stock_status: "instock" | "outofstock" | "onbackorder";
  description: string;
  short_description: string;
  categories: { id: number; name: string; slug: string }[];
  brands?: { id: number; name: string; slug: string }[];
  images: { id: number; src: string; alt: string }[];
  date_created: string;
};

function listProductsPage(params: { page?: number; perPage?: number; search?: string } = {}) {
  return wpRest<WcProduct[]>("/wc/v3/products", {
    searchParams: {
      page: String(params.page ?? 1),
      per_page: String(params.perPage ?? 50),
      status: "any",
      ...(params.search ? { search: params.search } : {}),
    },
  });
}

// WooCommerce's REST API caps per_page at 100, and the real catalog has
// 220+ products -- loop through every page so the admin list (and its
// pagination) reflects the true full inventory, not just the first 100.
export async function listProducts(params: { search?: string } = {}): Promise<WcProduct[]> {
  const perPage = 100;
  const all: WcProduct[] = [];
  for (let page = 1; ; page++) {
    const batch = await listProductsPage({ page, perPage, search: params.search });
    all.push(...batch);
    if (batch.length < perPage) break;
  }
  return all;
}

export function getProduct(id: number) {
  return wpRest<WcProduct>(`/wc/v3/products/${id}`);
}

export function createProduct(data: Partial<WcProduct>) {
  return wpRest<WcProduct>("/wc/v3/products", { method: "POST", body: data });
}

export function updateProduct(id: number, data: Partial<WcProduct>) {
  return wpRest<WcProduct>(`/wc/v3/products/${id}`, { method: "PUT", body: data });
}

export function deleteProduct(id: number) {
  // force=false (the default) moves the product to trash rather than
  // permanently deleting it.
  return wpRest<WcProduct>(`/wc/v3/products/${id}`, {
    method: "DELETE",
    searchParams: { force: "false" },
  });
}

// Uploads a file to the WordPress media library (core REST endpoint, not
// WooCommerce-specific) and returns the resulting attachment so its id can
// be attached to a product's `images` field.
export async function uploadProductImage(
  file: File,
): Promise<{ id: number; source_url: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const res = await fetch(`${baseUrl()}/wp/v2/media`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": file.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${file.name}"`,
    },
    body: buffer,
    cache: "no-store",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.message || `${res.status} ${res.statusText}`);
  }
  return { id: data.id, source_url: data.source_url };
}

// ---- Categories ----

export type WcTerm = {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  image: { id: number; src: string } | null;
};

export function listCategories() {
  return wpRest<WcTerm[]>("/wc/v3/products/categories", {
    searchParams: { per_page: "100", orderby: "name" },
  });
}

export function getCategory(id: number) {
  return wpRest<WcTerm>(`/wc/v3/products/categories/${id}`);
}

export function createCategory(data: { name: string; description?: string }) {
  return wpRest<WcTerm>("/wc/v3/products/categories", { method: "POST", body: data });
}

export function updateCategory(id: number, data: Partial<{ name: string; description: string }>) {
  return wpRest<WcTerm>(`/wc/v3/products/categories/${id}`, { method: "PUT", body: data });
}

export function deleteCategory(id: number) {
  return wpRest<WcTerm>(`/wc/v3/products/categories/${id}`, {
    method: "DELETE",
    searchParams: { force: "true" },
  });
}

// ---- Brands ----

export function listBrands() {
  return wpRest<WcTerm[]>("/wc/v3/products/brands", {
    searchParams: { per_page: "100", orderby: "name" },
  });
}

export function getBrand(id: number) {
  return wpRest<WcTerm>(`/wc/v3/products/brands/${id}`);
}

export function createBrand(data: { name: string; description?: string }) {
  return wpRest<WcTerm>("/wc/v3/products/brands", { method: "POST", body: data });
}

export function updateBrand(id: number, data: Partial<{ name: string; description: string }>) {
  return wpRest<WcTerm>(`/wc/v3/products/brands/${id}`, { method: "PUT", body: data });
}

export function deleteBrand(id: number) {
  return wpRest<WcTerm>(`/wc/v3/products/brands/${id}`, {
    method: "DELETE",
    searchParams: { force: "true" },
  });
}

