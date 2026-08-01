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
  pageBackground: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: number;
  pagePadding: number;
};

export const defaultGuideDesignTokens: GuideDesignTokens = {
  accentColor: "#76558f",
  pageBackground: "#ffffff",
  surfaceColor: "#f7f7f5",
  textColor: "#181221",
  mutedTextColor: "#716a79",
  borderColor: "#e3deec",
  headingFont: "Roboto",
  bodyFont: "Roboto",
  borderRadius: 8,
  pagePadding: 42,
};

export function resolveGuideDesignTokens(
  customization?: GuideCustomization,
): GuideDesignTokens {
  return {
    ...defaultGuideDesignTokens,
    accentColor:
      customization?.accentColor ??
      defaultGuideDesignTokens.accentColor,
    pageBackground:
      customization?.pageBackground ??
      defaultGuideDesignTokens.pageBackground,
    headingFont:
      customization?.headingFont ??
      defaultGuideDesignTokens.headingFont,
    bodyFont:
      customization?.bodyFont ??
      defaultGuideDesignTokens.bodyFont,
  };
}
