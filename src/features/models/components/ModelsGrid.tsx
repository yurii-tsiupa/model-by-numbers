"use client";

import type { Project } from "../types/Project";
import { ModelCard } from "./ModelCard";

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
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ModelCard
          key={project.id}
          project={project}
          isDeleting={deletingProjectId === project.id}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}