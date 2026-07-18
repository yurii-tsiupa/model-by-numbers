import type { GeneratedGuide } from "./GeneratedGuide";
import type { Project } from "@/features/models/types/Project";
import type { ProjectThumbnail } from "@/features/models/types/ProjectThumbnail";

export type GuideLibraryStatus = "ready" | "incomplete";

export type SavedGuide = {
  guide: GeneratedGuide;
  project: Project;
  thumbnail: ProjectThumbnail | null;
  status: GuideLibraryStatus;
};
