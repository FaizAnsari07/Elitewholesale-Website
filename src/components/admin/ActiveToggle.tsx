"use client";

// Two-state Active / Inactive button. It only reports the choice; the parent decides
// what to do (confirm, save, etc.).
export default function ActiveToggle({
  active,
  onSelect,
  disabled = false,
  compact = false,
  label,
}: {
  active: boolean;
  onSelect: (next: boolean) => void;
  disabled?: boolean;
  compact?: boolean;
  label?: string;
}) {
  const base = `font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
    compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
  }`;
  return (
    <div
      role="group"
      aria-label={label ?? "Active or inactive"}
      className="inline-flex overflow-hidden rounded-lg border border-border"
    >
      <button
        type="button"
        aria-pressed={active}
        disabled={disabled}
        onClick={() => onSelect(true)}
        className={`${base} ${active ? "bg-success text-background" : "text-muted-foreground hover:bg-foreground/10"}`}
      >
        Active
      </button>
      <button
        type="button"
        aria-pressed={!active}
        disabled={disabled}
        onClick={() => onSelect(false)}
        className={`${base} border-l border-border ${
          !active ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:bg-foreground/10"
        }`}
      >
        Inactive
      </button>
    </div>
  );
}
