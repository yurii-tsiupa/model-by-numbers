import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectQueryKeys } from "../constants/project.constants";
import { projectThumbnailService } from "../services/projectThumbnail.service";
import { saveProjectThumbnailReference } from "../services/projects.service";
import type { Project } from "../types/Project";
import type { ProjectThumbnail } from "../types/ProjectThumbnail";
import { projectThumbnailKey } from "./useProjectThumbnail";

type SaveProjectThumbnailVariables = {
  thumbnail: ProjectThumbnail;
  userId: string;
};

export function useSaveProjectThumbnail() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ thumbnail, userId }: SaveProjectThumbnailVariables) => {
      const thumbnailVersion = thumbnail.updatedAt.getTime();
      await projectThumbnailService.saveProjectThumbnail(thumbnail);
      await saveProjectThumbnailReference({
        projectId: thumbnail.projectId,
        userId,
        thumbnailVersion,
      });
      return { thumbnailVersion };
    },
    onSuccess: ({ thumbnailVersion }, { thumbnail }) => {
      client.setQueryData(projectThumbnailKey(thumbnail.projectId), thumbnail);
      client.setQueriesData<Project[]>({ queryKey: projectQueryKeys.all }, (projects) =>
        projects?.map((project) => project.id === thumbnail.projectId
          ? { ...project, thumbnailUrl: null, thumbnailVersion, updatedAt: thumbnail.updatedAt }
          : project),
      );
      void client.invalidateQueries({ queryKey: projectQueryKeys.all });
      void client.invalidateQueries({ queryKey: ["models-local-data"] });
      void client.invalidateQueries({ queryKey: ["saved-guides-library"] });
    },
  });
}
