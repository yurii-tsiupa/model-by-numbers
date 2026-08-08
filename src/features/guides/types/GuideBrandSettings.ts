export type GuideBrandSettings = {
  name: string | null;
  logoUrl: string | null;
};

export function normalizeGuideBrandSettings(value: unknown): GuideBrandSettings {
  if (!value || typeof value !== "object") return { name: null, logoUrl: null };
  const branding = value as Record<string, unknown>;
  const name = typeof branding.name === "string" ? branding.name.trim().slice(0, 100) || null : null;
  const logoUrl = typeof branding.logoUrl === "string" && /^data:image\/(png|jpeg);base64,/.test(branding.logoUrl)
    ? branding.logoUrl
    : null;
  return { name, logoUrl };
}
