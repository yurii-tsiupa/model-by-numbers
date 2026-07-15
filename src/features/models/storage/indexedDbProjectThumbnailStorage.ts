import type { ProjectThumbnail } from "../types/ProjectThumbnail";
import type { ProjectThumbnailStorage } from "./projectThumbnailStorage";

const DATABASE_NAME = "model-by-numbers";
const DATABASE_VERSION = 4;
const STORE_NAME = "project-thumbnails";
const MODEL_FILES_STORE = "model-files";
const GUIDES_STORE = "generated-guides";
const REFERENCES_STORE = "reference-images";

function addStores(database: IDBDatabase) {
  if (!database.objectStoreNames.contains(MODEL_FILES_STORE)) {
    const store = database.createObjectStore(MODEL_FILES_STORE, { keyPath: "projectId" });
    store.createIndex("userId", "userId", { unique: false });
  }
  if (!database.objectStoreNames.contains(GUIDES_STORE)) {
    const store = database.createObjectStore(GUIDES_STORE, { keyPath: "id" });
    store.createIndex("projectId", "projectId", { unique: false });
    store.createIndex("projectId-version", ["projectId", "version"], { unique: true });
    store.createIndex("createdAt", "createdAt", { unique: false });
  }
  if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: "projectId" });
  if (!database.objectStoreNames.contains(REFERENCES_STORE)) { const store=database.createObjectStore(REFERENCES_STORE,{keyPath:"id"});store.createIndex("projectId","projectId"); }
}

function openDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB) return Promise.reject(new Error("Local thumbnails are unavailable."));
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => addStores(request.result);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Local thumbnails are unavailable."));
    request.onblocked = () => reject(new Error("Local thumbnails are temporarily unavailable."));
  });
}

function normalize(value: ProjectThumbnail): ProjectThumbnail {
  const createdAt = new Date(value.createdAt);
  const updatedAt = new Date(value.updatedAt);
  return { ...value, createdAt: Number.isNaN(createdAt.getTime()) ? new Date(0) : createdAt, updatedAt: Number.isNaN(updatedAt.getTime()) ? new Date(0) : updatedAt };
}

async function complete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(new Error("Local thumbnail storage failed.")); transaction.onabort = () => reject(new Error("Local thumbnail storage failed.")); });
}

class IndexedDbProjectThumbnailStorage implements ProjectThumbnailStorage {
  async getProjectThumbnail(projectId: string) {
    const database = await openDatabase();
    try {
      const request = database.transaction(STORE_NAME).objectStore(STORE_NAME).get(projectId) as IDBRequest<ProjectThumbnail | undefined>;
      return await new Promise<ProjectThumbnail | null>((resolve, reject) => { request.onsuccess = () => resolve(request.result ? normalize(request.result) : null); request.onerror = () => reject(new Error("Local thumbnail storage failed.")); });
    } finally { database.close(); }
  }
  async getProjectThumbnails(projectIds: readonly string[]) {
    if (projectIds.length === 0) return [];
    const database = await openDatabase();
    try {
      const request = database.transaction(STORE_NAME).objectStore(STORE_NAME).getAll() as IDBRequest<ProjectThumbnail[]>;
      const records = await new Promise<ProjectThumbnail[]>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(new Error("Local thumbnail storage failed.")); });
      const ids = new Set(projectIds);
      return records.filter((record) => ids.has(record.projectId)).map(normalize);
    } finally { database.close(); }
  }
  async saveProjectThumbnail(thumbnail: ProjectThumbnail) {
    const database = await openDatabase();
    try { const transaction = database.transaction(STORE_NAME, "readwrite"); transaction.objectStore(STORE_NAME).put(thumbnail); await complete(transaction); } finally { database.close(); }
  }
  async deleteProjectThumbnail(projectId: string) {
    const database = await openDatabase();
    try { const transaction = database.transaction(STORE_NAME, "readwrite"); transaction.objectStore(STORE_NAME).delete(projectId); await complete(transaction); } finally { database.close(); }
  }
}

export const indexedDbProjectThumbnailStorage = new IndexedDbProjectThumbnailStorage();
