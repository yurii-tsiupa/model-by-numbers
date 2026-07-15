export function isPartIncludedInGuide(part: {
  includeInGuide?: boolean;
}): boolean {
  return part.includeInGuide !== false;
}

export function getGuideParts<T extends { includeInGuide?: boolean }>(
  parts: readonly T[],
): T[] {
  return parts.filter(isPartIncludedInGuide);
}
