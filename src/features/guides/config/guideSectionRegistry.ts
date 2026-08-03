import type { TranslationKey } from "@/features/i18n/locales/en";
import type { GuideManageableSectionId, GuideSectionSettings } from "../types/GuideSectionSettings";

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
  descriptionKey?: TranslationKey;
  settingsKey?: GuideManageableSectionId;
  isAvailable: (context: GuideSectionResolutionContext) => boolean;
};

const always = () => true;

export const GUIDE_SECTION_REGISTRY: readonly GuideSectionDefinition[] = [
  { id: "cover", contentSectionId: "projectOverview", core: true, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.overview", isAvailable: always },
  { id: "project-overview", contentSectionId: "projectOverview", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.overview", isAvailable: always },
  { id: "legend", contentSectionId: "legend", core: true, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.legend.title", isAvailable: always },
  { id: "kit", contentSectionId: "kit", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.kit.title", descriptionKey: "guide.sections.descriptions.kit", settingsKey: "kit", isAvailable: (context) => context.hasKit },
  { id: "model-views", contentSectionId: "modelOverview", core: true, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.modelOverview", isAvailable: (context) => context.hasModelViews },
  { id: "palette", contentSectionId: "palette", core: true, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.palette", isAvailable: (context) => context.hasPalette },
  { id: "exploded-view", contentSectionId: "explodedView", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.exploded.title", isAvailable: (context) => context.hasExplodedView },
  { id: "references", contentSectionId: "references", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.references", isAvailable: (context) => context.hasReferences },
  { id: "parts-overview", contentSectionId: "partsOverview", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.parts", isAvailable: (context) => context.hasPartsOverview },
  { id: "painting-workflow", contentSectionId: "paintingInstructions", core: true, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.workflow.instructions", isAvailable: (context) => context.hasPaintingWorkflow },
  { id: "assembly", contentSectionId: "assembly", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.assembly.sectionTitle", descriptionKey: "guide.sections.descriptions.assembly", settingsKey: "assembly", isAvailable: (context) => context.hasAssembly },
  { id: "finishing", contentSectionId: "finishing", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.finishing.title", descriptionKey: "guide.sections.descriptions.finishing", settingsKey: "finishing", isAvailable: (context) => context.hasFinishing },
  { id: "troubleshooting", contentSectionId: "troubleshooting", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.troubleshooting.title", descriptionKey: "guide.sections.descriptions.troubleshooting", settingsKey: "troubleshooting", isAvailable: (context) => context.hasTroubleshooting },
  { id: "back-cover", contentSectionId: "backCover", core: false, defaultEnabled: true, implemented: true, includeInContents: true, titleKey: "guide.backCover.title", descriptionKey: "guide.sections.descriptions.backCover", settingsKey: "backCover", isAvailable: (context) => context.hasBackCover },
] as const;

export type ResolvedGuideSection = GuideSectionDefinition & {
  order: number;
};

export type GuideSectionMetadata = {
  id: GuideContentSectionId;
  order: number;
  titleKey: TranslationKey;
};

export type GuideSectionControl = GuideSectionDefinition & {
  available: boolean;
  descriptionKey: TranslationKey;
  enabled: boolean;
  settingsKey: GuideManageableSectionId;
  titleKey: TranslationKey;
};

function isSectionEnabled(section: GuideSectionDefinition, settings: GuideSectionSettings | undefined): boolean {
  if (section.core || !section.settingsKey) return section.defaultEnabled;
  return settings?.[section.settingsKey]?.enabled ?? section.defaultEnabled;
}

export function resolveGuideSectionControls(
  context: GuideSectionResolutionContext,
  settings: GuideSectionSettings | undefined,
): GuideSectionControl[] {
  return GUIDE_SECTION_REGISTRY.flatMap((section) => {
    const settingsKey = section.settingsKey;
    const titleKey = section.titleKey;
    const descriptionKey = section.descriptionKey;
    return settingsKey && titleKey && descriptionKey
      ? [{ ...section, settingsKey, titleKey, descriptionKey, available: section.implemented && section.isAvailable(context), enabled: isSectionEnabled(section, settings) }]
      : [];
  });
}

export function resolveGuideSections(context: GuideSectionResolutionContext, settings?: GuideSectionSettings): ResolvedGuideSection[] {
  return GUIDE_SECTION_REGISTRY
    .filter((section) => section.implemented && isSectionEnabled(section, settings) && section.isAvailable(context))
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
