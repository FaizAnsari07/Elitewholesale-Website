"use client";

import { useTransition } from "react";

export default function DeleteButton({
  action,
  confirmMessage = "Are you sure? This cannot be easily undone.",
  label = "Delete",
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        startTransition(() => {
          action();
        });
      }}
      className="text-sm font-semibold text-destructive hover:underline disabled:opacity-50"
    >
      {pending ? "Deleting..." : label}
    </button>
  );
}
