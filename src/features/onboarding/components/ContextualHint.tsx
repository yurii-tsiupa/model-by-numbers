"use client";
import {useLayoutEffect,useRef,useState} from "react";
import {createPortal} from "react-dom";
import {useTranslation} from "@/features/i18n/hooks/useTranslation";
import {onboardingTargetSelector,type OnboardingTarget} from "../constants/onboardingTargets";
import type {TranslationKey} from "@/features/i18n/locales/en";
import {resolveFloatingPlacement} from "../lib/resolveFloatingPlacement";

export function ContextualHint({targetId,titleKey,descriptionKey,actionHintKeys,noteKey,onDismiss}:{targetId:OnboardingTarget;titleKey:TranslationKey;descriptionKey:TranslationKey;actionHintKeys?:readonly TranslationKey[];noteKey?:TranslationKey;onDismiss:()=>void}){
  const{t}=useTranslation(),[rect,setRect]=useState<DOMRect|null>(null),[hintSize,setHintSize]=useState({width:320,height:280}),hintRef=useRef<HTMLElement>(null);
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
  useLayoutEffect(()=>{
    const hint=hintRef.current;
    if(!hint)return;
    const update=()=>{const bounds=hint.getBoundingClientRect();setHintSize({width:bounds.width,height:bounds.height})};
    update();
    const observer=new ResizeObserver(update);
    observer.observe(hint);
    return()=>observer.disconnect();
  },[actionHintKeys,descriptionKey,noteKey,titleKey]);
  if(!rect)return null;
  const width=Math.min(320,window.innerWidth-24),hasSideSpace=rect.left>=width+22||window.innerWidth-rect.right>=width+22,verticalSpace=Math.max(72,rect.top-22,window.innerHeight-rect.bottom-22),height=Math.min(hintSize.height,hasSideSpace?window.innerHeight-24:verticalSpace),position=resolveFloatingPlacement(rect,{width,height,gap:10,order:["left","right","top","bottom"]}),maxHeight=Math.max(72,Math.min(height,window.innerHeight-position.top-12));
  return createPortal(<aside ref={hintRef} role="status" className="fixed z-[80] overflow-y-auto rounded-xl border border-[var(--accent)] bg-[var(--card)] p-3 text-[var(--text)] shadow-lg" style={{left:position.left,top:position.top,width,maxHeight}}>
    <h2 className="text-xs font-semibold">{t(titleKey)}</h2>
    <p className="mt-1 text-[11px] leading-4 text-[var(--text-secondary)]">{t(descriptionKey)}</p>
    {actionHintKeys?.length?<ol className="mt-2 list-decimal space-y-1 pl-4 text-[10px] leading-4 text-[var(--text-secondary)]">{actionHintKeys.map(key=><li key={key}>{t(key)}</li>)}</ol>:null}
    {noteKey?<p className="mt-2 rounded-lg bg-[var(--surface)] px-2 py-1.5 text-[10px] leading-4 text-[var(--text-muted)]">{t(noteKey)}</p>:null}
    <div className="mt-2 flex justify-end"><button type="button" onClick={onDismiss} className="cursor-pointer rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("onboarding.gotIt")}</button></div>
  </aside>,document.body);
}
