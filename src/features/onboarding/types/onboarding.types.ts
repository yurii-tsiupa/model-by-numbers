import type {TranslationKey} from "@/features/i18n/locales/en";
import type {OnboardingTarget} from "../constants/onboardingTargets";

export type TourPlacement="top"|"right"|"bottom"|"left"|"auto";
export type TourStep={
  id:string;
  targetId:OnboardingTarget;
  titleKey:TranslationKey;
  descriptionKey:TranslationKey;
  actionHintKeys?:readonly TranslationKey[];
  noteKey?:TranslationKey;
  placement?:TourPlacement;
  waitForTarget?:boolean;
  isEnabled?:()=>boolean;
  beforeOpen?:()=>void|(()=>void);
  disableNextUntilTarget?:boolean;
  canContinue?:()=>boolean;
  subscribeToContinue?:(listener:()=>void)=>(()=>void);
  blockedMessageKey?:TranslationKey;
  nextLabelKey?:TranslationKey;
};
export type OnboardingTour={id:string;version:number;steps:readonly TourStep[]};
export type ContextualHintId="stepEditor"|"marker"|"region";
export type OnboardingProgress={
  simpleModeTourVersion:number;
  stepEditorHintVersion:number;
  markerHintVersion:number;
  regionHintVersion:number;
  explicitlySkipped:boolean;
};
