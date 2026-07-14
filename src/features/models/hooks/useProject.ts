import { useQuery } from "@tanstack/react-query";

import { getProjectById } from "../services/projects.service";

export function useProject(
  projectId: string | undefined,
  userId: string | undefined,
) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => {
      if (!projectId || !userId) {
        throw new Error(
          "Project ID and authenticated user are required.",
        );
      }

      return getProjectById(projectId, userId);
    },
    enabled: Boolean(projectId && userId),
    retry: false,
  });
}