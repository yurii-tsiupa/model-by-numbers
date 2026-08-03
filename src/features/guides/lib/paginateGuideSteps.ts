import { getGuidePageGeometry, type GuidePageGeometry } from "../pdf/printPageConstants";
import { safePdfNumber } from "../pdf/safePdfNumber";
import { DEFAULT_GUIDE_PAGE_FORMAT, type GuidePageFormat } from "../types/GuidePageFormat";
import type { GuidePaintingStepViewModel, GuideStepPreviewState } from "../types/GuidePaintingStep";
import { GUIDE_STEP_LAYOUT } from "./getGuideScreenshotLayout";

type ReadyPreview = Extract<GuideStepPreviewState, { status: "ready" }>;

export type ResolvedGuideStepImage = {
  preview: ReadyPreview;
  width: number;
  height: number;
};

export type ResolvedGuideStepRow = {
  images: ResolvedGuideStepImage[];
};

export type ResolvedGuideStepLayout = {
  step: GuidePaintingStepViewModel;
  rows: ResolvedGuideStepRow[];
  height: number;
  imageIndent: number;
  imageLayout: "row" | "stack" | "grid";
};

export type GuidePaintingPageLayout = {
  pageIndex: number;
  steps: ResolvedGuideStepLayout[];
};

export const GUIDE_PAINTING_PAGE_LAYOUT = {
  firstPageHeadingHeight: 104,
  continuationHeadingHeight: 32,
  stepTextHeight: 82,
  stepGap: 13,
} as const;

const DEFAULT_IMAGE_INDENT = 34;
const PAGE_ENLARGEMENT_THRESHOLD = 36;

function imageDimensions(preview: ReadyPreview, columns: 1 | 2, geometry: GuidePageGeometry): ResolvedGuideStepImage {
  const imageContentWidth = geometry.contentWidth - DEFAULT_IMAGE_INDENT;
  const sourceWidth = preview.image.width;
  const sourceHeight = preview.image.height;
  const valid = Number.isFinite(sourceWidth) && Number.isFinite(sourceHeight) && sourceWidth > 0 && sourceHeight > 0;
  const ratio = safePdfNumber(valid ? sourceWidth / sourceHeight : 3 / 2, 3 / 2, { min: 1 / 4, max: 4 });
  const calculatedWidth = columns === 1
    ? imageContentWidth * GUIDE_STEP_LAYOUT.singleImageWidthPercent / 100
    : (imageContentWidth - GUIDE_STEP_LAYOUT.imageGap) / 2;
  const width = safePdfNumber(calculatedWidth, GUIDE_STEP_LAYOUT.minImageWidth, {
    min: GUIDE_STEP_LAYOUT.minImageWidth,
    max: imageContentWidth,
  });
  const height = safePdfNumber(width / ratio, GUIDE_STEP_LAYOUT.minImageHeight, {
    min: GUIDE_STEP_LAYOUT.minImageHeight,
    max: geometry.contentHeight * 0.55,
  });
  return { preview, width, height };
}

function resolveRows(previews: ReadyPreview[], geometry: GuidePageGeometry): ResolvedGuideStepRow[] {
  if (previews.length === 1) return [{ images: [imageDimensions(previews[0], 1, geometry)] }];
  if (previews.length === 3) {
    return [
      { images: previews.slice(0, 2).map((preview) => imageDimensions(preview, 2, geometry)) },
      { images: [imageDimensions(previews[2], 1, geometry)] },
    ];
  }
  const rows: ResolvedGuideStepRow[] = [];
  for (let index = 0; index < previews.length; index += 2) {
    const row = previews.slice(index, index + 2);
    rows.push({ images: row.map((preview) => imageDimensions(preview, row.length === 1 ? 1 : 2, geometry)) });
  }
  return rows;
}

function fitRowsToStepCapacity(rows: ResolvedGuideStepRow[], geometry: GuidePageGeometry): ResolvedGuideStepRow[] {
  const imageContentWidth = geometry.contentWidth - DEFAULT_IMAGE_INDENT;
  const firstPageStepCapacity = geometry.contentHeight - GUIDE_PAINTING_PAGE_LAYOUT.firstPageHeadingHeight;
  const rowGaps = Math.max(0, rows.length - 1) * GUIDE_STEP_LAYOUT.imageGap;
  const naturalImageHeight = rows.reduce(
    (total, row) => total + Math.max(0, ...row.images.map((image) => image.height)),
    0,
  );
  const availableImageHeight = Math.max(
    0,
    firstPageStepCapacity
      - GUIDE_PAINTING_PAGE_LAYOUT.stepTextHeight
      - GUIDE_PAINTING_PAGE_LAYOUT.stepGap
      - rowGaps,
  );
  const scale = naturalImageHeight > availableImageHeight && naturalImageHeight > 0
    ? safePdfNumber(availableImageHeight / naturalImageHeight, 1, { min: 0.1, max: 1 })
    : 1;

  if (scale === 1) return rows;
  return rows.map((row) => ({
    images: row.images.map((image) => ({
      ...image,
      width: safePdfNumber(image.width * scale, image.width, { min: 1, max: imageContentWidth }),
      height: safePdfNumber(image.height * scale, image.height, { min: 1, max: firstPageStepCapacity }),
    })),
  }));
}

export function resolveStepLayout(step: GuidePaintingStepViewModel, pageFormat: GuidePageFormat = DEFAULT_GUIDE_PAGE_FORMAT): ResolvedGuideStepLayout {
  const geometry = getGuidePageGeometry(pageFormat);
  const included = step.previews
    .filter((preview): preview is ReadyPreview => preview.status === "ready")
    .slice(0, GUIDE_STEP_LAYOUT.maxIncludedImages);
  const rows = fitRowsToStepCapacity(resolveRows(included, geometry), geometry);
  const imageHeight = rows.reduce((total, row) => total + Math.max(0, ...row.images.map((image) => image.height)), 0);
  const height = GUIDE_PAINTING_PAGE_LAYOUT.stepTextHeight
    + imageHeight
    + Math.max(0, rows.length - 1) * GUIDE_STEP_LAYOUT.imageGap;
  const imageCount = rows.reduce((total, row) => total + row.images.length, 0);
  const imageLayout = imageCount <= 2 ? "row" : "grid";
  return { step, rows, height, imageIndent: DEFAULT_IMAGE_INDENT, imageLayout };
}

function pageStepCapacity(pageIndex: number, geometry: GuidePageGeometry): number {
  return geometry.contentHeight - (pageIndex === 0
    ? GUIDE_PAINTING_PAGE_LAYOUT.firstPageHeadingHeight
    : GUIDE_PAINTING_PAGE_LAYOUT.continuationHeadingHeight);
}

type ImageLayoutCandidate = {
  imageLayout: ResolvedGuideStepLayout["imageLayout"];
  rows: ResolvedGuideStepRow[];
  blockHeight: number;
  score: number;
};

function candidateRowSets(previews: ReadyPreview[]): Array<{ imageLayout: ResolvedGuideStepLayout["imageLayout"]; rows: ReadyPreview[][] }> {
  if (previews.length <= 1) return [{ imageLayout: "row", rows: [previews] }];
  if (previews.length === 2) return [
    { imageLayout: "row", rows: [previews] },
    { imageLayout: "stack", rows: previews.map((preview) => [preview]) },
  ];
  if (previews.length === 3) return [
    { imageLayout: "grid", rows: [previews.slice(0, 2), previews.slice(2)] },
    { imageLayout: "stack", rows: previews.map((preview) => [preview]) },
  ];
  return [
    { imageLayout: "grid", rows: [previews.slice(0, 2), previews.slice(2, 4)] },
    { imageLayout: "stack", rows: previews.map((preview) => [preview]) },
  ];
}

function fitCandidate(
  candidate: ReturnType<typeof candidateRowSets>[number],
  blockHeightBudget: number,
  totalImageCount: number,
  geometry: GuidePageGeometry,
): ImageLayoutCandidate {
  const rowGapHeight = Math.max(0, candidate.rows.length - 1) * GUIDE_STEP_LAYOUT.imageGap;
  const naturalRows = candidate.rows.map((row) => {
    const horizontalGaps = Math.max(0, row.length - 1) * GUIDE_STEP_LAYOUT.imageGap;
    const singleImageWidthRatio = totalImageCount <= 2 ? 0.92 : 0.88;
    const rowWidth = row.length === 1
      ? geometry.contentWidth * singleImageWidthRatio
      : geometry.contentWidth;
    const imageWidth = (rowWidth - horizontalGaps) / Math.max(1, row.length);
    return row.map((preview) => {
      const valid = Number.isFinite(preview.image.width) && Number.isFinite(preview.image.height)
        && preview.image.width > 0 && preview.image.height > 0;
      const ratio = safePdfNumber(valid ? preview.image.width / preview.image.height : 3 / 2, 3 / 2, { min: 1 / 4, max: 4 });
      return { preview, width: imageWidth, height: imageWidth / ratio };
    });
  });
  const naturalImageHeight = naturalRows.reduce(
    (total, row) => total + Math.max(0, ...row.map((image) => image.height)),
    0,
  );
  const scale = naturalImageHeight > 0
    ? safePdfNumber(
        Math.min(1, Math.max(0, blockHeightBudget - rowGapHeight) / naturalImageHeight),
        1,
        { min: 0.01, max: 1 },
      )
    : 1;
  const rows = naturalRows.map((row) => ({
    images: row.map((image) => ({
      preview: image.preview,
      width: safePdfNumber(image.width * scale, image.width, { min: 1, max: geometry.contentWidth }),
      height: safePdfNumber(image.height * scale, image.height, { min: 1, max: blockHeightBudget }),
    })),
  }));
  const imageHeight = rows.reduce(
    (total, row) => total + Math.max(0, ...row.images.map((image) => image.height)),
    0,
  );
  const score = rows.reduce(
    (total, row) => total + row.images.reduce((rowTotal, image) => rowTotal + image.width * image.height, 0),
    0,
  );
  return {
    imageLayout: candidate.imageLayout,
    rows,
    blockHeight: imageHeight + rowGapHeight,
    score,
  };
}

function selectBestCandidate(layout: ResolvedGuideStepLayout, blockHeightBudget: number, geometry: GuidePageGeometry): ImageLayoutCandidate | null {
  const previews = layout.rows.flatMap((row) => row.images.map((image) => image.preview));
  if (previews.length === 0) return null;
  const candidates = candidateRowSets(previews).map((candidate) => fitCandidate(candidate, blockHeightBudget, previews.length, geometry));
  const current = candidates.find((candidate) => candidate.imageLayout === layout.imageLayout) ?? candidates[0];
  const best = candidates.reduce((winner, candidate) => candidate.score > winner.score ? candidate : winner, current);
  return best.imageLayout !== current.imageLayout && best.score < current.score * 1.15 ? current : best;
}

function optimizePageImages(page: GuidePaintingPageLayout, geometry: GuidePageGeometry): GuidePaintingPageLayout {
  const usedHeight = page.steps.reduce(
    (total, layout) => total + layout.height + GUIDE_PAINTING_PAGE_LAYOUT.stepGap,
    0,
  );
  let freeHeight = pageStepCapacity(page.pageIndex, geometry) - usedHeight;
  if (freeHeight < PAGE_ENLARGEMENT_THRESHOLD) return page;

  const steps = [...page.steps];
  const priority = steps
    .map((layout, index) => ({
      imageCount: layout.rows.reduce((total, row) => total + row.images.length, 0),
      index,
    }))
    .filter(({ imageCount }) => imageCount > 0)
    .sort((first, second) => Number(first.imageCount > 2) - Number(second.imageCount > 2));

  for (const { index } of priority) {
    if (freeHeight < 1) break;
    const layout = steps[index];
    const baseBlockHeight = layout.height - GUIDE_PAINTING_PAGE_LAYOUT.stepTextHeight;
    const candidate = selectBestCandidate(layout, baseBlockHeight + freeHeight, geometry);
    if (!candidate) continue;
    const growth = Math.max(0, candidate.blockHeight - baseBlockHeight);
    if (growth < 1) continue;
    steps[index] = {
      ...layout,
      height: GUIDE_PAINTING_PAGE_LAYOUT.stepTextHeight + candidate.blockHeight,
      imageIndent: 0,
      imageLayout: candidate.imageLayout,
      rows: candidate.rows,
    };
    freeHeight -= growth;
  }

  return { ...page, steps };
}

export function paginateGuideSteps(steps: readonly GuidePaintingStepViewModel[], pageFormat: GuidePageFormat = DEFAULT_GUIDE_PAGE_FORMAT): GuidePaintingPageLayout[] {
  const geometry = getGuidePageGeometry(pageFormat);
  const firstPageStepCapacity = geometry.contentHeight - GUIDE_PAINTING_PAGE_LAYOUT.firstPageHeadingHeight;
  const pages: GuidePaintingPageLayout[] = [{ pageIndex: 0, steps: [] }];
  let remainingHeight = firstPageStepCapacity;

  for (const step of steps) {
    const layout = resolveStepLayout(step, pageFormat);
    const requiredHeight = layout.height + GUIDE_PAINTING_PAGE_LAYOUT.stepGap;
    let page = pages.at(-1)!;
    if (page.steps.length > 0 && requiredHeight > remainingHeight) {
      page = { pageIndex: pages.length, steps: [] };
      pages.push(page);
      remainingHeight = geometry.contentHeight - GUIDE_PAINTING_PAGE_LAYOUT.continuationHeadingHeight;
    }
    page.steps.push(layout);
    remainingHeight -= requiredHeight;
  }

  return pages.map((page) => optimizePageImages(page, geometry));
}
