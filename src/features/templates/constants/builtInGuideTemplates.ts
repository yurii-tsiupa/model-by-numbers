import type { BuiltInGuideTemplate } from "../types/GuideLibraryTemplate";

export const BUILT_IN_GUIDE_TEMPLATES: readonly BuiltInGuideTemplate[] = [
  { id:"built-in-minimal",source:"builtIn",userId:null,nameKey:"minimal",category:"minimal",createdAt:null,updatedAt:null,settings:{pageBackground:"#FFFFFF",textColor:"#181221",accentColor:"#6D28D9",headingFont:"spaceGrotesk",bodyFont:"inter",pageNumberStyle:"numericWithTotal",pageNumberPosition:"bottomCenter",dividerStyle:"line",coverStyle:"minimal",spacing:"comfortable"}},
  { id:"built-in-technical",source:"builtIn",userId:null,nameKey:"technical",category:"technical",createdAt:null,updatedAt:null,settings:{pageBackground:"#F7F8FA",textColor:"#111827",accentColor:"#0E7C86",headingFont:"inter",bodyFont:"inter",pageNumberStyle:"numericWithTotal",pageNumberPosition:"bottomRight",dividerStyle:"accent",coverStyle:"solid",spacing:"compact"}},
  { id:"built-in-editorial",source:"builtIn",userId:null,nameKey:"editorial",category:"editorial",createdAt:null,updatedAt:null,settings:{pageBackground:"#FFFCF7",textColor:"#29231F",accentColor:"#8A4B35",headingFont:"spaceGrotesk",bodyFont:"inter",pageNumberStyle:"numeric",pageNumberPosition:"bottomLeft",dividerStyle:"none",coverStyle:"solid",spacing:"comfortable"}},
] as const;
