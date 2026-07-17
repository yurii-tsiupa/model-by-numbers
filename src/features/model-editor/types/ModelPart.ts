import type { ExplodedOffset } from "./ExplodedOffset";
import type { PartPaintingWorkflow } from "./PaintingWorkflow";

export type ModelPart = {
  id: string;
  meshUuid: string;
  sourcePartKey?: string;

  name: string;
  index: number;
  visible: boolean;
  includeInGuide: boolean;

  originalColor: string | null;

  /**
   * Temporary legacy value used before palette generation.
   */
  color: string | null;

  paletteColorId: string | null;
  explodedOffset: ExplodedOffset | null;
  paintingWorkflow: PartPaintingWorkflow;
};
