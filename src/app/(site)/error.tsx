"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="page-shell grid min-h-[60vh] place-items-center py-16">
      <div className="glass max-w-lg rounded-2xl p-10 text-center">
        <TriangleAlert className="mx-auto size-12 text-primary" />
        <h1 className="mt-5 text-3xl font-black">This page didn&apos;t load</h1>
        <p className="mt-3 text-muted-foreground">
          Something went wrong on our end. Please try again in a moment.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-primary">Try again</button>
          <Link href="/" className="btn btn-secondary">Go home</Link>
        </div>
      </div>
    </div>
  );
}
