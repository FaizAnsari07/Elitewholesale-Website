import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Services",
  description: "Elite Wholesale terms of service.",
};

export default function TermsServicesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-foreground sm:text-5xl">
        Terms &amp; Services
      </h1>
      <p className="mt-6 text-muted-foreground">
        Formal terms of service for wholesale orders have not been published
        yet. For questions about ordering, minimum quantities, shipping, or
        payment terms, please contact us directly and we&rsquo;ll be glad to
        help.
      </p>
      <p className="mt-4 text-muted-foreground">
        <a href={`mailto:${siteConfig.email}`} className="font-semibold text-primary">
          {siteConfig.email}
        </a>{" "}
        &middot;{" "}
        <a href={siteConfig.phoneHref} className="font-semibold text-primary">
          {siteConfig.phone}
        </a>
      </p>
    </div>
  );
}
