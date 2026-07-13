"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { projectQueryKeys } from "../constants/project.constants";
import { createProject } from "../services/projects.service";
import type { CreateProjectInput } from "../types/Project";

export type CreateProjectVariables = CreateProjectInput & {
  onUploadProgress?: (progress: number) => void;
};

export function useCreateProject(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: CreateProjectVariables) =>
      createProject(variables),

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