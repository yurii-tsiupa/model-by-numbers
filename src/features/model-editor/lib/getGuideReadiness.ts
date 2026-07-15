import type { PaletteColor } from "@/features/models/types/PaletteColor";
import type { Project } from "@/features/models/types/Project";
import type { GuidePartInput } from "@/features/guides/types/GuidePartInput";

import type { GuideReadiness } from "../types/GuideReadiness";

type GetGuideReadinessParams = {
  project: Project;
  parts: readonly GuidePartInput[];
  palette: PaletteColor[];
};

const HEX_COLOR_PATTERN =
  /^#[0-9A-F]{6}$/i;

export function getGuideReadiness({
  project,
  parts,
  palette,
}: GetGuideReadinessParams): GuideReadiness {
  const visibleParts = parts.filter(
    (part) => part.visible,
  );

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

  const paintedParts = parts.filter(
    hasValidPaletteColor,
  );

  const paintedVisibleParts =
    visibleParts.filter(hasValidPaletteColor);

  const unpaintedVisiblePartsCount =
    visibleParts.length -
    paintedVisibleParts.length;

  const checks = [
    {
      id: "model-file" as const,
      label: "Model file",
      description: project.originalFileName
        ? project.originalFileName
        : "No model file is attached.",
      isComplete: Boolean(
        project.originalFileName,
      ),
    },
    {
      id: "parts" as const,
      label: "Model parts",
      description:
        parts.length > 0
          ? `${parts.length} ${
              parts.length === 1
                ? "part"
                : "parts"
            } detected.`
          : "No model parts were detected.",
      isComplete: parts.length > 0,
    },
    {
      id: "palette" as const,
      label: "Project palette",
      description:
        palette.length > 0
          ? `${palette.length} ${
              palette.length === 1
                ? "color"
                : "colors"
            } available.`
          : "Generate or add palette colors.",
      isComplete: palette.length > 0,
    },
    {
      id: "painted-parts" as const,
      label: "Painted parts",
      description:
        paintedParts.length > 0
          ? `${paintedParts.length} of ${parts.length} parts use palette colors.`
          : "No parts have palette colors.",
      isComplete: paintedParts.length > 0,
    },
    {
      id: "visible-parts-painted" as const,
      label: "Visible parts completed",
      description:
        visibleParts.length === 0
          ? "No visible parts are available."
          : unpaintedVisiblePartsCount === 0
            ? "All visible parts have colors."
            : `${unpaintedVisiblePartsCount} visible ${
                unpaintedVisiblePartsCount === 1
                  ? "part is"
                  : "parts are"
              } still unpainted.`,
      isComplete:
        visibleParts.length > 0 &&
        unpaintedVisiblePartsCount === 0,
    },
    {
      id: "base-color" as const,
      label: "Base color",
      description: HEX_COLOR_PATTERN.test(
        project.baseColor,
      )
        ? project.baseColor.toUpperCase()
        : "Select a valid project base color.",
      isComplete: HEX_COLOR_PATTERN.test(
        project.baseColor,
      ),
    },
    {
      id: "printer-type" as const,
      label: "Printer type",
      description: project.printerType
        ? `Printer type: ${project.printerType.toUpperCase()}.`
        : "Select a printer type.",
      isComplete: Boolean(
        project.printerType,
      ),
    },
    {
      id: "material" as const,
      label: "Material",
      description: project.material
        ? `Material: ${project.material.toUpperCase()}.`
        : "Select a printing material.",
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
