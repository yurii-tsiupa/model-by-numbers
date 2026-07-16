import { STORAGE_DATABASE_NAME, STORAGE_DATABASE_VERSION, STORAGE_STORES } from "../constants/storage.constants";
import { StorageUnavailableError, storageError } from "../lib/storageErrors";
import type { StorageEntity, StorageFile } from "../types/StorageFile";
import type { StorageProvider } from "../types/StorageProvider";

type LegacyRecord = Record<string, unknown>;
const date = (value: unknown) => { const result = new Date(value instanceof Date || typeof value === "string" || typeof value === "number" ? value : 0); return Number.isNaN(result.getTime()) ? new Date(0) : result; };

function openDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB) return Promise.reject(new StorageUnavailableError("Local files are unavailable in this environment."));
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(STORAGE_DATABASE_NAME, STORAGE_DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database=request.result;
      if(!database.objectStoreNames.contains("model-files")){const store=database.createObjectStore("model-files",{keyPath:"projectId"});store.createIndex("userId","userId");}
      if(!database.objectStoreNames.contains(STORAGE_STORES.guide)){const store=database.createObjectStore(STORAGE_STORES.guide,{keyPath:"id"});store.createIndex("projectId","projectId");store.createIndex("projectId-version",["projectId","version"],{unique:true});store.createIndex("createdAt","createdAt");}
      if(!database.objectStoreNames.contains(STORAGE_STORES.reference)){const store=database.createObjectStore(STORAGE_STORES.reference,{keyPath:"id"});store.createIndex("projectId","projectId");}
      if(!database.objectStoreNames.contains(STORAGE_STORES.thumbnail))database.createObjectStore(STORAGE_STORES.thumbnail,{keyPath:"projectId"});
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new StorageUnavailableError("Local files are unavailable in this browser.", { cause: request.error }));
    request.onblocked = () => reject(new StorageUnavailableError("Local file storage is temporarily unavailable."));
  });
}
function result<T>(request: IDBRequest<T>, operation: "read" | "write" | "delete"): Promise<T> { return new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(storageError(operation, request.error)); }); }
function complete(transaction: IDBTransaction, operation: "write" | "delete"): Promise<void> { return new Promise((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(storageError(operation, transaction.error)); transaction.onabort = () => reject(storageError(operation, transaction.error)); }); }

function toFile(entity: StorageEntity, record: LegacyRecord): StorageFile | null {
  const blob = entity === "guide" ? record.pdfBlob : record.blob;
  if (!(blob instanceof Blob)) return null;
  const entityId = String(entity === "guide" || entity === "thumbnail" ? record.projectId : record.projectId);
  const id = String(entity === "thumbnail" ? record.projectId : record.id);
  const fileName = String(entity === "guide" ? record.fileName : entity === "reference" ? record.name : `${entityId}-thumbnail`);
  const mimeType = String(record.mimeType ?? blob.type ?? "application/octet-stream");
  return { id, entity, entityId, fileName, mimeType, blob, size: Number(record.size ?? blob.size), createdAt: date(record.createdAt), updatedAt: date(record.updatedAt), metadata: record };
}
function toRecord(file: StorageFile): LegacyRecord {
  const base = { ...(file.metadata ?? {}), createdAt: file.createdAt, updatedAt: file.updatedAt };
  if (file.entity === "guide") return { ...base, id: file.id, projectId: file.entityId, fileName: file.fileName, pdfBlob: file.blob };
  if (file.entity === "reference") return { ...base, id: file.id, projectId: file.entityId, name: file.fileName, mimeType: file.mimeType, blob: file.blob, size: file.size };
  return { ...base, projectId: file.entityId, mimeType: file.mimeType, blob: file.blob };
}

export class LocalStorageProvider implements StorageProvider {
  async save(file: StorageFile) { const db=await openDatabase(); try { const tx=db.transaction(STORAGE_STORES[file.entity],"readwrite"); tx.objectStore(STORAGE_STORES[file.entity]).put(toRecord(file)); await complete(tx,"write"); return file; } finally { db.close(); } }
  async get(id: string) { const db=await openDatabase(); try { for (const entity of ["reference","guide","thumbnail"] as const) { const record=await result(db.transaction(STORAGE_STORES[entity]).objectStore(STORAGE_STORES[entity]).get(id) as IDBRequest<LegacyRecord|undefined>,"read"); if(record) return toFile(entity,record); } return null; } finally { db.close(); } }
  async getManyByEntity(entity: StorageEntity, entityId: string) { const db=await openDatabase(); try { const store=db.transaction(STORAGE_STORES[entity]).objectStore(STORAGE_STORES[entity]); let records: LegacyRecord[]; if(entity==="thumbnail") { const record=await result(store.get(entityId) as IDBRequest<LegacyRecord|undefined>,"read"); records=record?[record]:[]; } else { records=await result(store.index("projectId").getAll(entityId) as IDBRequest<LegacyRecord[]>,"read"); } return records.map(record=>toFile(entity,record)).filter((file):file is StorageFile=>file!==null); } finally { db.close(); } }
  async delete(id: string) { const file=await this.get(id);if(file)await this.deleteFrom(file.entity,id); }
  async deleteByEntity(entity: StorageEntity, entityId: string) { const files=await this.getManyByEntity(entity,entityId); await Promise.all(files.map(file=>this.deleteFrom(entity,file.id))); }
  private async deleteFrom(entity: StorageEntity,id:string){const db=await openDatabase();try{const tx=db.transaction(STORAGE_STORES[entity],"readwrite");tx.objectStore(STORAGE_STORES[entity]).delete(id);await complete(tx,"delete");}finally{db.close();}}
}
