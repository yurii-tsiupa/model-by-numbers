export type GuideScreenshotLayout = {
  visibleCount: number;
  columns: 1 | 2;
};

// PDF points. These values are deliberately tied to the real printable width,
// not the browser preview width; the preview scales the completed PDF page.
export const GUIDE_STEP_LAYOUT = {
  maxIncludedImages: 4,
  minImageWidth: 210,
  minImageHeight: 135,
  imageGap: 8,
  singleImageWidthPercent: 68,
  twoColumnWidthPercent: 48,
} as const;

export function getGuideScreenshotLayout(
  count: number,
  limit = GUIDE_STEP_LAYOUT.maxIncludedImages,
): GuideScreenshotLayout {
  const visibleCount = Math.min(Math.max(count, 0), limit);
  return {
    visibleCount,
    columns: visibleCount === 1 ? 1 : 2,
  };
}
