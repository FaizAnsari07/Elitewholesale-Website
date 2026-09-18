import type { WcTerm } from "@/lib/woocommerce-admin";

export default function TermForm({
  action,
  term,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  term?: WcTerm;
  submitLabel: string;
}) {
  return (
    <form action={action} className="max-w-lg space-y-5 rounded-xl border border-black/10 bg-white p-6">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted">Name</label>
        <input
          required
          type="text"
          name="name"
          defaultValue={term?.name}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted">
          Description
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={term?.description}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        {submitLabel}
      </button>
    </form>
  );
}
