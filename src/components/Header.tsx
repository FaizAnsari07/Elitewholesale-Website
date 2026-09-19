import HeaderClient from "@/components/HeaderClient";
import { getAllBrands, getAllCategories, orFallback } from "@/lib/catalog";

export default async function Header() {
  // The menus are optional: if the API is down the rest of the site should still render.
  const [categories, brands] = await Promise.all([
    orFallback(getAllCategories(), []),
    orFallback(getAllBrands(), []),
  ]);
  return <HeaderClient categories={categories} brands={brands} />;
}
