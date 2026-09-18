import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cart",
  description: "Elite Wholesale shopping cart.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-brand">Your Cart</h1>
      <p className="mt-4 text-muted">
        Cart and checkout require an approved wholesale account and are not
        enabled on this preview site. Browse the catalog and reach out to
        place an order.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="/shop"
          className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Continue Shopping
        </Link>
        <a
          href={`mailto:${siteConfig.email}`}
          className="text-sm font-semibold text-accent hover:underline"
        >
          Email us to place an order
        </a>
      </div>
    </div>
  );
}
