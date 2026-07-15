import type { PaletteColor } from "@/features/models/types/PaletteColor";
import type { Project } from "@/features/models/types/Project";

import type { GuidePartInput } from "../types/GuidePartInput";
import type {
  GuideImages,
  GuidePart,
  ModelGuide,
  GuideReferenceImage,
} from "../types/ModelGuide";
import { getGuidePalette } from "./getGuidePalette";
import { isPartIncludedInGuide } from "./isPartIncludedInGuide";

type BuildGuideDataParams = {
  project: Project;
  parts: readonly GuidePartInput[];
  palette: readonly PaletteColor[];
  images: GuideImages;
  author: string;
  references?: readonly GuideReferenceImage[];
};

export function buildGuideData({
  project,
  parts,
  palette,
  images,
  author,
  references = [],
}: BuildGuideDataParams): ModelGuide {
  const paletteById = new Map(
    palette.map((color) => [color.id, color]),
  );

  const guideParts: GuidePart[] = parts
    .map((part, savedIndex) => ({
      part,
      guideIndex: part.index ?? savedIndex,
    }))
    .filter(({ part }) => isPartIncludedInGuide(part))
    .sort((firstPart, secondPart) =>
      firstPart.guideIndex - secondPart.guideIndex,
    )
    .map(({ part, guideIndex }) => {
      const color = part.paletteColorId
        ? paletteById.get(part.paletteColorId)
        : undefined;

      return {
        id: part.id,
        name: part.name,
        number: guideIndex + 1,
        colorNumber: color?.number ?? null,
        colorName: color?.name ?? null,
        colorHex: color?.hex ?? null,
        notes: null,
      };
    });

  const guidePalette = getGuidePalette(parts, palette);

  return {
    projectId: project.id,
    title: project.name,
    description: project.description,
    author,
    printerType: project.printerType,
    material: project.material,
    baseColor: project.baseColor,
    partsCount: guideParts.length,
    colorsCount: guidePalette.length,
    palette: guidePalette,
    parts: guideParts,
    images: { ...images },
    references: references.map(reference=>({...reference})),
    generatedAt: new Date(),
  };
}
