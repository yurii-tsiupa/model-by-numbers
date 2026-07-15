"use client";

import type { Project } from "../types/Project";
import { ModelCard } from "./ModelCard";
import { useModelsLocalData } from "../hooks/useModelsLocalData";

type ModelsGridProps = {
  projects: Project[];
  deletingProjectId: string | null;
  onDelete: (project: Project) => void;
};

export function ModelsGrid({
  projects,
  deletingProjectId,
  onDelete,
}: ModelsGridProps) {
  const localData = useModelsLocalData(projects.map((project) => project.id));
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ModelCard
          key={project.id}
          project={project}
          isDeleting={deletingProjectId === project.id}
          onDelete={onDelete}
          thumbnail={localData.data?.thumbnails.get(project.id) ?? null}
          latestGuide={localData.data?.latestGuides.get(project.id) ?? null}
          isLocalDataLoading={localData.isLoading}
        />
      ))}
    </div>
  );
}
