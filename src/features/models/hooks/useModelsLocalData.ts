import { useQuery } from "@tanstack/react-query";
import { generatedGuidesService } from "@/features/guides/services/generatedGuides.service";
import { projectThumbnailService } from "../services/projectThumbnail.service";

export function useModelsLocalData(projectIds: readonly string[]) {
  const stableIds = [...projectIds].sort();
  return useQuery({
    queryKey: ["models-local-data", stableIds],
    queryFn: async () => {
      const [thumbnails, guides] = await Promise.all([projectThumbnailService.getProjectThumbnails(stableIds), generatedGuidesService.getAll()]);
      return {
        thumbnails: new Map(thumbnails.map((thumbnail) => [thumbnail.projectId, thumbnail])),
        latestGuides: new Map(stableIds.flatMap((projectId) => { const latest = guides.filter((guide) => guide.projectId === projectId).sort((a, b) => b.version - a.version)[0]; return latest ? [[projectId, latest] as const] : []; })),
      };
    },
    enabled: stableIds.length > 0,
    retry: false,
  });
}
