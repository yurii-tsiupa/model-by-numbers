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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to delete the project. Please try again.";
}

export default function ModelsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

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
      setDeleteError(getErrorMessage(error));
    } finally {
      setDeletingProjectId(null);
    }
  }

  if (isAuthLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
        <Loader label="Loading your workspace..." />
      </main>
    );
  }

  const projects = projectsQuery.data ?? [];

  return (
    <>
      <main className="min-h-screen bg-neutral-950 text-white">
        <ModelsHeader
          user={user}
          onNewProject={() => setIsNewProjectModalOpen(true)}
        />

        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
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
        </section>
      </main>

      <NewProjectModal
        userId={user.uid}
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
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