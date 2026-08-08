export type GuideBrandElementPosition = "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";
export type GuideBrandElementSize = "small" | "medium" | "large";
export type GuideBrandTextAlignment = "left" | "center" | "right";
export type GuideBrandElementType = "logo" | "brand" | "cta" | "socialLinks" | "customLinks" | "qr";

export type GuideBrandElementLayout = {
  position: GuideBrandElementPosition;
  size: GuideBrandElementSize;
  alignment: GuideBrandTextAlignment;
  logoScale: number;
  qrScale: number;
};

export type GuideBrandPageLayout = Record<GuideBrandElementType, GuideBrandElementLayout>;
