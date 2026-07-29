"use client";
import type {TranslationKey} from "@/features/i18n/locales/en";
import type {OnboardingTarget} from "../constants/onboardingTargets";
import type {ContextualHintId} from "../types/onboarding.types";
import {useOnboarding} from "../hooks/useOnboarding";
import {ContextualHint} from "./ContextualHint";

export function ContextualHintSlot({id,targetId,titleKey,descriptionKey,actionHintKeys,noteKey}:{id:ContextualHintId;targetId:OnboardingTarget;titleKey:TranslationKey;descriptionKey:TranslationKey;actionHintKeys?:readonly TranslationKey[];noteKey?:TranslationKey}){
  const onboarding=useOnboarding();
  return onboarding.shouldShowHint(id)?<ContextualHint targetId={targetId} titleKey={titleKey} descriptionKey={descriptionKey} actionHintKeys={actionHintKeys} noteKey={noteKey} onDismiss={()=>onboarding.dismissHint(id)}/>:null;
}
