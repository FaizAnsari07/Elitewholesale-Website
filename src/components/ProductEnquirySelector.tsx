"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ShoppingBasket } from "lucide-react";
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
    <div className="grid h-10 grid-cols-[2.5rem_2.5rem_2.5rem] overflow-hidden rounded-lg border border-border">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="btn btn-ghost min-h-0 rounded-none p-0"
      >
        <Minus className="size-4" />
      </button>
      <span className="grid place-items-center text-sm font-bold tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        className="btn btn-ghost min-h-0 rounded-none p-0"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

function ViewCartLink({ count }: { count: number }) {
  return (
    <Link href="/enquiry" className="btn btn-secondary">
      <ShoppingBasket className="size-4" />
      View Enquiry ({count})
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
      <h2 className="label">
        Available Flavors / Options
      </h2>
      <ul className="mt-3 max-h-96 divide-y divide-border overflow-y-auto rounded-xl glass">
        {variations.map((v) => {
          const outOfStock = v.stockStatus === "OUT_OF_STOCK";
          const qty = getQty(v.id);
          return (
            <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{variationLabel(v)}</p>
                <span
                  className={`text-xs font-semibold uppercase ${
                    outOfStock ? "text-destructive" : "text-success"
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
          className="btn btn-primary min-w-56"
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
        className="btn btn-primary min-w-56"
      >
        {added ? "Added to Enquiry" : "Add to Enquiry"}
      </button>
      <ViewCartLink count={totalCount} />
    </div>
  );
}
