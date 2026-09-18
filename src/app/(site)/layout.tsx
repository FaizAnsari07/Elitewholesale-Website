import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AgeGate from "@/components/AgeGate";

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
