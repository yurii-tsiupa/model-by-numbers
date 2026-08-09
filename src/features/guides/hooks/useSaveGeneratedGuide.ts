import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generatedGuidesService } from "../services/generatedGuides.service";
import type { SaveGeneratedGuideInput } from "../types/GeneratedGuide";
import type { GeneratedGuide } from "../types/GeneratedGuide";
import { generatedGuidesKey } from "./useGeneratedGuides";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { generatedGuidesFirestoreService, reportGeneratedGuideSyncFailure } from "../services/generatedGuidesFirestore.service";

export function useSaveGeneratedGuide() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({ mutationFn: (input: SaveGeneratedGuideInput) => generatedGuidesService.save(input), onSuccess: (guide) => { queryClient.setQueryData(generatedGuidesKey(guide.projectId), (current: GeneratedGuide[] | undefined) => [guide, ...(current ?? []).filter((item) => item.id !== guide.id)]); void queryClient.invalidateQueries({ queryKey: ["saved-guides-library"] }); if (user?.uid) void generatedGuidesFirestoreService.save(user.uid, guide).catch((error) => reportGeneratedGuideSyncFailure("save", error)); } });
}
