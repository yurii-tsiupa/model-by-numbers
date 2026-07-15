import { useQuery } from "@tanstack/react-query";
import { generatedGuidesService } from "../services/generatedGuides.service";

export const generatedGuidesKey = (projectId: string) => ["generated-guides", projectId] as const;

export function useGeneratedGuides(projectId: string) {
  return useQuery({ queryKey: generatedGuidesKey(projectId), queryFn: () => generatedGuidesService.getByProjectId(projectId), enabled: Boolean(projectId), retry: false });
}

export function useGeneratedGuide(guideId: string) {
  return useQuery({ queryKey: ["generated-guide", guideId], queryFn: () => generatedGuidesService.getById(guideId), enabled: Boolean(guideId), retry: false });
}
