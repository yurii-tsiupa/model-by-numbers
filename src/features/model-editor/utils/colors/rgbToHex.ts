import type { RGB } from "./hexToRgb";

export function rgbToHex({
  r,
  g,
  b,
}: RGB): string {
  return `#${[r, g, b]
    .map((value) =>
      value
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")
    .toUpperCase()}`;
}