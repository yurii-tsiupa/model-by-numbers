export type RGB = {
  r: number;
  g: number;
  b: number;
};

export function hexToRgb(
  hex: string,
): RGB {
  const normalized = hex.replace("#", "");

  if (normalized.length !== 6) {
    throw new Error("Invalid HEX color.");
  }

  return {
    r: Number.parseInt(
      normalized.slice(0, 2),
      16,
    ),
    g: Number.parseInt(
      normalized.slice(2, 4),
      16,
    ),
    b: Number.parseInt(
      normalized.slice(4, 6),
      16,
    ),
  };
}