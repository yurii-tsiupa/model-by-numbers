import { LOCAL_DATABASE_STORES, openLocalDatabase } from "@/features/storage/lib/localDatabase";

const MODEL_FILES_STORE = LOCAL_DATABASE_STORES.modelFiles;

type StoredModelFile = {
  projectId: string;
  userId: string;
  file: File;
  fileName: string;
  fileSize: number;
  fileType: string;
  savedAt: Date;
};


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

  const database = await openLocalDatabase();

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

  const database = await openLocalDatabase();

  return new Promise<File | null>((resolve, reject) => {
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
}

export async function deleteLocalModelFile(
  projectId: string,
): Promise<void> {
  if (!projectId) {
    return;
  }

  const database = await openLocalDatabase();

  const transaction = database.transaction(
      MODEL_FILES_STORE,
      "readwrite",
    );

    const store = transaction.objectStore(MODEL_FILES_STORE);

    store.delete(projectId);

  await waitForTransaction(transaction);
}
