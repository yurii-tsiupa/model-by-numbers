import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectThumbnailService } from "../services/projectThumbnail.service";
import type { ProjectThumbnail } from "../types/ProjectThumbnail";
import { projectThumbnailKey } from "./useProjectThumbnail";

export function useSaveProjectThumbnail() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (thumbnail: ProjectThumbnail) => projectThumbnailService.saveProjectThumbnail(thumbnail), onSuccess: (_, thumbnail) => { client.setQueryData(projectThumbnailKey(thumbnail.projectId), thumbnail); void client.invalidateQueries({ queryKey: ["models-local-data"] }); } });
}
