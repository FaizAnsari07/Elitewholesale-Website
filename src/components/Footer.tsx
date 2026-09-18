import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

const QUICK_LINK_BRANDS = [
  { name: "Geek Bar", slug: "geek-bar" },
  { name: "Spaceman", slug: "spaceman" },
  { name: "Offstamp", slug: "off-stamp" },
  { name: "Pyne Pod", slug: "pyne-pod" },
];

const SOCIAL_LINKS = [
  {
    name: "Twitter",
    href: "https://twitter.com",
    path: "M23.954 4.569a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 9.9 9.9 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482A13.98 13.98 0 011.671 3.15a4.917 4.917 0 001.523 6.573 4.9 4.9 0 01-2.229-.616v.061a4.92 4.92 0 003.946 4.827 4.902 4.902 0 01-2.224.084 4.923 4.923 0 004.598 3.417 9.867 9.867 0 01-6.102 2.104c-.396 0-.788-.023-1.175-.069a13.945 13.945 0 007.548 2.212c9.057 0 14.01-7.503 14.01-14.01 0-.213-.005-.425-.014-.636a10.012 10.012 0 002.457-2.548z",
  },
  {
    name: "Facebook",
    href: "https://facebook.com",
    path: "M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    path: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.07 2.07 0 110-4.13 2.07 2.07 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45z",
  },
  {
    name: "YouTube",
    href: "https://youtube.com",
    path: "M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.81 3.02 3.02 0 002.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.81zM9.6 15.6V8.4L15.8 12l-6.2 3.6z",
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-black/10 bg-surface text-ink">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <Image
            src="/images/elite-wholesale-logo.png"
            alt="Elite Wholesale"
            width={200}
            height={92}
            className="h-12 w-auto"
          />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {siteConfig.description}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand">
            Get Started
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/about-us" className="hover:text-accent">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact-us" className="hover:text-accent">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/enquiry" className="hover:text-accent">
                Your Enquiry Cart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {QUICK_LINK_BRANDS.map((b) => (
              <li key={b.slug}>
                <Link href={`/brand/${b.slug}`} className="hover:text-accent">
                  {b.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              {siteConfig.address.line1}
              <br />
              {siteConfig.address.line2}
            </li>
            <li>
              <a href={`mailto:${siteConfig.email}`} className="hover:text-accent">
                {siteConfig.email}
              </a>
            </li>
            <li>
              <a href={siteConfig.phoneHref} className="hover:text-accent">
                {siteConfig.phone}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand">
            Open Hours
          </h3>
          <p className="mt-4 text-sm">Mon - Fri : 09.00 - 18.00</p>

          <div className="mt-6 flex gap-3">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                aria-label={s.name}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white transition hover:bg-accent"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-ink py-6 text-white/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center text-xs sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <span>&copy; {year} Elite Wholesale. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms-services" className="hover:text-white">
              Terms &amp; Services
            </Link>
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
