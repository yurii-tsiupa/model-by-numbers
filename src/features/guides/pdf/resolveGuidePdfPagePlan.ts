import type { GuideContentSectionId, GuidePdfSectionId, GuideSectionId } from "../config/guideSectionRegistry";
import type { GuideViewModel } from "../lib/getGuideViewModel";

export const GUIDE_PDF_PAGE_CAPACITY = {
  paletteColors: 8,
  parts: 10,
  references: 4,
} as const;

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

function sectionPageCount(viewModel: GuideViewModel, sectionId: GuideSectionId): number {
  switch (sectionId) {
    case "model-views":
      return viewModel.modelViews.length;
    case "assembly":
      return viewModel.guide.assemblySteps?.length ?? 0;
    case "references":
      return Math.max(1, Math.ceil(viewModel.includedReferences.length / GUIDE_PDF_PAGE_CAPACITY.references));
    case "palette":
      return Math.max(1, Math.ceil(viewModel.usedPalette.length / GUIDE_PDF_PAGE_CAPACITY.paletteColors));
    case "parts-overview":
      return Math.max(1, Math.ceil(viewModel.referencedParts.length / GUIDE_PDF_PAGE_CAPACITY.parts));
    case "painting-workflow":
      return viewModel.paintingPages.length;
    case "cover":
    case "legend":
    case "project-overview":
    case "exploded-view":
      return 1;
    case "kit":
    case "finishing":
    case "troubleshooting":
    case "back-cover":
      return 0;
  }
}

export function resolveGuidePdfPagePlan(viewModel: GuideViewModel): GuidePdfPagePlan {
  let nextPage = 1;
  let tableOfContents: number | null = null;
  const sections: Partial<Record<GuideSectionId, GuidePdfPageRange>> = {};
  const pages: GuideResolvedPdfPage[] = [];
  const sectionFirstPage: Partial<Record<GuideContentSectionId, number>> = {};
  const startedContentSections = new Set<GuideContentSectionId>();

  for (const section of viewModel.documentSections) {
    const count = sectionPageCount(viewModel, section.id);
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
