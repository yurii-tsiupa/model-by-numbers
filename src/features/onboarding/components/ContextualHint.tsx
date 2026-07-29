"use client";
import {useLayoutEffect,useState} from "react";
import {createPortal} from "react-dom";
import {useTranslation} from "@/features/i18n/hooks/useTranslation";
import {onboardingTargetSelector,type OnboardingTarget} from "../constants/onboardingTargets";
import type {TranslationKey} from "@/features/i18n/locales/en";

export function ContextualHint({targetId,titleKey,descriptionKey,onDismiss}:{targetId:OnboardingTarget;titleKey:TranslationKey;descriptionKey:TranslationKey;onDismiss:()=>void}){
  const{t}=useTranslation(),[rect,setRect]=useState<DOMRect|null>(null);
  useLayoutEffect(()=>{
    const target=document.querySelector<HTMLElement>(onboardingTargetSelector(targetId));
    if(!target)return;
    target.scrollIntoView({block:"nearest",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
    const update=()=>setRect(target.getBoundingClientRect());
    update();
    const observer=new ResizeObserver(update);
    observer.observe(target);
    window.addEventListener("resize",update);
    window.addEventListener("scroll",update,true);
    return()=>{observer.disconnect();window.removeEventListener("resize",update);window.removeEventListener("scroll",update,true)};
  },[targetId]);
  if(!rect)return null;
  const width=Math.min(320,window.innerWidth-24),left=Math.max(12,Math.min(window.innerWidth-width-12,rect.left)),top=Math.max(12,Math.min(window.innerHeight-180,rect.bottom+8));
  return createPortal(<aside role="status" className="fixed z-[80] rounded-xl border border-[var(--accent)] bg-[var(--card)] p-3 text-[var(--text)] shadow-lg" style={{left,top,width}}>
    <h2 className="text-xs font-semibold">{t(titleKey)}</h2>
    <p className="mt-1 text-[11px] leading-4 text-[var(--text-secondary)]">{t(descriptionKey)}</p>
    <div className="mt-2 flex justify-end"><button type="button" onClick={onDismiss} className="cursor-pointer rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("onboarding.gotIt")}</button></div>
  </aside>,document.body);
}
