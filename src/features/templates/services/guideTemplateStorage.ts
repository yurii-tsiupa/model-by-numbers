import { DEFAULT_GUIDE_PAGE_FORMAT } from "@/features/guides/types/GuidePageFormat";
import { normalizeGuideFontId } from "@/features/guides/design/guideFontRegistry";
import { LOCAL_DATABASE_STORES, openLocalDatabase } from "@/features/storage/lib/localDatabase";
import type { CreateUserGuideTemplateInput, GuideTemplateCategory, GuideTemplateSettings, UserGuideTemplate } from "../types/GuideLibraryTemplate";

type StoredTemplate = Omit<UserGuideTemplate,"createdAt"|"updatedAt"|"settings"> & {
  createdAt: Date|string|number;
  updatedAt: Date|string|number;
  settings: Omit<GuideTemplateSettings, "pageFormat"> & { pageFormat?: unknown };
};

const STORE=LOCAL_DATABASE_STORES.guideTemplates;
const categories:readonly GuideTemplateCategory[]=["minimal","technical","editorial","custom"];

function normalizeSettings(value:unknown):GuideTemplateSettings|null {
  if (!value || typeof value !== "object") return null;
  const settings = value as StoredTemplate["settings"];
  if (typeof settings.pageBackground !== "string" || typeof settings.textColor !== "string" || typeof settings.accentColor !== "string") return null;
  const pageFormat = settings.pageFormat === "a4" || settings.pageFormat === "letter"
    ? settings.pageFormat
    : DEFAULT_GUIDE_PAGE_FORMAT;
  const headingFont = settings.headingFont === undefined ? undefined : normalizeGuideFontId(typeof settings.headingFont === "string" ? settings.headingFont : undefined);
  const bodyFont = settings.bodyFont === undefined ? undefined : normalizeGuideFontId(typeof settings.bodyFont === "string" ? settings.bodyFont : undefined);
  const monoFont = settings.monoFont === undefined ? undefined : normalizeGuideFontId(typeof settings.monoFont === "string" ? settings.monoFont : undefined);
  return { ...settings, pageFormat, ...(headingFont ? { headingFont } : {}), ...(bodyFont ? { bodyFont } : {}), ...(monoFont ? { monoFont } : {}) } as GuideTemplateSettings;
}

function normalize(value:unknown):UserGuideTemplate|null {
  if(!value||typeof value!=="object")return null;
  const raw=value as Partial<StoredTemplate>;
  const settings=normalizeSettings(raw.settings);
  if(typeof raw.id!=="string"||raw.source!=="user"||typeof raw.userId!=="string"||typeof raw.name!=="string"||!categories.includes(raw.category as GuideTemplateCategory)||!settings)return null;
  const createdAt=new Date(raw.createdAt??0),updatedAt=new Date(raw.updatedAt??0);
  if(Number.isNaN(createdAt.getTime())||Number.isNaN(updatedAt.getTime()))return null;
  return{id:raw.id,userId:raw.userId,source:"user",name:raw.name.trim().slice(0,100),category:raw.category as GuideTemplateCategory,settings,createdAt,updatedAt};
}

function result<T>(request:IDBRequest<T>):Promise<T>{return new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(new Error("Template storage is unavailable."));});}

export const guideTemplateStorage={
  async getByUserId(userId:string){const db=await openLocalDatabase();const records=await result(db.transaction(STORE).objectStore(STORE).index("userId").getAll(userId) as IDBRequest<unknown[]>);return records.flatMap(value=>{const template=normalize(value);return template&&template.userId===userId?[template]:[]});},
  async create(userId:string,input:CreateUserGuideTemplateInput){const db=await openLocalDatabase(),now=new Date();const template:UserGuideTemplate={id:crypto.randomUUID(),userId,source:"user",name:input.name.trim().slice(0,100),category:input.category,settings:{...input.settings},createdAt:now,updatedAt:now};await result(db.transaction(STORE,"readwrite").objectStore(STORE).add(template));return template;},
  async delete(userId:string,id:string){const db=await openLocalDatabase(),store=db.transaction(STORE,"readonly").objectStore(STORE),existing=normalize(await result(store.get(id)));if(!existing||existing.userId!==userId)throw new Error("Template not found.");await result(db.transaction(STORE,"readwrite").objectStore(STORE).delete(id));},
};
