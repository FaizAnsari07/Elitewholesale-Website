export const siteConfig = {
  name: "Elite Wholesale",
  tagline: "Gas Station, Convenience Store & Smoke Shop Supply",
  domain: "elitewholesale.online",
  description:
    "Elite Wholesale is a premier wholesale distributor of vapes, e-liquids, glass, lighters, exotic snacks, and smoke shop supplies based in Portland, Oregon.",
  address: {
    line1: "7332 SE Powell Blvd",
    line2: "Portland, OR 97206",
    mapQuery: "7332 SE Powell Blvd Portland, OR 97206",
  },
  phone: "+1 (971) 678-2434",
  phoneHref: "tel:+19716782434",
  email: "wholesalevapes1@gmail.com",
};

export const WHOLESALE_PRICE_LABEL = "Contact us for wholesale pricing";

const NEW_PRODUCT_WINDOW_DAYS = 30;

export function isNewProduct(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const ageMs = Date.now() - new Date(dateStr).getTime();
  return ageMs >= 0 && ageMs <= NEW_PRODUCT_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "Categories", href: "/categories" },
  { label: "Brands", href: "/brands" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact Us", href: "/contact-us" },
];
