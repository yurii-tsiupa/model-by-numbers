import type { ModelGuide } from "../types/ModelGuide";
import type { GeneratedGuide, SaveGeneratedGuideInput } from "../types/GeneratedGuide";
import type { GuideStorage } from "./guideStorage";

const DATABASE_NAME = "model-by-numbers";
const DATABASE_VERSION = 3;
const STORE_NAME = "generated-guides";
const MODEL_FILES_STORE = "model-files";
const PROJECT_THUMBNAILS_STORE = "project-thumbnails";

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
  };
}

function openDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.reject(new Error("Saved guides are unavailable in this browser."));
  }
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(MODEL_FILES_STORE)) {
        const modelFiles = database.createObjectStore(MODEL_FILES_STORE, { keyPath: "projectId" });
        modelFiles.createIndex("userId", "userId", { unique: false });
      }
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("projectId", "projectId", { unique: false });
        store.createIndex("projectId-version", ["projectId", "version"], { unique: true });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
      if (!database.objectStoreNames.contains(PROJECT_THUMBNAILS_STORE)) database.createObjectStore(PROJECT_THUMBNAILS_STORE, { keyPath: "projectId" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(friendlyStorageError(request.error));
    request.onblocked = () => reject(new Error("Saved guide storage is temporarily unavailable."));
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(friendlyStorageError(request.error));
  });
}

class IndexedDbGuideStorage implements GuideStorage {
  async getAll(): Promise<GeneratedGuide[]> {
    const database = await openDatabase();
    try { const records = await requestResult(database.transaction(STORE_NAME).objectStore(STORE_NAME).getAll() as IDBRequest<StoredGuide[]>); return records.map(normalize); } finally { database.close(); }
  }
  async getByProjectId(projectId: string): Promise<GeneratedGuide[]> {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const records = await requestResult(transaction.objectStore(STORE_NAME).index("projectId").getAll(projectId) as IDBRequest<StoredGuide[]>);
      return records.map(normalize).sort((a, b) => b.version - a.version);
    } finally { database.close(); }
  }

  async getById(guideId: string): Promise<GeneratedGuide | null> {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const record = await requestResult(transaction.objectStore(STORE_NAME).get(guideId) as IDBRequest<StoredGuide | undefined>);
      return record ? normalize(record) : null;
    } finally { database.close(); }
  }

  async save(input: SaveGeneratedGuideInput): Promise<GeneratedGuide> {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("projectId");
      let saved: GeneratedGuide | null = null;
      const request = index.getAll(input.projectId) as IDBRequest<StoredGuide[]>;
      request.onsuccess = () => {
        const version = request.result.reduce((latest, guide) => Math.max(latest, guide.version), 0) + 1;
        const now = new Date();
        saved = { id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`, version, status: "ready", createdAt: now, updatedAt: now, ...input, snapshot: cloneSnapshot(input.snapshot) };
        store.add(saved);
      };
      request.onerror = () => transaction.abort();
      transaction.oncomplete = () => { database.close(); if (saved) resolve(saved); else reject(new Error("We could not save this guide in your browser.")); };
      transaction.onerror = () => { database.close(); reject(friendlyStorageError(transaction.error)); };
      transaction.onabort = () => { database.close(); reject(friendlyStorageError(transaction.error)); };
    });
  }

  async delete(guideId: string): Promise<void> {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(guideId);
      await new Promise<void>((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(friendlyStorageError(transaction.error)); transaction.onabort = () => reject(friendlyStorageError(transaction.error)); });
    } finally { database.close(); }
  }

  async deleteByProjectId(projectId: string): Promise<void> {
    const guides = await this.getByProjectId(projectId);
    await Promise.all(guides.map((guide) => this.delete(guide.id)));
  }
}

export const indexedDbGuideStorage: GuideStorage = new IndexedDbGuideStorage();
