import type { TranslationKey } from "@/features/i18n/locales/en";

export type GuideSectionId =
  | "cover"
  | "legend"
  | "project-overview"
  | "kit"
  | "palette"
  | "model-views"
  | "exploded-view"
  | "assembly"
  | "references"
  | "parts-overview"
  | "painting-workflow"
  | "finishing"
  | "troubleshooting"
  | "back-cover";

export type GuideSectionResolutionContext = {
  hasAssembly: boolean;
  hasExplodedView: boolean;
  hasModelViews: boolean;
  hasPaintingWorkflow: boolean;
  hasPalette: boolean;
  hasPartsOverview: boolean;
  hasReferences: boolean;
};

export type GuideSectionDefinition = {
  id: GuideSectionId;
  core: boolean;
  defaultEnabled: boolean;
  implemented: boolean;
  includeInContents: boolean;
  titleKey?: TranslationKey;
  isAvailable: (context: GuideSectionResolutionContext) => boolean;
};

const always = () => true;

export const GUIDE_SECTION_REGISTRY: readonly GuideSectionDefinition[] = [
  { id: "cover", core: true, defaultEnabled: true, implemented: true, includeInContents: false, titleKey: "guide.cover.document", isAvailable: always },
  { id: "legend", core: true, defaultEnabled: false, implemented: false, includeInContents: true, isAvailable: always },
  { id: "project-overview", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.overview", isAvailable: always },
  { id: "kit", core: false, defaultEnabled: false, implemented: false, includeInContents: true, isAvailable: always },
  { id: "palette", core: true, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.palette", isAvailable: (context) => context.hasPalette },
  { id: "model-views", core: true, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.modelOverview", isAvailable: (context) => context.hasModelViews },
  { id: "exploded-view", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.exploded.title", isAvailable: (context) => context.hasExplodedView },
  { id: "assembly", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.assembly.title", isAvailable: (context) => context.hasAssembly },
  { id: "references", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.references", isAvailable: (context) => context.hasReferences },
  { id: "parts-overview", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.parts", isAvailable: (context) => context.hasPartsOverview },
  { id: "painting-workflow", core: true, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.workflow.instructions", isAvailable: (context) => context.hasPaintingWorkflow },
  { id: "finishing", core: false, defaultEnabled: false, implemented: false, includeInContents: true, isAvailable: always },
  { id: "troubleshooting", core: false, defaultEnabled: false, implemented: false, includeInContents: true, isAvailable: always },
  { id: "back-cover", core: false, defaultEnabled: false, implemented: false, includeInContents: false, isAvailable: always },
] as const;

export type ResolvedGuideSection = GuideSectionDefinition & {
  order: number;
};

export type GuideSectionMetadata = ResolvedGuideSection & {
  titleKey: TranslationKey;
};

export function resolveGuideSections(context: GuideSectionResolutionContext): ResolvedGuideSection[] {
  return GUIDE_SECTION_REGISTRY
    .filter((section) => section.implemented && section.defaultEnabled && section.isAvailable(context))
    .map((section, order) => ({ ...section, order }));
}

export function resolveGuideContentsSections(sections: readonly ResolvedGuideSection[]): GuideSectionMetadata[] {
  return sections.flatMap((section) => section.includeInContents && section.titleKey
    ? [{ ...section, titleKey: section.titleKey }]
    : []);
}
