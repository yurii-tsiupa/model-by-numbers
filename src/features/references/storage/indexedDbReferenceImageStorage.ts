import { deleteReference, deleteReferences, loadReference, loadReferences, saveReference } from "@/features/storage/services/storage.service";
import type { StorageFile } from "@/features/storage/types/StorageFile";
import type { ReferenceImage } from "../types/ReferenceImage";
import type { ReferenceChanges, ReferenceImageStorage } from "./referenceImageStorage";

const toFile = (reference: ReferenceImage): StorageFile => ({ id:reference.id, entity:"reference", entityId:reference.projectId, fileName:reference.name, mimeType:reference.mimeType, blob:reference.blob, size:reference.size, createdAt:reference.createdAt, updatedAt:reference.updatedAt, metadata:reference });
const toReference = (file: StorageFile): ReferenceImage => file.metadata as ReferenceImage;

class IndexedDbReferenceImageStorage implements ReferenceImageStorage {
  async getByProjectId(projectId:string){return (await loadReferences(projectId)).map(toReference).sort((a,b)=>a.order-b.order);}
  async saveMany(references:ReferenceImage[]){await Promise.all(references.map(reference=>saveReference(toFile(reference))));return references;}
  async update(id:string,changes:ReferenceChanges){const file=await loadReference(id);if(!file||file.entity!=="reference")throw new Error("This reference is no longer available.");const current=toReference(file);const updated={...current,...changes,updatedAt:new Date()};await saveReference(toFile(updated));return updated;}
  delete(id:string){return deleteReference(id);}
  deleteByProjectId(projectId:string){return deleteReferences(projectId);}
}
export const indexedDbReferenceImageStorage=new IndexedDbReferenceImageStorage();
