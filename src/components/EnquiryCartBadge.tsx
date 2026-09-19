"use client";

import Link from "next/link";
import { ShoppingBasket } from "lucide-react";
import { useEnquiryCart } from "@/lib/enquiry-cart";

export default function EnquiryCartBadge() {
  const { totalCount } = useEnquiryCart();

  return (
    <Link
      href="/enquiry"
      aria-label="View enquiry selections"
      className="btn btn-secondary relative min-h-10 gap-2 px-3"
    >
      <ShoppingBasket className="size-4" />
      <span className="hidden xl:inline">Enquiry</span>
      {totalCount > 0 && (
        <span className="grid size-5 place-items-center rounded-full bg-primary text-xs text-primary-foreground">
          {totalCount}
        </span>
      )}
    </Link>
  );
}
