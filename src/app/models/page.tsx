"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { DeleteProjectModal } from "@/features/models/components/DeleteProjectModal";
import { ModelsEmptyState } from "@/features/models/components/ModelsEmptyState";
import { ModelsErrorState } from "@/features/models/components/ModelsErrorState";
import { ModelsGrid } from "@/features/models/components/ModelsGrid";
import { ModelsHeader } from "@/features/models/components/ModelsHeader";
import { ModelsSkeleton } from "@/features/models/components/ModelsSkeleton";
import { NewProjectModal } from "@/features/models/components/NewProjectModal";
import { useDeleteProject } from "@/features/models/hooks/useDeleteProject";
import { useProjects } from "@/features/models/hooks/useProjects";
import type { Project } from "@/features/models/types/Project";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export default function ModelsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { t } = useTranslation();

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] =
    useState(false);

  const [projectToDelete, setProjectToDelete] =
    useState<Project | null>(null);

  const [deletingProjectId, setDeletingProjectId] = useState<
    string | null
  >(null);

  const [deleteError, setDeleteError] = useState<string | null>(
    null,
  );

  const [thumbnailWarning, setThumbnailWarning] =
    useState(false);

  const projectsQuery = useProjects(user?.uid);
  const deleteProjectMutation = useDeleteProject(user?.uid);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, router, user]);

  function handleRequestDelete(project: Project) {
    setDeleteError(null);
    setProjectToDelete(project);
  }

  function handleCloseDeleteModal() {
    if (deleteProjectMutation.isPending) {
      return;
    }

    setProjectToDelete(null);
    setDeleteError(null);
  }

  async function handleConfirmDelete() {
    if (!projectToDelete) {
      return;
    }

    try {
      setDeleteError(null);
      setDeletingProjectId(projectToDelete.id);

      await deleteProjectMutation.mutateAsync(projectToDelete);

      setProjectToDelete(null);
    } catch (error) {
      console.error("Failed to delete project:", error);
      setDeleteError(t("models.deleteFailed"));
    } finally {
      setDeletingProjectId(null);
    }
  }

  if (isAuthLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6">
        <Loader label={t("models.loading")} />
      </main>
    );
  }

  const projects = projectsQuery.data ?? [];

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
        <ModelsHeader
          user={user}
          onNewProject={() =>
            setIsNewProjectModalOpen(true)
          }
        />

        <section className="relative px-4 pb-16 pt-6 md:px-6 lg:pb-20 lg:pt-8 xl:px-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-4 right-4 top-0 hidden h-px bg-[var(--border)] md:left-6 md:right-6 md:block xl:left-8 xl:right-8"
          />

          {thumbnailWarning ? (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3.5 sm:mb-8 sm:px-5 sm:py-4"
            >
              <div
                aria-hidden="true"
                className="mt-1 flex shrink-0 flex-col gap-1"
              >
                <span className="h-1 w-5 rounded-full bg-[var(--accent)]" />
                <span className="h-1 w-4 rounded-full bg-[var(--accent)] opacity-70" />
                <span className="h-1 w-3 rounded-full bg-[var(--accent)] opacity-40" />
              </div>

              <p className="font-[family-name:var(--font-inter)] text-sm leading-6 text-[var(--text-secondary)]">
                {t("modelImport.thumbnail.warning")}
              </p>
            </div>
          ) : null}

          <div className="min-h-[420px]">
            {projectsQuery.isLoading ? (
              <ModelsSkeleton />
            ) : projectsQuery.isError ? (
              <ModelsErrorState
                onRetry={() => {
                  void projectsQuery.refetch();
                }}
              />
            ) : projects.length === 0 ? (
              <ModelsEmptyState
                onNewProject={() =>
                  setIsNewProjectModalOpen(true)
                }
              />
            ) : (
              <ModelsGrid
                projects={projects}
                deletingProjectId={deletingProjectId}
                onDelete={handleRequestDelete}
              />
            )}
          </div>
        </section>
      </main>

      <NewProjectModal
        userId={user.uid}
        isOpen={isNewProjectModalOpen}
        onClose={() =>
          setIsNewProjectModalOpen(false)
        }
        onThumbnailWarning={() =>
          setThumbnailWarning(true)
        }
      />

      <DeleteProjectModal
        project={projectToDelete}
        isDeleting={deleteProjectMutation.isPending}
        error={deleteError}
        onClose={handleCloseDeleteModal}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />
    </>
  );
}