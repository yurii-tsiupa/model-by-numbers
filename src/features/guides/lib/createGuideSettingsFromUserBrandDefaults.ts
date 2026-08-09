import type { UserBrandDefaults } from "@/features/auth/types/UserBrandDefaults";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";
import type { GuidePdfBackgroundItem } from "../types/GuidePdfBackground";

export function createGuideSettingsFromUserBrandDefaults(base: GuideTemplateSettings, defaults: UserBrandDefaults, defaultBackground?: GuidePdfBackgroundItem): GuideTemplateSettings {
  return {
    ...base,
    accentColor: defaults.accentColor ?? base.accentColor,
    backgroundItems: defaultBackground ? [{ ...defaultBackground, scope: { mode: "all" } }] : base.backgroundItems.map((item) => ({ ...item, scope: item.scope.mode === "sections" ? { mode: "sections", sectionIds: [...item.scope.sectionIds] } : { mode: item.scope.mode } })),
    branding: { ...base.branding, enabled: false },
  };
}

export function createGuideBrandingFromUserDefaults(base: GuideTemplateSettings["branding"], defaults: UserBrandDefaults, logoAssetId: string | null): GuideTemplateSettings["branding"] {
  const websiteLink = defaults.websiteUrl ? [{ id: "profile-website", label: new URL(defaults.websiteUrl).hostname.replace(/^www\./, ""), url: defaults.websiteUrl }] : [];
  return { ...base, enabled: true, name: defaults.name, logoAssetId, logoUrl: null, socialLinks: defaults.socialLinks.map(link => ({ ...link, id: `profile-${link.id}` })), customLinks: websiteLink };
}
