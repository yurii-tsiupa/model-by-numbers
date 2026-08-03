import type { TranslationKey } from "@/features/i18n/locales/en";

import { getGuideSettings } from "./guideSettings";
import type {
  GuideImages,
  ModelGuide,
} from "../types/ModelGuide";
import {buildGuidePaintingStepViewModels} from "./buildGuidePaintingStepViewModels";
import { paginateGuideSteps } from "./paginateGuideSteps";

export type GuideModelView = {
  id: string;
  key: keyof GuideImages | null;
  image: string;
  labelKey:
    | "guide.original"
    | "guide.base"
    | "guide.painted"
    | "guide.numbers"
    | "guide.markerMap"
    | "guide.regionOverview"
    | "guide.coloredPartsOverview"
    | "guide.cleanModel"
    | "guide.paintedRegions"
    | "guide.coloredParts"
    | "guide.views.custom";
  captionKey:
    | "guide.originalCaption"
    | "guide.baseCaption"
    | "guide.paintedCaption"
    | "guide.numbersCaption";
  caption?:string;
};

export type GuideSectionId =
  | "project-overview"
  | "model-views"
  | "exploded-view"
  | "assembly"
  | "references"
  | "palette"
  | "parts-overview"
  | "painting-workflow";

export type GuideSectionMetadata = {
  id: GuideSectionId;
  titleKey: TranslationKey;
  order: number;
};

export type GuideTargetMode = "markers" | "region" | "parts";

const MODEL_VIEWS: readonly Omit<GuideModelView,"id"|"image">[] = [
  {
    key: "original",
    labelKey: "guide.original",
    captionKey: "guide.originalCaption",
  },
  {
    key: "base",
    labelKey: "guide.base",
    captionKey: "guide.baseCaption",
  },
  {
    key: "painted",
    labelKey: "guide.painted",
    captionKey: "guide.paintedCaption",
  },
  {
    key: "numbers",
    labelKey: "guide.numbers",
    captionKey: "guide.numbersCaption",
  },
];

export function getGuideViewModel(
  guide: ModelGuide,
) {
  const locale = guide.locale ?? "en";
  const settings = getGuideSettings(guide);

  const enabledModelViews: Record<
    keyof GuideImages,
    boolean
  > = {
    original: settings.includeOriginalView,
    base: settings.includeBaseView,
    painted: settings.includePaintedView,
    numbers: settings.includeNumbersView,
  };

  const seenModelImages = new Set<string>();
  const availableModelViews = MODEL_VIEWS.filter((view) => {
    const key=view.key;
    if(!key)return false;
    const image = guide.images[key];
    if (!enabledModelViews[key] || !image || seenModelImages.has(image)) {
      return false;
    }
    seenModelImages.add(image);
    return true;
  }).map((view)=>({ ...view, id:`legacy-${view.key}`, image:guide.images[view.key!]! }));

  const hasPaintingWorkflow = Boolean(
    guide.paintingSummary,
  );
  const paintingSteps = buildGuidePaintingStepViewModels(guide);
  const paintingPages = paginateGuideSteps(paintingSteps);
  const detailById = new Map(
    (guide.manualDetails ?? []).map((detail) => [detail.id, detail]),
  );
  const usedColorIds = new Set(
    paintingSteps.flatMap((step) => step.color ? [step.color.id] : []),
  );
  let hasMarkers = false;
  let hasRegions = false;

  for (const part of guide.workflowParts ?? guide.parts) {
    for (const step of part.paintingWorkflow?.stages ?? []) {
      for (const reference of step.targetReferences ?? []) {
        if (reference.type === "manualDetail") {
          const detail = detailById.get(reference.id);
          if (detail?.targetMode === "region") hasRegions = true;
          else hasMarkers = true;
        }
      }
    }
  }

  // New guide snapshots carry the workflow mode explicitly. The fallback keeps
  // historical snapshots readable without allowing marker/region details into
  // the technical model-parts section.
  const targetMode: GuideTargetMode = guide.simpleTargetMode ?? (hasRegions
    ? "region"
    : hasMarkers
      ? "markers"
      : "parts");
  const cleanLegacyView=availableModelViews.find(view=>view.key==="base")??availableModelViews.find(view=>view.key==="original")??availableModelViews[0];
  const workflowLegacyKey:keyof GuideImages=targetMode==="markers"?"numbers":"painted";
  const workflowLegacyView=availableModelViews.find(view=>view.key===workflowLegacyKey&&view.image!==cleanLegacyView?.image);
  const legacyModelViews = [cleanLegacyView,workflowLegacyView]
    .filter((view):view is NonNullable<typeof view>=>Boolean(view))
    .map((view) => ({
      ...view,
      labelKey:
        targetMode === "markers" && view.key === "numbers"
          ? "guide.markerMap" as const
          : targetMode === "region" && view.key === "painted"
            ? "guide.regionOverview" as const
            : targetMode === "parts" && view.key === "painted"
              ? "guide.coloredPartsOverview" as const
              : view.labelKey,
    }));
  const overviewLabelKey = (view: NonNullable<ModelGuide["overviewViews"]>[number]): GuideModelView["labelKey"] =>
    view.source === "manual" ? "guide.views.custom" : view.type === "marker-map" ? "guide.markerMap" : view.type === "painted-regions" ? "guide.paintedRegions" : view.type === "colored-parts" ? "guide.coloredParts" : "guide.cleanModel";
  const modelViews: GuideModelView[] = guide.overviewViews?.length
    ? guide.overviewViews.slice().sort((a,b)=>a.order-b.order).filter(view=>view.included!==false&&Boolean(view.image)).map(view=>({id:view.id,image:view.image,labelKey:overviewLabelKey(view),captionKey:"guide.baseCaption",caption:view.source==="manual"?view.caption?.trim()||undefined:undefined,key:null}))
    : legacyModelViews;
  const paletteSource =
    guide.previewPalette ?? guide.workflowPalette ?? guide.palette;
  const usageByColor = new Map<string, number>();
  for (const step of paintingSteps) {
    if (step.color) {
      usageByColor.set(
        step.color.id,
        (usageByColor.get(step.color.id) ?? 0) + 1,
      );
    }
  }
  const usedPalette = paletteSource
    .filter((color) => usedColorIds.has(color.id))
    .map((color) => ({
      id: color.id,
      number: color.number,
      name: color.name,
      hex: color.hex,
      usageCount: usageByColor.get(color.id) ?? 0,
    }));
  const includedReferences = (guide.references ?? [])
    .filter((reference) => reference.includedInGuide !== false)
    .slice()
    .sort((first, second) =>
      (first.order ?? 0) - (second.order ?? 0),
    );
  const referencedPartIds = new Set(
    (guide.workflowParts ?? guide.parts).flatMap((part) =>
      (part.paintingWorkflow?.stages ?? []).flatMap((stage) =>
        (stage.targetReferences ?? []).flatMap((reference) =>
          reference.type === "part" ? [reference.id] : [],
        ),
      ),
    ),
  );
  const referencedParts = (guide.workflowParts ?? guide.parts).filter(
    (part) => referencedPartIds.has(part.id),
  );
  const guideParts = targetMode === "parts" ? referencedParts : [];

  const sections: GuideSectionMetadata[] = [
    {
      id: "project-overview",
      titleKey: "guide.overview",
      order: 0,
    },

    ...(usedPalette.length > 0
      ? [{ id: "palette" as const, titleKey: "guide.palette" as const, order: 1 }]
      : []),

    ...(modelViews.length > 0
      ? [
          {
            id: "model-views" as const,
            titleKey: "guide.modelOverview" as const,
            order: 2,
          },
        ]
      : []),

    ...(settings.includeExplodedView &&
    guide.explodedView
      ? [
          {
            id: "exploded-view" as const,
            titleKey:
              "guide.exploded.title" as const,
            order: 2,
          },
        ]
      : []),

    ...(settings.includeAssemblyInstructions &&
    (guide.assemblySteps?.length ?? 0) > 0
      ? [
          {
            id: "assembly" as const,
            titleKey:
              "guide.assembly.title" as const,
            order: 3,
          },
        ]
      : []),

    ...(includedReferences.length > 0
      ? [
          {
            id: "references" as const,
            titleKey: "guide.references" as const,
            order: 4,
          },
        ]
      : []),

    ...(settings.includePartsTable && guideParts.length > 0
      ? [
          {
            id: "parts-overview" as const,
            titleKey: "guide.parts" as const,
            order: 6,
          },
        ]
      : []),

    ...(hasPaintingWorkflow
      ? [
          {
            id: "painting-workflow" as const,
            titleKey:
              "guide.workflow.instructions" as const,
            order: 7,
          },
        ]
      : []),
  ];

  return {
    guide,
    locale,
    settings,
    modelViews,
    workflowGuide: {
      ...guide,
      parts: guide.workflowParts ?? guide.parts,
    },
    hasPaintingWorkflow,
    sections,
    paintingSteps,
    paintingPages,
    usedPalette,
    includedReferences,
    referencedParts: guideParts,
    metrics: {
      stepCount: paintingSteps.length,
      targetCount: paintingSteps.filter(
        (step) => !step.isWholeModel && step.targetLabels.length > 0,
      ).length,
      usedColorCount: usedColorIds.size,
      modelPartCount: (guide.workflowParts ?? guide.parts).length,
      estimatedTotalTime:
        guide.paintingSummary?.estimatedTimeMinutes || null,
    },
    targetMode,
  } as const;
}

export type GuideViewModel = ReturnType<
  typeof getGuideViewModel
>;
