import type { GeneratedGuide } from "../types/GeneratedGuide";
import type { SavedGuide } from "../types/SavedGuide";
import type { Project } from "@/features/models/types/Project";
import type { ProjectThumbnail } from "@/features/models/types/ProjectThumbnail";

export function selectSavedGuides(projects: readonly Project[], guides: readonly GeneratedGuide[], thumbnails: readonly ProjectThumbnail[]): SavedGuide[] {
  const projectsById = new Map(projects.map(project => [project.id, project]));
  const thumbnailsByProjectId = new Map(thumbnails.map(thumbnail => [thumbnail.projectId, thumbnail]));
  return guides.flatMap(guide => {
    const project = projectsById.get(guide.projectId);
    if (!project) return [];
    return [{ guide, project, thumbnail: thumbnailsByProjectId.get(project.id) ?? null, status: guide.status === "ready" ? "ready" as const : "incomplete" as const }];
  });
}
