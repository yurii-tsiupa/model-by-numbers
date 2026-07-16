import type { PaletteColor } from "@/features/models/types/PaletteColor";
import type { Project } from "@/features/models/types/Project";
import type { GuidePartInput } from "@/features/guides/types/GuidePartInput";

import type { GuideReadiness } from "../types/GuideReadiness";
import { getGuideParts } from "@/features/guides/lib/isPartIncludedInGuide";
import type { Locale } from "@/features/i18n/types/Locale";
import { formatCount,translate } from "@/features/i18n/lib/i18n";

type GetGuideReadinessParams = {
  project: Project;
  parts: readonly GuidePartInput[];
  palette: PaletteColor[];
  locale?:Locale;
};

const HEX_COLOR_PATTERN =
  /^#[0-9A-F]{6}$/i;

export function getGuideReadiness({
  project,
  parts,
  palette,
  locale="en",
}: GetGuideReadinessParams): GuideReadiness {
  const t=(key:Parameters<typeof translate>[1],values?:Parameters<typeof translate>[2])=>translate(locale,key,values);
  const includedParts = getGuideParts(parts);

  const paletteColorIds = new Set(
    palette.map((color) => color.id),
  );

  const hasValidPaletteColor = (
    part: GuidePartInput,
  ) =>
    Boolean(
      part.paletteColorId &&
        paletteColorIds.has(part.paletteColorId),
    );

  const paintedIncludedParts = includedParts.filter(
    hasValidPaletteColor,
  );
  const unpaintedIncludedPartsCount =
    includedParts.length - paintedIncludedParts.length;

  const checks = [
    {
      id: "model-file" as const,
      label: t("readiness.modelFile"),
      description: project.originalFileName
        ? project.originalFileName
        : t("readiness.noModel"),
      isComplete: Boolean(
        project.originalFileName,
      ),
    },
    {
      id: "parts" as const,
      label: t("readiness.modelParts"),
      description:
        includedParts.length > 0
          ? t("readiness.included",{count:formatCount(locale,includedParts.length,"part")})
          : t("readiness.noIncluded"),
      isComplete: includedParts.length > 0,
    },
    {
      id: "palette" as const,
      label: t("readiness.projectPalette"),
      description:
        palette.length > 0
          ? t("readiness.available",{count:formatCount(locale,palette.length,"color")})
          : t("readiness.addPalette"),
      isComplete: palette.length > 0,
    },
    {
      id: "painted-parts" as const,
      label: t("readiness.painted"),
      description:
        paintedIncludedParts.length > 0
          ? t("readiness.paintedCount",{painted:paintedIncludedParts.length,total:includedParts.length})
          : t("readiness.noPainted"),
      isComplete: paintedIncludedParts.length > 0,
    },
    {
      id: "visible-parts-painted" as const,
      label: t("readiness.completed"),
      description:
        includedParts.length === 0
          ? t("readiness.noIncluded")
          : unpaintedIncludedPartsCount === 0
            ? t("readiness.allColors")
            : t("readiness.unpainted",{count:formatCount(locale,unpaintedIncludedPartsCount,"unpaintedPart")}),
      isComplete:
        includedParts.length > 0 &&
        unpaintedIncludedPartsCount === 0,
    },
    {
      id: "base-color" as const,
      label: t("guide.baseColor"),
      description: HEX_COLOR_PATTERN.test(
        project.baseColor,
      )
        ? project.baseColor.toUpperCase()
        : t("readiness.validBase"),
      isComplete: HEX_COLOR_PATTERN.test(
        project.baseColor,
      ),
    },
    {
      id: "printer-type" as const,
      label: t("guide.printer"),
      description: project.printerType
        ? t("readiness.printerValue",{value:project.printerType.toUpperCase()})
        : t("readiness.selectPrinter"),
      isComplete: Boolean(
        project.printerType,
      ),
    },
    {
      id: "material" as const,
      label: t("guide.material"),
      description: project.material
        ? t("readiness.materialValue",{value:project.material.toUpperCase()})
        : t("readiness.selectMaterial"),
      isComplete: Boolean(project.material),
    },
  ];

  const completedCount = checks.filter(
    (check) => check.isComplete,
  ).length;

  const totalCount = checks.length;

  return {
    checks,
    completedCount,
    totalCount,
    progress:
      totalCount > 0
        ? Math.round(
            (completedCount / totalCount) *
              100,
          )
        : 0,
    isReady:
      totalCount > 0 &&
      completedCount === totalCount,
  };
}
