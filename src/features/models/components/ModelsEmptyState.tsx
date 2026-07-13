"use client";

import { Box, Plus, Sparkles } from "lucide-react";

type ModelsEmptyStateProps = {
  onNewProject: () => void;
};

export function ModelsEmptyState({
  onNewProject,
}: ModelsEmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025] px-6 py-16 text-center sm:px-10 sm:py-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] shadow-2xl shadow-black/30">
          <Box className="h-7 w-7 text-orange-400" />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-neutral-400">
          <Sparkles className="h-3.5 w-3.5 text-orange-400" />
          Your workspace is ready
        </div>

        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          No models yet
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-400 sm:text-base">
          Upload your first 3D model and start preparing a structured
          painting guide for all of its parts.
        </p>

        <button
          type="button"
          onClick={onNewProject}
          className="mt-8 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
        >
          <Plus className="h-4 w-4" />
          Create your first project
        </button>
      </div>
    </div>
  );
}