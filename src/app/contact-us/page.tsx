import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Elite Wholesale for wholesale orders, partnership inquiries, and customer support.",
};

export default function ContactUsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-brand sm:text-4xl">
        Our Contact
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Welcome to leave a message — if you have any questions, you can
        contact us and we will reply as soon as possible.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-black/10 bg-surface p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-accent">
            Address
          </h3>
          <p className="mt-2 text-ink">
            {siteConfig.address.line1}
            <br />
            {siteConfig.address.line2}
          </p>
        </div>
        <div className="rounded-xl border border-black/10 bg-surface p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-accent">
            Phone
          </h3>
          <p className="mt-2">
            <a href={siteConfig.phoneHref} className="text-ink hover:text-accent">
              {siteConfig.phone}
            </a>
          </p>
        </div>
        <div className="rounded-xl border border-black/10 bg-surface p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-accent">
            Email
          </h3>
          <p className="mt-2">
            <a href={`mailto:${siteConfig.email}`} className="text-ink hover:text-accent">
              {siteConfig.email}
            </a>
          </p>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-xl border border-black/10">
        <iframe
          title={siteConfig.address.mapQuery}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(
            siteConfig.address.mapQuery,
          )}&t=m&z=14&output=embed`}
          loading="lazy"
          className="h-96 w-full"
        />
      </div>

      <div className="mt-14 rounded-xl border border-black/10 bg-surface p-8">
        <h2 className="text-xl font-bold text-brand">Get In Touch</h2>
        <p className="mt-2 text-sm text-muted">
          Fill out the form below and we&apos;ll follow up by email. For
          urgent wholesale orders, call or email us directly above.
        </p>
        <form
          action={`mailto:${siteConfig.email}`}
          method="post"
          encType="text/plain"
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <input
            name="name"
            type="text"
            required
            placeholder="Your Name"
            className="rounded-md border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Your Email"
            className="rounded-md border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
          />
          <input
            name="subject"
            type="text"
            placeholder="Subject"
            className="rounded-md border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none sm:col-span-2"
          />
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Your Message"
            className="rounded-md border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none sm:col-span-2"
          />
          <button
            type="submit"
            className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark sm:col-span-2 sm:w-fit"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
