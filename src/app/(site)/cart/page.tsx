import Link from "next/link";
import type { Metadata } from "next";
import { ShoppingBasket } from "lucide-react";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cart",
  description: "Elite Wholesale shopping cart.",
};

export default function CartPage() {
  return (
    <div className="page-shell grid min-h-[60vh] place-items-center py-12">
      <div className="glass max-w-xl rounded-2xl p-9 text-center">
        <ShoppingBasket className="mx-auto size-11 text-primary" />
        <h1 className="mt-5 text-3xl font-black">Your cart</h1>
        <p className="mt-3 text-muted-foreground">
          Cart and checkout require an approved wholesale account and are not enabled on this preview site.
          Browse the catalog and reach out to place an order.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn btn-primary">Continue shopping</Link>
          <a href={`mailto:${siteConfig.email}`} className="btn btn-secondary">Email us to place an order</a>
        </div>
      </div>
    </div>
  );
}
