"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { generatedGuidesService } from "../services/generatedGuides.service";
import { generatedGuidesFirestoreService, reportGeneratedGuideSyncFailure } from "../services/generatedGuidesFirestore.service";
import { generatedGuidesKey } from "./useGeneratedGuides";

export function useDeleteGeneratedGuidesByProject(projectId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: () => generatedGuidesService.deleteByProjectId(projectId),
    onSuccess: () => {
      queryClient.setQueryData(generatedGuidesKey(projectId), []);
      void queryClient.invalidateQueries({ queryKey: ["saved-guides-library"] });
      if (user?.uid) void generatedGuidesFirestoreService.deleteByProjectId(user.uid, projectId).catch((error) => reportGeneratedGuideSyncFailure("delete", error));
    },
  });
}
