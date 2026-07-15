import type { ProjectThumbnail } from "../types/ProjectThumbnail";

export interface ProjectThumbnailStorage {
  getProjectThumbnail(projectId: string): Promise<ProjectThumbnail | null>;
  getProjectThumbnails(projectIds: readonly string[]): Promise<ProjectThumbnail[]>;
  saveProjectThumbnail(thumbnail: ProjectThumbnail): Promise<void>;
  deleteProjectThumbnail(projectId: string): Promise<void>;
}
