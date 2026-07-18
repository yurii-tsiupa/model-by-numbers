"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import type { Project } from "../types/Project";
import { useDeleteProject } from "../hooks/useDeleteProject";
import { useProjects } from "../hooks/useProjects";
import { DeleteProjectModal } from "./DeleteProjectModal";
import { ModelsEmptyState } from "./ModelsEmptyState";
import { ModelsErrorState } from "./ModelsErrorState";
import { ModelsGrid } from "./ModelsGrid";
import { ModelsHeader } from "./ModelsHeader";
import { ModelsSkeleton } from "./ModelsSkeleton";
import { NewProjectModal } from "./NewProjectModal";

export function ModelsLibrary({ userId, embedded = false }: { userId: string; embedded?: boolean }) {
  const { t } = useTranslation();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [thumbnailWarning, setThumbnailWarning] = useState(false);
  const projectsQuery = useProjects(userId);
  const deleteProjectMutation = useDeleteProject(userId);

  function requestDelete(project: Project) { setDeleteError(null); setProjectToDelete(project); }
  function closeDelete() { if (!deleteProjectMutation.isPending) { setProjectToDelete(null); setDeleteError(null); } }
  async function confirmDelete() {
    if (!projectToDelete) return;
    try { setDeleteError(null); setDeletingProjectId(projectToDelete.id); await deleteProjectMutation.mutateAsync(projectToDelete); setProjectToDelete(null); }
    catch { setDeleteError(t("models.deleteFailed")); }
    finally { setDeletingProjectId(null); }
  }

  const projects = projectsQuery.data ?? [];
  const content = <><div aria-hidden="true" className="pointer-events-none absolute left-4 right-4 top-0 hidden h-px bg-[var(--border)] md:block"/>{thumbnailWarning ? <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3.5"><div aria-hidden="true" className="mt-1 flex shrink-0 flex-col gap-1"><span className="h-1 w-5 rounded-full bg-[var(--accent)]"/><span className="h-1 w-4 rounded-full bg-[var(--accent)] opacity-70"/><span className="h-1 w-3 rounded-full bg-[var(--accent)] opacity-40"/></div><p className="text-sm leading-6 text-[var(--text-secondary)]">{t("modelImport.thumbnail.warning")}</p></div> : null}<div className="min-h-[420px]">{projectsQuery.isLoading ? <ModelsSkeleton/> : projectsQuery.isError ? <ModelsErrorState onRetry={() => void projectsQuery.refetch()}/> : projects.length === 0 ? <ModelsEmptyState onNewProject={() => setIsNewProjectModalOpen(true)}/> : <ModelsGrid projects={projects} deletingProjectId={deletingProjectId} onDelete={requestDelete}/>}</div></>;

  return <>{embedded ? <><div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between"><ProfileSectionHeader title={t("profile.models.title")} description={t("profile.models.description")}/><button type="button" onClick={() => setIsNewProjectModalOpen(true)} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><Plus className="size-4"/>{t("models.new")}</button></div><section className="relative pt-6">{content}</section></> : <><ModelsHeader onNewProject={() => setIsNewProjectModalOpen(true)}/><section className="relative px-4 pb-16 pt-6 md:px-6 lg:pb-20 lg:pt-8 xl:px-8">{content}</section></>}<NewProjectModal userId={userId} isOpen={isNewProjectModalOpen} onClose={() => setIsNewProjectModalOpen(false)} onThumbnailWarning={() => setThumbnailWarning(true)}/><DeleteProjectModal project={projectToDelete} isDeleting={deleteProjectMutation.isPending} error={deleteError} onClose={closeDelete} onConfirm={() => void confirmDelete()}/></>;
}
