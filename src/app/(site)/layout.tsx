import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AgeGate from "@/components/AgeGate";

// Pages read live catalog data from the API, which is not reachable while the
// app is being built (Docker image build, Vercel), so render on request.
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AgeGate />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
