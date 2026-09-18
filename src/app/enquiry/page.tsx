"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useEnquiryCart } from "@/lib/enquiry-cart";
import { QuantityStepper } from "@/components/ProductEnquirySelector";
import { siteConfig } from "@/lib/site";

export default function EnquiryPage() {
  const { items, updateQuantity, removeItem, clearCart } = useEnquiryCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lines = items.map(
      (i) =>
        `- ${i.productName}${i.variationLabel ? ` (${i.variationLabel})` : ""} x${i.quantity}`,
    );
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      "",
      "Requested items:",
      ...lines,
      "",
      notes ? `Notes: ${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const mailto = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
      "Wholesale Enquiry from " + (name || "website"),
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSubmitted(true);
  }

  if (items.length === 0 && !submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-brand">Your Enquiry List is Empty</h1>
        <p className="mt-3 text-muted">
          Browse our catalog and add flavors or products you&apos;re interested in.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          View All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-brand sm:text-4xl">Your Enquiry</h1>
      <p className="mt-2 text-muted">
        Review your selected items and submit an enquiry — we&apos;ll follow up with wholesale
        pricing and availability.
      </p>

      {submitted ? (
        <div className="mt-10 rounded-xl border border-black/10 bg-surface p-8 text-center">
          <h2 className="text-xl font-bold text-brand">Thank you!</h2>
          <p className="mt-2 text-muted">
            Your email client should have opened with your enquiry pre-filled. If it
            didn&apos;t, email us directly at{" "}
            <a href={`mailto:${siteConfig.email}`} className="font-semibold text-accent">
              {siteConfig.email}
            </a>
            .
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              View All Products
            </Link>
            <button
              type="button"
              onClick={() => {
                clearCart();
                setSubmitted(false);
              }}
              className="rounded-md border border-black/15 px-6 py-2.5 text-sm font-semibold text-ink hover:bg-cream"
            >
              Start a New Enquiry
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-black/10 rounded-lg border border-black/10">
            {items.map((item) => (
              <li key={item.key} className="flex flex-wrap items-center gap-4 p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-cream">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{item.productName}</p>
                  {item.variationLabel && (
                    <p className="text-xs text-muted">{item.variationLabel}</p>
                  )}
                </div>
                <QuantityStepper
                  value={item.quantity}
                  onChange={(next) => updateQuantity(item.key, next)}
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  aria-label={`Remove ${item.productName}`}
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <form
            onSubmit={handleSubmit}
            className="h-fit space-y-3 rounded-lg border border-black/10 bg-surface p-6"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
              Your Details
            </h2>
            <input
              required
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
            <textarea
              rows={3}
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Submit Enquiry
            </button>
            <Link
              href="/shop"
              className="block text-center text-sm font-semibold text-accent hover:underline"
            >
              View All Products
            </Link>
          </form>
        </div>
      )}
    </div>
  );
}
