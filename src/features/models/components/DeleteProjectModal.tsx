"use client";

import {
  LoaderCircle,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { useEffect } from "react";

import type { Project } from "../types/Project";

type DeleteProjectModalProps = {
  project: Project | null;
  isDeleting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteProjectModal({
  project,
  isDeleting,
  error,
  onClose,
  onConfirm,
}: DeleteProjectModalProps) {
  useEffect(() => {
    if (!project) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [project, isDeleting, onClose]);

  if (!project) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isDeleting
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-project-title"
        className="w-full rounded-t-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:max-w-md sm:rounded-3xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
            <TriangleAlert
              className="h-5 w-5 text-red-500"
              strokeWidth={1.8}
            />
          </div>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            aria-label="Close delete confirmation"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h2
          id="delete-project-title"
          className="mt-6 font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]"
        >
          Delete project?
        </h2>

        <p className="mt-3 font-[family-name:var(--font-inter)] text-sm leading-6 text-[var(--text-secondary)]">
          You are about to permanently delete{" "}
          <span className="font-medium text-[var(--text)]">
            {project.name}
          </span>
          . This action cannot be undone.
        </p>

        {error ? (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-[family-name:var(--font-inter)] text-sm text-red-500"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="min-h-11 cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--bg)] px-5 py-3 font-[family-name:var(--font-inter)] text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 font-[family-name:var(--font-inter)] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete project
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
  }