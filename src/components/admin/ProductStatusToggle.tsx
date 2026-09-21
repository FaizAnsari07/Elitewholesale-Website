"use client";

import { useState, useTransition } from "react";
import ActiveToggle from "@/components/admin/ActiveToggle";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { setProductActiveAction } from "@/app/admin/actions";

// Active / Inactive for a whole product. Inactive products are hidden from the website.
// On an existing product the change is saved immediately (after a confirmation when going
// inactive); on a new product it is submitted with the form.
export default function ProductStatusToggle({
  productId,
  productName,
  initialActive,
}: {
  productId?: number | undefined;
  productName: string;
  initialActive: boolean;
}) {
  const [active, setActive] = useState(initialActive);
  const [confirming, setConfirming] = useState(false);
  const [note, setNote] = useState<{ text: string; error?: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  function apply(next: boolean) {
    if (productId === undefined) {
      setActive(next);
      setConfirming(false);
      setNote({ text: "Will be saved when you create the product." });
      return;
    }
    startTransition(async () => {
      try {
        await setProductActiveAction(productId, next);
        setActive(next);
        setNote({
          text: next ? "Saved: this product is active and shows on the website." : "Saved: this product is inactive and hidden from the website.",
        });
      } catch {
        setNote({ text: "Could not save. Please try again.", error: true });
      } finally {
        setConfirming(false);
      }
    });
  }

  function onSelect(next: boolean) {
    if (next === active) return;
    if (next) apply(true);
    else setConfirming(true);
  }

  return (
    <div>
      <input type="hidden" name="stock_status" value={active ? "instock" : "outofstock"} />
      <ActiveToggle active={active} onSelect={onSelect} disabled={pending} label="Product active or inactive" />
      <p className="mt-2 text-xs text-muted-foreground">Inactive products are hidden from the website.</p>
      {note && (
        <p className={`mt-1 text-xs font-semibold ${note.error ? "text-destructive" : "text-success"}`} role="status">
          {note.text}
        </p>
      )}
      <ConfirmDialog
        open={confirming}
        title="Make this product inactive?"
        message={`Are you sure you want to make “${productName || "this product"}” inactive? It will be hidden from the website until you make it active again.`}
        confirmLabel="Yes, make inactive"
        busy={pending}
        onConfirm={() => apply(false)}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
