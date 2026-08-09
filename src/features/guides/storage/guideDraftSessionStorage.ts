import { serializeGuideTemplateSettings } from "@/features/templates/lib/serializeGuideTemplateSettings";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";
import type { Locale } from "@/features/i18n/types/Locale";
import { normalizeGuideTemplateSettings } from "@/features/templates/services/guideTemplateStorage";

export type StoredGuideDraft = { projectId: string; draftId: string; templateId: string; locale: Locale; settings: GuideTemplateSettings };
const key = (projectId: string) => `guide-draft:${projectId}`;

export function saveGuideDraftSession(draft: StoredGuideDraft): void {
  if (typeof window !== "undefined") sessionStorage.setItem(key(draft.projectId), JSON.stringify({ ...draft, settings: serializeGuideTemplateSettings(draft.settings) }));
}

export function loadGuideDraftSession(projectId: string): StoredGuideDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(sessionStorage.getItem(key(projectId)) ?? "null") as Partial<StoredGuideDraft> | null;
    if (!value || value.projectId !== projectId || typeof value.draftId !== "string" || typeof value.templateId !== "string" || (value.locale !== "en" && value.locale !== "uk") || !value.settings) return null;
    const settings = normalizeGuideTemplateSettings(value.settings);
    return settings ? { projectId, draftId: value.draftId, templateId: value.templateId, locale: value.locale, settings } : null;
  } catch { return null; }
}

export function clearGuideDraftSession(projectId: string): void {
  if (typeof window !== "undefined") sessionStorage.removeItem(key(projectId));
}
