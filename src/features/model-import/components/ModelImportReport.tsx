"use client";

import { CheckCircle2, Copy } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { formatLocalizedNumber } from "@/features/i18n/lib/i18n";
import type { ModelAnalysis } from "../types/ModelAnalysis";
import type { ModelImportWarning } from "../types/ModelImportWarning";
import { createTechnicalImportReport } from "../lib/createTechnicalImportReport";

const formatMb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function ModelImportReport({ analysis, warnings, onChooseAnother }: { analysis: ModelAnalysis; warnings: ModelImportWarning[]; onChooseAnother: () => void }) {
  const { t, locale } = useTranslation();
  const rows: Array<[string, string]> = [
    [t("modelImport.report.format"), "GLB"],
    [t("modelImport.report.fileSize"), formatMb(analysis.file.sizeBytes)],
    [t("modelImport.report.meshes"), formatLocalizedNumber(analysis.scene.meshesCount, locale)],
    [t("modelImport.report.parts"), formatLocalizedNumber(analysis.parts.length, locale)],
    [t("modelImport.report.triangles"), formatLocalizedNumber(analysis.geometry.trianglesCount, locale)],
    [t("modelImport.report.materials"), formatLocalizedNumber(analysis.materials.materialsCount, locale)],
    [t("modelImport.report.textures"), formatLocalizedNumber(analysis.textures.texturesCount, locale)],
    [t("modelImport.report.dimensions"), `${analysis.bounds.width.toFixed(2)} × ${analysis.bounds.height.toFixed(2)} × ${analysis.bounds.depth.toFixed(2)}`],
    [t("modelImport.report.performance"), t(`modelImport.performance.${analysis.performanceLevel}`)],
  ];
  async function copyReport() {
    await navigator.clipboard.writeText(createTechnicalImportReport({ analysis, format: "glb", userAgent: navigator.userAgent }));
  }
  return <div className="space-y-4"><div className="flex items-center gap-2 text-emerald-300"><CheckCircle2 className="h-5 w-5" /><p className="font-medium">{t("modelImport.report.success")}</p></div><div className="grid grid-cols-2 gap-2">{rows.map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-white/[.02] p-3"><p className="text-[10px] uppercase text-neutral-600">{label}</p><p className="mt-1 text-sm">{value}</p></div>)}</div><p className="text-xs text-neutral-500">{t("modelImport.report.unitsUnknown")}</p>{warnings.length ? <div><h4 className="text-sm font-medium">{t("modelImport.report.warnings")}</h4><div className="mt-2 space-y-2">{warnings.map((warning, index) => <p key={`${warning.code}-${index}`} className={`rounded-lg border px-3 py-2 text-xs ${warning.severity === "critical" ? "border-red-400/20 text-red-300" : "border-amber-400/20 text-amber-300"}`}>{t(warning.messageKey)}</p>)}</div></div> : null}<div className="flex flex-wrap gap-2"><button type="button" onClick={onChooseAnother} className="rounded-xl border border-white/10 px-3 py-2 text-xs">{t("modelImport.actions.chooseAnother")}</button><button type="button" onClick={() => void copyReport()} className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs"><Copy className="h-3.5 w-3.5" />{t("modelImport.actions.copyReport")}</button></div></div>;
}
