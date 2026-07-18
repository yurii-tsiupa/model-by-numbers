import { BUILT_IN_GUIDE_TEMPLATES } from "../constants/builtInGuideTemplates";
import type { GuideLibraryTemplate, UserGuideTemplate } from "../types/GuideLibraryTemplate";

export const DEFAULT_GUIDE_TEMPLATE_ID = "built-in-minimal";
export function resolveGuideTemplate(templateId: string | undefined, userTemplates: readonly UserGuideTemplate[]): GuideLibraryTemplate {
  return BUILT_IN_GUIDE_TEMPLATES.find(template => template.id === templateId) ?? userTemplates.find(template => template.id === templateId) ?? BUILT_IN_GUIDE_TEMPLATES[0];
}
