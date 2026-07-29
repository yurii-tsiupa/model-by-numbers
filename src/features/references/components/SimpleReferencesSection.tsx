"use client";

import {ChevronDown,Eye,Images,Trash2,Upload} from "lucide-react";
import {useMemo,useRef,useState} from "react";

import {ConfirmationModal} from "@/components/ui/ConfirmationModal";
import {useTranslation} from "@/features/i18n/hooks/useTranslation";
import type {TranslationKey} from "@/features/i18n/locales/en";

import {createReferenceImages,type ReferenceValidationError} from "../lib/createReferenceImages";
import {useDeleteReference,useReferenceImages,useSaveReferences} from "../hooks/useReferenceImages";
import type {ReferenceImage} from "../types/ReferenceImage";
import {ReferenceImageView} from "./ReferenceImageView";
import {ONBOARDING_TARGETS} from "@/features/onboarding/constants/onboardingTargets";

const errorKey=(error:ReferenceValidationError):TranslationKey=>`references.${error.code}`;

type Props={
  projectId:string;
  activeReferenceId:string|null;
  isVisible:boolean;
  onSelect:(id:string)=>void;
  onShow:(id:string)=>void;
  onHide:()=>void;
  onDeleted:(id:string)=>void;
};

export function SimpleReferencesSection({projectId,activeReferenceId,isVisible,onSelect,onShow,onHide,onDeleted}:Props){
  const{t}=useTranslation();
  const query=useReferenceImages(projectId);
  const save=useSaveReferences(projectId);
  const remove=useDeleteReference(projectId,onDeleted);
  const inputRef=useRef<HTMLInputElement>(null);
  const expandedKey=`model-by-numbers:references-expanded:${projectId}`;
  const[expanded,setExpanded]=useState(()=>typeof window==="undefined"?true:window.localStorage.getItem(expandedKey)!=="false");
  const[errors,setErrors]=useState<string[]>([]);
  const[deleting,setDeleting]=useState<ReferenceImage|null>(null);
  const rows=useMemo(()=>query.data??[],[query.data]);
  const active=rows.find(row=>row.id===activeReferenceId)??rows[0]??null;
  function toggleExpanded(){
    setExpanded(value=>{
      const next=!value;
      window.localStorage.setItem(expandedKey,String(next));
      return next;
    });
  }

  async function upload(files:FileList){
    const result=await createReferenceImages(projectId,Array.from(files),rows);
    setErrors(result.errors.map(error=>t(errorKey(error),{name:error.fileName??""})));
    if(!result.references.length)return;
    try{
      const saved=await save.mutateAsync(result.references);
      const first=saved[0];
      if(first)onSelect(first.id);
    }catch{
      setErrors([t("references.saveFailed")]);
    }
  }

  return <section data-onboarding-target={ONBOARDING_TARGETS.references} className="simple-references border-b border-[var(--border)] pb-4">
    <button type="button" aria-expanded={expanded} onClick={toggleExpanded} className="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg text-left transition hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
      <Images className="size-4 text-[var(--accent)]"/>
      <span className="min-w-0 flex-1 text-sm font-semibold text-[var(--text)]">{t("simple.references.title")}</span>
      <span className="rounded-full border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">{rows.length}</span>
      <ChevronDown aria-hidden="true" className={`mr-1 size-4 text-[var(--text-muted)] transition-transform ${expanded?"rotate-180":""}`}/>
    </button>

    {expanded?<div className="pt-2">
      {rows.length?<div className="relative">
        <select aria-label={t("simple.references.select")} value={active?.id??""} onChange={event=>onSelect(event.target.value)} className="simple-steps-select h-10 w-full cursor-pointer appearance-none rounded-lg py-0 pl-3 pr-10 text-sm outline-none">
          <option value="" disabled>{t("simple.references.select")}</option>
          {rows.map(row=><option key={row.id} value={row.id}>{row.name}</option>)}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]"/>
      </div>:null}

      <p className="my-2 text-xs leading-5 text-[var(--text-muted)]">{t("simple.references.description")}</p>

      {rows.length?<div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={save.isPending} onClick={()=>inputRef.current?.click()} className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 text-xs font-semibold text-[var(--accent)] transition hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"><Upload className="size-3.5"/>{t("simple.references.add")}</button>
        <button type="button" disabled={!active} onClick={()=>{if(!active)return;if(isVisible)onHide();else onShow(active.id)}} className={`inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[var(--accent-2)] px-2 text-xs font-semibold text-[var(--accent-2)] transition disabled:cursor-not-allowed disabled:opacity-40 ${isVisible?"bg-[color-mix(in_srgb,var(--accent-2)_22%,var(--card))] hover:brightness-110":"bg-[var(--accent-2-soft)] hover:brightness-105"}`}><Eye className="size-3.5"/>{t(isVisible?"simple.references.showing":"simple.references.showShort")}</button>
      </div>:<button type="button" disabled={save.isPending} onClick={()=>inputRef.current?.click()} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();if(event.dataTransfer.files.length)void upload(event.dataTransfer.files)}} className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--card)] px-4 py-4 text-center transition hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"><Upload className="mb-1.5 size-5 text-[var(--accent)]"/><span className="text-sm font-semibold text-[var(--text)]">{t("simple.references.add")}</span><span className="mt-0.5 text-[10px] text-[var(--text-muted)]">{t("simple.references.drop")}</span></button>}

      {rows.length?<div role="listbox" aria-label={t("simple.references.select")} className="mt-2 grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1">
        {rows.map(row=>{
          const selected=active?.id===row.id;
          return <article key={row.id} className={`group relative min-w-0 overflow-hidden rounded-lg border bg-[var(--card)] transition hover:brightness-105 ${selected?"border-[var(--accent)]":"border-[var(--border)]"}`}>
            <button type="button" role="option" aria-selected={selected} onClick={()=>onSelect(row.id)} className="block w-full cursor-pointer text-left">
              <ReferenceImageView blob={row.blob} alt={row.name} className="aspect-square w-full object-cover"/>
              <span className="block truncate px-2 py-1.5 text-[10px] text-[var(--text)]">{row.name}</span>
            </button>
            {isVisible&&selected?<span className="absolute left-1.5 top-1.5 rounded-full bg-[var(--accent-2-soft)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--accent-2)]">{t("simple.references.showing")}</span>:null}
            <button type="button" onClick={()=>setDeleting(row)} aria-label={t("simple.references.deleteNamed",{name:row.name})} className="absolute right-1.5 top-1.5 grid size-7 cursor-pointer place-items-center rounded-md bg-[var(--card)] text-[var(--danger)] opacity-0 shadow-sm transition hover:bg-[var(--danger-soft)] group-hover:opacity-100 group-focus-within:opacity-100"><Trash2 className="size-3.5"/></button>
          </article>;
        })}
      </div>:null}

      <input ref={inputRef} hidden multiple type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={event=>{if(event.target.files)void upload(event.target.files);event.target.value=""}}/>
      {errors.map(error=><p key={error} role="alert" className="mt-2 text-xs text-[var(--danger)]">{error}</p>)}
    </div>:null}

    <ConfirmationModal isOpen={Boolean(deleting)} title={t("references.deleteTitle",{name:deleting?.name??t("simple.references.title")})} description={t("references.deleteDescription")} confirmLabel={t("references.delete")} variant="danger" isLoading={remove.isPending} onClose={()=>setDeleting(null)} onConfirm={()=>{if(deleting)remove.mutate(deleting.id,{onSuccess:()=>setDeleting(null),onError:()=>setErrors([t("references.deleteFailed")])})}}/>
  </section>;
}
