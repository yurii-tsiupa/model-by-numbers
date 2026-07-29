"use client";
import {CircleHelp} from "lucide-react";
import {useEffect,useRef,useState} from "react";
import {useTranslation} from "@/features/i18n/hooks/useTranslation";
import {ONBOARDING_TARGETS} from "../constants/onboardingTargets";
import {useOnboarding} from "../hooks/useOnboarding";

export function OnboardingHelpButton(){
  const{t}=useTranslation(),onboarding=useOnboarding(),[open,setOpen]=useState(false),ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!open)return;
    const pointer=(event:PointerEvent)=>{if(!ref.current?.contains(event.target as Node))setOpen(false)};
    const key=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};
    document.addEventListener("pointerdown",pointer);window.addEventListener("keydown",key);
    return()=>{document.removeEventListener("pointerdown",pointer);window.removeEventListener("keydown",key)};
  },[open]);
  return <div ref={ref} className="relative" data-onboarding-target={ONBOARDING_TARGETS.helpAction}>
    <button type="button" title={t("onboarding.help")} aria-label={t("onboarding.help")} aria-expanded={open} onClick={()=>setOpen(value=>!value)} className="grid size-10 cursor-pointer place-items-center rounded-[10px] border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><CircleHelp className="size-4"/></button>
    {open?<div role="menu" className="absolute right-0 top-12 z-[70] w-60 rounded-xl border border-[var(--border-strong)] bg-[var(--card)] p-1.5 text-[var(--text)] shadow-xl">
      <HelpItem label={t("onboarding.restartTour")} onClick={()=>{setOpen(false);onboarding.restartTour()}}/>
      <HelpItem label={t("onboarding.reopenStepHint")} onClick={()=>{setOpen(false);onboarding.reopenHint("stepEditor")}}/>
      <HelpItem label={t("onboarding.reopenMarkerHint")} onClick={()=>{setOpen(false);onboarding.reopenHint("marker")}}/>
      <HelpItem label={t("onboarding.reopenRegionHint")} onClick={()=>{setOpen(false);onboarding.reopenHint("region")}}/>
      <div className="my-1 h-px bg-[var(--border)]"/>
      <HelpItem label={t("onboarding.resetProgress")} onClick={()=>{setOpen(false);onboarding.resetProgress()}}/>
    </div>:null}
  </div>;
}
function HelpItem({label,onClick}:{label:string;onClick:()=>void}){return <button type="button" role="menuitem" onClick={onClick} className="flex min-h-9 w-full cursor-pointer items-center rounded-lg px-3 text-left text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{label}</button>}
