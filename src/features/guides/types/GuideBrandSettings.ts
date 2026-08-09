export type GuideBrandSocialPlatform = "instagram" | "tiktok" | "telegram" | "facebook" | "youtube" | "x" | "linkedin";

export type GuideBrandSocialLink = {
  id: string;
  platform: GuideBrandSocialPlatform;
  url: string;
  handle: string | null;
};

export type GuideBrandCustomLink = {
  id: string;
  label: string;
  url: string;
};

export type GuideBrandSettings = {
  enabled: boolean;
  backCoverLayout: GuideBrandPageLayout;
  contentPagesLayout: GuideBrandContentPageLayout;
  coverLayout: GuideBrandPageLayout;
  ctaText: string | null;
  name: string | null;
  logoAssetId: string | null;
  logoUrl: string | null;
  qrValue: string | null;
  socialLinks: GuideBrandSocialLink[];
  customLinks: GuideBrandCustomLink[];
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

const SOCIAL_PLATFORMS: readonly GuideBrandSocialPlatform[] = ["instagram", "tiktok", "telegram", "facebook", "youtube", "x", "linkedin"];

export function normalizeGuideBrandSettings(value: unknown): GuideBrandSettings {
  if (!value || typeof value !== "object") return { enabled: false, backCoverLayout: DEFAULT_BACK_COVER_BRAND_LAYOUT, contentPagesLayout: DEFAULT_CONTENT_PAGES_BRAND_LAYOUT, coverLayout: DEFAULT_COVER_BRAND_LAYOUT, ctaText: null, customLinks: [], name: null, logoAssetId: null, logoUrl: null, qrValue: null, socialLinks: [] };
  const branding = value as Record<string, unknown>;
  const ctaText = typeof branding.ctaText === "string" ? branding.ctaText.trim().slice(0, 160) || null : null;
  const backCoverLayout = normalizeGuideBrandPageLayout(branding.backCoverLayout, DEFAULT_BACK_COVER_BRAND_LAYOUT);
  const coverLayout = normalizeGuideBrandPageLayout(branding.coverLayout, DEFAULT_COVER_BRAND_LAYOUT);
  const contentPagesLayout = normalizeGuideBrandContentPageLayout(branding.contentPagesLayout);
  const name = typeof branding.name === "string" ? branding.name.trim().slice(0, 100) || null : null;
  const logoAssetId = typeof branding.logoAssetId === "string" && branding.logoAssetId.startsWith("guide-asset:") ? branding.logoAssetId : null;
  const logoUrl = typeof branding.logoUrl === "string" && (/^data:image\/(png|jpeg);base64,/.test(branding.logoUrl) || branding.logoUrl.startsWith("blob:"))
    ? branding.logoUrl
    : null;
  const qrValue = typeof branding.qrValue === "string" ? normalizeGuideBrandUrl(branding.qrValue) : null;
  const rawSocialLinks = Array.isArray(branding.socialLinks) ? branding.socialLinks : [];
  const socialLinks = rawSocialLinks
    ? rawSocialLinks.slice(0, 8).flatMap((item, index): GuideBrandSocialLink[] => {
        if (!item || typeof item !== "object") return [];
        const link = item as Record<string, unknown>;
        const url = typeof link.url === "string" ? normalizeGuideBrandUrl(link.url) : null;
        if (!url) return [];
        const candidate = typeof link.platform === "string" ? link.platform : link.type;
        if (!SOCIAL_PLATFORMS.includes(candidate as GuideBrandSocialPlatform)) return [];
        return [{
          id: typeof link.id === "string" && link.id.trim() ? link.id : `social-${index}`,
          platform: candidate as GuideBrandSocialPlatform,
          url,
          handle: typeof link.handle === "string" ? link.handle.trim().slice(0, 60) || null : typeof link.label === "string" ? link.label.trim().slice(0, 60) || null : null,
        }];
      })
    : [];
  const customCandidates: unknown[] = Array.isArray(branding.customLinks) ? [...branding.customLinks] : [];
  if (typeof branding.websiteUrl === "string") customCandidates.unshift({ id: "legacy-website", label: "Website", url: branding.websiteUrl });
  rawSocialLinks.forEach((item, index) => {
    if (!item || typeof item !== "object") return;
    const link = item as Record<string, unknown>;
    const candidate = typeof link.platform === "string" ? link.platform : link.type;
    if (!SOCIAL_PLATFORMS.includes(candidate as GuideBrandSocialPlatform)) customCandidates.push({ id: link.id ?? `legacy-link-${index}`, label: link.label ?? "Link", url: link.url });
  });
  const customLinks = customCandidates.slice(0, 5).flatMap((item, index): GuideBrandCustomLink[] => {
    if (!item || typeof item !== "object") return [];
    const link = item as Record<string, unknown>;
    const url = typeof link.url === "string" ? normalizeGuideBrandUrl(link.url) : null;
    const label = typeof link.label === "string" ? link.label.trim().slice(0, 60) : "";
    if (!url || !label) return [];
    return [{ id: typeof link.id === "string" && link.id.trim() ? link.id : `custom-${index}`, label, url }];
  });
  const hasBranding = Boolean(name || logoAssetId || logoUrl || ctaText || qrValue || socialLinks.length || customLinks.length);
  const enabled = typeof branding.enabled === "boolean" ? branding.enabled : hasBranding;
  return { enabled, backCoverLayout, contentPagesLayout, coverLayout, ctaText, customLinks, name, logoAssetId, logoUrl, qrValue, socialLinks };
}
import { DEFAULT_BACK_COVER_BRAND_LAYOUT, DEFAULT_CONTENT_PAGES_BRAND_LAYOUT, DEFAULT_COVER_BRAND_LAYOUT, GUIDE_BRAND_CONTENT_QR_SCALE_MAX, GUIDE_BRAND_CONTENT_QR_SCALE_MIN, GUIDE_BRAND_LOGO_SCALE_MAX, GUIDE_BRAND_LOGO_SCALE_MIN, GUIDE_BRAND_POSITIONS, normalizeGuideBrandPageLayout } from "../lib/guideBrandLayout";
import type { GuideBrandContentElementType, GuideBrandContentPageLayout, GuideBrandPageLayout } from "./GuideBrandLayout";

function normalizeGuideBrandContentPageLayout(value: unknown): GuideBrandContentPageLayout {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const layout = Object.fromEntries((Object.keys(DEFAULT_CONTENT_PAGES_BRAND_LAYOUT) as GuideBrandContentElementType[]).map(element => {
    const raw = source[element] && typeof source[element] === "object" ? source[element] as Record<string, unknown> : {};
    const fallback = DEFAULT_CONTENT_PAGES_BRAND_LAYOUT[element];
    return [element, {
      visible: typeof raw.visible === "boolean" ? raw.visible : fallback.visible,
      position: typeof raw.position === "string" && GUIDE_BRAND_POSITIONS.includes(raw.position as typeof fallback.position) ? raw.position as typeof fallback.position : fallback.position,
      logoScale: typeof raw.logoScale === "number" && Number.isFinite(raw.logoScale) ? Math.min(GUIDE_BRAND_LOGO_SCALE_MAX, Math.max(GUIDE_BRAND_LOGO_SCALE_MIN, Math.round(raw.logoScale))) : fallback.logoScale,
      qrScale: typeof raw.qrScale === "number" && Number.isFinite(raw.qrScale) ? Math.min(GUIDE_BRAND_CONTENT_QR_SCALE_MAX, Math.max(GUIDE_BRAND_CONTENT_QR_SCALE_MIN, Math.round(raw.qrScale))) : fallback.qrScale,
    }];
  })) as unknown as GuideBrandContentPageLayout;
  const sections = normalizeGuideBrandContentPageLayouts(source.sections);
  return Object.keys(sections).length ? { ...layout, sections } : layout;
}

const CONTENT_SECTION_IDS = ["projectOverview", "legend", "kit", "palette", "modelOverview", "explodedView", "assembly", "references", "partsOverview", "paintingInstructions", "finishing", "troubleshooting"] as const;

function normalizeGuideBrandContentPageLayouts(value: unknown): NonNullable<GuideBrandContentPageLayout["sections"]> {
  if (!value || typeof value !== "object") return {};
  const source = value as Record<string, unknown>;
  return Object.fromEntries(CONTENT_SECTION_IDS.flatMap(sectionId => source[sectionId] ? [[sectionId, normalizeGuideBrandContentPageLayout(source[sectionId])]] : []));
}
