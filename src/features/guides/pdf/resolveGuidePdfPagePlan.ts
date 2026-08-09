import type { GuideContentSectionId, GuidePdfSectionId, GuideSectionId } from "../config/guideSectionRegistry";
import type { GuideViewModel } from "../lib/getGuideViewModel";
import { getGuideAssemblyPageCount } from "../lib/resolveGuideAssemblyData";
import { getGuideFinishingPageCount } from "../lib/resolveGuideFinishingData";
import { getGuidePageGeometry } from "./printPageConstants";
import { DEFAULT_GUIDE_PAGE_FORMAT, type GuidePageFormat } from "../types/GuidePageFormat";

const MAX_PAGE_CAPACITY = {
  paletteColors: 8,
  kitItems: 16,
  parts: 10,
  references: 4,
  assemblyParts: 18,
  finishingItems: 2,
} as const;

export type GuidePdfPageCapacity = { [Key in keyof typeof MAX_PAGE_CAPACITY]: number };

export function getGuidePdfPageCapacity(pageFormat: GuidePageFormat = DEFAULT_GUIDE_PAGE_FORMAT): GuidePdfPageCapacity {
  const { contentHeight } = getGuidePageGeometry(pageFormat);
  return {
    paletteColors: Math.min(MAX_PAGE_CAPACITY.paletteColors, Math.max(2, Math.floor((contentHeight - 120) / 145) * 2)),
    kitItems: Math.min(MAX_PAGE_CAPACITY.kitItems, Math.max(8, Math.floor((contentHeight - 145) / 32))),
    parts: Math.min(MAX_PAGE_CAPACITY.parts, Math.max(6, Math.floor((contentHeight - 150) / 56))),
    references: contentHeight >= 600 ? MAX_PAGE_CAPACITY.references : 2,
    assemblyParts: Math.min(MAX_PAGE_CAPACITY.assemblyParts, Math.max(10, Math.floor((contentHeight - 330) / 15) * 2)),
    finishingItems: Math.min(MAX_PAGE_CAPACITY.finishingItems, Math.max(1, Math.floor((contentHeight - 130) / 250))),
  };
}

type GuidePdfPageRange = {
  count: number;
  start: number;
};

export type GuidePdfPagePlan = {
  pages: readonly GuideResolvedPdfPage[];
  sectionFirstPage: Readonly<Partial<Record<GuideContentSectionId, number>>>;
  tableOfContents: number | null;
  sections: Partial<Record<GuideSectionId, GuidePdfPageRange>>;
  totalPages: number;
};

export type GuideResolvedPdfPage = {
  isSectionStart: boolean;
  pageNumber: number;
  sectionId: GuidePdfSectionId;
  sourceSectionId?: GuideSectionId;
};

function sectionPageCount(viewModel: GuideViewModel, sectionId: GuideSectionId, capacity: GuidePdfPageCapacity, brandingEnabled: boolean): number {
  switch (sectionId) {
    case "model-views":
      return viewModel.modelViews.length;
    case "assembly":
      return getGuideAssemblyPageCount(viewModel.assemblyData, capacity.assemblyParts);
    case "references":
      return Math.max(1, Math.ceil(viewModel.includedReferences.length / capacity.references));
    case "palette":
      return Math.max(1, Math.ceil(viewModel.usedPalette.length / capacity.paletteColors));
    case "parts-overview":
      return Math.max(1, Math.ceil(viewModel.referencedParts.length / capacity.parts));
    case "painting-workflow":
      return viewModel.paintingPages.length;
    case "finishing":
      return getGuideFinishingPageCount(viewModel.finishingData, capacity.finishingItems);
    case "troubleshooting":
      return viewModel.troubleshootingData ? 1 : 0;
    case "back-cover":
      return brandingEnabled && viewModel.backCoverData ? 1 : 0;
    case "kit":
      return Math.max(1, Math.ceil(viewModel.kitItems.length / capacity.kitItems));
    case "cover":
    case "legend":
    case "project-overview":
    case "exploded-view":
      return 1;
  }
}

export function resolveGuidePdfPagePlan(viewModel: GuideViewModel, pageFormat: GuidePageFormat = viewModel.pageFormat, options: { brandingEnabled: boolean } = { brandingEnabled: false }): GuidePdfPagePlan {
  const capacity = getGuidePdfPageCapacity(pageFormat);
  let nextPage = 1;
  let tableOfContents: number | null = null;
  const sections: Partial<Record<GuideSectionId, GuidePdfPageRange>> = {};
  const pages: GuideResolvedPdfPage[] = [];
  const sectionFirstPage: Partial<Record<GuideContentSectionId, number>> = {};
  const startedContentSections = new Set<GuideContentSectionId>();

  for (const section of viewModel.documentSections) {
    const count = sectionPageCount(viewModel, section.id, capacity, options.brandingEnabled);
    sections[section.id] = { count, start: nextPage };
    for (let sectionPageIndex = 0; sectionPageIndex < count; sectionPageIndex += 1) {
      const isSectionStart = !startedContentSections.has(section.contentSectionId);
      pages.push({
        isSectionStart,
        pageNumber: nextPage,
        sectionId: section.contentSectionId,
        sourceSectionId: section.id,
      });
      sectionFirstPage[section.contentSectionId] ??= nextPage;
      startedContentSections.add(section.contentSectionId);
      nextPage += 1;
    }

    if (section.id === "cover" && viewModel.sections.length > 4) {
      tableOfContents = nextPage;
      pages.push({ isSectionStart: true, pageNumber: nextPage, sectionId: "toc" });
      nextPage += 1;
    }
  }

  return { pages, sectionFirstPage, tableOfContents, sections, totalPages: nextPage - 1 };
}
