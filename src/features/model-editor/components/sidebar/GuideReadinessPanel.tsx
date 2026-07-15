"use client";

import {
  Check,
  CircleAlert,
  FileCheck2,
} from "lucide-react";
import { useMemo } from "react";

import type { Project } from "@/features/models/types/Project";

import { getGuideReadiness } from "../../lib/getGuideReadiness";
import { useModelEditorStore } from "../../store/modelEditorStore";

type GuideReadinessPanelProps = {
  project: Project;
};

export function GuideReadinessPanel({
  project,
}: GuideReadinessPanelProps) {
  const parts = useModelEditorStore(
    (state) => state.parts,
  );

  const palette = useModelEditorStore(
    (state) => state.palette,
  );

  const readiness = useMemo(
    () =>
      getGuideReadiness({
        project,
        parts,
        palette,
      }),
    [palette, parts, project],
  );

  return (
    <section className="mt-6 border-t border-white/10 pt-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-neutral-500" />

            <h3 className="text-sm font-medium text-white">
              Guide readiness
            </h3>
          </div>

          <p className="mt-1 text-xs text-neutral-600">
            {readiness.completedCount} of{" "}
            {readiness.totalCount} checks
            completed
          </p>
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
            readiness.isReady
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              : "border-white/10 bg-white/[0.03] text-neutral-400"
          }`}
        >
          {readiness.progress}%
        </span>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${
            readiness.isReady
              ? "bg-emerald-400"
              : "bg-orange-400"
          }`}
          style={{
            width: `${readiness.progress}%`,
          }}
        />
      </div>

      <div className="mt-4 space-y-2">
        {readiness.checks.map((check) => (
          <div
            key={check.id}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3"
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                check.isComplete
                  ? "bg-emerald-400/15 text-emerald-300"
                  : "bg-white/[0.05] text-neutral-600"
              }`}
            >
              {check.isComplete ? (
                <Check className="h-3 w-3" />
              ) : (
                <CircleAlert className="h-3 w-3" />
              )}
            </span>

            <div className="min-w-0">
              <p
                className={`text-xs font-medium ${
                  check.isComplete
                    ? "text-neutral-300"
                    : "text-neutral-500"
                }`}
              >
                {check.label}
              </p>

              <p className="mt-1 text-[11px] leading-4 text-neutral-600">
                {check.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        className={`mt-4 rounded-xl border px-3 py-3 ${
          readiness.isReady
            ? "border-emerald-400/20 bg-emerald-400/10"
            : "border-orange-400/15 bg-orange-400/[0.06]"
        }`}
      >
        <p
          className={`text-xs font-medium ${
            readiness.isReady
              ? "text-emerald-300"
              : "text-orange-300"
          }`}
        >
          {readiness.isReady
            ? "The project is ready for guide generation."
            : "Complete the remaining checks before generating a guide."}
        </p>
      </div>
    </section>
  );
}