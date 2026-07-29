"use client";
import {useCallback,useEffect,useMemo,useRef,useState,type ReactNode} from "react";
import {createPortal} from "react-dom";
import {useTranslation} from "@/features/i18n/hooks/useTranslation";
import {SIMPLE_MODE_TOUR,ONBOARDING_HINT_VERSION} from "../config/simpleModeEditorTour";
import {onboardingTargetSelector,ONBOARDING_TARGETS} from "../constants/onboardingTargets";
import {OnboardingContext,type OnboardingContextValue} from "../hooks/useOnboarding";
import {onboardingStorage} from "../services/onboardingStorage";
import type {ContextualHintId,OnboardingProgress} from "../types/onboarding.types";
import {GuidedTour} from "./GuidedTour";

const EMPTY:OnboardingProgress={simpleModeTourVersion:0,stepEditorHintVersion:0,markerHintVersion:0,regionHintVersion:0,explicitlySkipped:false};
const HINT_KEYS:{[K in ContextualHintId]:keyof OnboardingProgress}={stepEditor:"stepEditorHintVersion",marker:"markerHintVersion",region:"regionHintVersion"};

export function OnboardingProvider({userId,eligible,simpleMode,children}:{userId:string;eligible:boolean;simpleMode:boolean;children:ReactNode}){
  const{t}=useTranslation(),[progress,setProgress]=useState<OnboardingProgress>(EMPTY),[ready,setReady]=useState(false),[offer,setOffer]=useState(false),[tourOpen,setTourOpen]=useState(false);
  const offeredThisVisit=useRef(false),previousFocus=useRef<HTMLElement|null>(null);
  useEffect(()=>{const timer=window.setTimeout(()=>{setProgress(onboardingStorage.read(userId));setReady(true)},0);return()=>window.clearTimeout(timer)},[userId]);
  const persist=useCallback((next:OnboardingProgress)=>{setProgress(next);onboardingStorage.write(userId,next)},[userId]);
  useEffect(()=>{
    if(!ready||!eligible||offeredThisVisit.current||progress.simpleModeTourVersion>=SIMPLE_MODE_TOUR.version)return;
    const timer=window.setTimeout(()=>{
      if(document.querySelector(onboardingTargetSelector(ONBOARDING_TARGETS.stepEditor))||document.querySelector('[role="dialog"]'))return;
      const required=[ONBOARDING_TARGETS.projectPalette,ONBOARDING_TARGETS.modelViewer,ONBOARDING_TARGETS.references,ONBOARDING_TARGETS.paintingSteps,ONBOARDING_TARGETS.guideAction];
      if(!required.every(target=>document.querySelector(onboardingTargetSelector(target))))return;
      offeredThisVisit.current=true;
      previousFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
      setOffer(true);
    },500);
    return()=>window.clearTimeout(timer);
  },[eligible,progress.simpleModeTourVersion,ready]);
  const closeOffer=()=>{setOffer(false);previousFocus.current?.focus()};
  const complete=useCallback((skipped=false)=>{persist({...progress,simpleModeTourVersion:SIMPLE_MODE_TOUR.version,explicitlySkipped:skipped});setTourOpen(false);window.setTimeout(()=>previousFocus.current?.focus(),0)},[persist,progress]);
  const restartTour=useCallback(()=>{previousFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;setOffer(false);setTourOpen(true)},[]);
  const reopenHint=useCallback((id:ContextualHintId)=>{const key=HINT_KEYS[id];persist({...progress,[key]:0})},[persist,progress]);
  const dismissHint=useCallback((id:ContextualHintId)=>{const key=HINT_KEYS[id];persist({...progress,[key]:ONBOARDING_HINT_VERSION})},[persist,progress]);
  const shouldShowHint=useCallback((id:ContextualHintId)=>ready&&simpleMode&&!offer&&!tourOpen&&Number(progress[HINT_KEYS[id]])<ONBOARDING_HINT_VERSION,[offer,progress,ready,simpleMode,tourOpen]);
  const resetProgress=useCallback(()=>{if(!window.confirm(t("onboarding.resetConfirm")))return;onboardingStorage.clear(userId);setProgress({...EMPTY});offeredThisVisit.current=true;setTourOpen(false);setOffer(false)},[t,userId]);
  const value=useMemo<OnboardingContextValue>(()=>({restartTour,reopenHint,resetProgress,shouldShowHint,dismissHint}),[dismissHint,reopenHint,resetProgress,restartTour,shouldShowHint]);
  useEffect(()=>{if(!offer)return;const key=(event:KeyboardEvent)=>{if(event.key==="Escape")closeOffer()};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)});
  return <OnboardingContext.Provider value={value}>
    {children}
    {offer&&typeof document!=="undefined"?createPortal(<div className="fixed inset-0 z-[90] grid place-items-center bg-[var(--overlay)] p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="onboarding-welcome-title" className="w-full max-w-md rounded-2xl border border-[var(--border-strong)] bg-[var(--card)] p-5 text-[var(--text)] shadow-xl">
        <h2 id="onboarding-welcome-title" className="text-lg font-semibold">{t("onboarding.welcome.title")}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{t("onboarding.welcome.description")}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={()=>{complete(true);setOffer(false)}} className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("onboarding.skip")}</button>
          <button type="button" onClick={closeOffer} className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("onboarding.maybeLater")}</button>
          <button type="button" autoFocus onClick={()=>{setOffer(false);setTourOpen(true)}} className="cursor-pointer rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("onboarding.startTour")}</button>
        </div>
      </section>
    </div>,document.body):null}
    {tourOpen?<GuidedTour tour={SIMPLE_MODE_TOUR} onClose={()=>{setTourOpen(false);window.setTimeout(()=>previousFocus.current?.focus(),0)}} onComplete={()=>complete(false)} onSkip={()=>complete(true)}/>:null}
  </OnboardingContext.Provider>;
}
