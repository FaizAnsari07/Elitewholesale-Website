import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Elite Wholesale for wholesale orders, partnership inquiries, and customer support.",
};

const CONTACT_CARDS = [
  {
    label: "Visit Us",
    value: (
      <>
        {siteConfig.address.line1}
        <br />
        {siteConfig.address.line2}
      </>
    ),
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    ),
  },
  {
    label: "Call Us",
    value: (
      <a href={siteConfig.phoneHref} className="hover:text-primary">
        {siteConfig.phone}
      </a>
    ),
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 00-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97a1.125 1.125 0 00.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    ),
  },
  {
    label: "Email Us",
    value: (
      <a href={`mailto:${siteConfig.email}`} className="hover:text-primary">
        {siteConfig.email}
      </a>
    ),
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    ),
  },
  {
    label: "Open Hours",
    value: "Mon – Fri : 09.00 – 18.00",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
      />
    ),
  },
];

export default function ContactUsPage() {
  return (
    <div>
      <div className="page-shell pt-12">
        <div className="max-w-3xl">
          <p className="section-label">We&apos;d love to hear from you</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">Get in touch</h1>
          <p className="mt-4 text-muted-foreground">
            Questions about wholesale pricing, availability, or a bulk order? Reach out and our team will
            follow up as soon as possible.
          </p>
        </div>
      </div>

      <div className="page-shell py-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACT_CARDS.map((card) => (
            <div
              key={card.label}
              className="glass rounded-2xl p-6 text-center transition hover:-translate-y-1 hover:border-primary/50"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75}>
                  {card.icon}
                </svg>
              </span>
              <h3 className="mt-4 section-label">
                {card.label}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="glass-strong rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold text-foreground">Send Us a Message</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Fill out the form below and we&apos;ll follow up by email. For urgent wholesale
              orders, call or email us directly above.
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
                className="field"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="Your Email"
                className="field"
              />
              <input
                name="subject"
                type="text"
                placeholder="Subject"
                className="field sm:col-span-2"
              />
              <textarea
                name="message"
                required
                rows={5}
                placeholder="Your Message"
                className="field sm:col-span-2"
              />
              <button
                type="submit"
                className="btn btn-primary sm:col-span-2 sm:w-fit"
              >
                Send Message
              </button>
            </form>
          </div>

          <div className="glass overflow-hidden rounded-2xl">
            <iframe
              title={siteConfig.address.mapQuery}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                siteConfig.address.mapQuery,
              )}&t=m&z=14&output=embed`}
              loading="lazy"
              className="h-full min-h-96 w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
