import { deleteAssemblyImageFile, deleteAssemblyImageFiles, loadAssemblyImageFile, saveAssemblyImageFile } from "@/features/storage/services/storage.service";

export type StoredAssemblyStepImage = {
  key: string;
  projectId: string;
  stepId: string;
  blob: Blob;
  fileName: string;
  mimeType: "image/webp" | "image/png";
  size: number;
  createdAt: Date;
  updatedAt: Date;
};

export const getAssemblyStepImageKey = (projectId: string, stepId: string) => `assembly-step:${projectId}:${stepId}`;

export async function saveAssemblyStepImage({ projectId, stepId, blob, fileName }: { projectId: string; stepId: string; blob: Blob; fileName: string }): Promise<StoredAssemblyStepImage> {
  if (blob.size <= 0 || (blob.type !== "image/webp" && blob.type !== "image/png")) throw new Error("Invalid assembly image.");
  const key = getAssemblyStepImageKey(projectId, stepId);
  const existing = await loadAssemblyImageFile(key);
  const now = new Date();
  const mimeType = blob.type as "image/webp" | "image/png";
  await saveAssemblyImageFile({ id:key, entity:"assembly-step-image", entityId:projectId, fileName, mimeType, blob, size:blob.size, createdAt:existing?.createdAt??now, updatedAt:now, metadata:{projectId,stepId} });
  return { key, projectId, stepId, blob, fileName, mimeType, size:blob.size, createdAt:existing?.createdAt??now, updatedAt:now };
}

export async function getAssemblyStepImage(projectId: string, stepId: string): Promise<Blob|null> { const file=await loadAssemblyImageFile(getAssemblyStepImageKey(projectId,stepId)); return file?.entity==="assembly-step-image"?file.blob:null; }
export const deleteAssemblyStepImage = (projectId:string,stepId:string) => deleteAssemblyImageFile(getAssemblyStepImageKey(projectId,stepId));
export const deleteAssemblyStepImagesByProjectId = (projectId:string) => deleteAssemblyImageFiles(projectId);
