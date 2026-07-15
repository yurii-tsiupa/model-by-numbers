import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generatedGuidesService } from "../services/generatedGuides.service";
import { generatedGuidesKey } from "./useGeneratedGuides";

export function useDeleteGeneratedGuide(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (guideId: string) => generatedGuidesService.delete(guideId), onSuccess: (_, guideId) => { queryClient.setQueryData(generatedGuidesKey(projectId), (current: Array<{ id: string }> | undefined) => current?.filter((guide) => guide.id !== guideId)); queryClient.removeQueries({ queryKey: ["generated-guide", guideId] }); } });
}
