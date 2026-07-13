import {
  ACCEPTED_MODEL_EXTENSIONS,
  MAX_MODEL_FILE_SIZE,
} from "../constants/project.constants";

type UploadModelParams = {
  userId: string;
  projectId: string;
  file: File;
  onProgress?: (progress: number) => void;
};

export type UploadedModel = {
  downloadUrl: null;
  storagePath: null;
  originalFileName: string;
  originalFileSize: number;
  originalFileType: string;
};

function validateModelFile(file: File): void {
  const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;

  if (
    !ACCEPTED_MODEL_EXTENSIONS.includes(
      extension as (typeof ACCEPTED_MODEL_EXTENSIONS)[number],
    )
  ) {
    throw new Error("Only .glb files are currently supported.");
  }

  if (file.size === 0) {
    throw new Error("The selected file is empty.");
  }

  if (file.size > MAX_MODEL_FILE_SIZE) {
    throw new Error("The model file must not exceed 50 MB.");
  }
}

function wait(duration: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

export async function uploadModel({
  file,
  onProgress,
}: UploadModelParams): Promise<UploadedModel> {
  validateModelFile(file);

  // Temporary local-only upload simulation.
  // The file is not sent to Firebase Storage.
  const progressSteps = [10, 25, 45, 70, 90, 100];

  for (const progress of progressSteps) {
    await wait(120);
    onProgress?.(progress);
  }

  return {
    downloadUrl: null,
    storagePath: null,
    originalFileName: file.name,
    originalFileSize: file.size,
    originalFileType: file.type || "model/gltf-binary",
  };
}

export async function deleteModelFile(
  _storagePath: string | null,
): Promise<void> {
  // Temporary no-op until Firebase Storage is enabled.
}