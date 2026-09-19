import Image from "next/image";
import type { WcProduct, WcTerm } from "@/lib/admin-api";

export default function ProductForm({
  action,
  product,
  categories,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  product?: WcProduct;
  categories: WcTerm[];
  submitLabel: string;
}) {
  const currentImage = product?.images?.[0];

  return (
    <form action={action} className="max-w-2xl space-y-5 rounded-xl border border-black/10 bg-white p-6">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted">
          Product Image
        </label>
        <div className="mt-2 flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-cream">
            {currentImage ? (
              <Image src={currentImage.src} alt={currentImage.alt || product?.name || ""} fill sizes="80px" className="object-contain p-1" />
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
        <p className="mt-1 text-xs text-muted">
          {currentImage ? "Upload a new file to replace the current image." : "Upload an image for this product."}
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted">Name</label>
        <input
          required
          type="text"
          name="name"
          defaultValue={product?.name}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">SKU</label>
          <input
            type="text"
            name="sku"
            defaultValue={product?.sku}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">
            Regular Price
          </label>
          <input
            type="text"
            name="regular_price"
            defaultValue={product?.regular_price}
            placeholder="0.00"
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">
            Stock Status
          </label>
          <select
            name="stock_status"
            defaultValue={product?.stock_status ?? "instock"}
            className="mt-1 w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
          >
            <option value="instock">In Stock</option>
            <option value="outofstock">Out of Stock</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">Status</label>
          <select
            name="status"
            defaultValue={product?.status ?? "publish"}
            className="mt-1 w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
          >
            <option value="publish">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted">Category</label>
        <select
          name="category_id"
          defaultValue={product?.categories[0]?.id}
          className="mt-1 w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted">
          Short Description
        </label>
        <textarea
          name="short_description"
          rows={2}
          defaultValue={product?.short_description}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted">
          Description
        </label>
        <textarea
          name="description"
          rows={5}
          defaultValue={product?.description}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <p className="text-xs text-muted">
        This quick form creates a simple product. Products with multiple
        flavors/options (variable products) aren&apos;t supported here yet.
      </p>

      <button
        type="submit"
        className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        {submitLabel}
      </button>
    </form>
  );
}
