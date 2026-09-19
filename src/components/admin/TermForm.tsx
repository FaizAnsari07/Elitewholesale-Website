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
    <form action={action} className="max-w-lg space-y-5 glass rounded-xl p-6">
      <div>
        <label className="label">Name</label>
        <input
          required
          type="text"
          name="name"
          defaultValue={term?.name}
          className="field"
        />
      </div>
      <div>
        <label className="label">
          Description
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={term?.description}
          className="field"
        />
      </div>
      {withImage && (
        <div>
          <label className="label">Image</label>
          <div className="mt-2 flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden glass rounded-xl">
              {term?.image ? (
                <Image src={term.image.src} alt={term.name} fill sizes="80px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="block w-full text-sm text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/80"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Shown on the Categories page. Leave empty to keep the current image.</p>
        </div>
      )}
      <button
        type="submit"
        className="btn btn-primary"
      >
        {submitLabel}
      </button>
    </form>
  );
}
