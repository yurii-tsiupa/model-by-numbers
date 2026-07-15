import { create } from "zustand";

import type { GuideImages } from "../types/ModelGuide";

export type GuideGenerationStatus =
  | "idle"
  | "capturing"
  | "ready"
  | "error";

export type GuideCaptureStep =
  | "original"
  | "base"
  | "painted"
  | "numbers";

type GuideGenerationState = {
  status: GuideGenerationStatus;
  currentStep: GuideCaptureStep | null;
  completedSteps: number;
  totalSteps: number;
  projectId: string | null;
  images: GuideImages | null;
  error: string | null;

  startCapture: (projectId: string) => void;
  setCaptureStep: (
    step: GuideCaptureStep,
    completedSteps: number,
  ) => void;
  setImages: (
    projectId: string,
    images: GuideImages,
  ) => void;
  setError: (message: string) => void;
  reset: () => void;
};

const TOTAL_CAPTURE_STEPS = 4;

const initialState = {
  status: "idle" as const,
  currentStep: null,
  completedSteps: 0,
  totalSteps: TOTAL_CAPTURE_STEPS,
  projectId: null,
  images: null,
  error: null,
};

export const useGuideGenerationStore =
  create<GuideGenerationState>()((set) => ({
    ...initialState,

    startCapture: (projectId) => {
      set({
        status: "capturing",
        currentStep: null,
        completedSteps: 0,
        totalSteps: TOTAL_CAPTURE_STEPS,
        projectId,
        images: null,
        error: null,
      });
    },

    setCaptureStep: (currentStep, completedSteps) => {
      set((state) =>
        state.status === "capturing"
          ? {
              currentStep,
              completedSteps,
            }
          : state,
      );
    },

    setImages: (projectId, images) => {
      set((state) =>
        state.projectId === projectId
          ? {
              status: "ready",
              currentStep: null,
              completedSteps: TOTAL_CAPTURE_STEPS,
              images: { ...images },
              error: null,
            }
          : state,
      );
    },

    setError: (error) => {
      set({
        status: "error",
        currentStep: null,
        error,
      });
    },

    reset: () => set(initialState),
  }));
