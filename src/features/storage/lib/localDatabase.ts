export const LOCAL_DATABASE_NAME = "model-by-numbers";
export const LOCAL_DATABASE_VERSION = 7;

export const LOCAL_DATABASE_STORES = {
  modelFiles: "model-files",
  guides: "generated-guides",
  thumbnails: "project-thumbnails",
  references: "reference-images",
  assemblyStepImages: "assembly-step-images",
  guideAssets: "guide-assets",
} as const;

let databasePromise: Promise<IDBDatabase> | null = null;

function ensureIndex(store: IDBObjectStore, name: string, keyPath: string | string[], options?: IDBIndexParameters) {
  if (!store.indexNames.contains(name)) store.createIndex(name, keyPath, options);
}

function upgradeDatabase(database: IDBDatabase, transaction: IDBTransaction) {
  const stores = LOCAL_DATABASE_STORES;
  const modelFiles = database.objectStoreNames.contains(stores.modelFiles) ? transaction.objectStore(stores.modelFiles) : database.createObjectStore(stores.modelFiles, { keyPath: "projectId" });
  ensureIndex(modelFiles, "userId", "userId", { unique: false });
  const guides = database.objectStoreNames.contains(stores.guides) ? transaction.objectStore(stores.guides) : database.createObjectStore(stores.guides, { keyPath: "id" });
  ensureIndex(guides, "projectId", "projectId", { unique: false });
  ensureIndex(guides, "projectId-version", ["projectId", "version"], { unique: true });
  ensureIndex(guides, "createdAt", "createdAt", { unique: false });
  if (!database.objectStoreNames.contains(stores.thumbnails)) database.createObjectStore(stores.thumbnails, { keyPath: "projectId" });
  const references = database.objectStoreNames.contains(stores.references) ? transaction.objectStore(stores.references) : database.createObjectStore(stores.references, { keyPath: "id" });
  ensureIndex(references, "projectId", "projectId", { unique: false });
  const assemblyImages = database.objectStoreNames.contains(stores.assemblyStepImages) ? transaction.objectStore(stores.assemblyStepImages) : database.createObjectStore(stores.assemblyStepImages, { keyPath: "id" });
  ensureIndex(assemblyImages, "projectId", "projectId", { unique: false });
  const guideAssets = database.objectStoreNames.contains(stores.guideAssets) ? transaction.objectStore(stores.guideAssets) : database.createObjectStore(stores.guideAssets, { keyPath: "id" });
  ensureIndex(guideAssets, "projectId", "projectId", { unique: false });
}

export function openLocalDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;
  if (typeof window === "undefined" || !window.indexedDB) return Promise.reject(new Error("Local browser storage is unavailable."));
  databasePromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(LOCAL_DATABASE_NAME, LOCAL_DATABASE_VERSION);
    request.onupgradeneeded = () => { if (request.transaction) upgradeDatabase(request.result, request.transaction); };
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => { database.close(); databasePromise = null; };
      database.onclose = () => { databasePromise = null; };
      resolve(database);
    };
    request.onerror = () => { databasePromise = null; reject(request.error ?? new Error("Unable to open local browser storage.")); };
    request.onblocked = () => { databasePromise = null; reject(new Error("Local browser storage is blocked by another tab.")); };
  });
  return databasePromise;
}
