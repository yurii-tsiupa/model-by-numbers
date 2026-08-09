import type { UserBrandDefaults } from "@/features/auth/types/UserBrandDefaults";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";
import type { GuidePdfBackgroundItem } from "../types/GuidePdfBackground";

export function createGuideSettingsFromUserBrandDefaults(base: GuideTemplateSettings, defaults: UserBrandDefaults, logoAssetId = defaults.logoAssetId, defaultBackground?: GuidePdfBackgroundItem): GuideTemplateSettings {
  const websiteLink = defaults.websiteUrl ? [{ id: "profile-website", label: new URL(defaults.websiteUrl).hostname.replace(/^www\./, ""), url: defaults.websiteUrl }] : [];
  return {
    ...base,
    accentColor: defaults.accentColor ?? base.accentColor,
    backgroundItems: defaultBackground ? [{ ...defaultBackground, scope: { mode: "all" } }] : base.backgroundItems.map((item) => ({ ...item, scope: item.scope.mode === "sections" ? { mode: "sections", sectionIds: [...item.scope.sectionIds] } : { mode: item.scope.mode } })),
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
