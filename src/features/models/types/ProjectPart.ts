import type { ExplodedOffset } from "@/features/model-editor/types/ExplodedOffset";
import type { PartPaintingWorkflow } from "@/features/model-editor/types/PaintingWorkflow";

export type ProjectPart = {
  id: string;
  meshUuid?: string;
  sourcePartKey?: string;
  name: string;
  visible: boolean;
  includeInGuide: boolean;

  /**
   * Temporary legacy field.
   * Can be removed after all existing projects are migrated.
   */
  color: string | null;

  paletteColorId: string | null;
  explodedOffset: ExplodedOffset | null;
  paintingWorkflow: PartPaintingWorkflow;
};
