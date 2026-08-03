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

export type GuideContentSectionId =
  | "projectOverview"
  | "legend"
  | "kit"
  | "palette"
  | "modelOverview"
  | "explodedView"
  | "assembly"
  | "references"
  | "partsOverview"
  | "paintingInstructions"
  | "finishing"
  | "troubleshooting"
  | "backCover";

export type GuidePdfSectionId = GuideContentSectionId | "toc";

export type GuideSectionResolutionContext = {
  hasAssembly: boolean;
  hasBackCover: boolean;
  hasExplodedView: boolean;
  hasFinishing: boolean;
  hasKit: boolean;
  hasModelViews: boolean;
  hasPaintingWorkflow: boolean;
  hasPalette: boolean;
  hasPartsOverview: boolean;
  hasReferences: boolean;
  hasTroubleshooting: boolean;
};

export type GuideSectionDefinition = {
  id: GuideSectionId;
  core: boolean;
  defaultEnabled: boolean;
  implemented: boolean;
  includeInContents: boolean;
  contentSectionId: GuideContentSectionId;
  titleKey?: TranslationKey;
  isAvailable: (context: GuideSectionResolutionContext) => boolean;
};

const always = () => true;

export const GUIDE_SECTION_REGISTRY: readonly GuideSectionDefinition[] = [
  { id: "cover", contentSectionId: "projectOverview", core: true, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.overview", isAvailable: always },
  { id: "project-overview", contentSectionId: "projectOverview", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.overview", isAvailable: always },
  { id: "legend", contentSectionId: "legend", core: true, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.legend.title", isAvailable: always },
  { id: "kit", contentSectionId: "kit", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.kit.title", isAvailable: (context) => context.hasKit },
  { id: "model-views", contentSectionId: "modelOverview", core: true, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.modelOverview", isAvailable: (context) => context.hasModelViews },
  { id: "palette", contentSectionId: "palette", core: true, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.palette", isAvailable: (context) => context.hasPalette },
  { id: "exploded-view", contentSectionId: "explodedView", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.exploded.title", isAvailable: (context) => context.hasExplodedView },
  { id: "references", contentSectionId: "references", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.references", isAvailable: (context) => context.hasReferences },
  { id: "parts-overview", contentSectionId: "partsOverview", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.parts", isAvailable: (context) => context.hasPartsOverview },
  { id: "painting-workflow", contentSectionId: "paintingInstructions", core: true, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.workflow.instructions", isAvailable: (context) => context.hasPaintingWorkflow },
  { id: "assembly", contentSectionId: "assembly", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.assembly.sectionTitle", isAvailable: (context) => context.hasAssembly },
  { id: "finishing", contentSectionId: "finishing", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.finishing.title", isAvailable: (context) => context.hasFinishing },
  { id: "troubleshooting", contentSectionId: "troubleshooting", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.troubleshooting.title", isAvailable: (context) => context.hasTroubleshooting },
  { id: "back-cover", contentSectionId: "backCover", core: false, defaultEnabled: true, implemented: true, includeInContents: false, isAvailable: (context) => context.hasBackCover },
] as const;

export type ResolvedGuideSection = GuideSectionDefinition & {
  order: number;
};

export type GuideSectionMetadata = {
  id: GuideContentSectionId;
  order: number;
  titleKey: TranslationKey;
};

export function resolveGuideSections(context: GuideSectionResolutionContext): ResolvedGuideSection[] {
  return GUIDE_SECTION_REGISTRY
    .filter((section) => section.implemented && section.defaultEnabled && section.isAvailable(context))
    .map((section, order) => ({ ...section, order }));
}

export function resolveGuideContentsSections(sections: readonly ResolvedGuideSection[]): GuideSectionMetadata[] {
  const seen = new Set<GuideContentSectionId>();
  return sections.flatMap((section) => {
    if (!section.includeInContents || !section.titleKey || seen.has(section.contentSectionId)) return [];
    seen.add(section.contentSectionId);
    return [{ id: section.contentSectionId, order: seen.size - 1, titleKey: section.titleKey }];
  });
}
