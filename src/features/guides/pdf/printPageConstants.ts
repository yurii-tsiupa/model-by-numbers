const POINTS_PER_MM = 72 / 25.4;

export const PDF_PAGE = {
  widthMm: 210,
  heightMm: 297,
  marginTopMm: 17,
  marginRightMm: 16,
  marginBottomMm: 20,
  marginLeftMm: 16,
} as const;

export const PDF_PAGE_POINTS = {
  width: PDF_PAGE.widthMm * POINTS_PER_MM,
  height: PDF_PAGE.heightMm * POINTS_PER_MM,
  marginTop: PDF_PAGE.marginTopMm * POINTS_PER_MM,
  marginRight: PDF_PAGE.marginRightMm * POINTS_PER_MM,
  marginBottom: PDF_PAGE.marginBottomMm * POINTS_PER_MM,
  marginLeft: PDF_PAGE.marginLeftMm * POINTS_PER_MM,
  printableWidth:
    (PDF_PAGE.widthMm - PDF_PAGE.marginLeftMm - PDF_PAGE.marginRightMm) *
    POINTS_PER_MM,
  printableHeight:
    (PDF_PAGE.heightMm - PDF_PAGE.marginTopMm - PDF_PAGE.marginBottomMm) *
    POINTS_PER_MM,
} as const;

const GUIDE_HEADER_HEIGHT = 34;
const GUIDE_FOOTER_HEIGHT = 40;
const GUIDE_CONTENT_PADDING_TOP = PDF_PAGE_POINTS.marginTop - GUIDE_HEADER_HEIGHT;
const GUIDE_CONTENT_PADDING_BOTTOM = PDF_PAGE_POINTS.marginBottom - GUIDE_FOOTER_HEIGHT;

export const PDF_PAGE_LAYOUT = {
  pageWidth: PDF_PAGE_POINTS.width,
  pageHeight: PDF_PAGE_POINTS.height,
  paddingLeft: PDF_PAGE_POINTS.marginLeft,
  paddingRight: PDF_PAGE_POINTS.marginRight,
  headerHeight: GUIDE_HEADER_HEIGHT,
  footerHeight: GUIDE_FOOTER_HEIGHT,
  contentPaddingTop: GUIDE_CONTENT_PADDING_TOP,
  contentPaddingBottom: GUIDE_CONTENT_PADDING_BOTTOM,
  contentWidth: PDF_PAGE_POINTS.printableWidth,
  contentRegionHeight: PDF_PAGE_POINTS.height - GUIDE_HEADER_HEIGHT - GUIDE_FOOTER_HEIGHT,
  contentHeight:
    PDF_PAGE_POINTS.height
    - GUIDE_HEADER_HEIGHT
    - GUIDE_FOOTER_HEIGHT
    - GUIDE_CONTENT_PADDING_TOP
    - GUIDE_CONTENT_PADDING_BOTTOM,
} as const;

export const PRINT_SECTION_FIRST_BLOCK_POINTS = 56;
