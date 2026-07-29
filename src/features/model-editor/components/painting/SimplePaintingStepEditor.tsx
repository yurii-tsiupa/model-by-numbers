"use client";
import {useEffect,useState} from "react";
import {useTranslation} from "@/features/i18n/hooks/useTranslation";
import type {CreatePaintingStageInput,PaintingStage,PaintingStageType,PaintingTargetReference} from "../../types/PaintingWorkflow";
import {PAINTING_STAGE_TYPES} from "../../lib/paintingWorkflow";
import {getPaintingStageTypeLabel} from "../../lib/paintingStageLabel";
import {getStepsReferencingManualDetail} from "../../lib/paintingTargets";
import {useModelEditorStore} from "../../store/modelEditorStore";
import {StepPreview} from "../../step-previews/StepPreview";
import {StepDetailsAndMarkers} from "./StepDetailsAndMarkers";
import {SimplePartColorDetail} from "./SimplePartColorDetail";
import {resolveSavedPartColorAssignments} from "../../step-previews/resolveStepPreviewComposition";

type Props={stage:PaintingStage;projectId:string;activeReferenceId?:string|null;onSelectReference?:(id:string)=>void;onShowReference?:(id:string)=>void;onReferenceDeleted?:(id:string)=>void;onClose:()=>void;onSave:(input:CreatePaintingStageInput)=>void};
export function SimplePaintingStepEditor({stage,projectId,onClose,onSave}:Props){
 const{t}=useTranslation(),parts=useModelEditorStore(s=>s.parts),simpleTargetMode=useModelEditorStore(s=>s.simpleTargetMode),update=useModelEditorStore(s=>s.updatePaintingStage),deleteDetail=useModelEditorStore(s=>s.deleteManualDetail),clearPartDraft=useModelEditorStore(s=>s.setSimplePartColorDraft),clearAssignments=useModelEditorStore(s=>s.clearSimplePartColorAssignments),commitAssignment=useModelEditorStore(s=>s.commitSimplePartColorAssignment);
 const storeAtOpen=useModelEditorStore.getState(),savedPartId=stage.targetReferences?.find(reference=>reference.type==="part")?.id??null,currentDraft=storeAtOpen.simplePartColorDraft,initialPartId=savedPartId??currentDraft?.partId??storeAtOpen.selectedPartId,savedAssignments=resolveSavedPartColorAssignments(parts,undefined,stage.id,storeAtOpen.simplePaintingStepOrder),initialColorId=stage.paletteColorId??(initialPartId?(Object.hasOwn(storeAtOpen.simplePartColorStepDraftAssignments,initialPartId)?storeAtOpen.simplePartColorStepDraftAssignments[initialPartId]:Object.hasOwn(storeAtOpen.simplePartColorAssignments,initialPartId)?storeAtOpen.simplePartColorAssignments[initialPartId]:savedAssignments.get(initialPartId)??null):null);
 const[type,setType]=useState<PaintingStageType>(stage.type),[title,setTitle]=useState(stage.customName??getPaintingStageTypeLabel(stage.type,t)),[notes,setNotes]=useState(stage.notes),[targets,setTargets]=useState<PaintingTargetReference[]>(initialPartId?[{type:"part",id:initialPartId}]:stage.targetReferences??[]),[paletteColorId,setPaletteColorId]=useState<string|null>(initialColorId);
 useEffect(()=>{
  if(simpleTargetMode!=="parts")return;
  clearPartDraft({stageId:stage.id,partId:initialPartId,paletteColorId:initialColorId});
  return useModelEditorStore.subscribe(state=>{
   const draft=state.simplePartColorDraft;
   if(!draft||draft.stageId!==stage.id)return;
   setTargets(draft.partId?[{type:"part",id:draft.partId}]:[]);
   setPaletteColorId(draft.paletteColorId);
  });
 },[clearPartDraft,initialColorId,initialPartId,simpleTargetMode,stage.id]);
 const valid=Boolean(title.trim())&&title.length<=100&&notes.length<=500&&(simpleTargetMode!=="parts"||type==="primer"||Boolean(targets.some(reference=>reference.type==="part")&&paletteColorId)),isPrimer=type==="primer";
 function targetsChanged(value:PaintingTargetReference[]){const nextKeys=new Set(value.map(reference=>`${reference.type}:${reference.id}`));for(const reference of stage.targetReferences??[])if(!nextKeys.has(`${reference.type}:${reference.id}`)&&reference.type==="manualDetail"&&getStepsReferencingManualDetail(parts,reference.id).length<=1)deleteDetail(reference.id);setTargets(value);const owner=parts.find(part=>part.paintingWorkflow.stages.some(item=>item.id===stage.id));if(owner)update(owner.id,stage.id,{targetReferences:value})}
 const previewStage={...stage,type,customName:title.trim(),notes,paletteColorId,targetReferences:targets};
 function close(){clearPartDraft(null);clearAssignments();onClose()}
 return <form onSubmit={event=>{event.preventDefault();if(valid){const stepPartId=targets.find(reference=>reference.type==="part")?.id;if(simpleTargetMode==="parts"&&stepPartId&&paletteColorId)commitAssignment(stepPartId,paletteColorId);onSave({type,customName:title.trim(),paletteColorId,recommendedCoats:stage.recommendedCoats,notes:notes.trim(),targetReferences:targets,overviewPreviewEnabled:stage.overviewPreviewEnabled,previewShots:stage.previewShots});clearPartDraft(null);clearAssignments()}}} className="simple-step-editor mt-3 space-y-3">
  <section><div className="space-y-2.5"><label className="simple-editor-label block text-[10px] font-semibold uppercase tracking-wide">{t("painting.form.stepTitle")}<input autoFocus value={title} maxLength={100} onChange={event=>setTitle(event.target.value)} className="simple-editor-control mt-1 h-10 w-full px-3 text-sm normal-case tracking-normal"/></label><label className="simple-editor-label block text-[10px] font-semibold uppercase tracking-wide">{t("painting.form.stage")}<select value={type} onChange={event=>setType(event.target.value as PaintingStageType)} className="simple-editor-control mt-1 h-10 w-full cursor-pointer px-3 text-sm normal-case tracking-normal">{PAINTING_STAGE_TYPES.map(value=><option key={value} value={value}>{getPaintingStageTypeLabel(value,t)}</option>)}</select></label><label className="simple-editor-label block text-[10px] font-semibold uppercase tracking-wide">{t("painting.form.instruction")}<textarea rows={3} maxLength={500} value={notes} onChange={event=>setNotes(event.target.value)} className="simple-editor-control mt-1 min-h-20 w-full resize-y p-3 text-sm normal-case tracking-normal"/></label></div></section>
  <section className="simple-editor-section border-t pt-3">{isPrimer?<dl className="flex gap-3 text-xs"><dt className="font-semibold">{t("editor.workflow.target")}</dt><dd className="text-[var(--text-muted)]">{t("editor.workflow.entireModel")}</dd></dl>:simpleTargetMode==="parts"?<SimplePartColorDetail stageId={stage.id} partId={targets.find(reference=>reference.type==="part")?.id??null} colorId={paletteColorId} onChange={(partId,colorId)=>{setTargets(partId?[{type:"part",id:partId}]:[]);setPaletteColorId(colorId)}}/>:<StepDetailsAndMarkers value={targets} onChange={targetsChanged}/>}</section>
  <section className="simple-editor-section border-t pt-3"><div className="flex items-center gap-3"><h4 className="simple-editor-heading text-[10px] font-semibold uppercase tracking-wider">{t("editor.workflow.stepPreview")}</h4><span aria-hidden="true" className="h-px flex-1 bg-[var(--border)]"/></div><StepPreview projectId={projectId} step={previewStage}/></section>
  <div className="simple-editor-footer flex items-center justify-end gap-2 pt-2"><button type="button" onClick={close} className="simple-editor-cancel min-h-9 cursor-pointer rounded-lg px-3 text-sm font-medium">{t("common.cancel")}</button><button disabled={!valid} className="simple-editor-save min-h-9 cursor-pointer rounded-lg px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">{t("painting.form.saveStep")}</button></div>
 </form>
}
