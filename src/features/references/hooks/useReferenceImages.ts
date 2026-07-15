import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { referenceImagesService } from "../services/referenceImages.service";
import type { ReferenceChanges } from "../storage/referenceImageStorage";
import type { ReferenceImage } from "../types/ReferenceImage";
export const referenceImagesKey=(projectId:string)=>["reference-images",projectId] as const;
export function useReferenceImages(projectId:string){return useQuery({queryKey:referenceImagesKey(projectId),queryFn:()=>referenceImagesService.getByProjectId(projectId),retry:false});}
export function useSaveReferences(projectId:string){const c=useQueryClient();return useMutation({mutationFn:(rows:ReferenceImage[])=>referenceImagesService.saveMany(rows),onSuccess:(rows)=>c.setQueryData(referenceImagesKey(projectId),(old:ReferenceImage[]|undefined)=>[...(old??[]),...rows].sort((a,b)=>a.order-b.order))});}
export function useUpdateReference(projectId:string){const c=useQueryClient();return useMutation({mutationFn:({id,changes}:{id:string;changes:ReferenceChanges})=>referenceImagesService.update(id,changes),onSuccess:(row)=>c.setQueryData(referenceImagesKey(projectId),(old:ReferenceImage[]|undefined)=>old?.map(r=>r.id===row.id?row:r))});}
export function useDeleteReference(projectId:string,onDeleted?:(id:string)=>void){const c=useQueryClient();return useMutation({mutationFn:(id:string)=>referenceImagesService.delete(id),onSuccess:(_,id)=>{c.setQueryData(referenceImagesKey(projectId),(old:ReferenceImage[]|undefined)=>old?.filter(r=>r.id!==id));onDeleted?.(id);}});}
