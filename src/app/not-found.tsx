import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="page-shell grid min-h-[60vh] place-items-center py-16">
      <div className="glass max-w-lg rounded-2xl p-10 text-center">
        <SearchX className="mx-auto size-12 text-primary" />
        <p className="section-label mt-5">Error 404</p>
        <h1 className="mt-2 text-3xl font-black">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">Go home</Link>
          <Link href="/shop" className="btn btn-secondary">Browse catalogue</Link>
        </div>
      </div>
    </div>
  );
}
