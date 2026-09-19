"use client";

import { useState } from "react";
import type { AdminVariation } from "@/lib/admin-api";

// The API only updates stock/order for an existing variation id, never its
// label. So a renamed flavor is sent without its id (saved as a new variation
// and the old one is removed), which is a rename from the admin's point of view.
type Row = AdminVariation & { key: number; origId?: number | undefined; origLabel: string };

export default function VariationsEditor({ initial }: { initial: AdminVariation[] }) {
  const [rows, setRows] = useState<Row[]>(() => initial.map((v, i) => ({ ...v, key: i, origId: v.id, origLabel: v.label })));
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
      ...fresh.map((label, i) => ({
        key: nextKey + i,
        label,
        origLabel: "",
        stock_status: "instock" as const,
      })),
    ]);
    setNextKey((k) => k + fresh.length);
    setDraft("");
  }

  function renameRow(key: number, label: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.key === key
          ? {
              ...r,
              label,
              // Unchanged label keeps the original record; a changed one becomes new.
              ...(label.trim() === r.origLabel && r.origId !== undefined
                ? { id: r.origId }
                : { id: undefined }),
            }
          : r,
      ),
    );
  }

  const payload = rows
    .filter((r) => r.label.trim() !== "")
    .map(({ id, label, stock_status }) => ({
      ...(id !== undefined ? { id } : {}),
      label: label.trim(),
      stock_status,
    }));

  return (
    <div>
      <label className="label">
        Flavors / Options ({rows.length})
      </label>
      <p className="mt-1 text-xs text-muted-foreground">
        Add, rename or remove flavors here. Customers pick a quantity for each option on the
        product page. Leave empty for a single-option product.
      </p>
      <input type="hidden" name="variations_json" value={JSON.stringify(payload)} />

      {rows.length > 0 && (
        <ul className="glass mt-3 max-h-80 divide-y divide-border overflow-y-auto rounded-xl">
          {rows.map((row) => (
            <li key={row.key} className="flex items-center gap-3 px-3 py-2">
              <input
                type="text"
                value={row.label}
                onChange={(e) => renameRow(row.key, e.target.value)}
                aria-label={`Flavor name: ${row.origLabel || "new flavor"}`}
                className="field min-w-0 flex-1 py-1.5"
              />
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
                className="field !w-auto py-1 text-xs"
              >
                <option value="instock">In Stock</option>
                <option value="outofstock">Out of Stock</option>
              </select>
              <button
                type="button"
                aria-label={`Remove ${row.label}`}
                onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              addFromDraft();
            }
          }}
          placeholder="Add flavors: one per line or comma-separated (Enter to add)"
          className="field"
        />
        <button
          type="button"
          onClick={addFromDraft}
          disabled={draft.trim() === ""}
          className="btn btn-secondary shrink-0 self-start disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}
