export default function ProductLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-14 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
        <span className="text-slate-300 dark:text-zinc-700">/</span>
        <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
        <span className="text-slate-300 dark:text-zinc-700">/</span>
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
      </div>

      {/* Main Product Skeleton */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:gap-12">
        {/* Image Box */}
        <div className="md:col-span-3 lg:col-span-4">
          <div className="aspect-square w-full animate-pulse rounded-3xl bg-slate-200 dark:bg-zinc-800 shadow-sm" />
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-between md:col-span-6 lg:col-span-5">
          <div className="space-y-4">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-slate-200 dark:bg-zinc-800" />
            <div className="h-9 w-36 animate-pulse rounded-lg bg-slate-200 dark:bg-zinc-800" />

            <div className="my-4 h-[1px] w-full bg-slate-100 dark:bg-zinc-800" />

            <div className="space-y-2.5">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-8">
            <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-zinc-800" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-emerald-100 dark:bg-emerald-950/40" />
          </div>
        </div>
      </div>
    </main>
  );
}
