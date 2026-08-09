export type GuideBrandElementPosition = "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";
export type GuideBrandElementSize = "small" | "medium" | "large";
export type GuideBrandTextAlignment = "left" | "center" | "right";
export type GuideBrandElementType = "logo" | "brand" | "cta" | "socialLinks" | "customLinks" | "qr";

export type GuideBrandElementLayout = {
  visible: boolean;
  position: GuideBrandElementPosition;
  size: GuideBrandElementSize;
  alignment: GuideBrandTextAlignment;
  logoScale: number;
  qrScale: number;
};

export type GuideBrandPageLayout = Record<GuideBrandElementType, GuideBrandElementLayout>;
export type GuideBrandContentElementType = "logo" | "brand" | "socialLinks" | "qr";
export type GuideBrandContentElementLayout = { visible: boolean; position: GuideBrandElementPosition; logoScale: number; qrScale: number };
export type GuideBrandContentPageLayout = Record<GuideBrandContentElementType, GuideBrandContentElementLayout> & {
  sections?: Partial<Record<import("../config/guideSectionRegistry").GuideContentSectionId, GuideBrandContentPageLayout>>;
};
