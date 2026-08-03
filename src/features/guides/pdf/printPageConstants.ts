import { DEFAULT_GUIDE_PAGE_FORMAT, type GuidePageFormat } from "../types/GuidePageFormat";

const POINTS_PER_INCH = 72;
const POINTS_PER_MM = POINTS_PER_INCH / 25.4;
const GUIDE_HEADER_HEIGHT = 34;
const GUIDE_FOOTER_HEIGHT = 40;
const GUIDE_MARGIN_TOP = 17 * POINTS_PER_MM;
const GUIDE_MARGIN_RIGHT = 16 * POINTS_PER_MM;
const GUIDE_MARGIN_BOTTOM = 20 * POINTS_PER_MM;
const GUIDE_MARGIN_LEFT = 16 * POINTS_PER_MM;

export type GuidePageGeometry = {
  pageFormat: GuidePageFormat;
  pageWidth: number;
  pageHeight: number;
  paddingLeft: number;
  paddingRight: number;
  headerHeight: number;
  footerHeight: number;
  contentPaddingTop: number;
  contentPaddingBottom: number;
  contentWidth: number;
  contentRegionHeight: number;
  contentHeight: number;
};

const PAGE_SIZES: Record<GuidePageFormat, { width: number; height: number }> = {
  a4: { width: 210 * POINTS_PER_MM, height: 297 * POINTS_PER_MM },
  letter: { width: 8.5 * POINTS_PER_INCH, height: 11 * POINTS_PER_INCH },
};

const geometryCache = new Map<GuidePageFormat, GuidePageGeometry>();

export function getGuidePageGeometry(pageFormat: GuidePageFormat = DEFAULT_GUIDE_PAGE_FORMAT): GuidePageGeometry {
  const cached = geometryCache.get(pageFormat);
  if (cached) return cached;
  const size = PAGE_SIZES[pageFormat];
  const contentPaddingTop = GUIDE_MARGIN_TOP - GUIDE_HEADER_HEIGHT;
  const contentPaddingBottom = GUIDE_MARGIN_BOTTOM - GUIDE_FOOTER_HEIGHT;
  const geometry = Object.freeze({
    pageFormat,
    pageWidth: size.width,
    pageHeight: size.height,
    paddingLeft: GUIDE_MARGIN_LEFT,
    paddingRight: GUIDE_MARGIN_RIGHT,
    headerHeight: GUIDE_HEADER_HEIGHT,
    footerHeight: GUIDE_FOOTER_HEIGHT,
    contentPaddingTop,
    contentPaddingBottom,
    contentWidth: size.width - GUIDE_MARGIN_LEFT - GUIDE_MARGIN_RIGHT,
    contentRegionHeight: size.height - GUIDE_HEADER_HEIGHT - GUIDE_FOOTER_HEIGHT,
    contentHeight: size.height
      - GUIDE_HEADER_HEIGHT
      - GUIDE_FOOTER_HEIGHT
      - contentPaddingTop
      - contentPaddingBottom,
  });
  geometryCache.set(pageFormat, geometry);
  return geometry;
}

export function getGuidePdfPageSize(pageFormat: GuidePageFormat = DEFAULT_GUIDE_PAGE_FORMAT) {
  const geometry = getGuidePageGeometry(pageFormat);
  return { width: geometry.pageWidth, height: geometry.pageHeight };
}

export const PRINT_SECTION_FIRST_BLOCK_POINTS = 56;
