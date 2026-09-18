"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { SearchResult } from "@/lib/wordpress";

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
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") goToShopSearch();
          }}
          placeholder="Search products..."
          className="w-full rounded-full border border-black/15 bg-white py-2.5 pl-10 pr-4 text-sm text-ink shadow-sm transition placeholder:text-muted focus:border-brand focus:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/15"
        />
      </div>

      {open && trimmedQuery.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-black/10 bg-white shadow-xl">
          {loading ? (
            <p className="p-4 text-sm text-muted">Searching&hellip;</p>
          ) : visibleResults.length === 0 ? (
            <p className="p-4 text-sm text-muted">No products found for &ldquo;{query}&rdquo;.</p>
          ) : (
            <>
              <ul className="divide-y divide-black/5">
                {visibleResults.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/product/${r.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-cream"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-cream">
                        {r.image && (
                          <Image
                            src={r.image.sourceUrl}
                            alt={r.image.altText || r.name}
                            fill
                            sizes="40px"
                            className="object-contain"
                          />
                        )}
                      </div>
                      <span className="truncate text-sm font-medium text-ink">{r.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={goToShopSearch}
                className="block w-full border-t border-black/5 bg-cream px-4 py-2.5 text-center text-xs font-semibold text-brand hover:text-brand-dark"
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
