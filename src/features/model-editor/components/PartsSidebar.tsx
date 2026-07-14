import {
  Box,
  Search,
} from "lucide-react";

export function PartsSidebar() {
  return (
    <aside className="flex min-h-0 w-full shrink-0 flex-col border-b border-white/10 bg-neutral-950/70 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="border-b border-white/10 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-600">
              Model Structure
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              Parts
            </h2>
          </div>

          <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs text-neutral-500">
            0
          </span>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />

          <input
            type="search"
            placeholder="Search parts"
            disabled
            className="h-10 w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.025] pl-9 pr-3 text-sm text-neutral-500 outline-none placeholder:text-neutral-700 disabled:opacity-60"
          />
        </div>
      </div>

      <div className="flex min-h-44 flex-1 items-center justify-center p-5 lg:min-h-0">
        <div className="max-w-48 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <Box className="h-5 w-5 text-neutral-600" />
          </div>

          <p className="mt-4 text-sm font-medium text-neutral-400">
            No parts loaded
          </p>

          <p className="mt-1 text-xs leading-5 text-neutral-600">
            Parts will appear here after the 3D model is
            analyzed.
          </p>
        </div>
      </div>
    </aside>
  );
}