"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { projectQueryKeys } from "../constants/project.constants";
import { createProject } from "../services/projects.service";
import type {
  CreateProjectInput,
  Project,
} from "../types/Project";

export type CreateProjectVariables = CreateProjectInput & {
  onUploadProgress?: (progress: number) => void;
};

export function useCreateProject(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: CreateProjectVariables) =>
      createProject(variables),

    onSuccess: async (createdProject) => {
      if (!userId) {
        return;
      }

      const queryKey = projectQueryKeys.list(userId);

      queryClient.setQueryData<Project[]>(
        queryKey,
        (currentProjects = []) => {
          const projectAlreadyExists = currentProjects.some(
            (project) => project.id === createdProject.id,
          );

          if (projectAlreadyExists) {
            return currentProjects;
          }

          return [createdProject, ...currentProjects];
        },
      );

      await queryClient.invalidateQueries({
        queryKey,
      });
    },
  });
}