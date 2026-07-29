"use client";

import {Brush,Check,Eraser,MapPin,Paintbrush,Pencil,Plus,Redo2,Sparkles,Trash2,Undo2,X} from "lucide-react";
import {useEffect,useMemo,useRef,useState,type ComponentType,type CSSProperties} from "react";

import {useTranslation} from "@/features/i18n/hooks/useTranslation";
import {useModelEditorStore} from "../../store/modelEditorStore";
import type {PaintingTargetReference} from "../../types/PaintingWorkflow";
import {SimpleDetailColorSelect} from "./SimpleDetailColorSelect";
import {regionSelectionsEqual,smoothRegionSelections} from "../../lib/regionBrushGeometry";

const focusClass="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]";
const primaryButtonClass=`inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-3 text-xs font-semibold text-[var(--accent-foreground)] shadow-sm transition hover:brightness-110 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`;
const areaButtonClass=`simple-detail-area-action inline-flex min-h-9 w-full cursor-pointer items-center justify-center rounded-lg px-3 text-xs font-semibold transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`;
const toolButtonClass=`grid size-9 cursor-pointer place-items-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] shadow-sm transition hover:border-[var(--accent)] hover:bg-[var(--bg)] hover:text-[var(--accent)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 ${focusClass}`;

export function StepDetailsAndMarkers({value,onChange}:{value:PaintingTargetReference[];onChange:(value:PaintingTargetReference[])=>void}){
  const{t}=useTranslation();
  const details=useModelEditorStore(state=>state.manualDetails);
  const palette=useModelEditorStore(state=>state.palette);
  const markerDraft=useModelEditorStore(state=>state.manualDetailPlacement);
  const regionDraft=useModelEditorStore(state=>state.regionPlacement);
  const startMarkers=useModelEditorStore(state=>state.startManualDetailPlacement);
  const cancelMarkers=useModelEditorStore(state=>state.cancelManualDetailPlacement);
  const finishMarkersStore=useModelEditorStore(state=>state.finishManualDetailPlacement);
  const createRegion=useModelEditorStore(state=>state.createRegionManualDetail);
  const startRegion=useModelEditorStore(state=>state.startRegionPlacement);
  const cancelRegion=useModelEditorStore(state=>state.cancelRegionPlacement);
  const simpleTargetMode=useModelEditorStore(state=>state.simpleTargetMode);
  const update=useModelEditorStore(state=>state.updateManualDetail);
  const remove=useModelEditorStore(state=>state.deleteManualDetail);
  const[editorId,setEditorId]=useState<string|null>(null);
  const[isNew,setIsNew]=useState(false);
  const[pendingId,setPendingId]=useState<string|null>(null);
  const[name,setName]=useState("");
  const[colorId,setColorId]=useState<string|null>(null);
  const[validation,setValidation]=useState(false);
  const regionCreationRef=useRef(false);
  const attachedIds=new Set(value.filter(reference=>reference.type==="manualDetail").map(reference=>reference.id));
  const attached=details.filter(detail=>attachedIds.has(detail.id));
  const editableDetailId=value.find(reference=>reference.type==="manualDetail")?.id??null;
  const editing=editorId?details.find(detail=>detail.id===editorId)??null:null;
  const mode=simpleTargetMode??"markers";
  const targetAction=mode==="markers"
    ?{label:t("editor.workflow.addMarkers"),Icon:MapPin}
    :{label:t("editor.workflow.selectPaintArea"),Icon:Paintbrush};
  const targeting=Boolean(markerDraft||regionDraft);
  const regionCount=(regionDraft?.selections??editing?.region?.selections??[]).reduce((sum,selection)=>sum+selection.triangleIndices.length,0);
  const markerCount=(markerDraft?.pins.length??0)+(markerDraft?editing?.pins.length??0:editing?.pins.length??0);
  const activeCount=mode==="markers"?markerCount:regionCount;

  useEffect(()=>{if(!targeting)return;const escape=(event:KeyboardEvent)=>{if(event.key!=="Escape")return;event.preventDefault();if(markerDraft)cancelMarkers();if(regionDraft)cancelRegion()};window.addEventListener("keydown",escape);return()=>window.removeEventListener("keydown",escape)},[cancelMarkers,cancelRegion,markerDraft,regionDraft,targeting]);
  useEffect(()=>{if(mode==="markers"&&regionDraft)cancelRegion();if(mode==="region"&&markerDraft)cancelMarkers()},[cancelMarkers,cancelRegion,markerDraft,mode,regionDraft]);
  function stopTransientTargeting(){if(markerDraft)cancelMarkers();if(regionDraft)cancelRegion()}
  function add(){if(attachedIds.size>0)return;stopTransientTargeting();regionCreationRef.current=false;setIsNew(true);setEditorId(null);setPendingId(null);setName("");setColorId(null);setValidation(false)}
  function edit(id:string){if(id!==editableDetailId)return;const detail=details.find(item=>item.id===id);if(!detail)return;stopTransientTargeting();regionCreationRef.current=false;setIsNew(false);setEditorId(id);setName(detail.name);setColorId(detail.colorId);setValidation(false)}
  function beginTargeting(){
    if(!name.trim()||!colorId){setValidation(true);return}
    setValidation(false);
    const currentMode=useModelEditorStore.getState().simpleTargetMode??"markers";
    if(currentMode==="markers"){if(!editorId&&attachedIds.size>0)return;cancelRegion();startMarkers(name.trim(),editorId??undefined);return}
    cancelMarkers();
    let id=editorId;
    if(!id){
      if(attachedIds.size>0||regionCreationRef.current)return;
      regionCreationRef.current=true;
      id=createRegion(name.trim(),colorId);
      setEditorId(id);
      setPendingId(id);
    }
    else update(id,{name:name.trim(),colorId,targetMode:"region",pins:[]});
    startRegion(id);
  }
  function finishMarkers(){
    if(!markerDraft?.pins.length){setValidation(true);return}
    if(!editorId&&attachedIds.size>0){cancelMarkers();reset();return}
    const existing=markerDraft.detailId;
    finishMarkersStore();
    const id=existing??useModelEditorStore.getState().selectedManualDetailId;
    if(id){setEditorId(id);if(!existing)setPendingId(id);update(id,{name:name.trim(),colorId,targetMode:"markers",region:{selections:[]}})}
  }
  function save(){
    if(!editorId||!name.trim()||!activeCount){setValidation(true);return}
    if(!attachedIds.has(editorId)&&attachedIds.size>0){if(pendingId)remove(pendingId);reset();return}
    update(editorId,{name:name.trim(),colorId,targetMode:mode,...(mode==="markers"?{region:{selections:[]}}:{pins:[]})});
    if(!attachedIds.has(editorId))onChange([...value,{type:"manualDetail",id:editorId}]);
    reset();
  }
  function reset(){stopTransientTargeting();regionCreationRef.current=false;setEditorId(null);setPendingId(null);setIsNew(false);setValidation(false)}
  function cancel(){if(pendingId&&!attachedIds.has(pendingId))remove(pendingId);reset()}

  const editorOpen=isNew||Boolean(editorId);
  return <section>
    <div className="flex items-center gap-3">
      <h4 className="simple-editor-heading text-[10px] font-semibold uppercase tracking-wider">{t("editor.workflow.detail")}</h4>
      <span aria-hidden="true" className="h-px flex-1 bg-[var(--border)]"/>
    </div>
    {attached.length?<div className="mt-3 space-y-2">{attached.map(detail=>{const color=detail.colorId?palette.find(candidate=>candidate.id===detail.colorId):null,count=detail.region?.selections.reduce((sum,selection)=>sum+selection.triangleIndices.length,0)??0;return <article key={detail.id} className="flex min-w-0 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-2">
      {color?<span className="size-5 shrink-0 rounded-md border" style={{backgroundColor:color.hex}}/>:<MapPin className="size-4"/>}
      <span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{detail.name}</span><span className="block truncate text-[10px] text-[var(--text-secondary)]">{color?.name??t("editor.colors.unassigned")} · {detail.targetMode==="region"?t("editor.region.selectedCount",{count}):t("editor.workflow.markerCount",{count:detail.pins.length})}</span></span>
      {detail.id===editableDetailId?<button type="button" onClick={()=>edit(detail.id)} title={t("editor.workflow.editDetailNamed",{name:detail.name})} aria-label={t("editor.workflow.editDetailNamed",{name:detail.name})} className={toolButtonClass}><Pencil className="size-3.5"/></button>:null}
      <button type="button" onClick={()=>onChange(value.filter(reference=>!(reference.type==="manualDetail"&&reference.id===detail.id)))} title={t("editor.workflow.deleteDetailNamed",{name:detail.name})} aria-label={t("editor.workflow.deleteDetailNamed",{name:detail.name})} className={`${toolButtonClass} border-red-500/20 text-red-400 hover:border-red-400 hover:bg-red-500/10 hover:text-red-400`}><Trash2 className="size-3.5"/></button>
    </article>})}</div>:!editorOpen?<div className="mt-2.5 flex items-center justify-between gap-3"><p className="text-xs text-[var(--text-muted)]">{t("editor.workflow.noDetails")}</p><button type="button" onClick={add} className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[var(--accent)] transition hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><Plus className="size-3.5"/>{t("editor.workflow.addDetail")}</button></div>:null}
    {editorOpen?<div className="mt-3 space-y-3 rounded-xl bg-[var(--card)]">
      <label className="simple-editor-label block text-[10px] font-semibold uppercase tracking-wide">{t("editor.workflow.detailName")}<input value={name} disabled={targeting} placeholder={t("editor.workflow.detailNamePlaceholder")} onChange={event=>setName(event.target.value)} className="simple-editor-control mt-1 h-9 w-full px-3 text-sm normal-case tracking-normal placeholder:text-[var(--text-muted)]"/></label>
      <SimpleDetailColorSelect value={colorId} colors={palette} disabled={targeting} onChange={setColorId} label={t("editor.workflow.detailColor")}/>
      {validation?<p role="alert" className="text-xs text-red-400">{t("editor.region.targetRequired")}</p>:null}
      {markerDraft?<MarkerControls count={markerDraft.pins.length} finish={finishMarkers}/>:regionDraft?<RegionControls/>:null}
      <div className="space-y-2 border-t border-[var(--border)] pt-3">
        <button type="button" onClick={beginTargeting} disabled={targeting} className={`${areaButtonClass} gap-2`}><targetAction.Icon className="size-3.5"/>{targetAction.label}</button>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={cancel} className="min-h-9 w-full cursor-pointer rounded-lg bg-transparent px-3 text-xs font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("common.cancel")}</button>
          <button type="button" onClick={save} disabled={!editorId||!activeCount||targeting} className={`${primaryButtonClass} w-full`}>{t("editor.workflow.saveDetail")}</button>
        </div>
      </div>
    </div>:null}
  </section>
}

function MarkerControls({count,finish}:{count:number;finish:()=>void}){
  const{t}=useTranslation();
  const undo=useModelEditorStore(state=>state.undoDraftManualDetailPin);
  const clear=useModelEditorStore(state=>state.clearDraftManualDetailPins);
  const cancel=useModelEditorStore(state=>state.cancelManualDetailPlacement);
  const markerGhostClass=`inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-transparent px-2.5 text-xs font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`;
  const markerToolClass=`grid size-8 cursor-pointer place-items-center rounded-lg bg-transparent text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`;
  return <div className="space-y-2 border-t border-[var(--border)] pt-2.5">
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h5 className="text-xs font-semibold text-[var(--text)]">{t("editor.workflow.markerPlacementTitle")}</h5>
        <span className="shrink-0 text-[11px] font-medium text-[var(--text-secondary)]">{t("editor.workflow.markerCount",{count})}</span>
      </div>
      <p className="mt-0.5 text-[11px] leading-4 text-[var(--text-muted)]">{t("editor.workflow.markerPlacementInstruction")}</p>
    </div>
    <div className="flex items-center gap-1">
      <button type="button" disabled={!count} onClick={undo} title={t("editor.workflow.undoLast")} aria-label={t("editor.workflow.undoLast")} className={markerToolClass}><Undo2 className="size-4"/></button>
      <button type="button" disabled={!count} onClick={clear} title={t("editor.workflow.clearMarkers")} aria-label={t("editor.workflow.clearMarkers")} className={`${markerToolClass} hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] disabled:hover:text-[var(--text-muted)]`}><Trash2 className="size-4"/></button>
    </div>
    <div className="grid grid-cols-[1fr_2fr] gap-1.5">
      <button type="button" onClick={cancel} className={markerGhostClass}><X className="size-3.5"/>{t("common.cancel")}</button>
      <button type="button" disabled={!count} onClick={finish} className={`${primaryButtonClass} w-full`}><Check className="size-3.5"/>{t("editor.region.finishPlacement")}</button>
    </div>
  </div>
}

function RegionControls(){
  const{t}=useTranslation();
  const draft=useModelEditorStore(state=>state.regionPlacement);
  const setBrush=useModelEditorStore(state=>state.setRegionBrush);
  const setErase=useModelEditorStore(state=>state.setRegionErase);
  const undo=useModelEditorStore(state=>state.undoRegion);
  const redo=useModelEditorStore(state=>state.redoRegion);
  const clear=useModelEditorStore(state=>state.clearRegion);
  const commit=useModelEditorStore(state=>state.commitRegionSelections);
  const finish=useModelEditorStore(state=>state.finishRegionPlacement);
  const cancel=useModelEditorStore(state=>state.cancelRegionPlacement);
  const count=draft?.selections.reduce((sum,selection)=>sum+selection.triangleIndices.length,0)??0;
  const smoothed=useMemo(()=>smoothRegionSelections(draft?.selections??[],"manual"),[draft?.selections]);
  const canSmooth=Boolean(draft&&count&&!regionSelectionsEqual(draft.selections,smoothed));
  if(!draft)return null;
  return <div className="sticky bottom-2 z-10 space-y-2.5 rounded-xl border border-[var(--accent-2)] bg-[var(--card)]/95 p-2.5 shadow-lg backdrop-blur">
    <p className="px-0.5 text-xs font-semibold text-[var(--accent-2)]">{t("editor.region.placing")} · {t("editor.region.selectedCount",{count})}</p>
    <label className="flex min-w-0 items-center gap-2 rounded-lg bg-[var(--surface)] px-2 py-2 text-xs">
      <span className="flex shrink-0 items-center gap-1.5 font-medium text-[var(--text-secondary)]"><Brush className="size-3.5 text-[var(--accent-2)]"/>{t("editor.region.brushSize")}</span>
      <input type="range" min="0" max="100" step="1" value={draft.brush} onChange={event=>setBrush(Number(event.target.value))} aria-label={t("editor.region.brushSize")} style={{"--region-brush-progress":`${draft.brush}%`} as CSSProperties} className="region-brush-slider min-w-16 flex-1 cursor-pointer disabled:cursor-not-allowed"/>
      <span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-[var(--text-secondary)]">{(.3+(8-.3)*(draft.brush/100)**2).toFixed(1)}%</span>
    </label>
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="flex gap-1">
        <IconButton icon={Brush} label={t("editor.region.paint")} active={!draft.erase} onClick={()=>setErase(false)}/>
        <IconButton icon={Eraser} label={t("editor.region.erase")} active={draft.erase} onClick={()=>setErase(true)}/>
      </div>
      <span aria-hidden="true" className="mx-0.5 h-6 w-px bg-[var(--border)]"/>
      <div className="flex gap-1">
        <IconButton icon={Undo2} label={t("common.undo")} disabled={!draft.history.length} onClick={undo}/>
        <IconButton icon={Redo2} label={t("common.redo")} disabled={!draft.future.length} onClick={redo}/>
        <IconButton icon={Sparkles} label={t("editor.region.smoothEdges")} disabled={!canSmooth} onClick={()=>commit(smoothed)}/>
        <IconButton icon={Trash2} label={t("common.clear")} disabled={!count} destructive onClick={clear}/>
      </div>
      <div className="ml-auto flex gap-1">
        <IconButton icon={X} label={t("common.cancel")} onClick={cancel}/>
        <IconButton icon={Check} label={t("editor.region.finish")} disabled={!count} onClick={finish} primary/>
      </div>
    </div>
  </div>
}

function IconButton({icon:Icon,label,disabled=false,active=false,primary=false,destructive=false,onClick}:{icon:ComponentType<{className?:string}>;label:string;disabled?:boolean;active?:boolean;primary?:boolean;destructive?:boolean;onClick:()=>void}){
  return <button type="button" title={label} aria-label={label} aria-pressed={active||undefined} disabled={disabled} onClick={onClick} className={`${toolButtonClass} region-toolbar-button ${active?"is-active":""} ${destructive?"is-destructive":""} ${primary?"is-primary":""}`}><Icon className="size-4"/></button>
}
