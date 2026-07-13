"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ModelsEmptyState } from "@/features/models/components/ModelsEmptyState";
import { ModelsErrorState } from "@/features/models/components/ModelsErrorState";
import { ModelsGrid } from "@/features/models/components/ModelsGrid";
import { ModelsHeader } from "@/features/models/components/ModelsHeader";
import { ModelsSkeleton } from "@/features/models/components/ModelsSkeleton";
import { NewProjectModal } from "@/features/models/components/NewProjectModal";
import { useDeleteProject } from "@/features/models/hooks/useDeleteProject";
import { useProjects } from "@/features/models/hooks/useProjects";
import type { Project } from "@/features/models/types/Project";

export default function ModelsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] =
    useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<
    string | null
  >(null);

  const projectsQuery = useProjects(user?.uid);
  const deleteProjectMutation = useDeleteProject(user?.uid);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, router, user]);

  async function handleDeleteProject(project: Project) {
    try {
      setDeletingProjectId(project.id);
      await deleteProjectMutation.mutateAsync(project);
    } catch (error) {
      console.error("Failed to delete project:", error);
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
              onDelete={handleDeleteProject}
            />
          )}
        </section>
      </main>

      <NewProjectModal
        userId={user.uid}
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
    </>
  );
}