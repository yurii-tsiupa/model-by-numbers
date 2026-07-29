"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Image from "next/image";
import {Camera,Plus,RefreshCw,Trash2,X} from "lucide-react";
import {useCallback,useEffect,useMemo,useRef,useState} from "react";

import {useTranslation} from "@/features/i18n/hooks/useTranslation";

import {getPaintingStageLabel} from "../lib/paintingStageLabel";
import {useModelEditorStore} from "../store/modelEditorStore";
import type {PaintingStage,PaintingStepPreviewShot} from "../types/PaintingWorkflow";
import {invalidateStepPreview} from "./cache";
import {getStepPreviewCacheKey} from "./getStepPreviewCacheKey";
import {getCurrentStepPreviewCamera,getOrGenerateStepPreview} from "./stepPreviewService";
import type {StepPreviewErrorCode,StepPreviewResult} from "./types";
import {useManualStepPreviewCapture} from "./ManualStepPreviewCaptureContext";

function normalizeError(error:unknown):StepPreviewErrorCode{if(error instanceof Error&&["modelUnavailable","targetsUnavailable","renderUnavailable","generationCancelled"].includes(error.message))return error.message as StepPreviewErrorCode;return"unknown"}
const previewFocusClass="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]";
const previewSecondaryClass=`inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-xs font-medium text-[var(--text)] shadow-sm transition hover:border-[var(--accent)] hover:bg-[var(--bg)] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 ${previewFocusClass}`;
const previewPrimaryClass=`inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-3 text-xs font-semibold text-[var(--accent-foreground)] shadow-sm transition hover:brightness-110 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 ${previewFocusClass}`;
const previewIconClass=`grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] shadow-sm transition hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${previewFocusClass}`;

export function StepPreview({projectId,step}:{projectId:string;step:PaintingStage}){
  const{t}=useTranslation();
  const manualCapture=useManualStepPreviewCapture();
  const parts=useModelEditorStore(state=>state.parts);
  const details=useModelEditorStore(state=>state.manualDetails);
  const palette=useModelEditorStore(state=>state.palette);
  const addMarkerShot=useModelEditorStore(state=>state.addPaintingStagePreviewShot);
  const addRegionShot=useModelEditorStore(state=>state.addPaintingStageRegionPreviewShot);
  const replaceRegionShot=useModelEditorStore(state=>state.replacePaintingStageRegionPreviewShot);
  const remove=useModelEditorStore(state=>state.removePaintingStagePreviewShot);
  const setOverview=useModelEditorStore(state=>state.setPaintingStageOverviewPreviewEnabled);
  const[choosing,setChoosing]=useState(false);
  const[previewError,setPreviewError]=useState(false);
  const addButtonRef=useRef<HTMLButtonElement>(null);
  const part=parts.find(item=>item.paintingWorkflow.stages.some(candidate=>candidate.id===step.id));
  const targetIds=new Set(step.targetReferences?.filter(reference=>reference.type==="manualDetail").map(reference=>reference.id));
  const targetDetails=details.filter(detail=>targetIds.has(detail.id));
  const markerDetails=targetDetails.filter(detail=>(detail.targetMode??"markers")==="markers");
  const regionDetails=targetDetails.filter(detail=>detail.targetMode==="region"&&detail.region?.selections.length);
  const shots=step.previewShots??[];
  const overviewEnabled=step.overviewPreviewEnabled!==false;
  const added=new Set(shots.filter(shot=>shot.type==="manualDetailLocation").map(shot=>`${shot.manualDetailId}:${shot.pinId}`));
  const title=getPaintingStageLabel(step,t);
  const canManualCapture=Boolean(part)&&((step.targetReferences?.length??0)>0||step.type==="primer");

  function removeShot(shot:PaintingStepPreviewShot){if(!part)return;invalidateStepPreview(getStepPreviewCacheKey(projectId,step,parts,details,palette,shot));remove(part.id,step.id,shot.id)}
  function closeChooser(){setChoosing(false);requestAnimationFrame(()=>addButtonRef.current?.focus())}
  function removeOverview(){if(!part)return;invalidateStepPreview(getStepPreviewCacheKey(projectId,step,parts,details,palette));setOverview(part.id,step.id,false)}
  function restoreOverview(){if(part)setOverview(part.id,step.id,true)}
  function captureRegion(detailId:string){
    if(!part)return;
    const camera=getCurrentStepPreviewCamera(projectId);
    if(!camera){setPreviewError(true);return}
    setPreviewError(false);
    addRegionShot(part.id,step.id,detailId,camera);
    closeChooser();
  }
  function replaceRegion(shot:PaintingStepPreviewShot){
    if(!part||shot.type!=="manualDetailRegion")return;
    const camera=getCurrentStepPreviewCamera(projectId);
    if(!camera){setPreviewError(true);return}
    invalidateStepPreview(getStepPreviewCacheKey(projectId,step,parts,details,palette,shot));
    setPreviewError(false);
    replaceRegionShot(part.id,step.id,shot.id,camera);
  }

  return <section className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5">
    <div>
      <div className="w-full"><h4 className="text-xs font-semibold text-[var(--text)]">{regionDetails.length?t("editor.region.previewTitle"):t("editor.steps.preview.title")}</h4><p className="mt-0.5 text-[10px] leading-4 text-[var(--text-secondary)]">{regionDetails.length?t("editor.region.previewHelp"):t("editor.steps.preview.automatic")}</p></div>
      <div className="mt-2 flex flex-wrap items-center justify-start gap-1.5">
        {!overviewEnabled?<button type="button" onClick={restoreOverview} title={t("editor.steps.previewShots.restoreOverview")} aria-label={t("editor.steps.previewShots.restoreOverview")} className={previewIconClass}><RefreshCw className="size-3.5"/></button>:null}
        {targetDetails.length?<button ref={addButtonRef} type="button" onClick={()=>setChoosing(true)} title={regionDetails.length?t("editor.region.addCustomPreview"):t("editor.steps.previewShots.addAnother")} aria-label={regionDetails.length?t("editor.region.addCustomPreview"):t("editor.steps.previewShots.addAnother")} className={previewIconClass}><Plus className="size-3.5"/></button>:null}
        {canManualCapture&&part?<button type="button" onClick={()=>manualCapture?.open(part.id,step)} className={`${previewPrimaryClass} w-fit px-2.5`}><Camera className="size-3.5 shrink-0"/><span>{t("editor.steps.manualCapture.create")}</span></button>:null}
      </div>
    </div>
    {previewError?<p role="alert" className="mt-2 text-xs text-red-400">{t("editor.region.previewCameraUnavailable")}</p>:null}
    {overviewEnabled||shots.length?<div className="mt-2.5 grid gap-1.5">
      {overviewEnabled?<PreviewImage projectId={projectId} step={step} label={t("editor.steps.previewShots.automaticOverview")} title={title} onRemove={removeOverview}/>:null}
      {shots.map((shot,index)=>{const detail=details.find(item=>item.id===shot.manualDetailId);const pinIndex=shot.type==="manualDetailLocation"?detail?.pins.findIndex(pin=>pin.id===shot.pinId)??-1:-1;const unavailable=shot.type==="manualStepCapture"?false:!detail||(shot.type==="manualDetailLocation"?pinIndex<0:detail.targetMode!=="region"||!detail.region?.selections.length);const label=shot.type==="manualStepCapture"?t("editor.steps.manualCapture.label",{index:index+1}):shot.type==="manualDetailRegion"&&detail?t("editor.region.customPreviewLabel",{name:detail.name,index:index+1}):detail&&pinIndex>=0?t("editor.steps.previewShots.detailLabel",{number:detail.markerNumber??detail.number,name:detail.name,index:pinIndex+1}):t("editor.steps.previewShots.unavailable");return <PreviewImage key={shot.id} projectId={projectId} step={step} shot={shot} label={label} title={title} unavailable={unavailable} onReplace={shot.type==="manualDetailRegion"?()=>replaceRegion(shot):undefined} onRemove={()=>removeShot(shot)}/>})}
    </div>:<p className="mt-2 rounded-lg bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-muted)]">{t("editor.steps.preview.empty")}</p>}
    {choosing?<div role="dialog" aria-modal="true" aria-label={regionDetails.length?t("editor.region.addCustomPreview"):t("editor.steps.previewShots.chooseLocation")} className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
      <div className="flex items-center justify-between"><p className="text-xs font-semibold">{regionDetails.length?t("editor.region.addCustomPreview"):t("editor.steps.previewShots.chooseLocation")}</p><button autoFocus type="button" aria-label={t("common.close")} onClick={closeChooser} className={`grid size-9 cursor-pointer place-items-center rounded-lg border border-[var(--border)] bg-[var(--card)] transition hover:bg-[var(--bg)] ${previewFocusClass}`}><X className="size-4"/></button></div>
      {regionDetails.length?<p className="mt-1 text-xs text-[var(--text-secondary)]">{t("editor.region.positionAndCapture")}</p>:null}
      <div className="mt-2 space-y-3">
        {markerDetails.map(detail=><section key={detail.id}><p className="text-xs font-medium">{t("editor.manualDetails.detailLabel",{number:detail.markerNumber??detail.number,name:detail.name})}</p><div className="mt-1 flex flex-wrap gap-1">{detail.pins.map((pin,index)=>{const exists=added.has(`${detail.id}:${pin.id}`);return <button key={pin.id} type="button" disabled={exists} title={exists?t("editor.steps.previewShots.alreadyAdded"):undefined} onClick={()=>{if(part){addMarkerShot(part.id,step.id,detail.id,pin.id);closeChooser()}}} className={previewSecondaryClass}>{t("editor.steps.previewShots.location",{index:index+1})}</button>})}</div></section>)}
        {regionDetails.map(detail=><button key={detail.id} type="button" onClick={()=>captureRegion(detail.id)} className={`flex w-full cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-left text-xs shadow-sm transition hover:border-[var(--accent)] hover:bg-[var(--bg)] active:scale-[.99] ${previewFocusClass}`}><Camera className="size-4 text-[var(--accent)]"/><span><span className="block font-medium">{detail.name}</span><span className="text-[10px] text-[var(--text-secondary)]">{t("editor.region.captureCurrentView")}</span></span></button>)}
      </div>
      <button type="button" onClick={closeChooser} className={`mt-3 ${previewSecondaryClass}`}>{t("common.cancel")}</button>
    </div>:null}
  </section>
}

function PreviewImage({projectId,step,shot,label,title,unavailable=false,onReplace,onRemove}:{projectId:string;step:PaintingStage;shot?:PaintingStepPreviewShot;label:string;title:string;unavailable?:boolean;onReplace?:()=>void;onRemove?:()=>void}){
  const{t}=useTranslation();
  const parts=useModelEditorStore(state=>state.parts);
  const details=useModelEditorStore(state=>state.manualDetails);
  const palette=useModelEditorStore(state=>state.palette);
  const key=useMemo(()=>getStepPreviewCacheKey(projectId,step,parts,details,palette,shot),[details,palette,parts,projectId,shot,step]);
  const[result,setResult]=useState<StepPreviewResult|null>(null);
  const[error,setError]=useState<StepPreviewErrorCode|null>(null);
  const[loading,setLoading]=useState(false);
  const request=useRef(0);
  const hasTargets=Boolean(step.targetReferences?.length)||step.type==="primer";
  const generate=useCallback(async(force=false)=>{if(!hasTargets||unavailable)return;const token=++request.current;setLoading(true);setError(null);try{const next=await getOrGenerateStepPreview(projectId,step.id,key,force,shot);if(token===request.current)setResult(next)}catch(runtimeError){if(token===request.current){setResult(null);setError(normalizeError(runtimeError))}}finally{if(token===request.current)setLoading(false)}},[hasTargets,key,projectId,shot,step.id,unavailable]);
  useEffect(()=>{void generate();return()=>{request.current+=1}},[generate]);
  return <figure className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]">
    <div className="flex min-h-9 items-center justify-between gap-2 px-2 py-1"><figcaption title={label} className="min-w-0 flex-1 truncate pr-1 text-[10px] leading-4 text-[var(--text-secondary)]">{label}</figcaption><div className="flex shrink-0 gap-1"><button type="button" disabled={loading||unavailable} onClick={onReplace??(()=>void generate(true))} title={onReplace?t("editor.region.replacePreview"):t("editor.region.generatePreview")} aria-label={onReplace?t("editor.region.replacePreview"):t("editor.region.generatePreview")} className={`grid size-7 cursor-pointer place-items-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--accent)] transition hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${previewFocusClass}`}><RefreshCw className={`size-3.5 ${loading?"animate-spin":""}`}/></button>{onRemove?<button type="button" onClick={onRemove} title={t("editor.steps.previewShots.accessibility.remove",{label})} aria-label={t("editor.steps.previewShots.accessibility.remove",{label})} className={`grid size-7 cursor-pointer place-items-center rounded-md border border-transparent text-[var(--danger)] transition hover:border-[var(--danger)] hover:bg-[var(--danger-soft)] active:scale-95 ${previewFocusClass}`}><Trash2 className="size-3.5"/></button>:null}</div></div>
    <div className="relative aspect-[16/7]">{!hasTargets?<div className="grid h-full place-items-center p-3 text-center text-xs text-neutral-500">{t("editor.steps.preview.general")}</div>:unavailable?<div className="grid h-full place-items-center p-3 text-center text-xs text-neutral-500">{t("editor.steps.previewShots.missingLocation")}</div>:loading?<div role="status" className="grid h-full place-items-center text-xs text-neutral-500">{t("editor.steps.preview.generating")}</div>:result?<Image unoptimized fill sizes="320px" src={result.imageUrl} alt={shot?t("editor.steps.previewShots.accessibility.alt",{title,label}):t("editor.steps.preview.accessibility.alt",{title})} className="object-cover"/>:<button type="button" onClick={()=>void generate(true)} className={`absolute inset-3 m-auto h-fit ${previewPrimaryClass}`}>{error?t(`editor.steps.preview.errors.${error}`):t("editor.region.generatePreview")}</button>}</div>
  </figure>
}
