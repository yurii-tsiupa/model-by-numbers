"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";

type ModelsErrorStateProps = {
  onRetry: () => void;
};

export function ModelsErrorState({
  onRetry,
}: ModelsErrorStateProps) {
  return (
    <div className="rounded-[2rem] border border-red-400/15 bg-red-400/[0.04] px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10">
        <TriangleAlert className="h-6 w-6 text-red-400" />
      </div>

      <h2 className="mt-5 text-xl font-semibold text-white">
        Something went wrong
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-400">
        We could not load your projects. Check your connection and try
        again.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}