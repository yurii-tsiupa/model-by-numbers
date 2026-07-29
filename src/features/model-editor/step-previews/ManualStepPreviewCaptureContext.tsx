"use client";

import {createContext,useContext} from "react";

import type {PaintingStage,StepPreviewDisplayMode} from "../types/PaintingWorkflow";

export type ManualStepPreviewCaptureRequest={partId:string;step:PaintingStage;displayMode:StepPreviewDisplayMode};
export type ManualStepPreviewCaptureApi={
  request:ManualStepPreviewCaptureRequest|null;
  open:(partId:string,step:PaintingStage)=>void;
  setDisplayMode:(mode:StepPreviewDisplayMode)=>void;
};

export const ManualStepPreviewCaptureContext=createContext<ManualStepPreviewCaptureApi|null>(null);

export function useManualStepPreviewCapture(){
  return useContext(ManualStepPreviewCaptureContext);
}
