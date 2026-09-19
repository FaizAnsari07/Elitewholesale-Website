"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createAdminSession,
  destroyAdminSession,
  verifyCredentials,
} from "@/lib/admin-auth";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  type AdminVariation,
  type ProductInput,
  createCategory,
  updateCategory,
  deleteCategory,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/lib/admin-api";
import { writeSettings } from "@/lib/admin-settings";

// ---- Auth ----

export async function loginAction(formData: FormData): Promise<void> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");

  if (!verifyCredentials(username, password)) {
    redirect(`/admin/login?error=1&from=${encodeURIComponent(from)}`);
  }

  await createAdminSession();
  redirect(from.startsWith("/admin") ? from : "/admin");
}

export async function logoutAction(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}

// ---- Products ----

async function uploadedImageUrl(formData: FormData): Promise<string | undefined> {
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    return (await uploadProductImage(image)).url;
  }
  return undefined;
}

function parseVariations(raw: FormDataEntryValue | null): AdminVariation[] {
  try {
    const parsed = JSON.parse(String(raw ?? "[]"));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((v) => ({
        id: typeof v.id === "number" ? v.id : undefined,
        label: String(v.label ?? "").trim(),
        stock_status: v.stock_status === "outofstock" ? ("outofstock" as const) : ("instock" as const),
      }))
      .filter((v) => v.id !== undefined || v.label !== "");
  } catch {
    return [];
  }
}

async function productPayloadFromForm(formData: FormData): Promise<ProductInput> {
  const categoryId = Number(formData.get("category_id"));
  const brandId = Number(formData.get("brand_id"));
  const payload: ProductInput = {
    name: String(formData.get("name") ?? ""),
    sku: String(formData.get("sku") ?? ""),
    regular_price: String(formData.get("regular_price") ?? ""),
    description: String(formData.get("description") ?? ""),
    short_description: String(formData.get("short_description") ?? ""),
    status: formData.get("status") === "draft" ? "draft" : "publish",
    stock_status: formData.get("stock_status") === "outofstock" ? "outofstock" : "instock",
    categories: categoryId ? [{ id: categoryId }] : [],
    brands: brandId ? [{ id: brandId }] : [],
    ...(formData.has("variations_json") ? { variations: parseVariations(formData.get("variations_json")) } : {}),
  };
  const imageUrl = await uploadedImageUrl(formData);
  if (imageUrl) payload.image_url = imageUrl;
  return payload;
}

export async function createProductAction(formData: FormData): Promise<void> {
  const product = await createProduct(await productPayloadFromForm(formData));
  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProductAction(id: number, formData: FormData): Promise<void> {
  await updateProduct(id, await productPayloadFromForm(formData));
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  redirect(`/admin/products/${id}`);
}

export async function deleteProductAction(id: number): Promise<void> {
  await deleteProduct(id);
  revalidatePath("/admin/products");
}

// ---- Categories ----

export async function createCategoryAction(formData: FormData): Promise<void> {
  await createCategory({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    image_url: await uploadedImageUrl(formData),
  });
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategoryAction(id: number, formData: FormData): Promise<void> {
  await updateCategory(id, {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    image_url: await uploadedImageUrl(formData),
  });
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategoryAction(id: number): Promise<void> {
  await deleteCategory(id);
  revalidatePath("/admin/categories");
}

// ---- Brands ----

export async function createBrandAction(formData: FormData): Promise<void> {
  await createBrand({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
  });
  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}

export async function updateBrandAction(id: number, formData: FormData): Promise<void> {
  await updateBrand(id, {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
  });
  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}

export async function deleteBrandAction(id: number): Promise<void> {
  await deleteBrand(id);
  revalidatePath("/admin/brands");
}

// ---- Settings ----

export async function saveSettingsAction(formData: FormData): Promise<void> {
  await writeSettings({
    enquiryRecipientEmail: String(formData.get("enquiryRecipientEmail") ?? ""),
  });
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}
