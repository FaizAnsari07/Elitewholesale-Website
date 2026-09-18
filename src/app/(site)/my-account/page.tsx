import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "My Account",
  description: "Wholesale account access for Elite Wholesale customers.",
};

export default function MyAccountPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-brand">Wholesale Account</h1>
      <p className="mt-4 text-muted">
        Elite Wholesale pricing, ordering, and account access are reserved for
        approved wholesale customers. Account login and checkout are not yet
        connected in this preview site.
      </p>
      <p className="mt-2 text-muted">
        To set up a wholesale account, contact us directly at{" "}
        <a href={`mailto:${siteConfig.email}`} className="font-semibold text-accent">
          {siteConfig.email}
        </a>{" "}
        or call{" "}
        <a href={siteConfig.phoneHref} className="font-semibold text-accent">
          {siteConfig.phone}
        </a>
        .
      </p>
    </div>
  );
}
