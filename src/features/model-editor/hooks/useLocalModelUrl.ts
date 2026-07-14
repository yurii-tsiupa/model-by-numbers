"use client";

import { useEffect, useState } from "react";

import { loadLocalModelFile } from "@/features/models/services/storage.service";

type LocalModelUrlState = {
  modelUrl: string | null;
  isLoading: boolean;
  error: Error | null;
};

export function useLocalModelUrl({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}): LocalModelUrlState {
  const [state, setState] = useState<LocalModelUrlState>({
    modelUrl: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isActive = true;
    let objectUrl: string | null = null;

    async function loadModel() {
      setState({
        modelUrl: null,
        isLoading: true,
        error: null,
      });

      try {
        const file = await loadLocalModelFile({
          projectId,
          userId,
        });

        if (!file) {
          throw new Error(
            "The model file was not found in this browser. It may have been created on another device or removed from local storage.",
          );
        }

        objectUrl = URL.createObjectURL(file);

        if (!isActive) {
          URL.revokeObjectURL(objectUrl);
          return;
        }

        setState({
          modelUrl: objectUrl,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setState({
          modelUrl: null,
          isLoading: false,
          error:
            error instanceof Error
              ? error
              : new Error(
                  "Unable to load the local model file.",
                ),
        });
      }
    }

    void loadModel();

    return () => {
      isActive = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [projectId, userId]);

  return state;
}