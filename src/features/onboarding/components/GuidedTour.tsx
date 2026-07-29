"use client";
import {useEffect,useLayoutEffect,useMemo,useRef,useState,useSyncExternalStore} from "react";
import {createPortal} from "react-dom";
import {useTranslation} from "@/features/i18n/hooks/useTranslation";
import {onboardingTargetSelector} from "../constants/onboardingTargets";
import type {OnboardingTour,TourPlacement} from "../types/onboarding.types";

const GAP=12,WIDTH=336,ESTIMATED_TOOLTIP_HEIGHT=250;
const subscribeNever=()=>()=>{};
const alwaysTrue=()=>true;
function tooltipPosition(rect:DOMRect,placement:TourPlacement){
  const viewportWidth=window.innerWidth,viewportHeight=window.innerHeight;
  const height=Math.min(ESTIMATED_TOOLTIP_HEIGHT,Math.max(160,viewportHeight-24));
  const resolved=placement==="auto"?(rect.right+WIDTH+GAP<viewportWidth?"right":rect.left-WIDTH-GAP>0?"left":rect.bottom+height+GAP<viewportHeight?"bottom":"top"):placement;
  let left=rect.left+rect.width/2-WIDTH/2,top=rect.bottom+GAP;
  if(resolved==="top")top=rect.top-height-GAP;
  if(resolved==="right"){left=rect.right+GAP;top=rect.top}
  if(resolved==="left"){left=rect.left-WIDTH-GAP;top=rect.top}
  return{left:Math.max(12,Math.min(viewportWidth-WIDTH-12,left)),top:Math.max(12,Math.min(viewportHeight-height-12,top))};
}

export function GuidedTour({tour,onClose,onComplete,onSkip}:{tour:OnboardingTour;onClose:()=>void;onComplete:()=>void;onSkip:()=>void}){
  const{t}=useTranslation();
  const[index,setIndex]=useState(0),[rect,setRect]=useState<DOMRect|null>(null);
  const tooltipRef=useRef<HTMLDivElement>(null),previousFocusRef=useRef<HTMLElement|null>(null);
  const steps=useMemo(()=>tour.steps.filter(step=>step.isEnabled?.()!==false),[tour]);
  const step=steps[index];
  const canContinue=useSyncExternalStore(step?.subscribeToContinue??subscribeNever,step?.canContinue??alwaysTrue,alwaysTrue);
  useLayoutEffect(()=>{previousFocusRef.current=document.activeElement instanceof HTMLElement?document.activeElement:null;return()=>previousFocusRef.current?.focus()},[]);
  useLayoutEffect(()=>{
    if(!step)return;
    let attempts=0,target:HTMLElement|null=null,cleanup:undefined|void|(()=>void),stopTracking:undefined|(()=>void),frame=0;
    const update=()=>{if(!target?.isConnected)return;setRect(target.getBoundingClientRect())};
    const interval=window.setInterval(()=>{
      if(attempts===0)setRect(null);
      target=document.querySelector<HTMLElement>(onboardingTargetSelector(step.targetId));
      attempts++;
      if(!target&&attempts<12)return;
      window.clearInterval(interval);
      if(!target){if(index<steps.length-1)setIndex(value=>value+1);else onClose();return}
      cleanup=step.beforeOpen?.();
      target.scrollIntoView({block:"nearest",inline:"nearest",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
      update();
      const observer=new ResizeObserver(()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update)});
      observer.observe(target);
      const handle=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update)};
      window.addEventListener("resize",handle);
      window.addEventListener("scroll",handle,true);
      stopTracking=()=>{observer.disconnect();window.removeEventListener("resize",handle);window.removeEventListener("scroll",handle,true)};
    },step.waitForTarget?125:0);
    return()=>{window.clearInterval(interval);cancelAnimationFrame(frame);stopTracking?.();if(typeof cleanup==="function")cleanup()};
  },[index,onClose,step,steps.length]);
  useEffect(()=>{tooltipRef.current?.focus()},[index,rect]);
  useEffect(()=>{
    const keydown=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){event.preventDefault();onClose()}
      if(event.key==="ArrowLeft"&&index>0){event.preventDefault();setIndex(value=>value-1)}
      if(event.key==="ArrowRight"&&rect&&canContinue){event.preventDefault();if(index===steps.length-1)onComplete();else setIndex(value=>value+1)}
    };
    window.addEventListener("keydown",keydown);
    return()=>window.removeEventListener("keydown",keydown);
  },[canContinue,index,onClose,onComplete,rect,steps.length]);
  if(typeof document==="undefined"||!step||!rect)return null;
  const position=tooltipPosition(rect,step.placement??"auto"),contentMaxHeight=Math.max(96,window.innerHeight-position.top-108),padding=6;
  return createPortal(<div className="pointer-events-none fixed inset-0 z-[90]" aria-live="polite">
    <div aria-hidden="true" className="pointer-events-auto fixed bg-[var(--overlay)]" style={{left:0,top:0,right:0,height:Math.max(0,rect.top-padding)}}/>
    <div aria-hidden="true" className="pointer-events-auto fixed bg-[var(--overlay)]" style={{left:0,top:rect.top-padding,width:Math.max(0,rect.left-padding),height:rect.height+padding*2}}/>
    <div aria-hidden="true" className="pointer-events-auto fixed bg-[var(--overlay)]" style={{left:rect.right+padding,top:rect.top-padding,right:0,height:rect.height+padding*2}}/>
    <div aria-hidden="true" className="pointer-events-auto fixed bg-[var(--overlay)]" style={{left:0,top:rect.bottom+padding,right:0,bottom:0}}/>
    <div aria-hidden="true" className="pointer-events-none fixed rounded-xl border-2 border-[var(--accent)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_18%,transparent)]" style={{left:rect.left-padding,top:rect.top-padding,width:rect.width+padding*2,height:rect.height+padding*2}}/>
    <div ref={tooltipRef} tabIndex={-1} role="dialog" aria-modal="false" aria-labelledby={`tour-title-${step.id}`} className="pointer-events-auto fixed z-[91] w-[min(336px,calc(100vw-24px))] text-[var(--text)] outline-none" style={position}>
      <div className="min-h-32 overflow-y-auto rounded-xl border border-[var(--border-strong)] bg-[var(--card)] p-4 shadow-xl" style={{maxHeight:contentMaxHeight}}>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">{t("onboarding.progress",{current:index+1,total:steps.length})}</p>
        <h2 id={`tour-title-${step.id}`} className="mt-1 text-sm font-semibold">{t(step.titleKey)}</h2>
        <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)]">{t(step.descriptionKey)}</p>
        {!canContinue&&step.blockedMessageKey?<p role="status" className="mt-2 text-[11px] font-medium leading-4 text-[var(--accent)]">{t(step.blockedMessageKey)}</p>:null}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-lg">
        {index>0?<button type="button" onClick={()=>setIndex(value=>value-1)} className="h-9 shrink-0 cursor-pointer whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("onboarding.back")}</button>:null}
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={onSkip} className="h-9 shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("onboarding.skip")}</button>
          <button type="button" disabled={(!rect&&step.disableNextUntilTarget)||!canContinue} onClick={()=>index===steps.length-1?onComplete():setIndex(value=>value+1)} className="h-9 shrink-0 cursor-pointer whitespace-nowrap rounded-lg bg-[var(--accent)] px-4 text-xs font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t(index===steps.length-1?"onboarding.finish":step.nextLabelKey??"onboarding.next")}</button>
        </div>
      </div>
    </div>
  </div>,document.body);
}
