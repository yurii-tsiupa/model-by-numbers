"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { projectQueryKeys } from "../constants/project.constants";
import { deleteProject } from "../services/projects.service";
import type { Project } from "../types/Project";

export function useDeleteProject(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: Project) => deleteProject(project),

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