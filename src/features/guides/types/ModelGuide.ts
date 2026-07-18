export type GuidePaletteColor = {
  id: string;
  number: number;
  name: string;
  hex: string;
  usageCount: number;
};

export type GuidePart = {
  id: string;
  name: string;
  number: number;
  colorNumber: number | null;
  colorName: string | null;
  colorHex: string | null;
  notes: string | null;
  paintingWorkflow?: import("@/features/model-editor/types/PaintingWorkflow").PartPaintingWorkflow;
};

export type GuideImages = {
  original: string | null;
  base: string | null;
  painted: string | null;
  numbers: string | null;
};
export type GuideSettings={includeOriginalView:boolean;includeBaseView:boolean;includePaintedView:boolean;includeNumbersView:boolean;includePartsTable:boolean;includeProjectDescription:boolean;includeReferenceImages:boolean;includeExplodedView:boolean;includeAssemblyInstructions:boolean;includeAssemblyStepImages:boolean};
export type GuideExplodedView={image:string|null;labelsMode:"none"|"numbers"|"numbers-and-names";partsCount:number};
export type GuideAssemblyPart={id:string;number:number;name:string};
export type GuideAssemblyStep={id:string;order:number;title:string;description:string;parts:GuideAssemblyPart[];image:string|null};
import type { ReferenceImageType } from "@/features/references/types/ReferenceImage";
export type GuideReferenceImage = { id:string; name:string; type:ReferenceImageType; dataUrl:string; width:number; height:number; };

export type ModelGuide = {
  templateId?: string;
  assetReferences?: import("../services/assets/types").GuideAssetReference[];
  locale?: import("@/features/i18n/types/Locale").Locale;
  projectId: string;
  title: string;
  description: string;
  author: string;
  printerType: string;
  material: string;
  baseColor: string;
  partsCount: number;
  colorsCount: number;
  palette: GuidePaletteColor[];
  parts: GuidePart[];
  images: GuideImages;
  references?: GuideReferenceImage[];
  generatedAt: Date;
  settings?: GuideSettings;
  explodedView?: GuideExplodedView | null;
  assemblySteps?: GuideAssemblyStep[];
  workflowPalette?: GuidePaletteColor[];
  workflowParts?: GuidePart[];
  paintingSummary?: { modelName:string; createdAt:Date; stagesCount:number; estimatedTimeMinutes:number; difficulties:import("@/features/model-editor/types/PaintingWorkflow").PaintingDifficulty[]; isReady:boolean };
};
