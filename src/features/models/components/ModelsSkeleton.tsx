export function ModelsSkeleton() {
  return (
    <div className="grid justify-center grid-cols-[repeat(auto-fit,340px)] gap-5">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
        >
          <div className="aspect-[16/10] animate-pulse bg-[var(--bg)]" />

          <div className="space-y-5 p-5">
            <div className="space-y-2">
              <div className="h-6 w-2/3 animate-pulse rounded bg-[var(--border)]" />
              <div className="h-4 w-full animate-pulse rounded bg-[var(--border)] opacity-70" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--border)] opacity-50" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="h-16 animate-pulse rounded-xl bg-[var(--bg)]" />
              <div className="h-16 animate-pulse rounded-xl bg-[var(--bg)]" />
            </div>

            <div className="space-y-3 border-t border-[var(--border)] pt-4">
              <div className="h-4 w-full animate-pulse rounded bg-[var(--border)] opacity-70" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-[var(--border)] opacity-60" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--border)] opacity-50" />
            </div>

            <div className="flex gap-2 pt-2">
              <div className="h-11 flex-1 animate-pulse rounded-xl bg-[var(--border)]" />
              <div className="h-11 w-11 animate-pulse rounded-xl bg-[var(--border)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}