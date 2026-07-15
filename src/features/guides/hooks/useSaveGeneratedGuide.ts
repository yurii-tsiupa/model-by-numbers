import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generatedGuidesService } from "../services/generatedGuides.service";
import type { SaveGeneratedGuideInput } from "../types/GeneratedGuide";
import type { GeneratedGuide } from "../types/GeneratedGuide";
import { generatedGuidesKey } from "./useGeneratedGuides";

export function useSaveGeneratedGuide() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (input: SaveGeneratedGuideInput) => generatedGuidesService.save(input), onSuccess: (guide) => { queryClient.setQueryData(generatedGuidesKey(guide.projectId), (current: GeneratedGuide[] | undefined) => [guide, ...(current ?? [])]); } });
}
