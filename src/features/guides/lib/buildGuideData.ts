import type { PaletteColor } from "@/features/models/types/PaletteColor";
import type { Project } from "@/features/models/types/Project";

import type { GuidePartInput } from "../types/GuidePartInput";
import type {
  GuideImages,
  GuidePart,
  ModelGuide,
  GuideReferenceImage,
  GuideSettings,
  GuideExplodedView,
  GuideAssemblyStep,
} from "../types/ModelGuide";
import { getGuidePalette } from "./getGuidePalette";
import { isPartIncludedInGuide } from "./isPartIncludedInGuide";
import type { Locale } from "@/features/i18n/types/Locale";
import { getPartsInPaintingOrder } from "@/features/model-editor/lib/paintingOrder";
import { getPaintingPreviewSummary, getWorkflowPalette } from "./getPaintingGuidePreviewData";

type BuildGuideDataParams = {
  project: Project;
  parts: readonly GuidePartInput[];
  palette: readonly PaletteColor[];
  images: GuideImages;
  author: string;
  references?: readonly GuideReferenceImage[];
  locale: Locale;
  settings?: GuideSettings;
  explodedView?: GuideExplodedView | null;
  assemblySteps?: readonly GuideAssemblyStep[];
};

export function buildGuideData({
  project,
  parts,
  palette,
  images,
  author,
  references = [],
  locale,
  settings,
  explodedView = null,
  assemblySteps = [],
}: BuildGuideDataParams): ModelGuide {
  const paletteById = new Map(
    palette.map((color) => [color.id, color]),
  );

  const orderedParts=getPartsInPaintingOrder({parts,paintingOrder:project.paintingOrder,includeExcluded:false});
  const workflowParts: GuidePart[] = orderedParts
    .map((part, savedIndex) => ({
      part,
      guideIndex: part.index ?? savedIndex,
    }))
    .filter(({ part }) => isPartIncludedInGuide(part))
    .map(({ part }, orderedIndex) => {
      const color = part.paletteColorId
        ? paletteById.get(part.paletteColorId)
        : undefined;

      return {
        id: part.id,
        name: part.name,
        number: orderedIndex + 1,
        colorNumber: color?.number ?? null,
        colorName: color?.name ?? null,
        colorHex: color?.hex ?? null,
        notes: null,
        paintingWorkflow:part.paintingWorkflow?{...part.paintingWorkflow,stages:part.paintingWorkflow.stages.map(stage=>({...stage}))}:undefined,
      };
    });

  const guideParts:GuidePart[]=parts.map((part,savedIndex)=>({part,guideIndex:part.index??savedIndex})).filter(({part})=>isPartIncludedInGuide(part)).sort((a,b)=>a.guideIndex-b.guideIndex).map(({part,guideIndex})=>{const color=part.paletteColorId?paletteById.get(part.paletteColorId):undefined;return{id:part.id,name:part.name,number:guideIndex+1,colorNumber:color?.number??null,colorName:color?.name??null,colorHex:color?.hex??null,notes:null};});

  const guidePalette = getGuidePalette(parts, palette);
  const previewSummary=getPaintingPreviewSummary(orderedParts);

  return {
    locale,
    projectId: project.id,
    title: project.name,
    description: project.description,
    author,
    printerType: project.printerType,
    material: project.material,
    baseColor: project.baseColor,
    partsCount: guideParts.length,
    colorsCount: guidePalette.length,
    palette: guidePalette,
    parts: guideParts,
    images: { ...images },
    references: references.map(reference=>({...reference})),
    generatedAt: new Date(),
    settings,
    explodedView: explodedView ? { ...explodedView } : null,
    assemblySteps: assemblySteps.map(step=>({...step,parts:step.parts.map(part=>({...part}))})).sort((a,b)=>a.order-b.order),
    workflowPalette:getWorkflowPalette(orderedParts,palette),
    workflowParts,
    paintingSummary:{modelName:project.originalFileName,createdAt:project.createdAt,stagesCount:previewSummary.stagesCount,estimatedTimeMinutes:previewSummary.estimatedTimeMinutes,difficulties:previewSummary.difficulties,isReady:true},
  };
}
