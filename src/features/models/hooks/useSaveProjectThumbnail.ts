import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectQueryKeys } from "../constants/project.constants";
import { projectThumbnailService } from "../services/projectThumbnail.service";
import { saveProjectThumbnailReference } from "../services/projects.service";
import type { Project } from "../types/Project";
import type { ProjectThumbnail } from "../types/ProjectThumbnail";
import { projectThumbnailKey } from "./useProjectThumbnail";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string"
      ? resolve(reader.result)
      : reject(new Error("Thumbnail encoding failed."));
    reader.onerror = () => reject(reader.error ?? new Error("Thumbnail encoding failed."));
    reader.readAsDataURL(blob);
  });
}

type SaveProjectThumbnailVariables = {
  thumbnail: ProjectThumbnail;
  userId: string;
};

export function useSaveProjectThumbnail() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ thumbnail, userId }: SaveProjectThumbnailVariables) => {
      const thumbnailUrl = await blobToDataUrl(thumbnail.blob);
      const thumbnailVersion = thumbnail.updatedAt.getTime();
      await projectThumbnailService.saveProjectThumbnail(thumbnail);
      await saveProjectThumbnailReference({
        projectId: thumbnail.projectId,
        userId,
        thumbnailUrl,
        thumbnailVersion,
      });
      return { thumbnailUrl, thumbnailVersion };
    },
    onSuccess: ({ thumbnailUrl, thumbnailVersion }, { thumbnail }) => {
      client.setQueryData(projectThumbnailKey(thumbnail.projectId), thumbnail);
      client.setQueriesData<Project[]>({ queryKey: projectQueryKeys.all }, (projects) =>
        projects?.map((project) => project.id === thumbnail.projectId
          ? { ...project, thumbnailUrl, thumbnailVersion, updatedAt: thumbnail.updatedAt }
          : project),
      );
      void client.invalidateQueries({ queryKey: projectQueryKeys.all });
      void client.invalidateQueries({ queryKey: ["models-local-data"] });
      void client.invalidateQueries({ queryKey: ["saved-guides-library"] });
    },
  });
}
