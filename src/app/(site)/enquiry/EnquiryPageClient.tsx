"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Send, ShoppingBasket, Trash2 } from "lucide-react";
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
      <div className="page-shell grid min-h-[60vh] place-items-center py-12">
        <div className="glass max-w-lg rounded-2xl p-10 text-center">
          <ShoppingBasket className="mx-auto size-12 text-primary" />
          <h1 className="mt-5 text-3xl font-black">Your enquiry is empty</h1>
          <p className="mt-3 text-muted-foreground">
            Browse the catalogue and add the products you want to discuss.
          </p>
          <Link href="/shop" className="btn btn-primary mt-7">
            Browse products <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-12">
      <p className="section-label">Wholesale request</p>
      <h1 className="mt-3 text-4xl font-black sm:text-5xl">Your enquiry</h1>
      <p className="mt-3 text-muted-foreground">
        Review your selected items and send an enquiry — we&apos;ll follow up with wholesale pricing and
        availability.
      </p>

      {submitted ? (
        <div className="glass-strong mx-auto mt-10 max-w-2xl rounded-2xl p-10 text-center">
          <CheckCircle2 className="mx-auto size-12 text-success" />
          <h2 className="mt-4 text-2xl font-black">Thank you!</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Your email client should have opened with your enquiry pre-filled. If it didn&apos;t, email us
            directly at{" "}
            <a href={`mailto:${recipientEmail}`} className="font-semibold text-primary">
              {recipientEmail}
            </a>
            .
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/shop" className="btn btn-primary">View All Products</Link>
            <button
              type="button"
              onClick={() => {
                clearCart();
                setSubmitted(false);
              }}
              className="btn btn-secondary"
            >
              Start a New Enquiry
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-7 lg:grid-cols-[1.2fr_.8fr]">
          <section>
            <div className="grid gap-3">
              {items.map((item) => (
                <article
                  key={item.key}
                  className="glass grid grid-cols-[5rem_minmax(0,1fr)_auto] items-center gap-4 rounded-xl p-3"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-foreground/5">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        sizes="80px"
                        className="object-contain p-2"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-bold">{item.productName}</h2>
                    {item.variationLabel && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">{item.variationLabel}</p>
                    )}
                    <div className="mt-3">
                      <QuantityStepper value={item.quantity} onChange={(next) => updateQuantity(item.key, next)} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    aria-label={`Remove ${item.productName}`}
                    className="btn btn-ghost size-10 min-h-0 p-0"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </article>
              ))}
            </div>
            <button type="button" onClick={clearCart} className="btn btn-ghost mt-4 text-destructive">
              <Trash2 className="size-4" />
              Clear enquiry
            </button>
          </section>

          <form onSubmit={handleSubmit} className="glass-strong h-fit rounded-2xl p-6">
            <h2 className="text-xl font-bold">Contact details</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalCount} item{totalCount === 1 ? "" : "s"} selected
            </p>
            <div className="mt-6 grid gap-4">
              <label>
                <span className="label">Name</span>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="field" />
              </label>
              <label>
                <span className="label">Email</span>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
              </label>
              <label>
                <span className="label">Phone (optional)</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="field" />
              </label>
              <label>
                <span className="label">Notes (optional)</span>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="field min-h-28 resize-y" />
              </label>
              <button type="submit" className="btn btn-primary">
                <Send className="size-4" />
                Send enquiry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
