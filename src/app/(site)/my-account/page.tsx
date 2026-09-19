import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "My Account",
  description: "Wholesale account access for Elite Wholesale customers.",
};

export default function MyAccountPage() {
  return (
    <div className="page-shell grid min-h-[60vh] place-items-center py-12">
      <div className="glass max-w-xl rounded-2xl p-9 text-center">
        <UserRound className="mx-auto size-11 text-primary" />
        <h1 className="mt-5 text-3xl font-black">Wholesale account</h1>
        <p className="mt-3 text-muted-foreground">
          Elite Wholesale pricing, ordering, and account access are reserved for approved wholesale customers.
          Account login and checkout are not yet connected in this preview site.
        </p>
        <p className="mt-2 text-muted-foreground">
          To set up a wholesale account, contact us at{" "}
          <a href={`mailto:${siteConfig.email}`} className="font-semibold text-primary">{siteConfig.email}</a> or call{" "}
          <a href={siteConfig.phoneHref} className="font-semibold text-primary">{siteConfig.phone}</a>.
        </p>
      </div>
    </div>
  );
}
