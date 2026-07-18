"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateUserGuideTemplateInput } from "../types/GuideLibraryTemplate";
import { guideTemplateStorage } from "../services/guideTemplateStorage";

const key=(userId:string)=>["guide-templates",userId] as const;
export function useGuideTemplates(userId:string|undefined){return useQuery({queryKey:key(userId??""),queryFn:()=>guideTemplateStorage.getByUserId(userId??""),enabled:Boolean(userId),retry:false});}
export function useCreateGuideTemplate(userId:string|undefined){const client=useQueryClient();return useMutation({mutationFn:(input:CreateUserGuideTemplateInput)=>{if(!userId)throw new Error("Authentication required.");return guideTemplateStorage.create(userId,input)},onSuccess:async()=>{if(userId)await client.invalidateQueries({queryKey:key(userId)})}})}
export function useDeleteGuideTemplate(userId:string|undefined){const client=useQueryClient();return useMutation({mutationFn:(id:string)=>{if(!userId)throw new Error("Authentication required.");return guideTemplateStorage.delete(userId,id)},onSuccess:async()=>{if(userId)await client.invalidateQueries({queryKey:key(userId)})}})}
