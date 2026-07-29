"use client";
import {createContext,useContext} from "react";
import type {ContextualHintId} from "../types/onboarding.types";

export type OnboardingContextValue={
  restartTour:()=>void;
  reopenHint:(id:ContextualHintId)=>void;
  resetProgress:()=>void;
  shouldShowHint:(id:ContextualHintId)=>boolean;
  dismissHint:(id:ContextualHintId)=>void;
};
export const OnboardingContext=createContext<OnboardingContextValue|null>(null);
export function useOnboarding(){
  const value=useContext(OnboardingContext);
  if(!value)throw new Error("useOnboarding must be used inside OnboardingProvider");
  return value;
}
