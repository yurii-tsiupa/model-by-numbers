import type { PaletteColor } from "@/features/models/types/PaletteColor";
import type { Project } from "@/features/models/types/Project";
import type { GuidePartInput } from "@/features/guides/types/GuidePartInput";

import type { GuideReadiness } from "../types/GuideReadiness";
import { getGuideParts } from "@/features/guides/lib/isPartIncludedInGuide";

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
        includedParts.length > 0
          ? `${includedParts.length} ${includedParts.length === 1 ? "part" : "parts"} included in guide.`
          : "No parts are included in the guide.",
      isComplete: includedParts.length > 0,
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
        paintedIncludedParts.length > 0
          ? `${paintedIncludedParts.length} of ${includedParts.length} included parts use palette colors.`
          : "No included parts have palette colors.",
      isComplete: paintedIncludedParts.length > 0,
    },
    {
      id: "visible-parts-painted" as const,
      label: "Included parts completed",
      description:
        includedParts.length === 0
          ? "No parts are included in the guide."
          : unpaintedIncludedPartsCount === 0
            ? "All included parts have colors."
            : `${unpaintedIncludedPartsCount} included ${
                unpaintedIncludedPartsCount === 1
                  ? "part is"
                  : "parts are"
              } still unpainted.`,
      isComplete:
        includedParts.length > 0 &&
        unpaintedIncludedPartsCount === 0,
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
