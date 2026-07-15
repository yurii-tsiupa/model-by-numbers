import { useQuery } from "@tanstack/react-query";
import { projectThumbnailService } from "../services/projectThumbnail.service";

export const projectThumbnailKey = (projectId: string) => ["project-thumbnail", projectId] as const;
export function useProjectThumbnail(projectId: string) {
  return useQuery({ queryKey: projectThumbnailKey(projectId), queryFn: () => projectThumbnailService.getProjectThumbnail(projectId), enabled: Boolean(projectId), retry: false });
}
