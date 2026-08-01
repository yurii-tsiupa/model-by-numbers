export type GuideScreenshotLayout = {
  visibleCount: number;
  columns: 1 | 2;
  primaryFirst: boolean;
};

export function getGuideScreenshotLayout(
  count: number,
  limit = 6,
): GuideScreenshotLayout {
  const visibleCount = Math.min(Math.max(count, 0), limit);
  return {
    visibleCount,
    columns: visibleCount === 1 ? 1 : 2,
    primaryFirst: visibleCount === 3 || visibleCount >= 5,
  };
}
