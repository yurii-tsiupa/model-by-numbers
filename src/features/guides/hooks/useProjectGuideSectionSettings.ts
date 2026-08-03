"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Project } from "@/features/models/types/Project";
import { saveProjectGuideSectionSettings } from "@/features/models/services/projects.service";

import type { GuideSectionSettings } from "../types/GuideSectionSettings";

export function useProjectGuideSectionSettings(project: Project | undefined, userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: GuideSectionSettings) => {
      if (!project || !userId) throw new Error("Authentication required.");
      await saveProjectGuideSectionSettings(project.id, userId, settings);
      return settings;
    },
    onMutate: async (settings) => {
      const queryKey = ["project", project?.id] as const;
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Project>(queryKey);
      queryClient.setQueryData<Project>(queryKey, (current) => current ? { ...current, guideSectionSettings: settings } : current);
      return { previous, queryKey };
    },
    onError: (_error, _settings, context) => {
      if (context?.previous) queryClient.setQueryData(context.queryKey, context.previous);
    },
  });
}
