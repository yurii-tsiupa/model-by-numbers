import type { StorageFile } from "../types/StorageFile";
import type { StorageProvider } from "../types/StorageProvider";

const message = "Firebase Storage provider is not implemented yet.";
export class FirebaseStorageProvider implements StorageProvider {
  save(file: StorageFile): Promise<StorageFile> { void file; throw new Error(message); }
  get(id: string): Promise<StorageFile | null> { void id; throw new Error(message); }
  getManyByEntity(entity: StorageFile["entity"], entityId: string): Promise<StorageFile[]> { void entity; void entityId; throw new Error(message); }
  delete(id: string): Promise<void> { void id; throw new Error(message); }
  deleteByEntity(entity: StorageFile["entity"], entityId: string): Promise<void> { void entity; void entityId; throw new Error(message); }
}
