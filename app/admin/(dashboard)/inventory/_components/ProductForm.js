"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Sparkles, Loader2 } from "lucide-react";
import { generateProductDescription } from "../aiActions";

export default function ProductForm({ categories, initialData, action }) {
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const isEditing = Boolean(initialData);

  // These three now need to be "controlled" (tracked in React state)
  // instead of just defaultValue — the Generate button needs to READ the
  // current name/category to build a good prompt, and WRITE the result
  // back into the description field. Price/stock/image stay simple
  // uncontrolled fields since nothing else needs to read their live value.
  const [name, setName] = useState(initialData?.name || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );

  function handleSubmit(formData) {
    startTransition(async () => {
      const result = await action(formData);

      if (result?.errors) {
        setErrors(result.errors);
        return;
      }

      toast.success(isEditing ? "Product updated" : "Product added");
      router.push("/admin/inventory");
    });
  }

  async function handleGenerateDescription() {
    if (!name.trim()) {
      toast.error("Enter a product name first");
      return;
    }

    setIsGenerating(true);
    const categoryName = categories.find((c) => c.id === categoryId)?.name;
    const result = await generateProductDescription(name, categoryName);
    setIsGenerating(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setDescription(result.description);
    toast.success("Description generated");
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      {errors.form && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {errors.form}
        </p>
      )}

      <div>
        <label className="mb-1 block text-sm font-semibold">Product Name</label>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2 outline-none focus:border-primary"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Category</label>
        <select
          name="category_id"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2 outline-none focus:border-primary"
        >
          <option value="" disabled>
            Choose a category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="mt-1 text-xs text-red-600">{errors.category_id}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-semibold">Price (₦)</label>
          <input
            type="number"
            name="price"
            step="0.01"
            defaultValue={initialData?.price}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2 outline-none focus:border-primary"
          />
          {errors.price && (
            <p className="mt-1 text-xs text-red-600">{errors.price}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">
            Stock Quantity
          </label>
          <input
            type="number"
            name="stock_quantity"
            defaultValue={initialData?.stock_quantity}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2 outline-none focus:border-primary"
          />
          {errors.stock_quantity && (
            <p className="mt-1 text-xs text-red-600">{errors.stock_quantity}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Image URL</label>
        <input
          type="text"
          name="image_url"
          defaultValue={initialData?.image_url}
          placeholder="https://..."
          className="w-full rounded-xl border border-border bg-surface px-4 py-2 outline-none focus:border-primary"
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-semibold">
            Description{" "}
            <span className="font-normal text-text-muted">(optional)</span>
          </label>
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={isGenerating}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles size={14} /> Generate with AI
              </>
            )}
          </button>
        </div>
        <textarea
          name="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2 outline-none focus:border-primary"
        />
      </div>

      <div className="mt-2 flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
        >
          <Save size={18} /> {isPending ? "Saving..." : "Save Product"}
        </button>
        <Link
          href="/admin/inventory"
          className="rounded-xl border border-border px-6 py-2.5 font-semibold transition hover:bg-surface-muted"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
