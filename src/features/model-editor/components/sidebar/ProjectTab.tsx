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

type ProjectTabProps = {
  project: Project;
  isGeneratingThumbnail: boolean;
  thumbnailError: string | null;
  onRegenerateThumbnail: () => void;
};

const printerLabels = {
  fdm: "FDM",
  resin: "Resin / SLA",
  other: "Other",
};

const materialLabels = {
  pla: "PLA",
  petg: "PETG",
  abs: "ABS",
  tpu: "TPU",
  resin: "Resin",
  other: "Other",
};

export function ProjectTab({
  project,
  isGeneratingThumbnail,
  thumbnailError,
  onRegenerateThumbnail,
}: ProjectTabProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-600">
          Model Settings
        </p>

        <h2 className="mt-2 text-lg font-semibold text-white">
          Project
        </h2>
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Printer className="h-4 w-4" />
            Printer type
          </div>

          <p className="mt-2 text-sm text-neutral-300">
            {printerLabels[project.printerType]}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Layers3 className="h-4 w-4" />
            Material
          </div>

          <p className="mt-2 text-sm text-neutral-300">
            {materialLabels[project.material]}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Box className="h-4 w-4" />
            Base color
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

      <GuideReadinessPanel project={project} />
      <div className="mt-5 border-t border-white/10 pt-5"><button type="button" disabled={isGeneratingThumbnail} onClick={onRegenerateThumbnail} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-neutral-300 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50">{isGeneratingThumbnail ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}{isGeneratingThumbnail ? "Generating thumbnail..." : "Regenerate Thumbnail"}</button>{thumbnailError ? <p role="alert" className="mt-2 text-xs leading-5 text-red-300">{thumbnailError}</p> : null}</div>
      <GeneratedGuidesSection projectId={project.id} />
    </div>
  );
}
