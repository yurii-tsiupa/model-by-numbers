import { colorDistance } from "./colorDistance";

export function mergeSimilarColors(
  colors: string[],
  threshold: number,
): Map<string, string> {
  const mergeMap = new Map<string, string>();

  if (colors.length === 0) {
    return mergeMap;
  }

  const usage = new Map<string, number>();

  for (const color of colors) {
    usage.set(
      color,
      (usage.get(color) ?? 0) + 1,
    );
  }

  const uniqueColors = [...usage.keys()];

  uniqueColors.sort(
    (a, b) =>
      (usage.get(b) ?? 0) -
      (usage.get(a) ?? 0),
  );

  for (let i = 0; i < uniqueColors.length; i++) {
    const baseColor = uniqueColors[i];

    if (mergeMap.has(baseColor)) {
      continue;
    }

    mergeMap.set(baseColor, baseColor);

    for (
      let j = i + 1;
      j < uniqueColors.length;
      j++
    ) {
      const candidateColor =
        uniqueColors[j];

      if (mergeMap.has(candidateColor)) {
        continue;
      }

      const distance = colorDistance(
        baseColor,
        candidateColor,
      );

      if (distance <= threshold) {
        mergeMap.set(
          candidateColor,
          baseColor,
        );
      }
    }
  }

  return mergeMap;
}