"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { saveProjectGuideTemplate, saveProjectGuideTemplateSettings } from "@/features/models/services/projects.service";
import type { Project } from "@/features/models/types/Project";

import { resolveGuideTemplate } from "../lib/resolveGuideTemplate";
import type { GuideTemplateSettings } from "../types/GuideLibraryTemplate";
import { useGuideTemplates } from "./useGuideTemplates";
import { defaultGuideDesignTokens } from "@/features/guides/design/guideDesignTokens";

export function useCurrentGuideTemplate(project: Project | undefined, userId: string | undefined, overrideTemplateId?: string) {
  const templates = useGuideTemplates(userId);
  const queryClient = useQueryClient();
  const queryKey = ["project", project?.id] as const;
  const selectedId = overrideTemplateId ?? project?.selectedGuideTemplateId;
  const resolvedTemplate = resolveGuideTemplate(selectedId, templates.data ?? []);
  const current = {
    ...resolvedTemplate,
    settings: {
      ...resolvedTemplate.settings,
      ...project?.guideTemplateSettings,
      accentColor: project?.guideTemplateSettings?.accentColor ?? defaultGuideDesignTokens.accentColor,
    },
  } as typeof resolvedTemplate;

  const selection = useMutation({
    mutationFn: async (templateId: string) => {
      if (!project || !userId) throw new Error("Authentication required.");
      await saveProjectGuideTemplate(project.id, userId, templateId);
      return templateId;
    },
    onSuccess: (templateId) => {
      queryClient.setQueryData<Project>(queryKey, (value) => value ? { ...value, selectedGuideTemplateId: templateId } : value);
    },
  });

  const settingsUpdate = useMutation({
    mutationFn: async (settings: Partial<GuideTemplateSettings>) => {
      if (!project || !userId) throw new Error("Authentication required.");
      const nextSettings = { ...project.guideTemplateSettings, ...settings };
      await saveProjectGuideTemplateSettings(project.id, userId, nextSettings);
      return nextSettings;
    },
    onMutate: async (settings) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Project>(queryKey);
      queryClient.setQueryData<Project>(queryKey, (value) => value
        ? { ...value, guideTemplateSettings: { ...value.guideTemplateSettings, ...settings } }
        : value);
      return { previous };
    },
    onError: (_error, _settings, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
  });

  return {
    current,
    templates: templates.data ?? [],
    isLoading: templates.isLoading,
    select: selection.mutateAsync,
    isSelecting: selection.isPending,
    updateSettings: settingsUpdate.mutateAsync,
    isUpdatingSettings: settingsUpdate.isPending,
  } as const;
}
