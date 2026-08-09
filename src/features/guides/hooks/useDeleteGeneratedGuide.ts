import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generatedGuidesService } from "../services/generatedGuides.service";
import { generatedGuidesKey } from "./useGeneratedGuides";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { generatedGuidesFirestoreService, reportGeneratedGuideSyncFailure } from "../services/generatedGuidesFirestore.service";

export function useDeleteGeneratedGuide(projectId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({ mutationFn: (guideId: string) => generatedGuidesService.delete(guideId), onSuccess: (_, guideId) => { queryClient.setQueryData(generatedGuidesKey(projectId), (current: Array<{ id: string }> | undefined) => current?.filter((guide) => guide.id !== guideId)); queryClient.removeQueries({ queryKey: ["generated-guide", guideId] }); void queryClient.invalidateQueries({ queryKey: ["saved-guides-library"] }); if (user?.uid) void generatedGuidesFirestoreService.delete(user.uid, projectId, guideId).catch((error) => reportGeneratedGuideSyncFailure("delete", error)); } });
}
