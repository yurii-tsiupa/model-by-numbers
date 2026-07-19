"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectQueryKeys } from "../constants/project.constants";
import { updateProjectBaseColor } from "../services/projects.service";
import type { Project } from "../types/Project";

export function useUpdateProjectBaseColor(projectId: string, userId: string) {
  const client = useQueryClient();
  return useMutation({
    scope: { id: `project-base-color-${projectId}` },
    mutationFn: (baseColor: string) => updateProjectBaseColor(projectId, userId, baseColor),
    onSuccess: ({ baseColor, updatedAt }) => {
      client.setQueryData<Project>(["project", projectId], (project) =>
        project ? { ...project, baseColor, updatedAt } : project,
      );
      client.setQueriesData<Project[]>({ queryKey: projectQueryKeys.all }, (projects) =>
        projects?.map((project) => project.id === projectId
          ? { ...project, baseColor, updatedAt }
          : project),
      );
      void client.invalidateQueries({ queryKey: projectQueryKeys.all });
    },
  });
}
