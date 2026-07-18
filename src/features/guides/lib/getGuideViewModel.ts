import type { TranslationKey } from "@/features/i18n/locales/en";

import { getGuideSettings } from "./guideSettings";
import type {
  GuideImages,
  ModelGuide,
} from "../types/ModelGuide";

export type GuideModelView = {
  key: keyof GuideImages;
  labelKey:
    | "guide.original"
    | "guide.base"
    | "guide.painted"
    | "guide.numbers";
  captionKey:
    | "guide.originalCaption"
    | "guide.baseCaption"
    | "guide.paintedCaption"
    | "guide.numbersCaption";
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

const MODEL_VIEWS: readonly GuideModelView[] = [
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

  const modelViews = MODEL_VIEWS.filter(
    (view) => enabledModelViews[view.key],
  );

  const hasPaintingWorkflow = Boolean(
    guide.paintingSummary,
  );

  const sections: GuideSectionMetadata[] = [
    {
      id: "project-overview",
      titleKey: "guide.overview",
      order: 0,
    },

    ...(modelViews.length > 0
      ? [
          {
            id: "model-views" as const,
            titleKey: "guide.modelViews" as const,
            order: 1,
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

    ...(guide.references?.length ?? 0) > 0
      ? [
          {
            id: "references" as const,
            titleKey: "guide.references" as const,
            order: 4,
          },
        ]
      : [],

    {
      id: "palette",
      titleKey: "guide.palette",
      order: 5,
    },

    ...(settings.includePartsTable
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
  } as const;
}

export type GuideViewModel = ReturnType<
  typeof getGuideViewModel
>;