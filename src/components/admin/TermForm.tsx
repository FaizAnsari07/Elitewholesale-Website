import Image from "next/image";
import type { AdminTerm } from "@/lib/admin-api";

export default function TermForm({
  action,
  term,
  submitLabel,
  withImage = false,
}: {
  action: (formData: FormData) => Promise<void>;
  term?: AdminTerm;
  submitLabel: string;
  withImage?: boolean;
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
      {withImage && (
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">Image</label>
          <div className="mt-2 flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-cream">
              {term?.image ? (
                <Image src={term.image.src} alt={term.name} fill sizes="80px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                  No image
                </div>
              )}
            </div>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="block w-full text-sm text-ink file:mr-4 file:rounded-md file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-dark"
            />
          </div>
          <p className="mt-1 text-xs text-muted">Shown on the Categories page. Leave empty to keep the current image.</p>
        </div>
      )}
      <button
        type="submit"
        className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        {submitLabel}
      </button>
    </form>
  );
}
