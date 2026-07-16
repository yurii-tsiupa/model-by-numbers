import { deleteThumbnail, loadThumbnail, saveThumbnail } from "@/features/storage/services/storage.service";
import type { StorageFile } from "@/features/storage/types/StorageFile";
import type { ProjectThumbnail } from "../types/ProjectThumbnail";
import type { ProjectThumbnailStorage } from "./projectThumbnailStorage";

const toFile=(thumbnail:ProjectThumbnail):StorageFile=>({id:thumbnail.projectId,entity:"thumbnail",entityId:thumbnail.projectId,fileName:`${thumbnail.projectId}-thumbnail`,mimeType:thumbnail.mimeType,blob:thumbnail.blob,size:thumbnail.blob.size,createdAt:thumbnail.createdAt,updatedAt:thumbnail.updatedAt,metadata:thumbnail});
const toThumbnail=(file:StorageFile):ProjectThumbnail=>file.metadata as ProjectThumbnail;
class IndexedDbProjectThumbnailStorage implements ProjectThumbnailStorage {
 async getProjectThumbnail(projectId:string){const file=await loadThumbnail(projectId);return file?toThumbnail(file):null;}
 async getProjectThumbnails(projectIds:readonly string[]){return (await Promise.all(projectIds.map(id=>this.getProjectThumbnail(id)))).filter((row):row is ProjectThumbnail=>row!==null);}
 async saveProjectThumbnail(thumbnail:ProjectThumbnail){await saveThumbnail(toFile(thumbnail));}
 deleteProjectThumbnail(projectId:string){return deleteThumbnail(projectId);}
}
export const indexedDbProjectThumbnailStorage=new IndexedDbProjectThumbnailStorage();
