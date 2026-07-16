import type { ModelGuide } from "../types/ModelGuide";
import type { GeneratedGuide, SaveGeneratedGuideInput } from "../types/GeneratedGuide";
import type { GuideStorage } from "./guideStorage";
import { loadGuidePdfs, saveGuidePdf } from "@/features/storage/services/storage.service";
import { LOCAL_DATABASE_STORES, openLocalDatabase } from "@/features/storage/lib/localDatabase";

const STORE_NAME = LOCAL_DATABASE_STORES.guides;

type StoredGuide = Omit<GeneratedGuide, "createdAt" | "updatedAt"> & {
  createdAt: Date | string | number;
  updatedAt: Date | string | number;
};

function friendlyStorageError(error: unknown): Error {
  if (error instanceof DOMException && error.name === "QuotaExceededError") {
    return new Error("There is not enough browser storage to save this guide.");
  }
  return new Error("We could not access saved guides in this browser.");
}

function validDate(value: Date | string | number): Date {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function normalize(record: StoredGuide): GeneratedGuide {
  return { ...record, snapshot: { ...record.snapshot, generatedAt: validDate(record.snapshot.generatedAt) }, createdAt: validDate(record.createdAt), updatedAt: validDate(record.updatedAt) };
}

function cloneSnapshot(snapshot: ModelGuide): ModelGuide {
  if (typeof structuredClone === "function") return structuredClone(snapshot);
  return {
    ...snapshot,
    generatedAt: new Date(snapshot.generatedAt),
    images: { ...snapshot.images },
    parts: snapshot.parts.map((part) => ({ ...part })),
    palette: snapshot.palette.map((color) => ({ ...color })),
    assemblySteps: snapshot.assemblySteps?.map(step=>({...step,parts:step.parts.map(part=>({...part}))})),
    explodedView: snapshot.explodedView ? {...snapshot.explodedView} : snapshot.explodedView,
    settings: snapshot.settings ? {...snapshot.settings} : snapshot.settings,
  };
}


function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(friendlyStorageError(request.error));
  });
}

class IndexedDbGuideStorage implements GuideStorage {
  async getAll(): Promise<GeneratedGuide[]> {
    const database = await openLocalDatabase();
    const records = await requestResult(database.transaction(STORE_NAME).objectStore(STORE_NAME).getAll() as IDBRequest<StoredGuide[]>); return records.map(normalize);
  }
  async getByProjectId(projectId: string): Promise<GeneratedGuide[]> {
    const database = await openLocalDatabase();
    const transaction = database.transaction(STORE_NAME, "readonly");
      const records = await requestResult(transaction.objectStore(STORE_NAME).index("projectId").getAll(projectId) as IDBRequest<StoredGuide[]>);
      const files = new Map((await loadGuidePdfs(projectId)).map(file => [file.id, file.blob]));
      return records.map(normalize).map(guide=>({...guide,pdfBlob:files.get(guide.id)??guide.pdfBlob})).sort((a, b) => b.version - a.version);
  }

  async getById(guideId: string): Promise<GeneratedGuide | null> {
    const database = await openLocalDatabase();
    const transaction = database.transaction(STORE_NAME, "readonly");
      const record = await requestResult(transaction.objectStore(STORE_NAME).get(guideId) as IDBRequest<StoredGuide | undefined>);
      if(!record)return null;
      const guide=normalize(record);
      const file=(await loadGuidePdfs(guide.projectId)).find(candidate=>candidate.id===guideId);
      return file?{...guide,pdfBlob:file.blob}:guide;
  }

  async save(input: SaveGeneratedGuideInput): Promise<GeneratedGuide> {
    const database = await openLocalDatabase();
    const saved = await new Promise<GeneratedGuide>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("projectId");
      let saved: GeneratedGuide | null = null;
      const request = index.getAll(input.projectId) as IDBRequest<StoredGuide[]>;
      request.onsuccess = () => {
        const version = request.result.reduce((latest, guide) => Math.max(latest, guide.version), 0) + 1;
        const now = new Date();
        saved = { id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`, version, status: "ready", createdAt: now, updatedAt: now, ...input, snapshot: cloneSnapshot(input.snapshot) };
        store.add({...saved,pdfBlob:null});
      };
      request.onerror = () => transaction.abort();
      transaction.oncomplete = () => { if (saved) resolve(saved); else reject(new Error("We could not save this guide in your browser.")); };
      transaction.onerror = () => { reject(friendlyStorageError(transaction.error)); };
      transaction.onabort = () => { reject(friendlyStorageError(transaction.error)); };
    });
    if(saved.pdfBlob)await saveGuidePdf({id:saved.id,entity:"guide",entityId:saved.projectId,fileName:saved.fileName,mimeType:saved.pdfBlob.type||"application/pdf",blob:saved.pdfBlob,size:saved.pdfBlob.size,createdAt:saved.createdAt,updatedAt:saved.updatedAt,metadata:saved});
    return saved;
  }

  async delete(guideId: string): Promise<void> {
    const database = await openLocalDatabase();
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(guideId);
      await new Promise<void>((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(friendlyStorageError(transaction.error)); transaction.onabort = () => reject(friendlyStorageError(transaction.error)); });
  }

  async deleteByProjectId(projectId: string): Promise<void> {
    const guides = await this.getByProjectId(projectId);
    await Promise.all(guides.map((guide) => this.delete(guide.id)));
  }
}

export const indexedDbGuideStorage: GuideStorage = new IndexedDbGuideStorage();
