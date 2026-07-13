import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import { storage } from "@/lib/firebase/client";

type UploadModelParams = {
  userId: string;
  projectId: string;
  file: File;
  onProgress?: (progress: number) => void;
};

export type UploadedModel = {
  downloadUrl: string;
  storagePath: string;
};

const MAX_MODEL_FILE_SIZE = 100 * 1024 * 1024;

function validateModelFile(file: File): void {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension !== "glb") {
    throw new Error("Only .glb files are currently supported.");
  }

  if (file.size === 0) {
    throw new Error("The selected file is empty.");
  }

  if (file.size > MAX_MODEL_FILE_SIZE) {
    throw new Error("The model file must not exceed 100 MB.");
  }
}

export function uploadModel({
  userId,
  projectId,
  file,
  onProgress,
}: UploadModelParams): Promise<UploadedModel> {
  validateModelFile(file);

  const storagePath = `users/${userId}/projects/${projectId}/model/model.glb`;
  const modelReference = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(modelReference, file, {
    contentType: file.type || "model/gltf-binary",
    customMetadata: {
      originalFileName: file.name,
      projectId,
      userId,
    },
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          snapshot.totalBytes > 0
            ? Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              )
            : 0;

        onProgress?.(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(
            uploadTask.snapshot.ref,
          );

          resolve({
            downloadUrl,
            storagePath,
          });
        } catch (error) {
          reject(error);
        }
      },
    );
  });
}

export async function deleteModelFile(
  storagePath: string,
): Promise<void> {
  if (!storagePath) {
    return;
  }

  const modelReference = ref(storage, storagePath);

  await deleteObject(modelReference);
}