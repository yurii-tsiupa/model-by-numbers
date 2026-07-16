import type { StorageFile } from "./StorageFile";

/** Keeps feature code independent of the current browser or future cloud backend. */
export interface StorageProvider {
  save(file: StorageFile): Promise<StorageFile>;
  get(id: string): Promise<StorageFile | null>;
  getManyByEntity(entity: StorageFile["entity"], entityId: string): Promise<StorageFile[]>;
  delete(id: string): Promise<void>;
  deleteByEntity(entity: StorageFile["entity"], entityId: string): Promise<void>;
}
