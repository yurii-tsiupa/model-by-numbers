import { create } from "zustand";

import type { GuideAssemblyStep, GuideExplodedView, GuideImages, GuideSettings } from "../types/ModelGuide";

export type GuideGenerationStatus =
  | "idle"
  | "capturing"
  | "ready"
  | "error";

export type GuideCaptureStep =
  | "original"
  | "base"
  | "painted"
  | "numbers"
  | "exploded"
  | "assembly-assets";

type GuideGenerationState = {
  status: GuideGenerationStatus;
  currentStep: GuideCaptureStep | null;
  completedSteps: number;
  totalSteps: number;
  projectId: string | null;
  images: GuideImages | null;
  error: string | null;
  settings: GuideSettings | null;
  explodedView: GuideExplodedView | null;
  assemblySteps: GuideAssemblyStep[];

  startCapture: (projectId: string,totalSteps?:number) => void;
  setGuideExtras:(settings:GuideSettings,explodedView:GuideExplodedView|null,assemblySteps:GuideAssemblyStep[])=>void;
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
  settings:null,explodedView:null,assemblySteps:[],
};

export const useGuideGenerationStore =
  create<GuideGenerationState>()((set) => ({
    ...initialState,

    startCapture: (projectId,totalSteps=TOTAL_CAPTURE_STEPS) => {
      set({
        status: "capturing",
        currentStep: null,
        completedSteps: 0,
        totalSteps,
        projectId,
        images: null,
        error: null,
      });
    },
    setGuideExtras:(settings,explodedView,assemblySteps)=>set({settings,explodedView,assemblySteps:assemblySteps.map(step=>({...step,parts:step.parts.map(part=>({...part}))}))}),

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
              completedSteps: state.totalSteps,
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
