import Image from "next/image";
import VariationsEditor from "@/components/admin/VariationsEditor";
import type { AdminProduct, AdminTerm } from "@/lib/admin-api";

export default function ProductForm({
  action,
  product,
  categories,
  brands,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  product?: AdminProduct;
  categories: AdminTerm[];
  brands: AdminTerm[];
  submitLabel: string;
}) {
  const currentImage = product?.images?.[0];

  return (
    <form action={action} className="max-w-2xl space-y-5 glass rounded-xl p-6">
      <div>
        <label className="label">
          Product Image
        </label>
        <div className="mt-2 flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden glass rounded-xl">
            {currentImage ? (
              <Image src={currentImage.src} alt={currentImage.alt || product?.name || ""} fill sizes="80px" className="object-contain p-1" />
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
        <p className="mt-1 text-xs text-muted-foreground">
          {currentImage ? "Upload a new file to replace the current image." : "Upload an image for this product."}
        </p>
      </div>

      <div>
        <label className="label">Name</label>
        <input
          required
          type="text"
          name="name"
          defaultValue={product?.name}
          className="field"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">SKU</label>
          <input
            type="text"
            name="sku"
            defaultValue={product?.sku}
            className="field"
          />
        </div>
        <div>
          <label className="label">
            Regular Price
          </label>
          <input
            type="text"
            name="regular_price"
            defaultValue={product?.regular_price}
            placeholder="0.00"
            className="field"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">
            Stock Status
          </label>
          <select
            name="stock_status"
            defaultValue={product?.stock_status ?? "instock"}
            className="mt-1 field"
          >
            <option value="instock">In Stock</option>
            <option value="outofstock">Out of Stock</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select
            name="status"
            defaultValue={product?.status ?? "publish"}
            className="mt-1 field"
          >
            <option value="publish">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Category</label>
        <select
          name="category_id"
          defaultValue={product?.categories[0]?.id}
          className="mt-1 field"
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
        <label className="label">Brand</label>
        <select
          name="brand_id"
          defaultValue={product?.brands[0]?.id}
          className="mt-1 field"
        >
          <option value="">— None —</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">
          Short Description
        </label>
        <textarea
          name="short_description"
          rows={2}
          defaultValue={product?.short_description}
          className="field"
        />
      </div>

      <div>
        <label className="label">
          Description
        </label>
        <textarea
          name="description"
          rows={5}
          defaultValue={product?.description}
          className="field"
        />
      </div>

      <VariationsEditor initial={product?.variations ?? []} />

      <button
        type="submit"
        className="btn btn-primary"
      >
        {submitLabel}
      </button>
    </form>
  );
}
