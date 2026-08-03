export function isLightGuideColor(hex: string): boolean {
  const normalized = hex.trim().replace(/^#/, "");
  const expanded = normalized.length === 3
    ? normalized.split("").map((character) => character.repeat(2)).join("")
    : normalized;

  if (!/^[\da-f]{6}$/i.test(expanded)) return false;

  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

  return luminance >= 0.9;
}
