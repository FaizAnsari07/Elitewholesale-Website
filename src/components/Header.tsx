import HeaderClient from "@/components/HeaderClient";
import { getAllBrands, getAllCategories } from "@/lib/wordpress";

export default async function Header() {
  const [categories, brands] = await Promise.all([getAllCategories(), getAllBrands()]);
  return <HeaderClient categories={categories} brands={brands} />;
}
