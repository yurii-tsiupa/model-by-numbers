import { hexToRgb } from "./hexToRgb";

export function colorDistance(
  first: string,
  second: string,
): number {
  const a = hexToRgb(first);
  const b = hexToRgb(second);

  return Math.sqrt(
    (a.r - b.r) ** 2 +
      (a.g - b.g) ** 2 +
      (a.b - b.b) ** 2,
  );
}