"use client";
import { useEffect,useRef,useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Locale } from "@/features/i18n/types/Locale";
import { translate } from "@/features/i18n/lib/i18n";
import type { GuideSectionId,GuideSectionMetadata } from "../lib/getGuideViewModel";

export function GuideNavigation({sections,locale}:{sections:readonly GuideSectionMetadata[];locale:Locale}){
  const[activeId,setActiveId]=useState<GuideSectionId|undefined>(sections[0]?.id);
  const navigationTargetRef=useRef<GuideSectionId|null>(null);
  const navigationTimeoutRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  const t=(key:Parameters<typeof translate>[1])=>translate(locale,key);
  useEffect(()=>{
    const elements=sections.map(section=>document.getElementById(section.id)).filter((element):element is HTMLElement=>Boolean(element));
    if(!elements.length)return;
    const intersectionRatios=new Map<string,number>();
    const lastSectionId=sections.at(-1)?.id;
    let animationFrame:number|null=null;
    const isAtPageBottom=()=>window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-2;
    const activateLastSectionAtBottom=()=>{if(!lastSectionId||!isAtPageBottom())return false;navigationTargetRef.current=null;setActiveId(lastSectionId);return true;};
    const observer=new IntersectionObserver(entries=>{for(const entry of entries)intersectionRatios.set(entry.target.id,entry.isIntersecting?entry.intersectionRatio:0);if(activateLastSectionAtBottom())return;const navigationTarget=navigationTargetRef.current;if(navigationTarget){if((intersectionRatios.get(navigationTarget)??0)>0){navigationTargetRef.current=null;setActiveId(navigationTarget);}return;}const visible=elements.map(element=>({element,ratio:intersectionRatios.get(element.id)??0})).filter(item=>item.ratio>0).sort((a,b)=>b.ratio-a.ratio)[0];if(visible)setActiveId(visible.element.id as GuideSectionId);},{rootMargin:"-15% 0px -70% 0px",threshold:[0,0.25,0.5,0.75,1]});
    const handleScroll=()=>{if(animationFrame!==null)return;animationFrame=window.requestAnimationFrame(()=>{animationFrame=null;activateLastSectionAtBottom();});};
    elements.forEach(element=>observer.observe(element));
    window.addEventListener("scroll",handleScroll,{passive:true});
    window.addEventListener("resize",handleScroll);
    activateLastSectionAtBottom();
    return()=>{observer.disconnect();window.removeEventListener("scroll",handleScroll);window.removeEventListener("resize",handleScroll);if(animationFrame!==null)window.cancelAnimationFrame(animationFrame);};
  },[sections]);
  useEffect(()=>()=>{if(navigationTimeoutRef.current)clearTimeout(navigationTimeoutRef.current);},[]);
  function navigate(id:GuideSectionId){const target=document.getElementById(id);if(!target)return;navigationTargetRef.current=id;if(navigationTimeoutRef.current)clearTimeout(navigationTimeoutRef.current);navigationTimeoutRef.current=setTimeout(()=>{navigationTargetRef.current=null;},1500);window.history.replaceState(null,"",`#${id}`);target.focus({preventScroll:true});target.scrollIntoView({behavior:"smooth",block:"start"});setActiveId(id);}
  const links=<ol className="mt-3 space-y-1">{sections.map(section=><li key={section.id}><a href={`#${section.id}`} aria-current={activeId===section.id?"location":undefined} onClick={event=>{event.preventDefault();navigate(section.id);}} className={`block rounded-lg px-3 py-2 text-sm leading-5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${activeId===section.id?"bg-orange-400/10 font-medium text-orange-300":"text-neutral-400 hover:bg-white/[0.04] hover:text-white"}`}>{t(section.titleKey)}</a></li>)}</ol>;
  return <>
    <details className="group mx-5 mt-6 rounded-2xl border border-white/10 bg-neutral-900/90 p-4 sm:mx-6 lg:hidden"><summary className="flex cursor-pointer list-none items-center justify-between font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"><span>{t("guide.navigation.contents")}</span><ChevronDown className="h-4 w-4 transition group-open:rotate-180"/></summary>{links}</details>
    <nav aria-label={t("guide.navigation.label")} className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-white/10 bg-neutral-900/85 p-4 shadow-xl shadow-black/20 backdrop-blur lg:block"><h2 className="font-semibold text-white">{t("guide.navigation.contents")}</h2>{links}</nav>
  </>;
}
