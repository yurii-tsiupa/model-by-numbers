import {
  Box,
  Layers3,
  Printer,
} from "lucide-react";

import type { Project } from "@/features/models/types/Project";

import { GuideReadinessPanel } from "./GuideReadinessPanel";

type ProjectTabProps = {
  project: Project;
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
    </div>
  );
}