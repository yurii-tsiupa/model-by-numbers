import type { ProjectPart } from "@/features/models/types/ProjectPart";

export function initializeDefaultPaintingStep(
  parts: ProjectPart[],
): ProjectPart[] {
  if (!parts.length || parts.some((part) => part.paintingWorkflow.stages.length > 0)) return parts;
  const now = new Date().toISOString();
  return parts.map((part, index) => index !== 0 ? part : {
    ...part,
    paintingWorkflow: {
      ...part.paintingWorkflow,
      stages: [{
        id: crypto.randomUUID(),
        order: 1,
        type: "primer",
        customName: null,
        paletteColorId: null,
        recommendedCoats: null,
        notes: "",
        targetReferences: [],
        overviewPreviewEnabled: true,
        previewShots: [],
        createdAt: now,
        updatedAt: now,
      }],
    },
  });
}
