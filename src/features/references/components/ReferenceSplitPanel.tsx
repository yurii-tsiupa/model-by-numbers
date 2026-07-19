"use client";
import {ChevronLeft,ChevronRight,X} from "lucide-react";
import {useEffect} from "react";
import {useTranslation} from "@/features/i18n/hooks/useTranslation";
import type {ReferenceImage} from "../types/ReferenceImage";
import {ReferenceImageView} from "./ReferenceImageView";

export function ReferenceSplitPanel({reference,references,onSelect,onClose}:{reference:ReferenceImage;references:ReferenceImage[];onSelect:(id:string)=>void;onClose:()=>void}){
 const{t}=useTranslation(),index=references.findIndex(row=>row.id===reference.id);
 useEffect(()=>{const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;return()=>previous?.focus()},[]);
 return <section className="flex min-h-[20rem] min-w-0 flex-1 flex-col border-l border-white/10 bg-neutral-950"><header className="flex items-center justify-between gap-3 border-b border-white/10 p-3"><div className="min-w-0"><p className="truncate text-sm text-white">{reference.name}</p><p className="truncate text-xs text-neutral-500">{t(`references.type.${reference.type}`)}{reference.includeInGuide?` · ${t("references.included")}`:""}</p></div><button type="button" onClick={onClose} aria-label={t("common.close")} className="rounded-lg p-2"><X className="h-4 w-4"/></button></header><div className="flex min-h-0 flex-1 items-center justify-center p-3"><ReferenceImageView blob={reference.blob} alt={reference.name} className="max-h-full max-w-full object-contain"/></div><footer className="flex justify-center gap-4 p-3"><button type="button" disabled={index<=0} onClick={()=>onSelect(references[index-1].id)} aria-label={t("common.previous")} className="rounded-lg p-2 disabled:opacity-30"><ChevronLeft/></button><button type="button" disabled={index>=references.length-1} onClick={()=>onSelect(references[index+1].id)} aria-label={t("common.next")} className="rounded-lg p-2 disabled:opacity-30"><ChevronRight/></button></footer></section>
}
