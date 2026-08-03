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
  GuideOverviewView,
} from "../types/ModelGuide";
import { getGuidePalette } from "./getGuidePalette";
import { isPartIncludedInGuide } from "./isPartIncludedInGuide";
import type { Locale } from "@/features/i18n/types/Locale";
import type { GuideBackCover } from "../types/GuideBackCover";
import type { GuideSectionSettings } from "../types/GuideSectionSettings";
import { getPartsInPaintingOrder } from "@/features/model-editor/lib/paintingOrder";
import { getPaintingPreviewSummary, getWorkflowPalette } from "./getPaintingGuidePreviewData";
import {getOrderedSimplePaintingSteps,withResolvedSimpleMarkerNumbers} from "@/features/model-editor/lib/markerNumbering";

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
  templateId?: string;
  overviewViews?: readonly GuideOverviewView[];
  backCover?: GuideBackCover;
  sectionSettings?: GuideSectionSettings;
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
  templateId,
  overviewViews,
  backCover,
  sectionSettings,
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
        meshUuid:part.meshUuid,
        paletteColorId:part.paletteColorId,
        name: part.name,
        number: orderedIndex + 1,
        colorNumber: color?.number ?? null,
        colorName: color?.name ?? null,
        colorHex: color?.hex ?? null,
        notes: null,
        paintingWorkflow:part.paintingWorkflow?{...part.paintingWorkflow,stages:part.paintingWorkflow.stages.map(stage=>({...stage,targetReferences:stage.targetReferences?.map(reference=>({...reference}))??[]}))}:undefined,
      };
    });

  const guideParts:GuidePart[]=parts.map((part,savedIndex)=>({part,guideIndex:part.index??savedIndex})).filter(({part})=>isPartIncludedInGuide(part)).sort((a,b)=>a.guideIndex-b.guideIndex).map(({part,guideIndex})=>{const color=part.paletteColorId?paletteById.get(part.paletteColorId):undefined;return{id:part.id,name:part.name,number:guideIndex+1,colorNumber:color?.number??null,colorName:color?.name??null,colorHex:color?.hex??null,notes:null};});

  const guidePalette = getGuidePalette(parts, palette);
  const previewSummary=getPaintingPreviewSummary(orderedParts);
  const numberedManualDetails=withResolvedSimpleMarkerNumbers(project.manualDetails,getOrderedSimplePaintingSteps(orderedParts.flatMap(part=>part.paintingWorkflow?[{paintingWorkflow:part.paintingWorkflow}]:[]),project.simplePaintingStepOrder));

  return {
    simpleTargetMode: project.simpleTargetMode,
    templateId,
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
    overviewViews:overviewViews?.map(view=>({...view,camera:view.camera?{...view.camera,position:{...view.camera.position},target:{...view.camera.target},up:{...view.camera.up}}:undefined})),
    references: references.map(reference=>({...reference})),
    generatedAt: new Date(),
    settings,
    explodedView: explodedView ? { ...explodedView } : null,
    assemblySteps: assemblySteps.map(step=>({...step,parts:step.parts.map(part=>({...part}))})).sort((a,b)=>a.order-b.order),
    backCover: backCover ? { ...backCover } : undefined,
    sectionSettings: sectionSettings ? { ...sectionSettings } : undefined,
    workflowPalette:getWorkflowPalette(orderedParts,palette,project.manualDetails),
    previewPalette:palette.map(color=>({...color})),
    workflowParts,
    manualDetails:numberedManualDetails.map(detail=>({...detail,pins:detail.pins.map(pin=>({...pin,position:{...pin.position},normal:pin.normal?{...pin.normal}:null,camera:{...pin.camera,position:{...pin.camera.position},target:{...pin.camera.target}}}))})),
    paintingSummary:{modelName:project.originalFileName,createdAt:project.createdAt,stagesCount:previewSummary.stagesCount,estimatedTimeMinutes:previewSummary.estimatedTimeMinutes,difficulties:previewSummary.difficulties,isReady:true},
  };
}
