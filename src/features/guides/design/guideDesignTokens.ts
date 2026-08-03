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
  accentBorder: string;
  accentForeground: string;
  accentText: string;
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
  accentBorder: "#CDBDF5",
  accentForeground: "#FFFFFF",
  accentText: "#7C3AED",
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

export type GuideAccentPalette = Pick<GuideDesignTokens, "accentColor" | "accentHover" | "accentSoft" | "accentBorder" | "accentForeground" | "accentText">;

const HEX_COLOR = /^#[0-9A-F]{6}$/;

export function normalizeGuideAccentColor(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  if (/^#[0-9A-F]{3}$/.test(normalized)) {
    return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }
  return HEX_COLOR.test(normalized) ? normalized : null;
}

function channels(color: string): [number, number, number] {
  return [Number.parseInt(color.slice(1, 3), 16), Number.parseInt(color.slice(3, 5), 16), Number.parseInt(color.slice(5, 7), 16)];
}

function toHex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue].map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function mix(color: string, target: "white" | "black", amount: number): string {
  const [red, green, blue] = channels(color);
  const targetValue = target === "white" ? 255 : 0;
  return toHex(red + (targetValue - red) * amount, green + (targetValue - green) * amount, blue + (targetValue - blue) * amount);
}

function relativeLuminance(color: string): number {
  const values = channels(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}

function contrast(first: string, second: string): number {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

function readableAccentText(accent: string, surface: string): string {
  if (contrast(accent, surface) >= 4.5) return accent;
  for (const amount of [0.2, 0.35, 0.5, 0.65, 0.8]) {
    const candidate = mix(accent, "black", amount);
    if (contrast(candidate, surface) >= 4.5) return candidate;
  }
  return defaultGuideDesignTokens.inkPrimary;
}

export function resolveGuideAccentPalette(value: string | null | undefined): GuideAccentPalette {
  const accentColor = normalizeGuideAccentColor(value) ?? defaultGuideDesignTokens.accentColor;
  if (accentColor === defaultGuideDesignTokens.accentColor) {
    return {
      accentColor,
      accentHover: defaultGuideDesignTokens.accentHover,
      accentSoft: defaultGuideDesignTokens.accentSoft,
      accentBorder: defaultGuideDesignTokens.accentBorder,
      accentForeground: defaultGuideDesignTokens.accentForeground,
      accentText: defaultGuideDesignTokens.accentText,
    };
  }
  const accentSoft = mix(accentColor, "white", 0.88);
  const white = "#FFFFFF";
  const dark = defaultGuideDesignTokens.inkPrimary;
  return {
    accentColor,
    accentHover: mix(accentColor, "black", 0.22),
    accentSoft,
    accentBorder: mix(accentColor, "white", 0.58),
    accentForeground: contrast(accentColor, white) >= contrast(accentColor, dark) ? white : dark,
    accentText: readableAccentText(accentColor, accentSoft),
  };
}

export function resolveGuideDesignTokens(customization?: GuideCustomization): GuideDesignTokens {
  const accent = resolveGuideAccentPalette(customization?.accentColor);
  return {
    ...defaultGuideDesignTokens,
    ...accent,
    paperBackground: customization?.pageBackground ?? defaultGuideDesignTokens.paperBackground,
    headingFont: customization?.headingFont ?? defaultGuideDesignTokens.headingFont,
    bodyFont: customization?.bodyFont ?? defaultGuideDesignTokens.bodyFont,
    eyebrowFont: customization?.bodyFont ?? defaultGuideDesignTokens.eyebrowFont,
  };
}
