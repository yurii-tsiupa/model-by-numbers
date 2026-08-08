export type GuideBrandSettings = {
  ctaText: string | null;
  name: string | null;
  logoUrl: string | null;
  qrValue: string | null;
  websiteUrl: string | null;
};

export function normalizeGuideBrandUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.length > 2048) return null;
  const candidate = /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    const supportedProtocol = url.protocol === "http:" || url.protocol === "https:";
    const recognizableHost = url.hostname === "localhost" || url.hostname.includes(".");
    return supportedProtocol && recognizableHost ? url.toString() : null;
  } catch {
    return null;
  }
}

export function normalizeGuideBrandSettings(value: unknown): GuideBrandSettings {
  if (!value || typeof value !== "object") return { ctaText: null, name: null, logoUrl: null, qrValue: null, websiteUrl: null };
  const branding = value as Record<string, unknown>;
  const ctaText = typeof branding.ctaText === "string" ? branding.ctaText.trim().slice(0, 160) || null : null;
  const name = typeof branding.name === "string" ? branding.name.trim().slice(0, 100) || null : null;
  const logoUrl = typeof branding.logoUrl === "string" && /^data:image\/(png|jpeg);base64,/.test(branding.logoUrl)
    ? branding.logoUrl
    : null;
  const qrValue = typeof branding.qrValue === "string" ? normalizeGuideBrandUrl(branding.qrValue) : null;
  const websiteUrl = typeof branding.websiteUrl === "string" ? normalizeGuideBrandUrl(branding.websiteUrl) : null;
  return { ctaText, name, logoUrl, qrValue, websiteUrl };
}
