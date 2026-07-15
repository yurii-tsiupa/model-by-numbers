const DATABASE_NAME = "model-by-numbers";
const DATABASE_VERSION = 3;
const MODEL_FILES_STORE = "model-files";
const GENERATED_GUIDES_STORE = "generated-guides";
const PROJECT_THUMBNAILS_STORE = "project-thumbnails";

type StoredModelFile = {
  projectId: string;
  userId: string;
  file: File;
  fileName: string;
  fileSize: number;
  fileType: string;
  savedAt: Date;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(
        new Error(
          "Local model storage is only available in the browser.",
        ),
      );

      return;
    }

    if (!("indexedDB" in window)) {
      reject(
        new Error(
          "IndexedDB is not supported by this browser.",
        ),
      );

      return;
    }

    const request = window.indexedDB.open(
      DATABASE_NAME,
      DATABASE_VERSION,
    );

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(MODEL_FILES_STORE)) {
        const store = database.createObjectStore(
          MODEL_FILES_STORE,
          {
            keyPath: "projectId",
          },
        );

        store.createIndex("userId", "userId", {
          unique: false,
        });
      }

      if (!database.objectStoreNames.contains(GENERATED_GUIDES_STORE)) {
        const guideStore = database.createObjectStore(
          GENERATED_GUIDES_STORE,
          { keyPath: "id" },
        );
        guideStore.createIndex("projectId", "projectId", {
          unique: false,
        });
        guideStore.createIndex(
          "projectId-version",
          ["projectId", "version"],
          { unique: true },
        );
        guideStore.createIndex("createdAt", "createdAt", {
          unique: false,
        });
      }

      if (!database.objectStoreNames.contains(PROJECT_THUMBNAILS_STORE)) {
        database.createObjectStore(PROJECT_THUMBNAILS_STORE, { keyPath: "projectId" });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(
        request.error ??
          new Error("Unable to open local model storage."),
      );
    };

    request.onblocked = () => {
      reject(
        new Error(
          "Local model storage is blocked by another browser tab.",
        ),
      );
    };
  });
}

function waitForTransaction(
  transaction: IDBTransaction,
): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(
        transaction.error ??
          new Error("Local model storage transaction failed."),
      );
    };

    transaction.onabort = () => {
      reject(
        transaction.error ??
          new Error("Local model storage transaction was aborted."),
      );
    };
  });
}

export async function saveModelFile({
  projectId,
  userId,
  file,
}: {
  projectId: string;
  userId: string;
  file: File;
}): Promise<void> {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  if (!userId) {
    throw new Error("User ID is required.");
  }

  const database = await openDatabase();

  try {
    const transaction = database.transaction(
      MODEL_FILES_STORE,
      "readwrite",
    );

    const store = transaction.objectStore(MODEL_FILES_STORE);

    const storedFile: StoredModelFile = {
      projectId,
      userId,
      file,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      savedAt: new Date(),
    };

    store.put(storedFile);

    await waitForTransaction(transaction);
  } finally {
    database.close();
  }
}

export async function getModelFile({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}): Promise<File | null> {
  if (!projectId || !userId) {
    return null;
  }

  const database = await openDatabase();

  try {
    return await new Promise<File | null>((resolve, reject) => {
      const transaction = database.transaction(
        MODEL_FILES_STORE,
        "readonly",
      );

      const store = transaction.objectStore(MODEL_FILES_STORE);
      const request = store.get(projectId);

      request.onsuccess = () => {
        const result = request.result as
          | StoredModelFile
          | undefined;

        if (!result) {
          resolve(null);
          return;
        }

        if (result.userId !== userId) {
          resolve(null);
          return;
        }

        resolve(result.file);
      };

      request.onerror = () => {
        reject(
          request.error ??
            new Error("Unable to read the local model file."),
        );
      };
    });
  } finally {
    database.close();
  }
}

export async function deleteLocalModelFile(
  projectId: string,
): Promise<void> {
  if (!projectId) {
    return;
  }

  const database = await openDatabase();

  try {
    const transaction = database.transaction(
      MODEL_FILES_STORE,
      "readwrite",
    );

    const store = transaction.objectStore(MODEL_FILES_STORE);

    store.delete(projectId);

    await waitForTransaction(transaction);
  } finally {
    database.close();
  }
}
