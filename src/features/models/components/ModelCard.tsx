"use client";

import {
  Box,
  CalendarDays,
  FileBox,
  History,
  LoaderCircle,
  LockKeyhole,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import type { Project } from "../types/Project";

type ModelCardProps = {
  project: Project;
  isDeleting: boolean;
  onDelete: (project: Project) => void;
};

const statusLabels: Record<Project["status"], string> = {
  draft: "Draft",
  processing: "Processing",
  ready: "Ready",
  generated: "Generated",
  archived: "Archived",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatFileSize(bytes: number): string {
  if (!bytes) {
    return "Unknown size";
  }

  const kilobytes = bytes / 1024;
  const megabytes = bytes / (1024 * 1024);

  if (megabytes >= 1) {
    return `${megabytes.toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(kilobytes))} KB`;
}

export function ModelCard({
  project,
  isDeleting,
  onDelete,
}: ModelCardProps) {
  const [hasThumbnailError, setHasThumbnailError] = useState(false);

  const shouldShowThumbnail =
    Boolean(project.thumbnailUrl) && !hasThumbnailError;

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.025] transition duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04]">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-neutral-900">
        {shouldShowThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnailUrl ?? ""}
            alt={project.name}
            onError={() => setHasThumbnailError(true)}
            className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.12),transparent_60%)]" />

            <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40">
              <Box className="h-9 w-9 text-orange-400/80" />
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 to-transparent" />

        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-xs font-medium text-neutral-200 backdrop-blur-md">
          {statusLabels[project.status]}
        </span>

        <div
          className="absolute bottom-4 right-4 h-5 w-5 rounded-full border border-white/20 shadow-lg shadow-black/40"
          style={{ backgroundColor: project.baseColor }}
          title={`Base color: ${project.baseColor}`}
        />
      </div>

      <div className="p-5">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight text-white">
            {project.name}
          </h2>

          <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-neutral-500">
            {project.description || "No description provided."}
          </p>
        </div>

        <div className="mt-5 space-y-2.5 border-t border-white/10 pt-4 text-xs text-neutral-500">
          <div className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <FileBox className="h-3.5 w-3.5 shrink-0" />

              <span className="truncate">
                {project.originalFileName || "Model file"}
              </span>
            </span>

            <span className="shrink-0">
              {formatFileSize(project.originalFileSize)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" />
              Created
            </span>

            <span>{formatDate(project.createdAt)}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <History className="h-3.5 w-3.5" />
              Updated
            </span>

            <span>{formatDate(project.updatedAt)}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            disabled
            className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-neutral-600"
          >
            <LockKeyhole className="h-4 w-4" />
            Open
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={() => onDelete(project)}
            aria-label={`Delete ${project.name}`}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 text-neutral-500 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}