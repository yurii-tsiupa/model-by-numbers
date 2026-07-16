import { ClassicGuideDocument } from "../classic/ClassicGuideDocument";
import { ClassicGuidePreview } from "../classic/ClassicGuidePreview";
import type { GuideTemplate } from "../types/GuideTemplate";

const templates = new Map<string,GuideTemplate>();
export function registerTemplate(template:GuideTemplate){templates.set(template.id,template);return template;}
export const classicGuideTemplate=registerTemplate({id:"classic",name:"Classic",Preview:ClassicGuidePreview,PdfDocument:ClassicGuideDocument,settings:{explodedViewStyle:"contained",assemblyStepStyle:"cards"}});
export const defaultGuideTemplate=classicGuideTemplate;
export function getGuideTemplate(id:string):GuideTemplate{return templates.get(id)??defaultGuideTemplate;}
