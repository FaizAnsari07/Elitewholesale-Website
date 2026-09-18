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
  createCategory,
  updateCategory,
  deleteCategory,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/lib/woocommerce-admin";
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

function productPayloadFromForm(formData: FormData) {
  const payload: Record<string, unknown> = {
    name: String(formData.get("name") ?? ""),
    sku: String(formData.get("sku") ?? ""),
    regular_price: String(formData.get("regular_price") ?? ""),
    description: String(formData.get("description") ?? ""),
    short_description: String(formData.get("short_description") ?? ""),
    status: String(formData.get("status") ?? "publish"),
    stock_status: String(formData.get("stock_status") ?? "instock"),
  };
  const categoryId = formData.get("category_id");
  if (categoryId) payload.categories = [{ id: Number(categoryId) }];
  return payload;
}

export async function createProductAction(formData: FormData): Promise<void> {
  const payload = productPayloadFromForm(formData);
  const product = await createProduct({ ...payload, type: "simple" });
  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProductAction(id: number, formData: FormData): Promise<void> {
  const payload = productPayloadFromForm(formData);
  await updateProduct(id, payload);
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
  });
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategoryAction(id: number, formData: FormData): Promise<void> {
  await updateCategory(id, {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
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
