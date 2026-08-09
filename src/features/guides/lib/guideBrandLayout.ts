import { getGuidePageGeometry } from "../pdf/printPageConstants";
import type { GuidePageFormat } from "../types/GuidePageFormat";
import type { GuideBrandContentPageLayout, GuideBrandElementLayout, GuideBrandElementPosition, GuideBrandElementSize, GuideBrandElementType, GuideBrandPageLayout, GuideBrandTextAlignment } from "../types/GuideBrandLayout";

export type GuideBrandPageType = "cover" | "backCover";

export const GUIDE_BRAND_ELEMENT_ORDER: readonly GuideBrandElementType[] = ["logo", "brand", "cta", "socialLinks", "customLinks", "qr"];
export const BRAND_CONTENT_PRIORITY = { brand: 0, cta: 1, socialLinks: 2, customLinks: 3 } as const;
export const GUIDE_BRAND_CONTENT_ORDER = (Object.keys(BRAND_CONTENT_PRIORITY) as Array<keyof typeof BRAND_CONTENT_PRIORITY>)
  .sort((left, right) => BRAND_CONTENT_PRIORITY[left] - BRAND_CONTENT_PRIORITY[right]);
export const GUIDE_BRAND_POSITIONS: readonly GuideBrandElementPosition[] = ["top-left", "top-center", "top-right", "center-left", "center", "center-right", "bottom-left", "bottom-center", "bottom-right"];
export const GUIDE_BRAND_LOGO_SCALE_MIN = 20;
export const GUIDE_BRAND_LOGO_SCALE_MAX = 300;
export const GUIDE_BRAND_LOGO_SCALE_DEFAULT = 100;
export const GUIDE_BRAND_QR_SCALE_MIN = 85;
export const GUIDE_BRAND_QR_SCALE_MAX = 200;
export const GUIDE_BRAND_QR_SCALE_DEFAULT = 100;
export const GUIDE_BRAND_CONTENT_QR_SCALE_MIN = 70;
export const GUIDE_BRAND_CONTENT_QR_SCALE_MAX = 200;
export const GUIDE_BRAND_SIZES: readonly GuideBrandElementSize[] = ["small", "medium", "large"];
export const GUIDE_BRAND_ALIGNMENTS: readonly GuideBrandTextAlignment[] = ["left", "center", "right"];

export const DEFAULT_COVER_BRAND_LAYOUT: GuideBrandPageLayout = {
  logo: { visible: true, position: "top-left", size: "medium", alignment: "left", logoScale: 100, qrScale: 100 },
  brand: { visible: true, position: "top-left", size: "medium", alignment: "left", logoScale: 100, qrScale: 100 },
  cta: { visible: true, position: "top-left", size: "medium", alignment: "left", logoScale: 100, qrScale: 100 },
  qr: { visible: true, position: "bottom-left", size: "medium", alignment: "left", logoScale: 100, qrScale: 100 },
  socialLinks: { visible: true, position: "bottom-left", size: "medium", alignment: "left", logoScale: 100, qrScale: 100 },
  customLinks: { visible: true, position: "bottom-left", size: "medium", alignment: "left", logoScale: 100, qrScale: 100 },
};

export const DEFAULT_BACK_COVER_BRAND_LAYOUT: GuideBrandPageLayout = {
  logo: { visible: true, position: "center", size: "large", alignment: "center", logoScale: 100, qrScale: 100 },
  brand: { visible: true, position: "top-center", size: "medium", alignment: "center", logoScale: 100, qrScale: 100 },
  cta: { visible: true, position: "top-center", size: "medium", alignment: "center", logoScale: 100, qrScale: 100 },
  qr: { visible: true, position: "bottom-center", size: "large", alignment: "center", logoScale: 100, qrScale: 100 },
  socialLinks: { visible: true, position: "bottom-center", size: "medium", alignment: "center", logoScale: 100, qrScale: 100 },
  customLinks: { visible: true, position: "bottom-center", size: "medium", alignment: "center", logoScale: 100, qrScale: 100 },
};

export const DEFAULT_CONTENT_PAGES_BRAND_LAYOUT: GuideBrandContentPageLayout = {
  logo: { visible: false, position: "bottom-left", logoScale: 100, qrScale: 100 },
  brand: { visible: false, position: "bottom-left", logoScale: 100, qrScale: 100 },
  socialLinks: { visible: false, position: "bottom-center", logoScale: 100, qrScale: 100 },
  qr: { visible: false, position: "bottom-right", logoScale: 100, qrScale: 100 },
};

function isPosition(value: unknown): value is GuideBrandElementPosition { return typeof value === "string" && GUIDE_BRAND_POSITIONS.includes(value as GuideBrandElementPosition); }
function isSize(value: unknown): value is GuideBrandElementSize { return typeof value === "string" && GUIDE_BRAND_SIZES.includes(value as GuideBrandElementSize); }
function isAlignment(value: unknown): value is GuideBrandTextAlignment { return typeof value === "string" && GUIDE_BRAND_ALIGNMENTS.includes(value as GuideBrandTextAlignment); }

export function normalizeGuideBrandPageLayout(value: unknown, defaults: GuideBrandPageLayout): GuideBrandPageLayout {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const legacyText = source.text && typeof source.text === "object" ? source.text as Record<string, unknown> : null;
  const legacyLinks = source.links && typeof source.links === "object" ? source.links as Record<string, unknown> : null;
  return Object.fromEntries(GUIDE_BRAND_ELEMENT_ORDER.map((element) => {
    const raw = source[element] && typeof source[element] === "object"
      ? source[element] as Record<string, unknown>
      : (element === "brand" || element === "cta") && legacyText
        ? legacyText
        : (element === "socialLinks" || element === "customLinks") && legacyLinks
          ? legacyLinks
        : {};
    const fallback = defaults[element];
    const legacySize = isSize(raw.size) ? raw.size : fallback.size;
    const legacyQrScale = element === "qr"
      ? defaults.qr.size === "medium"
        ? { small: 87, medium: 100, large: 113 }[legacySize]
        : { small: 71, medium: 86, large: 100 }[legacySize]
      : GUIDE_BRAND_QR_SCALE_DEFAULT;
    return [element, {
      visible: typeof raw.visible === "boolean" ? raw.visible : fallback.visible,
      position: isPosition(raw.position) ? raw.position : fallback.position,
      size: legacySize,
      alignment: isAlignment(raw.alignment) ? raw.alignment : fallback.alignment,
      logoScale: typeof raw.logoScale === "number" && Number.isFinite(raw.logoScale)
        ? Math.min(GUIDE_BRAND_LOGO_SCALE_MAX, Math.max(GUIDE_BRAND_LOGO_SCALE_MIN, Math.round(raw.logoScale)))
        : GUIDE_BRAND_LOGO_SCALE_DEFAULT,
      qrScale: typeof raw.qrScale === "number" && Number.isFinite(raw.qrScale)
        ? Math.min(GUIDE_BRAND_QR_SCALE_MAX, Math.max(GUIDE_BRAND_QR_SCALE_MIN, Math.round(raw.qrScale)))
        : Math.min(GUIDE_BRAND_QR_SCALE_MAX, Math.max(GUIDE_BRAND_QR_SCALE_MIN, legacyQrScale)),
    } satisfies GuideBrandElementLayout];
  })) as GuideBrandPageLayout;
}

export function resolveGuideBrandElementPosition(page: GuideBrandPageType, position: GuideBrandElementPosition, pageFormat: GuidePageFormat) {
  const geometry = getGuidePageGeometry(pageFormat);
  const allowedHeight = page === "backCover"
    ? geometry.contentRegionHeight - geometry.contentPaddingTop - 72
    : geometry.contentHeight;
  const column = position.endsWith("left") ? 0 : position.endsWith("right") ? 2 : 1;
  const row = position.startsWith("top") ? 0 : position.startsWith("bottom") ? 2 : 1;
  return {
    alignItems: column === 0 ? "flex-start" as const : column === 2 ? "flex-end" as const : "center" as const,
    height: allowedHeight / 3,
    justifyContent: row === 0 ? "flex-start" as const : row === 2 ? "flex-end" as const : "center" as const,
    left: geometry.paddingLeft + column * (geometry.contentWidth / 3),
    position: "absolute" as const,
    top: geometry.contentPaddingTop + row * (allowedHeight / 3),
    width: geometry.contentWidth / 3,
  };
}

export function resolveGuideBrandPositionAlignment(position: GuideBrandElementPosition): GuideBrandTextAlignment {
  return position.endsWith("left") ? "left" : position.endsWith("right") ? "right" : "center";
}

export function groupGuideBrandContentByPosition(layout: GuideBrandPageLayout, activeElements: ReadonlySet<GuideBrandElementType>) {
  return GUIDE_BRAND_POSITIONS.map((position) => ({
    elements: GUIDE_BRAND_CONTENT_ORDER.filter((element) => activeElements.has(element) && layout[element].position === position),
    position,
  })).filter((group) => group.elements.length > 0);
}

export function resolveGuideBrandLogoDimensions(page: GuideBrandPageType, logoScale: number, pageFormat: GuidePageFormat): { height: number; width: number } {
  const geometry = getGuidePageGeometry(pageFormat);
  const formatScale = Math.min(geometry.pageWidth / 595.28, geometry.pageHeight / 841.89);
  const scale = Math.min(GUIDE_BRAND_LOGO_SCALE_MAX, Math.max(GUIDE_BRAND_LOGO_SCALE_MIN, logoScale)) / 100;
  const baseHeight = page === "cover" ? 27 : 76;
  const baseWidth = page === "cover" ? 59.4 : 126.92;
  return {
    height: Math.round(Math.min(baseHeight * formatScale * scale, geometry.contentRegionHeight * 0.3)),
    width: Math.round(Math.min(baseWidth * formatScale * scale, geometry.contentWidth)),
  };
}

export function resolveGuideBrandQrPoints(page: GuideBrandPageType, qrScale: number, pageFormat: GuidePageFormat): number {
  const geometry = getGuidePageGeometry(pageFormat);
  const formatScale = Math.min(geometry.pageWidth / 595.28, geometry.pageHeight / 841.89);
  const scale = Math.min(GUIDE_BRAND_QR_SCALE_MAX, Math.max(GUIDE_BRAND_QR_SCALE_MIN, qrScale)) / 100;
  const baseSize = page === "cover" ? 62 : 126;
  return Math.round(Math.min(baseSize * Math.max(1, formatScale) * scale, geometry.contentRegionHeight * 0.35, geometry.contentWidth));
}
