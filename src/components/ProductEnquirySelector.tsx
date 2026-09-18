"use client";

import Link from "next/link";
import { useState } from "react";
import { useEnquiryCart } from "@/lib/enquiry-cart";
import type { ProductVariation } from "@/lib/wordpress";

export function QuantityStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center rounded-md border border-black/15">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, value - 1))}
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
  const [added, setAdded] = useState<Set<string>>(new Set());

  function getQty(id: string) {
    return quantities[id] ?? 1;
  }

  function handleAdd(variation: ProductVariation) {
    addItem({
      productSlug,
      productName,
      variationId: variation.id,
      variationLabel: variationLabel(variation),
      image: variation.image?.sourceUrl ?? image,
      quantity: getQty(variation.id),
    });
    setAdded((prev) => new Set(prev).add(variation.id));
  }

  if (variations.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
        Available Flavors / Options
      </h2>
      <ul className="mt-3 divide-y divide-black/10 rounded-lg border border-black/10">
        {variations.map((v) => {
          const outOfStock = v.stockStatus === "OUT_OF_STOCK";
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
              <div className="flex items-center gap-3">
                <QuantityStepper
                  value={getQty(v.id)}
                  onChange={(next) => setQuantities((prev) => ({ ...prev, [v.id]: next }))}
                />
                <button
                  type="button"
                  disabled={outOfStock}
                  onClick={() => handleAdd(v)}
                  className="rounded-md bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {added.has(v.id) ? "Added" : "Add"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {totalCount > 0 && (
        <Link
          href="/enquiry"
          className="mt-4 inline-block rounded-md border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand hover:text-white"
        >
          View Selected ({totalCount})
        </Link>
      )}
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
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <QuantityStepper value={quantity} onChange={setQuantity} />
      <button
        type="button"
        disabled={outOfStock}
        onClick={() => {
          addItem({ productSlug, productName, image, quantity });
          setAdded(true);
        }}
        className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        {added ? "Added to Enquiry" : "Add to Enquiry"}
      </button>
      {totalCount > 0 && (
        <Link
          href="/enquiry"
          className="rounded-md border border-brand px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand hover:text-white"
        >
          View Selected ({totalCount})
        </Link>
      )}
    </div>
  );
}
