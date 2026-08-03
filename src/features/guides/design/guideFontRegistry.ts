import { Font } from "@react-pdf/renderer";

export type GuideFontId = "inter" | "unbounded" | "jetbrainsMono";

export type GuideFontDefinition = {
  id: GuideFontId;
  label: string;
  family: string;
  supportedWeights: readonly number[];
  supportsCyrillic: boolean;
};

export const GUIDE_FONT_REGISTRY: Record<GuideFontId, GuideFontDefinition> = {
  inter: {
    id: "inter",
    label: "Inter",
    family: "Inter",
    supportedWeights: [400, 500, 600, 700],
    supportsCyrillic: true,
  },
  unbounded: {
    id: "unbounded",
    label: "Unbounded",
    family: "Unbounded",
    supportedWeights: [500, 600, 700],
    supportsCyrillic: true,
  },
  jetbrainsMono: {
    id: "jetbrainsMono",
    label: "JetBrains Mono",
    family: "JetBrains Mono",
    supportedWeights: [400, 500],
    supportsCyrillic: true,
  },
} as const;

export const GUIDE_FONT_OPTIONS = Object.values(GUIDE_FONT_REGISTRY) as readonly GuideFontDefinition[];

const GUIDE_FONT_SOURCES: Record<GuideFontId, Record<number, string>> = {
  inter: {
    400: "/fonts/Inter-Regular.ttf",
    500: "/fonts/Inter-Medium.ttf",
    600: "/fonts/Inter-SemiBold.ttf",
    700: "/fonts/Inter-Bold.ttf",
  },
  unbounded: {
    500: "/fonts/Unbounded-Medium.ttf",
    600: "/fonts/Unbounded-SemiBold.ttf",
    700: "/fonts/Unbounded-Bold.ttf",
  },
  jetbrainsMono: {
    400: "/fonts/JetBrainsMono-Regular.ttf",
    500: "/fonts/JetBrainsMono-Medium.ttf",
  },
};

export function normalizeGuideFontId(value: string | null | undefined): GuideFontId {
  if (value === "inter" || value === "unbounded" || value === "jetbrainsMono") {
    return value;
  }
  return "inter";
}

export function resolveGuideFontDefinition(value: string | null | undefined): GuideFontDefinition {
  return GUIDE_FONT_REGISTRY[normalizeGuideFontId(value)];
}

export function resolveGuideFontFamily(value: string | null | undefined): string {
  return resolveGuideFontDefinition(value).family;
}

export function resolveGuideFontWeight(value: string | null | undefined, requestedWeight: number): number {
  const supportedWeights = resolveGuideFontDefinition(value).supportedWeights;
  if (supportedWeights.includes(requestedWeight)) {
    return requestedWeight;
  }
  const closestWeight = [...supportedWeights].sort((left, right) => Math.abs(left - requestedWeight) - Math.abs(right - requestedWeight))[0];
  return closestWeight ?? supportedWeights[0] ?? 400;
}

export function registerGuideFonts(): void {
  for (const definition of Object.values(GUIDE_FONT_REGISTRY)) {
    Font.register({
      family: definition.family,
      fonts: definition.supportedWeights.map((fontWeight) => ({
        src: GUIDE_FONT_SOURCES[definition.id][fontWeight],
        fontWeight,
      })),
    });
  }
}
