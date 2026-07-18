"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useProjects } from "@/features/models/hooks/useProjects";
import { projectThumbnailService } from "@/features/models/services/projectThumbnail.service";
import { generatedGuidesService } from "../services/generatedGuides.service";
import { selectSavedGuides } from "../lib/selectSavedGuides";

export function useSavedGuides(userId: string | undefined) {
  const projectsQuery = useProjects(userId);
  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);
  const projectIds = useMemo(() => projects.map(project => project.id).sort(), [projects]);
  const libraryQuery = useQuery({
    queryKey: ["saved-guides-library", projectIds],
    queryFn: async () => { const [guides, thumbnails] = await Promise.all([generatedGuidesService.getAll(), projectThumbnailService.getProjectThumbnails(projectIds)]); return { guides, thumbnails }; },
    enabled: projectsQuery.isSuccess && projectIds.length > 0,
    retry: false,
  });
  const guides = useMemo(() => selectSavedGuides(projects, libraryQuery.data?.guides ?? [], libraryQuery.data?.thumbnails ?? []), [libraryQuery.data, projects]);
  return {
    guides,
    projectCount: projects.length,
    isLoading: projectsQuery.isLoading || (projectIds.length > 0 && libraryQuery.isLoading),
    isError: projectsQuery.isError || libraryQuery.isError,
    refetch: async () => { await projectsQuery.refetch(); if (projectIds.length > 0) await libraryQuery.refetch(); },
  };
}
