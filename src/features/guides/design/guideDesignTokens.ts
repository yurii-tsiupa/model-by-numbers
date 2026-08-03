export type GuideCustomization = {
  accentColor?: string;
  pageBackground?: string;
  coverBackground?: string;
  pageBackgroundImage?: string;
  perPageBackgrounds?: Record<string, string>;
  headingFont?: string;
  bodyFont?: string;
  pageNumberColor?: string;
  pageNumberFont?: string;
  dividerStyle?: "solid" | "dashed" | "underline";
};

export type GuideDesignTokens = {
  accentColor: string;
  accentHover: string;
  accentSoft: string;
  tealSecondary: string;
  inkPrimary: string;
  inkSecondary: string;
  inkMuted: string;
  inkFaint: string;
  borderColor: string;
  paperBackground: string;
  surfaceBackground: string;
  radiusPill: number;
  radiusCard: number;
  radiusPage: number;
  spacingXs: number;
  spacingSm: number;
  spacingMd: number;
  spacingLg: number;
  spacingXl: number;
  pagePadding: number;
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  eyebrowFont: string;
  sizeEyebrow: number;
  sizeH1: number;
  sizeH2: number;
  sizeBody: number;
  sizeCaption: number;
  sizeStat: number;
  weightSemibold: number;
  weightBold: number;
  borderWidth: number;
  lineHeightBody: number;
  lineHeightHeading: number;
};

export const defaultGuideDesignTokens: GuideDesignTokens = {
  accentColor: "#7C3AED",
  accentHover: "#5B21B6",
  accentSoft: "#F1EBFC",
  tealSecondary: "#0EA5A0",
  inkPrimary: "#15121F",
  inkSecondary: "#453F55",
  inkMuted: "#7A7387",
  inkFaint: "#C6C1D1",
  borderColor: "#E7E2F0",
  paperBackground: "#FFFFFF",
  surfaceBackground: "#F8F5FE",
  radiusPill: 999,
  radiusCard: 14,
  radiusPage: 4,
  spacingXs: 6,
  spacingSm: 12,
  spacingMd: 18,
  spacingLg: 26,
  spacingXl: 42,
  pagePadding: 42,
  headingFont: "Unbounded",
  bodyFont: "Inter",
  monoFont: "JetBrains Mono",
  eyebrowFont: "Inter",
  sizeEyebrow: 11,
  sizeH1: 34,
  sizeH2: 19,
  sizeBody: 13.5,
  sizeCaption: 10.5,
  sizeStat: 24,
  weightSemibold: 600,
  weightBold: 700,
  borderWidth: 1,
  lineHeightBody: 1.5,
  lineHeightHeading: 1.2,
};

export function resolveGuideDesignTokens(customization?: GuideCustomization): GuideDesignTokens {
  return {
    ...defaultGuideDesignTokens,
    accentColor: customization?.accentColor ?? defaultGuideDesignTokens.accentColor,
    paperBackground: customization?.pageBackground ?? defaultGuideDesignTokens.paperBackground,
    headingFont: customization?.headingFont ?? defaultGuideDesignTokens.headingFont,
    bodyFont: customization?.bodyFont ?? defaultGuideDesignTokens.bodyFont,
    eyebrowFont: customization?.bodyFont ?? defaultGuideDesignTokens.eyebrowFont,
  };
}
