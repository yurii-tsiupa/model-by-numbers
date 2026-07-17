import type {Locale} from "@/features/i18n/types/Locale";

const UNSAFE=/[^a-z0-9]+/g,MARKS=/[\u0300-\u036f]/g;
function slug(value:string|undefined|null){return(value??"").trim().toLowerCase().normalize("NFKD").replace(MARKS,"").replace(UNSAFE,"-").replace(/-+/g,"-").replace(/^-|-$/g,"");}
export function generateGuidePdfFileName({projectName,modelName,locale}:{projectName:string;modelName?:string|null;locale:Locale}){return`${slug(projectName)||slug(modelName)||"model"}-painting-guide-${locale}.pdf`;}
