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
  meshUuid?: string;
  paletteColorId?: string | null;
};

export type GuideImages = {
  original: string | null;
  base: string | null;
  painted: string | null;
  numbers: string | null;
};
export type GuideOverviewViewType="clean"|"marker-map"|"painted-regions"|"colored-parts";
export type GuideOverviewView={id:string;type:GuideOverviewViewType;image:string;order:number;camera?:import("@/features/model-editor/types/PaintingWorkflow").PaintingPreviewCamera;caption?:string;source?:"automatic"|"manual";sourceRevision?:string;included?:boolean;};
export type GuideSettings={includeOriginalView:boolean;includeBaseView:boolean;includePaintedView:boolean;includeNumbersView:boolean;includePartsTable:boolean;includeProjectDescription:boolean;includeReferenceImages:boolean;includeExplodedView:boolean;includeAssemblyInstructions:boolean;includeAssemblyStepImages:boolean};
export type GuideExplodedView={image:string|null;labelsMode:"none"|"numbers"|"numbers-and-names";partsCount:number};
export type GuideAssemblyPart={id:string;number:number;name:string};
export type GuideAssemblyStep={id:string;order:number;title:string;description:string;parts:GuideAssemblyPart[];image:string|null;partIds?:string[];imageId?:string|null;};
import type { ReferenceImageType } from "@/features/references/types/ReferenceImage";
export type GuideReferenceImage = { id:string; name:string; type:ReferenceImageType; dataUrl:string; width:number; height:number; source?:"project"|"guide"; includedInGuide?:boolean; order?:number; caption?:string; };

export type ModelGuide = {
  simpleTargetMode?: import("@/features/models/types/SimpleTargetMode").SimpleTargetMode | null;
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
  overviewViews?: GuideOverviewView[];
  references?: GuideReferenceImage[];
  generatedAt: Date;
  settings?: GuideSettings;
  explodedView?: GuideExplodedView | null;
  assemblySteps?: GuideAssemblyStep[];
  workflowPalette?: GuidePaletteColor[];
  previewPalette?: import("@/features/models/types/PaletteColor").PaletteColor[];
  workflowParts?: GuidePart[];
  manualDetails?: import("@/features/models/types/ManualDetail").ManualDetail[];
  kitItems?: import("./GuideKit").GuideManualKitItem[];
  includedKitItemIds?: string[];
  finishingItems?: import("./GuideFinishing").GuideFinishingItemInput[];
  includedFinishingItemIds?: string[];
  paintingSummary?: { modelName:string; createdAt:Date; stagesCount:number; estimatedTimeMinutes:number; difficulties:import("@/features/model-editor/types/PaintingWorkflow").PaintingDifficulty[]; isReady:boolean };
};
