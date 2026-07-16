"use client";

import {
  Check,
  CircleAlert,
  FileCheck2,
} from "lucide-react";
import { useMemo } from "react";

import type { Project } from "@/features/models/types/Project";
import type { GuideSettings } from "@/features/guides/types/ModelGuide";
import { getAssemblyGuideReadiness } from "@/features/guides/lib/getAssemblyGuideReadiness";

import { getGuideReadiness } from "../../lib/getGuideReadiness";
import { useModelEditorStore } from "../../store/modelEditorStore";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

type GuideReadinessPanelProps = {
  project: Project;
  guideSettings: GuideSettings;
};

export function GuideReadinessPanel({
  project,
  guideSettings,
}: GuideReadinessPanelProps) {
  const {t,locale}=useTranslation();
  const parts = useModelEditorStore(
    (state) => state.parts,
  );

  const palette = useModelEditorStore(
    (state) => state.palette,
  );
  const assemblySteps = useModelEditorStore((state) => state.assemblySteps);
  const setActiveTab = useModelEditorStore((state) => state.setActiveSidebarTab);
  const assemblyReadiness = useMemo(() => getAssemblyGuideReadiness({ settings: guideSettings, assemblySteps, parts }), [assemblySteps, guideSettings, parts]);
  const openAssemblyIssue = (stepId: string | null) => {
    setActiveTab("assembly");
    if (stepId) window.setTimeout(() => document.getElementById(`assembly-step-${stepId}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  };

  const readiness = useMemo(
    () =>
      getGuideReadiness({
        project,
        parts,
        palette,
        locale,
      }),
    [locale,palette, parts, project],
  );

  return (
    <section className="mt-6 border-t border-white/10 pt-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-neutral-500" />

            <h3 className="text-sm font-medium text-white">
              {t("readiness.title")}
            </h3>
          </div>

          <p className="mt-1 text-xs text-neutral-600">
            {t("readiness.progress",{completed:readiness.completedCount,total:readiness.totalCount})}
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

      <div className={`mt-4 rounded-xl border px-3 py-3 ${assemblyReadiness.blockingIssues.length ? "border-red-400/20 bg-red-400/5" : assemblyReadiness.warnings.some((issue) => issue.severity === "warning") ? "border-amber-400/20 bg-amber-400/5" : assemblyReadiness.isEnabled ? "border-emerald-400/20 bg-emerald-400/5" : "border-white/10 bg-white/[0.02]"}`}>
        <p className="text-xs font-medium">{!assemblyReadiness.isEnabled ? t("readiness.assembly.disabled") : assemblyReadiness.blockingIssues.length ? t("readiness.assembly.attention", { count: new Set(assemblyReadiness.blockingIssues.map((issue) => issue.stepId)).size }) : t("readiness.assembly.ready")}</p>
        {assemblyReadiness.warnings.filter((issue) => issue.code === "missing-step-image").length ? <p className="mt-1 text-[11px] text-amber-300">{t("readiness.assembly.missingImages", { count: assemblyReadiness.warnings.filter((issue) => issue.code === "missing-step-image").length })}</p> : null}
        {assemblyReadiness.warnings.filter((issue) => issue.code === "stale-step-image").length ? <p className="mt-1 text-[11px] text-amber-300">{t("readiness.assembly.staleImages", { count: assemblyReadiness.warnings.filter((issue) => issue.code === "stale-step-image").length })}</p> : null}
        {assemblyReadiness.isEnabled && (assemblyReadiness.blockingIssues.length || assemblyReadiness.warnings.length) ? <div className="mt-2 flex flex-wrap gap-1">{[...assemblyReadiness.blockingIssues, ...assemblyReadiness.warnings.filter((issue) => issue.severity === "warning")].slice(0, 3).map((issue, index) => <button key={`${issue.code}-${issue.stepId}-${index}`} type="button" onClick={() => openAssemblyIssue(issue.stepId)} className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-orange-300">{t(`readiness.assembly.issue.${issue.code}`)}</button>)}</div> : null}
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
            ? t("readiness.ready")
            : t("readiness.notReady")}
        </p>
      </div>
    </section>
  );
}
