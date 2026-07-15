const UNSUPPORTED_CHARACTERS_PATTERN = /[^a-z0-9]+/g;
const COMBINING_MARKS_PATTERN = /[\u0300-\u036f]/g;

export function createGuideFileName(
  projectName: string,
): string {
  const normalizedName = projectName
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(COMBINING_MARKS_PATTERN, "")
    .replace(UNSUPPORTED_CHARACTERS_PATTERN, "-")
    .replace(/^-+|-+$/g, "");

  if (!normalizedName) {
    return "model-painting-guide.pdf";
  }

  return `${normalizedName}-painting-guide.pdf`;
}
