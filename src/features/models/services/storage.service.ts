import { deleteLocalModelFile, getModelFile, saveModelFile } from "@/features/model-editor/services/model-file.service";

type UploadModelParams = {
  userId: string;
  projectId: string;
  file: File;
  onProgress?: (progress: number) => void;
};

type UploadModelResult = {
  modelUrl: null;
  modelStoragePath: null;

  originalFileName: string;
  originalFileSize: number;
  originalFileType: string;
};

const FAKE_UPLOAD_STEPS = [12, 28, 46, 68, 84, 100];

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

export async function uploadModel({
  userId,
  projectId,
  file,
  onProgress,
}: UploadModelParams): Promise<UploadModelResult> {
  onProgress?.(0);

  for (const progress of FAKE_UPLOAD_STEPS.slice(0, -1)) {
    await wait(90);
    onProgress?.(progress);
  }

  await saveModelFile({
    projectId,
    userId,
    file,
  });

  onProgress?.(100);

  return {
    modelUrl: null,
    modelStoragePath: null,

    originalFileName: file.name,
    originalFileSize: file.size,
    originalFileType:
      file.type || "model/gltf-binary",
  };
}

export async function loadLocalModelFile({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}): Promise<File | null> {
  return getModelFile({
    projectId,
    userId,
  });
}

export async function deleteModelFile(
  projectId: string,
): Promise<void> {
  await deleteLocalModelFile(projectId);
}