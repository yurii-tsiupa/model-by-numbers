export function ModelsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.025]"
        >
          <div className="aspect-[16/10] animate-pulse bg-white/[0.04]" />

          <div className="space-y-4 p-5">
            <div className="h-5 w-2/3 animate-pulse rounded-full bg-white/[0.06]" />

            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded-full bg-white/[0.04]" />
              <div className="h-3 w-4/5 animate-pulse rounded-full bg-white/[0.04]" />
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="h-3 w-full animate-pulse rounded-full bg-white/[0.04]" />
            </div>

            <div className="flex gap-2">
              <div className="h-10 flex-1 animate-pulse rounded-full bg-white/[0.05]" />
              <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.05]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}