"use client";

import {
  ArrowLeft,
  BookOpen,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";

import type { Project } from "@/features/models/types/Project";

type EditorHeaderProps = {
  project: Project;
};

const statusLabels: Record<Project["status"], string> = {
  draft: "Draft",
  processing: "Processing",
  ready: "Ready",
  generated: "Generated",
  archived: "Archived",
};

export function EditorHeader({
  project,
}: EditorHeaderProps) {
  const router = useRouter();

  return (
    <header className="shrink-0 border-b border-white/10 bg-neutral-950/90 backdrop-blur-xl">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => router.push("/models")}
            aria-label="Back to models"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 text-neutral-400 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-base font-semibold text-white sm:text-lg">
                {project.name}
              </h1>

              <span className="hidden shrink-0 rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[11px] font-medium text-neutral-400 sm:inline-flex">
                {statusLabels[project.status]}
              </span>
            </div>

            <p className="mt-0.5 truncate text-xs text-neutral-500">
              {project.originalFileName || "Model project"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled
            className="hidden cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-neutral-600 sm:flex"
          >
            <Save className="h-4 w-4" />
            Save
          </button>

          <button
            type="button"
            disabled
            className="flex cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/10 px-3 py-2.5 text-sm font-medium text-neutral-600 sm:px-4"
          >
            <BookOpen className="h-4 w-4" />

            <span className="hidden sm:inline">
              Generate Guide
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}