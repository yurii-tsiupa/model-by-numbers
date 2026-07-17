import {
  Box,
  Layers3,
  Printer,
  ImagePlus,
  LoaderCircle,
} from "lucide-react";

import type { Project } from "@/features/models/types/Project";
import { GeneratedGuidesSection } from "@/features/guides/components/GeneratedGuidesSection";

import { GuideReadinessPanel } from "./GuideReadinessPanel";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import type { GuideSettings } from "@/features/guides/types/ModelGuide";
import { useModelEditorStore } from "../../store/modelEditorStore";
import { formatModelDimension } from "@/features/model-import/lib/modelDimensions";
import { PaintingProjectInsightsPanel } from "./PaintingProjectInsightsPanel";

type ProjectTabProps = {
  project: Project;
  isGeneratingThumbnail: boolean;
  thumbnailError: string | null;
  onRegenerateThumbnail: () => void;
  guideSettings: GuideSettings;
};

export function ProjectTab({
  project,
  isGeneratingThumbnail,
  thumbnailError,
  onRegenerateThumbnail,
  guideSettings,
}: ProjectTabProps) {
  const {t,locale}=useTranslation();
  const printerLabels={fdm:t("domain.fdm"),resin:t("domain.resin"),other:t("domain.other")};
  const materialLabels={pla:t("domain.pla"),petg:t("domain.petg"),abs:t("domain.abs"),tpu:"TPU",resin:t("domain.resin"),other:t("domain.other")};
  const parts=useModelEditorStore(state=>state.parts),labelsMode=useModelEditorStore(state=>state.explodedLabelsMode),setViewerMode=useModelEditorStore(state=>state.setViewerMode);
  const customOffsets=parts.filter(part=>part.explodedOffset!==null).length;
  const labelsText=labelsMode==="none"?t("exploded.labels.none"):labelsMode==="numbers"?t("exploded.labels.numbers"):t("exploded.labels.names");
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-600">
          {t("editor.modelSettings")}
        </p>

        <h2 className="mt-2 text-lg font-semibold text-white">
          {t("editor.tabs.project")}
        </h2>
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Printer className="h-4 w-4" />
            {t("guide.printer")}
          </div>

          <p className="mt-2 text-sm text-neutral-300">
            {printerLabels[project.printerType]}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Layers3 className="h-4 w-4" />
            {t("guide.material")}
          </div>

          <p className="mt-2 text-sm text-neutral-300">
            {materialLabels[project.material]}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Box className="h-4 w-4" />
            {t("guide.baseColor")}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span
              className="h-5 w-5 rounded-full border border-white/20"
              style={{
                backgroundColor: project.baseColor,
              }}
            />

            <span className="font-mono text-xs uppercase text-neutral-400">
              {project.baseColor}
            </span>
          </div>
        </div>
      </div>

      <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-center gap-2 text-xs text-neutral-600"><Box className="h-4 w-4" />{t("projectInfo.physicalModel")}</div>
        <dl className="mt-3 space-y-3 text-xs">
          <div><dt className="text-neutral-600">{t("projectInfo.units")}</dt><dd className="mt-1 text-neutral-300">{project.modelUnits?t(`modelImport.units.${project.modelUnits}`):t("projectInfo.unknown")}</dd></div>
          <div><dt className="text-neutral-600">{t("projectInfo.originalDimensions")}</dt><dd className="mt-1 text-neutral-300">{project.originalDimensions&&project.modelUnits?`${formatModelDimension(project.originalDimensions.width,locale)} × ${formatModelDimension(project.originalDimensions.height,locale)} × ${formatModelDimension(project.originalDimensions.depth,locale)} ${t(`modelImport.units.symbol.${project.modelUnits}`)}`:t("projectInfo.notRecorded")}</dd></div>
        </dl>
      </section>

      <GuideReadinessPanel project={project} guideSettings={guideSettings} />
      <PaintingProjectInsightsPanel />
      <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3"><p className="text-xs font-medium text-neutral-300">{t("exploded.summary.title")}</p><p className="mt-1 text-[11px] text-neutral-500">{t("exploded.summary.parts",{count:parts.length})}</p><p className="mt-1 text-[11px] text-neutral-500">{t("exploded.summary.adjusted",{count:customOffsets})}</p><p className="mt-1 text-[11px] text-neutral-500">{t("exploded.summary.labels",{mode:labelsText})}</p>{parts.length<2?<p className="mt-2 text-xs text-amber-300">{t("exploded.singlePart")}</p>:<button type="button" onClick={()=>setViewerMode("exploded")} className="mt-2 text-xs text-orange-300">{t("exploded.reviewLayout")}</button>}</section>
      <div className="mt-5 border-t border-white/10 pt-5"><button type="button" disabled={isGeneratingThumbnail} onClick={onRegenerateThumbnail} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-neutral-300 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50">{isGeneratingThumbnail ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}{isGeneratingThumbnail ? t("editor.generatingThumbnail") : t("editor.regenerateThumbnail")}</button>{thumbnailError ? <p role="alert" className="mt-2 text-xs leading-5 text-red-300">{thumbnailError}</p> : null}</div>
      <GeneratedGuidesSection projectId={project.id} />
    </div>
  );
}
