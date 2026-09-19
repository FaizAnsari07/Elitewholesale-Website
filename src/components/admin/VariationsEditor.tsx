"use client";

import { useState } from "react";
import type { AdminVariation } from "@/lib/admin-api";

type Row = AdminVariation & { key: number };

export default function VariationsEditor({ initial }: { initial: AdminVariation[] }) {
  const [rows, setRows] = useState<Row[]>(() => initial.map((v, i) => ({ ...v, key: i })));
  const [draft, setDraft] = useState("");
  const [nextKey, setNextKey] = useState(initial.length);

  function addFromDraft() {
    const labels = draft
      .split(/[\n,]/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (labels.length === 0) return;
    const existing = new Set(rows.map((r) => r.label.toLowerCase()));
    const fresh = labels.filter((l, i) => !existing.has(l.toLowerCase()) && labels.indexOf(l) === i);
    setRows((prev) => [
      ...prev,
      ...fresh.map((label, i) => ({ key: nextKey + i, label, stock_status: "instock" as const })),
    ]);
    setNextKey((k) => k + fresh.length);
    setDraft("");
  }

  const payload = rows.map(({ id, label, stock_status }) => ({ id, label, stock_status }));

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted">
        Flavors / Options ({rows.length})
      </label>
      <p className="mt-1 text-xs text-muted">
        Customers pick a quantity for each option on the product page. Leave empty for a
        single-option product.
      </p>
      <input type="hidden" name="variations_json" value={JSON.stringify(payload)} />

      {rows.length > 0 && (
        <ul className="mt-3 max-h-80 divide-y divide-black/10 overflow-y-auto rounded-lg border border-black/10">
          {rows.map((row) => (
            <li key={row.key} className="flex items-center gap-3 px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{row.label}</span>
              <select
                value={row.stock_status}
                onChange={(e) =>
                  setRows((prev) =>
                    prev.map((r) =>
                      r.key === row.key
                        ? { ...r, stock_status: e.target.value as Row["stock_status"] }
                        : r,
                    ),
                  )
                }
                className="rounded-md border border-black/15 bg-white px-2 py-1 text-xs"
              >
                <option value="instock">In Stock</option>
                <option value="outofstock">Out of Stock</option>
              </select>
              <button
                type="button"
                aria-label={`Remove ${row.label}`}
                onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted hover:bg-cream hover:text-accent"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex gap-2">
        <textarea
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add flavors: one per line or comma-separated"
          className="w-full rounded-md border border-black/15 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <button
          type="button"
          onClick={addFromDraft}
          disabled={draft.trim() === ""}
          className="shrink-0 self-start rounded-md border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}
