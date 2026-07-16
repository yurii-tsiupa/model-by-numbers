import { LocalStorageProvider } from "../providers/LocalStorageProvider";
import type { StorageFile } from "../types/StorageFile";

// Replacing this instance is the only provider-selection change needed for Firebase Storage.
const provider = new LocalStorageProvider();

export const saveReference = (file: StorageFile) => provider.save(file);
export const saveThumbnail = (file: StorageFile) => provider.save(file);
export const saveGuidePdf = (file: StorageFile) => provider.save(file);
export const loadReference = (id: string) => provider.get(id);
export const loadThumbnail = (projectId: string) => provider.getManyByEntity("thumbnail", projectId).then(files => files[0] ?? null);
export const loadReferences = (projectId: string) => provider.getManyByEntity("reference", projectId);
export const loadGuidePdfs = (projectId: string) => provider.getManyByEntity("guide", projectId);
export const deleteReference = (id: string) => provider.delete(id);
export const deleteReferences = (projectId: string) => provider.deleteByEntity("reference", projectId);
export const deleteThumbnail = (projectId: string) => provider.deleteByEntity("thumbnail", projectId);
export const deleteGuidePdfs = (projectId: string) => provider.deleteByEntity("guide", projectId);
