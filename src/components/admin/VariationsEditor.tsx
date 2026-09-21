"use client";

import { useState, useTransition } from "react";
import type { AdminVariation } from "@/lib/admin-api";
import ActiveToggle from "@/components/admin/ActiveToggle";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { setVariationActiveAction } from "@/app/admin/actions";

// The API only updates stock/order for an existing variation id, never its
// label. So a renamed flavor is sent without its id (saved as a new variation
// and the old one is removed), which is a rename from the admin's point of view.
type Row = AdminVariation & { key: number; origId?: number | undefined; origLabel: string };

export default function VariationsEditor({
  initial,
  productId,
}: {
  initial: AdminVariation[];
  productId?: number | undefined;
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    initial.map((v, i) => ({ ...v, key: i, origId: v.id, origLabel: v.label })),
  );
  const [draft, setDraft] = useState("");
  const [nextKey, setNextKey] = useState(initial.length);
  const [confirmKey, setConfirmKey] = useState<number | null>(null);
  const [note, setNote] = useState<{ text: string; error?: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

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

  function setLocal(key: number, stock: Row["stock_status"]) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, stock_status: stock } : r)));
  }

  // Apply a change. For a flavor that already exists in the database it is saved right away;
  // new or renamed flavors are saved with the form's Save button.
  function apply(row: Row, active: boolean) {
    const stock = active ? "instock" : "outofstock";
    const persisted = productId !== undefined && row.id !== undefined && row.id === row.origId;
    if (!persisted) {
      setLocal(row.key, stock);
      setConfirmKey(null);
      setNote({ text: `“${row.label || "Flavor"}” will be ${active ? "active" : "inactive"} once you click Save.` });
      return;
    }
    startTransition(async () => {
      try {
        await setVariationActiveAction(productId, row.id as number, active);
        setLocal(row.key, stock);
        setNote({
          text: active
            ? `Saved: “${row.label}” is active and shows on the website.`
            : `Saved: “${row.label}” is inactive and hidden from the website.`,
        });
      } catch {
        setNote({ text: "Could not save that change. Please try again.", error: true });
      } finally {
        setConfirmKey(null);
      }
    });
  }

  function onSelect(row: Row, next: boolean) {
    if (next === (row.stock_status === "instock")) return;
    if (next) apply(row, true);
    else setConfirmKey(row.key);
  }

  const payload = rows
    .filter((r) => r.label.trim() !== "")
    .map(({ id, label, stock_status }) => ({
      ...(id !== undefined ? { id } : {}),
      label: label.trim(),
      stock_status,
    }));

  const activeCount = rows.filter((r) => r.stock_status === "instock").length;
  const confirmRow = rows.find((r) => r.key === confirmKey);

  return (
    <div>
      <label className="label">
        Flavors / Options ({rows.length}
        {rows.length > 0 ? `, ${activeCount} active` : ""})
      </label>
      <p className="mt-1 text-xs text-muted-foreground">
        Add, rename or remove flavors here. Inactive flavors are hidden from the website. Customers pick a
        quantity for each active option on the product page. Leave empty for a single-option product.
      </p>
      <input type="hidden" name="variations_json" value={JSON.stringify(payload)} />

      {note && (
        <p className={`mt-2 text-xs font-semibold ${note.error ? "text-destructive" : "text-success"}`} role="status">
          {note.text}
        </p>
      )}

      {rows.length > 0 && (
        <ul className="glass mt-3 max-h-96 divide-y divide-border overflow-y-auto rounded-xl">
          {rows.map((row) => {
            const isActive = row.stock_status === "instock";
            return (
              <li key={row.key} className={`flex flex-wrap items-center gap-3 px-3 py-2 ${isActive ? "" : "bg-destructive/5"}`}>
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) => renameRow(row.key, e.target.value)}
                  aria-label={`Flavor name: ${row.origLabel || "new flavor"}`}
                  className={`field min-w-0 flex-1 py-1.5 ${isActive ? "" : "opacity-60"}`}
                />
                <ActiveToggle
                  compact
                  active={isActive}
                  disabled={pending}
                  label={`${row.label || "Flavor"} active or inactive`}
                  onSelect={(next) => onSelect(row, next)}
                />
                <button
                  type="button"
                  aria-label={`Remove ${row.label}`}
                  onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                  className="size-8 shrink-0 items-center justify-center rounded-full text-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  &times;
                </button>
              </li>
            );
          })}
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

      <ConfirmDialog
        open={confirmRow !== undefined}
        title="Make this flavor inactive?"
        message={`Are you sure you want to make “${confirmRow?.label ?? ""}” inactive? It will be hidden from the website until you make it active again.`}
        confirmLabel="Yes, make inactive"
        busy={pending}
        onConfirm={() => confirmRow && apply(confirmRow, false)}
        onCancel={() => setConfirmKey(null)}
      />
    </div>
  );
}
