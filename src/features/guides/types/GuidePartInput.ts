export type GuidePartInput = {
  id: string;
  meshUuid?:string;
  name: string;
  visible: boolean;
  includeInGuide?: boolean;
  paletteColorId: string | null;
  index?: number;
  paintingWorkflow?: import("@/features/model-editor/types/PaintingWorkflow").PartPaintingWorkflow;
};
