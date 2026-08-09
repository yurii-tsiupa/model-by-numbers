import type { UserBrandDefaults } from "@/features/auth/types/UserBrandDefaults";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";

export function createGuideSettingsFromUserBrandDefaults(base: GuideTemplateSettings, defaults: UserBrandDefaults, logoAssetId = defaults.logoAssetId): GuideTemplateSettings {
  const websiteLink = defaults.websiteUrl ? [{ id: "profile-website", label: new URL(defaults.websiteUrl).hostname.replace(/^www\./, ""), url: defaults.websiteUrl }] : [];
  return {
    ...base,
    accentColor: defaults.accentColor ?? base.accentColor,
    branding: {
      ...base.branding,
      name: defaults.name ?? base.branding.name,
      logoAssetId: logoAssetId ?? base.branding.logoAssetId,
      logoUrl: null,
      socialLinks: defaults.socialLinks.length ? defaults.socialLinks.map((link) => ({ ...link, id: `profile-${link.id}` })) : base.branding.socialLinks.map((link) => ({ ...link })),
      customLinks: websiteLink.length ? websiteLink : base.branding.customLinks.map((link) => ({ ...link })),
    },
  };
}
