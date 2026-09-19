"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, LoaderCircle } from "lucide-react";
import type { SearchResult } from "@/lib/catalog";

export default function SearchBox({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [trimmedQuery]);

  const visibleResults = trimmedQuery.length < 2 ? [] : results;

  function goToShopSearch() {
    if (trimmedQuery.length < 2) return;
    setOpen(false);
    router.push(`/shop?q=${encodeURIComponent(trimmedQuery)}`);
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative min-w-0 ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
      <input
        type="search"
        aria-label="Search products"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") goToShopSearch();
        }}
        placeholder="Search products…"
        className="field h-10 py-2 pl-10"
      />

      {open && trimmedQuery.length >= 2 && (
        <div className="menu-solid absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-auto rounded-xl p-2">
          {loading ? (
            <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Searching…
            </div>
          ) : visibleResults.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">No products found for &ldquo;{query}&rdquo;.</p>
          ) : (
            <>
              {visibleResults.map((r) => (
                <Link
                  key={r.slug}
                  href={`/product/${r.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-foreground/5"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-foreground/5">
                    {r.image && (
                      <Image
                        src={r.image.sourceUrl}
                        alt={r.image.altText || r.name}
                        fill
                        sizes="48px"
                        className="object-contain p-1"
                      />
                    )}
                  </div>
                  <span className="min-w-0 truncate text-sm font-bold">{r.name}</span>
                </Link>
              ))}
              <button
                type="button"
                onClick={goToShopSearch}
                className="mt-1 block w-full rounded-lg border-t border-border p-3 text-center text-xs font-semibold text-primary hover:bg-foreground/5"
              >
                View all results for &ldquo;{trimmedQuery}&rdquo;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
