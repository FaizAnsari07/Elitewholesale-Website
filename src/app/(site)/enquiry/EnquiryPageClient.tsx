"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useEnquiryCart } from "@/lib/enquiry-cart";
import { QuantityStepper } from "@/components/ProductEnquirySelector";

export default function EnquiryPageClient({ recipientEmail }: { recipientEmail: string }) {
  const { items, updateQuantity, removeItem, clearCart, totalCount } = useEnquiryCart();
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

    const mailto = `mailto:${recipientEmail}?subject=${encodeURIComponent(
      "Wholesale Enquiry from " + (name || "website"),
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSubmitted(true);
  }

  if (items.length === 0 && !submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <svg viewBox="0 0 24 24" className="mx-auto h-14 w-14 text-black/15" fill="none" stroke="currentColor" strokeWidth={1.25}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.914-4.5 2.436-6.75H5.106M7.5 14.25L5.106 5.25M9.75 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm9 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          />
        </svg>
        <h1 className="mt-6 text-3xl font-extrabold text-brand">Your Cart is Empty</h1>
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
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-brand sm:text-4xl">Your Cart</h1>
      <p className="mt-2 text-muted">
        Review your selected items and send an enquiry — we&apos;ll follow up with wholesale
        pricing and availability.
      </p>

      {submitted ? (
        <div className="mt-10 rounded-xl border border-black/10 bg-surface p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success text-white">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
          <h2 className="mt-4 text-xl font-bold text-brand">Thank you!</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Your email client should have opened with your enquiry pre-filled. If it
            didn&apos;t, email us directly at{" "}
            <a href={`mailto:${recipientEmail}`} className="font-semibold text-accent">
              {recipientEmail}
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
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="overflow-x-auto rounded-lg border border-black/10 bg-white">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-black/10 bg-cream">
                <tr>
                  <th className="w-10 px-3 py-3" aria-hidden />
                  <th className="px-3 py-3 font-semibold text-ink">Thumbnail</th>
                  <th className="px-3 py-3 font-semibold text-ink">Product</th>
                  <th className="px-3 py-3 font-semibold text-ink">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {items.map((item) => (
                  <tr key={item.key}>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label={`Remove ${item.productName}`}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-muted hover:bg-cream hover:text-accent"
                      >
                        &times;
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded bg-cream">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            sizes="56px"
                            className="object-contain p-1"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-ink">{item.productName}</p>
                      {item.variationLabel && (
                        <p className="text-xs text-muted">{item.variationLabel}</p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(next) => updateQuantity(item.key, next)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form
            onSubmit={handleSubmit}
            className="h-fit space-y-3 rounded-lg border border-black/10 bg-surface p-6"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
              {totalCount} item{totalCount === 1 ? "" : "s"} &middot; Your Details
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
              Send Enquiry
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
