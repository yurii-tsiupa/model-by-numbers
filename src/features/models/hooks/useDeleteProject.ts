"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { projectQueryKeys } from "../constants/project.constants";
import { deleteProject } from "../services/projects.service";
import type { Project } from "../types/Project";
import { projectThumbnailService } from "../services/projectThumbnail.service";
import { generatedGuidesService } from "@/features/guides/services/generatedGuides.service";
import { referenceImagesService } from "@/features/references/services/referenceImages.service";
import { deleteAssemblyStepImagesByProjectId } from "@/features/model-editor/services/assemblyStepImage.service";
import { deleteGuideAssetFiles } from "@/features/storage/services/storage.service";

export function useDeleteProject(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Project) => {
      await deleteProject(project);
      await Promise.allSettled([
        projectThumbnailService.deleteProjectThumbnail(project.id),
        generatedGuidesService.deleteByProjectId(project.id),
        referenceImagesService.deleteByProjectId(project.id),
        deleteAssemblyStepImagesByProjectId(project.id),
        deleteGuideAssetFiles(project.id),
      ]);
    },

    onSuccess: async () => {
      if (!userId) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: projectQueryKeys.list(userId),
      });
    },
  });
}
