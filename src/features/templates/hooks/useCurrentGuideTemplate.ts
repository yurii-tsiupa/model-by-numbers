"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { saveProjectGuideTemplate, saveProjectGuideTemplateSettings } from "@/features/models/services/projects.service";
import type { Project } from "@/features/models/types/Project";

import { resolveGuideTemplate } from "../lib/resolveGuideTemplate";
import type { GuideTemplateSettings } from "../types/GuideLibraryTemplate";
import { useGuideTemplates } from "./useGuideTemplates";
import { defaultGuideDesignTokens } from "@/features/guides/design/guideDesignTokens";
import { useResolvedGuideTemplateAssets } from "./useResolvedGuideTemplateAssets";
import { imageSourceToBlob, saveGuideAsset } from "@/features/guides/services/assets/saveGuideAsset";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { createGuideSettingsFromUserBrandDefaults } from "@/features/guides/lib/createGuideSettingsFromUserBrandDefaults";

type CurrentGuideTemplateOptions = {
  draft?: { settings: GuideTemplateSettings; templateId: string; onSettingsChange: (settings: Partial<GuideTemplateSettings>) => void; onTemplateChange: (templateId: string, settings: GuideTemplateSettings) => void };
  savedSettings?: GuideTemplateSettings;
};

export function useCurrentGuideTemplate(project: Project | undefined, userId: string | undefined, overrideTemplateId?: string, options?: CurrentGuideTemplateOptions) {
  const { profile } = useAuth();
  const templates = useGuideTemplates(userId);
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["project", project?.id] as const, [project?.id]);
  const selectedId = options?.draft?.templateId ?? overrideTemplateId ?? project?.selectedGuideTemplateId;
  const resolvedTemplate = resolveGuideTemplate(selectedId, templates.data ?? []);
  const profileSeededSettings = profile && options?.draft && !options.draft.settings
    ? createGuideSettingsFromUserBrandDefaults(resolvedTemplate.settings, profile.brandDefaults)
    : null;
  const persistedSettings = options?.draft?.settings ?? options?.savedSettings ?? project?.guideTemplateSettings;
  const unresolvedCurrent = {
    ...resolvedTemplate,
    settings: {
      ...resolvedTemplate.settings,
      ...profileSeededSettings,
      ...persistedSettings,
      accentColor: persistedSettings?.accentColor ?? profileSeededSettings?.accentColor ?? defaultGuideDesignTokens.accentColor,
    },
  } as typeof resolvedTemplate;
  const resolvedSettings = useResolvedGuideTemplateAssets(unresolvedCurrent.settings, project?.id);
  const current = { ...unresolvedCurrent, settings: resolvedSettings };

  const selection = useMutation({
    mutationFn: async (templateId: string) => {
      if (!project || !userId) throw new Error("Authentication required.");
      if (options?.draft) {
        const selected = resolveGuideTemplate(templateId, templates.data ?? []);
        options.draft.onTemplateChange(templateId, profile ? createGuideSettingsFromUserBrandDefaults(selected.settings, profile.brandDefaults) : structuredClone(selected.settings));
        return templateId;
      }
      await saveProjectGuideTemplate(project.id, userId, templateId);
      return templateId;
    },
    onSuccess: (templateId) => {
      if (options?.draft) return;
      queryClient.setQueryData<Project>(queryKey, (value) => value ? { ...value, selectedGuideTemplateId: templateId } : value);
    },
  });

  const settingsUpdate = useMutation({
    mutationFn: async (settings: Partial<GuideTemplateSettings>) => {
      if (!project || !userId) throw new Error("Authentication required.");
      if (options?.draft) { options.draft.onSettingsChange(settings); return { ...options.draft.settings, ...settings }; }
      const nextSettings = { ...project.guideTemplateSettings, ...settings };
      await saveProjectGuideTemplateSettings(project.id, userId, nextSettings);
      return nextSettings;
    },
    onMutate: async (settings) => {
      if (options?.draft || options?.savedSettings) return {};
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

  const migratedInlineAssetsRef = useRef<string | null>(null);
  useEffect(() => {
    if (!project || !userId || options?.draft || options?.savedSettings) return;
    const branding = unresolvedCurrent.settings.branding;
    const backgrounds = unresolvedCurrent.settings.backgroundItems;
    const inlineLogo = branding.logoUrl?.startsWith("data:image/") && !branding.logoAssetId;
    const inlineBackgrounds = backgrounds.filter((item) => item.imageUrl?.startsWith("data:image/") && !item.localAssetId);
    if (!inlineLogo && !inlineBackgrounds.length) return;
    const signature = `${inlineLogo ? branding.logoUrl?.length : 0}:${inlineBackgrounds.map((item) => `${item.id}:${item.imageUrl?.length}`).join("|")}`;
    if (migratedInlineAssetsRef.current === signature) return;
    migratedInlineAssetsRef.current = signature;
    void (async () => {
      try {
        const nextBranding = inlineLogo && branding.logoUrl
          ? { ...branding, logoAssetId: (await saveGuideAsset({ projectId: project.id, kind: "branding-logo", assetId: crypto.randomUUID(), blob: await imageSourceToBlob(branding.logoUrl) })).storageKey }
          : branding;
        const nextBackgrounds = await Promise.all(backgrounds.map(async (item) => item.imageUrl?.startsWith("data:image/") && !item.localAssetId
          ? { ...item, localAssetId: (await saveGuideAsset({ projectId: project.id, kind: "pdf-background", assetId: item.id, blob: await imageSourceToBlob(item.imageUrl) })).storageKey }
          : item));
        await settingsUpdate.mutateAsync({ branding: nextBranding, backgroundItems: nextBackgrounds });
      } catch { migratedInlineAssetsRef.current = null; }
    })();
  }, [options?.draft, options?.savedSettings, project, settingsUpdate, unresolvedCurrent.settings.backgroundItems, unresolvedCurrent.settings.branding, userId]);

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
