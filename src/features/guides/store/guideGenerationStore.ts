import { create } from "zustand";

import type { GuideAssemblyStep, GuideExplodedView, GuideImages, GuideOverviewView, GuideReferenceImage, GuideSettings } from "../types/ModelGuide";
import type { GuideAssetReference } from "../services/assets/types";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";
import type { Locale } from "@/features/i18n/types/Locale";
import { clearGuideDraftSession, saveGuideDraftSession } from "../storage/guideDraftSessionStorage";

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
  draftTemplateSettings: GuideTemplateSettings | null;
  draftTemplateId: string | null;
  draftLocale: Locale | null;
  draftId: string | null;

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
  setDraftTemplate:(settings: GuideTemplateSettings, templateId: string, locale: Locale, draftId?: string, projectId?: string)=>void;
  updateDraftTemplateSettings:(settings: Partial<GuideTemplateSettings>)=>void;
  setDraftTemplateId:(templateId:string)=>void;
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
  settings:null,explodedView:null,assemblySteps:[],assetReferences:[],guideReferences:null,guideReferencesProjectId:null,overviewViews:null,overviewCaptureRequest:null,draftTemplateSettings:null,draftTemplateId:null,draftLocale:null,draftId:null,
};

export const useGuideGenerationStore =
  create<GuideGenerationState>()((set) => ({
    ...initialState,

    startCapture: (projectId,totalSteps=TOTAL_CAPTURE_STEPS) => {
      clearGuideDraftSession(projectId);
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
        draftTemplateSettings: null,
        draftTemplateId: null,
        draftLocale: null,
        draftId: crypto.randomUUID(),
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
    setDraftTemplate:(draftTemplateSettings,draftTemplateId,draftLocale,nextDraftId,nextProjectId)=>set(state=>{const draftId=nextDraftId??state.draftId??crypto.randomUUID(),projectId=nextProjectId??state.projectId;if(projectId)saveGuideDraftSession({projectId,draftId,templateId:draftTemplateId,locale:draftLocale,settings:draftTemplateSettings});return{draftTemplateSettings:structuredClone(draftTemplateSettings),draftTemplateId,draftLocale,draftId,projectId}}),
    updateDraftTemplateSettings:(settings)=>set(state=>{if(!state.draftTemplateSettings)return{};const draftTemplateSettings={...state.draftTemplateSettings,...structuredClone(settings)};if(state.projectId&&state.draftId&&state.draftTemplateId&&state.draftLocale)saveGuideDraftSession({projectId:state.projectId,draftId:state.draftId,templateId:state.draftTemplateId,locale:state.draftLocale,settings:draftTemplateSettings});return{draftTemplateSettings}}),
    setDraftTemplateId:(draftTemplateId)=>set(state=>{if(state.projectId&&state.draftId&&state.draftLocale&&state.draftTemplateSettings)saveGuideDraftSession({projectId:state.projectId,draftId:state.draftId,templateId:draftTemplateId,locale:state.draftLocale,settings:state.draftTemplateSettings});return{draftTemplateId}}),

    setError: (error) => {
      set({
        status: "error",
        currentStep: null,
        error,
      });
    },

    reset: () => set(initialState),
  }));
