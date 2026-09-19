import "server-only";

function baseUrl(): string {
  const url = process.env.CATALOG_API_URL;
  if (!url) throw new Error("CATALOG_API_URL is not set");
  return url.replace(/\/$/, "");
}

function apiKey(): string {
  const key = process.env.CATALOG_API_KEY;
  if (!key) throw new Error("CATALOG_API_KEY is not set");
  return key;
}

async function apiFetch<T>(
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
      "X-Api-Key": apiKey(),
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

// ---- Products ----

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

export function listProducts(params: { search?: string } = {}): Promise<WcProduct[]> {
  return apiFetch<WcProduct[]>("/admin/products.php", {
    searchParams: params.search ? { search: params.search } : {},
  });
}

export function getProduct(id: number) {
  return apiFetch<WcProduct>("/admin/products.php", { searchParams: { id: String(id) } });
}

export function createProduct(data: Partial<WcProduct>) {
  return apiFetch<WcProduct>("/admin/products.php", { method: "POST", body: data });
}

export function updateProduct(id: number, data: Partial<WcProduct>) {
  return apiFetch<WcProduct>("/admin/products.php", {
    method: "PUT",
    searchParams: { id: String(id) },
    body: data,
  });
}

export function deleteProduct(id: number) {
  return apiFetch<{ deleted: boolean }>("/admin/products.php", {
    method: "DELETE",
    searchParams: { id: String(id) },
  });
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
  return apiFetch<WcTerm[]>("/admin/categories.php");
}

export function getCategory(id: number) {
  return apiFetch<WcTerm>("/admin/categories.php", { searchParams: { id: String(id) } });
}

export function createCategory(data: { name: string; description?: string }) {
  return apiFetch<WcTerm>("/admin/categories.php", { method: "POST", body: data });
}

export function updateCategory(id: number, data: Partial<{ name: string; description: string }>) {
  return apiFetch<WcTerm>("/admin/categories.php", {
    method: "PUT",
    searchParams: { id: String(id) },
    body: data,
  });
}

export function deleteCategory(id: number) {
  return apiFetch<{ deleted: boolean }>("/admin/categories.php", {
    method: "DELETE",
    searchParams: { id: String(id) },
  });
}

// ---- Brands ----

export function listBrands() {
  return apiFetch<WcTerm[]>("/admin/brands.php");
}

export function getBrand(id: number) {
  return apiFetch<WcTerm>("/admin/brands.php", { searchParams: { id: String(id) } });
}

export function createBrand(data: { name: string; description?: string }) {
  return apiFetch<WcTerm>("/admin/brands.php", { method: "POST", body: data });
}

export function updateBrand(id: number, data: Partial<{ name: string; description: string }>) {
  return apiFetch<WcTerm>("/admin/brands.php", {
    method: "PUT",
    searchParams: { id: String(id) },
    body: data,
  });
}

export function deleteBrand(id: number) {
  return apiFetch<{ deleted: boolean }>("/admin/brands.php", {
    method: "DELETE",
    searchParams: { id: String(id) },
  });
}

// Uploads an image to the API host and returns its public URL.
export async function uploadProductImage(file: File): Promise<{ url: string }> {
  const res = await fetch(`${baseUrl()}/admin/upload.php`, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey(),
      "Content-Type": file.type || "application/octet-stream",
      "X-Filename": file.name,
    },
    body: Buffer.from(await file.arrayBuffer()),
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `${res.status} ${res.statusText}`);
  return { url: data.url as string };
}
