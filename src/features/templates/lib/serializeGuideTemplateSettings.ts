import { normalizeGuideBrandSettings } from "@/features/guides/types/GuideBrandSettings";
import { normalizeGuidePdfBackgroundItems } from "@/features/guides/types/GuidePdfBackground";
import type { GuideTemplateSettings } from "../types/GuideLibraryTemplate";

export function serializeGuideTemplateSettings(settings: Partial<GuideTemplateSettings>): Partial<GuideTemplateSettings> {
  const serialized = { ...settings };
  if (settings.branding) {
    const branding = normalizeGuideBrandSettings(settings.branding);
    serialized.branding = { ...branding, logoUrl: null };
  }
  if (settings.backgroundItems) {
    serialized.backgroundItems = normalizeGuidePdfBackgroundItems(settings.backgroundItems).map((item) => ({ ...item, imageUrl: null }));
  }
  return serialized;
}

export function assertGuideSettingsFirestoreSafe(settings: Partial<GuideTemplateSettings>): void {
  const json = JSON.stringify(settings);
  if (/data:image\/(png|jpeg);base64,/i.test(json) || /blob:/i.test(json)) throw new Error("Runtime Guide image data cannot be persisted to Firestore.");
  if (process.env.NODE_ENV === "development" && new Blob([json]).size > 256 * 1024) console.warn("Guide settings payload is unusually large.");
}
