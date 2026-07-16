export type StorageEntity = "guide" | "reference" | "thumbnail" | "assembly-step-image";

export type StorageFile = {
  id: string;
  ownerId?: string;
  entity: StorageEntity;
  entityId: string;
  fileName: string;
  mimeType: string;
  blob: Blob;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Readonly<Record<string, unknown>>;
};
