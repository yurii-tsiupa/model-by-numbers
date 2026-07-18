"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Project } from "@/features/models/types/Project";
import { saveProjectGuideTemplate } from "@/features/models/services/projects.service";
import { useGuideTemplates } from "./useGuideTemplates";
import { resolveGuideTemplate } from "../lib/resolveGuideTemplate";

export function useCurrentGuideTemplate(project:Project|undefined,userId:string|undefined,overrideTemplateId?:string){const templates=useGuideTemplates(userId);const queryClient=useQueryClient();const selectedId=overrideTemplateId??project?.selectedGuideTemplateId;const current=resolveGuideTemplate(selectedId,templates.data??[]);const selection=useMutation({mutationFn:async(templateId:string)=>{if(!project||!userId)throw new Error("Authentication required.");await saveProjectGuideTemplate(project.id,userId,templateId);return templateId},onSuccess:templateId=>{queryClient.setQueryData<Project>(["project",project?.id],value=>value?{...value,selectedGuideTemplateId:templateId}:value)}});return{current,templates:templates.data??[],isLoading:templates.isLoading,select:selection.mutateAsync,isSelecting:selection.isPending} as const;}
