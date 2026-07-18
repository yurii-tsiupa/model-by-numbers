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
    <div className="flex flex-wrap justify-center gap-5">
      {projects.map((project) => (
        <div
          key={project.id}
          className="w-full max-w-[420px] flex-1 basis-[340px]"
        >
          <ModelCard
            project={project}
            isDeleting={deletingProjectId === project.id}
            onDelete={onDelete}
            thumbnail={localData.data?.thumbnails.get(project.id) ?? null}
            latestGuide={localData.data?.latestGuides.get(project.id) ?? null}
            isLocalDataLoading={localData.isLoading}
          />
        </div>
      ))}
    </div>
  );
}
