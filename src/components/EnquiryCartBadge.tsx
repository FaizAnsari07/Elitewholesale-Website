"use client";

import Link from "next/link";
import { useEnquiryCart } from "@/lib/enquiry-cart";

export default function EnquiryCartBadge() {
  const { totalCount } = useEnquiryCart();

  return (
    <Link
      href="/enquiry"
      aria-label="View enquiry selections"
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-black/10 text-ink hover:bg-cream"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.914-4.5 2.436-6.75H5.106M7.5 14.25L5.106 5.25M9.75 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm9 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
      {totalCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
          {totalCount}
        </span>
      )}
    </Link>
  );
}
