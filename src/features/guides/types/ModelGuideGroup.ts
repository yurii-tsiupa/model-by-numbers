import type { Project } from "@/features/models/types/Project";
import type { ProjectThumbnail } from "@/features/models/types/ProjectThumbnail";
import type { SavedGuide } from "./SavedGuide";

export type ModelGuideGroup = {
  project: Project;
  thumbnail: ProjectThumbnail | null;
  updatedAt: Date;
  guides: SavedGuide[];
};
