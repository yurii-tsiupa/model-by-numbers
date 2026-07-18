import { createContext, useContext, type ReactNode } from "react";
import { BUILT_IN_GUIDE_TEMPLATES } from "@/features/templates/constants/builtInGuideTemplates";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";

const GuidePdfTemplateContext=createContext<GuideTemplateSettings>(BUILT_IN_GUIDE_TEMPLATES[0].settings);
export function GuidePdfTemplateProvider({settings,children}:{settings?:GuideTemplateSettings;children:ReactNode}){return <GuidePdfTemplateContext.Provider value={settings??BUILT_IN_GUIDE_TEMPLATES[0].settings}>{children}</GuidePdfTemplateContext.Provider>}
export const useGuidePdfTemplate=()=>useContext(GuidePdfTemplateContext);
