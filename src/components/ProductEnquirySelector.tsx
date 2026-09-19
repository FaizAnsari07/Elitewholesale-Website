"use client";

import Link from "next/link";
import { useState } from "react";
import { useEnquiryCart } from "@/lib/enquiry-cart";
import type { ProductVariation } from "@/lib/catalog";

export function QuantityStepper({
  value,
  onChange,
  min = 0,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center rounded-md border border-black/15">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-8 w-8 items-center justify-center text-lg font-semibold text-ink hover:bg-cream"
      >
        &minus;
      </button>
      <span className="w-8 text-center text-sm font-semibold text-ink">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        className="flex h-8 w-8 items-center justify-center text-lg font-semibold text-ink hover:bg-cream"
      >
        +
      </button>
    </div>
  );
}

function ViewCartLink({ count }: { count: number }) {
  return (
    <Link
      href="/enquiry"
      className="inline-flex items-center gap-2 rounded-md border border-brand px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.914-4.5 2.436-6.75H5.106M7.5 14.25L5.106 5.25M9.75 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm9 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
      View Cart ({count})
    </Link>
  );
}

function variationLabel(variation: ProductVariation): string {
  return (
    variation.attributes.nodes
      .map((a) => a.value)
      .filter(Boolean)
      .join(" / ") || "Standard"
  );
}

export default function ProductEnquirySelector({
  productSlug,
  productName,
  image,
  variations,
}: {
  productSlug: string;
  productName: string;
  image: string | null;
  variations: ProductVariation[];
}) {
  const { addItem, totalCount } = useEnquiryCart();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [justAdded, setJustAdded] = useState(false);

  function getQty(id: string) {
    return quantities[id] ?? 0;
  }

  const selectedCount = variations.reduce((sum, v) => sum + getQty(v.id), 0);

  function handleAddSelected() {
    const toAdd = variations.filter((v) => getQty(v.id) > 0);
    if (toAdd.length === 0) return;
    for (const v of toAdd) {
      addItem({
        productSlug,
        productName,
        variationId: v.id,
        variationLabel: variationLabel(v),
        image: v.image?.sourceUrl ?? image,
        quantity: getQty(v.id),
      });
    }
    setQuantities({});
    setJustAdded(true);
  }

  if (variations.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
        Available Flavors / Options
      </h2>
      <ul className="mt-3 max-h-96 divide-y divide-black/10 overflow-y-auto rounded-lg border border-black/10">
        {variations.map((v) => {
          const outOfStock = v.stockStatus === "OUT_OF_STOCK";
          const qty = getQty(v.id);
          return (
            <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{variationLabel(v)}</p>
                <span
                  className={`text-xs font-semibold uppercase ${
                    outOfStock ? "text-accent" : "text-success"
                  }`}
                >
                  {outOfStock ? "Out of Stock" : "In Stock"}
                </span>
              </div>
              <QuantityStepper
                value={qty}
                onChange={(next) => {
                  setJustAdded(false);
                  setQuantities((prev) => ({ ...prev, [v.id]: outOfStock ? 0 : next }));
                }}
              />
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={selectedCount <= 0}
          onClick={handleAddSelected}
          className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {justAdded ? "Added to Enquiry" : `Add Selected${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
        </button>
        <ViewCartLink count={totalCount} />
      </div>
    </div>
  );
}

export function SimpleProductEnquiryButton({
  productSlug,
  productName,
  image,
  outOfStock,
}: {
  productSlug: string;
  productName: string;
  image: string | null;
  outOfStock: boolean;
}) {
  const { addItem, totalCount } = useEnquiryCart();
  const [quantity, setQuantity] = useState(0);
  const [added, setAdded] = useState(false);

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <QuantityStepper value={quantity} onChange={setQuantity} />
      <button
        type="button"
        disabled={outOfStock || quantity <= 0}
        onClick={() => {
          addItem({ productSlug, productName, image, quantity });
          setAdded(true);
          setQuantity(0);
        }}
        className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        {added ? "Added to Enquiry" : "Add to Enquiry"}
      </button>
      <ViewCartLink count={totalCount} />
    </div>
  );
}
