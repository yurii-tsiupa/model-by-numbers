import { normalizeGuideAccentColor } from "@/features/guides/design/guideDesignTokens";
import { normalizeGuideBrandUrl, type GuideBrandSocialLink, type GuideBrandSocialPlatform } from "@/features/guides/types/GuideBrandSettings";
import type { Locale } from "@/features/i18n/types/Locale";

export type UserBrandDefaults = {
  name: string | null;
  logoAssetId: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  socialLinks: GuideBrandSocialLink[];
  accentColor: string | null;
  defaultGuideLocale: Locale;
};

const PLATFORMS: readonly GuideBrandSocialPlatform[] = ["instagram", "tiktok", "telegram", "facebook", "youtube", "x", "linkedin"];
export const EMPTY_USER_BRAND_DEFAULTS: UserBrandDefaults = { name: null, logoAssetId: null, websiteUrl: null, contactEmail: null, socialLinks: [], accentColor: null, defaultGuideLocale: "en" };

export function normalizeUserBrandDefaults(value: unknown): UserBrandDefaults {
  if (!value || typeof value !== "object") return { ...EMPTY_USER_BRAND_DEFAULTS };
  const source = value as Record<string, unknown>;
  const socialLinks = (Array.isArray(source.socialLinks) ? source.socialLinks : []).slice(0, 8).flatMap((item, index): GuideBrandSocialLink[] => {
    if (!item || typeof item !== "object") return [];
    const link = item as Record<string, unknown>;
    const url = typeof link.url === "string" ? normalizeGuideBrandUrl(link.url) : null;
    if (!url || !PLATFORMS.includes(link.platform as GuideBrandSocialPlatform)) return [];
    return [{ id: typeof link.id === "string" && link.id ? link.id : `profile-social-${index}`, platform: link.platform as GuideBrandSocialPlatform, url, handle: typeof link.handle === "string" ? link.handle.trim().slice(0, 60) || null : null }];
  });
  const email = typeof source.contactEmail === "string" ? source.contactEmail.trim().slice(0, 254) : "";
  return {
    name: typeof source.name === "string" ? source.name.trim().slice(0, 100) || null : null,
    logoAssetId: typeof source.logoAssetId === "string" && source.logoAssetId.startsWith("profile-brand-logo:") ? source.logoAssetId : null,
    websiteUrl: typeof source.websiteUrl === "string" ? normalizeGuideBrandUrl(source.websiteUrl) : null,
    contactEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
    socialLinks,
    accentColor: typeof source.accentColor === "string" ? normalizeGuideAccentColor(source.accentColor) : null,
    defaultGuideLocale: source.defaultGuideLocale === "uk" ? "uk" : "en",
  };
}
