import type { GuideSectionId, GuideViewModel } from "../lib/getGuideViewModel";

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
  cover: number;
  tableOfContents: number | null;
  sections: Partial<Record<GuideSectionId, GuidePdfPageRange>>;
  totalPages: number;
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
    case "project-overview":
    case "exploded-view":
      return 1;
  }
}

export function resolveGuidePdfPagePlan(viewModel: GuideViewModel): GuidePdfPagePlan {
  let nextPage = 1;
  const cover = nextPage++;
  const tableOfContents = viewModel.sections.length > 4 ? nextPage++ : null;
  const sections: Partial<Record<GuideSectionId, GuidePdfPageRange>> = {};

  for (const section of viewModel.sections) {
    const count = sectionPageCount(viewModel, section.id);
    sections[section.id] = { count, start: nextPage };
    nextPage += count;
  }

  return { cover, tableOfContents, sections, totalPages: nextPage - 1 };
}
