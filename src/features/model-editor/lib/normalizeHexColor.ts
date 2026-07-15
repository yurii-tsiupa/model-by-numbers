const SHORT_HEX_PATTERN = /^#([0-9a-f]{3})$/i;
const FULL_HEX_PATTERN = /^#([0-9a-f]{6})$/i;

export function normalizeHexColor(
  value: string,
): string | null {
  const trimmedValue = value.trim();

  const shortMatch = trimmedValue.match(
    SHORT_HEX_PATTERN,
  );

  if (shortMatch) {
    const [red, green, blue] =
      shortMatch[1].split("");

    return `#${red}${red}${green}${green}${blue}${blue}`.toUpperCase();
  }

  const fullMatch = trimmedValue.match(
    FULL_HEX_PATTERN,
  );

  if (!fullMatch) {
    return null;
  }

  return `#${fullMatch[1].toUpperCase()}`;
}