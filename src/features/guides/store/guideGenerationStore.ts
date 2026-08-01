import { create } from "zustand";

import type { GuideAssemblyStep, GuideExplodedView, GuideImages, GuideOverviewView, GuideReferenceImage, GuideSettings } from "../types/ModelGuide";
import type { GuideAssetReference } from "../services/assets/types";

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
  | "assembly-assets"
  | "step-images";

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
  assetReferences: GuideAssetReference[];
  guideReferences: GuideReferenceImage[] | null;
  guideReferencesProjectId: string | null;
  overviewViews: GuideOverviewView[] | null;
  overviewCaptureRequest: { projectId:string; viewId:string|null; type:GuideOverviewView["type"] } | null;

  startCapture: (projectId: string,totalSteps?:number) => void;
  setGuideExtras:(settings:GuideSettings,explodedView:GuideExplodedView|null,assemblySteps:GuideAssemblyStep[],assetReferences:GuideAssetReference[])=>void;
  setCaptureStep: (
    step: GuideCaptureStep,
    completedSteps: number,
  ) => void;
  setImages: (
    projectId: string,
    images: GuideImages,
  ) => void;
  setGuideReferences: (projectId: string, references: GuideReferenceImage[]) => void;
  setOverviewViews:(views:GuideOverviewView[])=>void;
  requestOverviewCapture:(request:{projectId:string;viewId:string|null;type:GuideOverviewView["type"]}|null)=>void;
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
  settings:null,explodedView:null,assemblySteps:[],assetReferences:[],guideReferences:null,guideReferencesProjectId:null,overviewViews:null,overviewCaptureRequest:null,
};

export const useGuideGenerationStore =
  create<GuideGenerationState>()((set) => ({
    ...initialState,

    startCapture: (projectId,totalSteps=TOTAL_CAPTURE_STEPS) => {
      set((state)=>({
        status: "capturing",
        currentStep: null,
        completedSteps: 0,
        totalSteps,
        projectId,
        images: null,
        error: null,
        guideReferences: null,
        guideReferencesProjectId: null,
        overviewViews: state.projectId===projectId?state.overviewViews:null,
        overviewCaptureRequest: null,
      }));
    },
    setGuideExtras:(settings,explodedView,assemblySteps,assetReferences)=>set({settings,explodedView,assemblySteps:assemblySteps.map(step=>({...step,parts:step.parts.map(part=>({...part}))})),assetReferences:[...assetReferences]}),

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
    setGuideReferences: (guideReferencesProjectId, guideReferences) => set({ guideReferencesProjectId, guideReferences: guideReferences.map((reference) => ({ ...reference })) }),
    setOverviewViews:(overviewViews)=>set({overviewViews:overviewViews.map(view=>({...view,camera:view.camera?{...view.camera,position:{...view.camera.position},target:{...view.camera.target},up:{...view.camera.up}}:undefined}))}),
    requestOverviewCapture:(overviewCaptureRequest)=>set({overviewCaptureRequest}),

    setError: (error) => {
      set({
        status: "error",
        currentStep: null,
        error,
      });
    },

    reset: () => set(initialState),
  }));
