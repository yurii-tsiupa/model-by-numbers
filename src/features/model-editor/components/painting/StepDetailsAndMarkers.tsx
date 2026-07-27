"use client";

import {Brush,Check,Eraser,MapPin,Paintbrush,Pencil,Plus,Redo2,Trash2,Undo2,X} from "lucide-react";
import {useEffect,useState,type ComponentType} from "react";

import {useTranslation} from "@/features/i18n/hooks/useTranslation";
import {resolveSimpleTargetMode} from "../../lib/simpleTargetMode";

import {useModelEditorStore} from "../../store/modelEditorStore";
import type {PaintingTargetReference} from "../../types/PaintingWorkflow";
import {SimpleDetailColorSelect} from "./SimpleDetailColorSelect";

const focusClass="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]";
const secondaryButtonClass=`inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-xs font-medium text-[var(--text)] shadow-sm transition hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] hover:bg-[var(--bg)] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`;
const primaryButtonClass=`inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-3 text-xs font-semibold text-[var(--accent-foreground)] shadow-sm transition hover:brightness-110 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`;
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
  const attachedIds=new Set(value.filter(reference=>reference.type==="manualDetail").map(reference=>reference.id));
  const attached=details.filter(detail=>attachedIds.has(detail.id));
  const editing=editorId?details.find(detail=>detail.id===editorId)??null:null;
  const mode=resolveSimpleTargetMode(simpleTargetMode,editing?.targetMode);
  const targeting=Boolean(markerDraft||regionDraft);
  const regionCount=(regionDraft?.selections??editing?.region?.selections??[]).reduce((sum,selection)=>sum+selection.triangleIndices.length,0);
  const markerCount=(markerDraft?.pins.length??0)+(markerDraft?editing?.pins.length??0:editing?.pins.length??0);
  const activeCount=mode==="markers"?markerCount:regionCount;

  useEffect(()=>{if(!targeting)return;const escape=(event:KeyboardEvent)=>{if(event.key!=="Escape")return;event.preventDefault();if(markerDraft)cancelMarkers();if(regionDraft)cancelRegion()};window.addEventListener("keydown",escape);return()=>window.removeEventListener("keydown",escape)},[cancelMarkers,cancelRegion,markerDraft,regionDraft,targeting]);
  function stopTransientTargeting(){if(markerDraft)cancelMarkers();if(regionDraft)cancelRegion()}
  function add(){stopTransientTargeting();setIsNew(true);setEditorId(null);setPendingId(null);setName("");setColorId(null);setValidation(false)}
  function edit(id:string){const detail=details.find(item=>item.id===id);if(!detail)return;stopTransientTargeting();setIsNew(false);setEditorId(id);setName(detail.name);setColorId(detail.colorId);setValidation(false)}
  function beginTargeting(){
    if(!name.trim()||!colorId){setValidation(true);return}
    setValidation(false);
    if(mode==="markers"){startMarkers(name.trim(),editorId??undefined);return}
    let id=editorId;
    if(!id){id=createRegion(name.trim(),colorId);setEditorId(id);setPendingId(id)}
    else update(id,{name:name.trim(),colorId,targetMode:"region",pins:[]});
    startRegion(id);
  }
  function finishMarkers(){
    if(!markerDraft?.pins.length){setValidation(true);return}
    const existing=markerDraft.detailId;
    finishMarkersStore();
    const id=existing??useModelEditorStore.getState().selectedManualDetailId;
    if(id){setEditorId(id);if(!existing)setPendingId(id);update(id,{name:name.trim(),colorId,targetMode:"markers",region:{selections:[]}})}
  }
  function save(){
    if(!editorId||!name.trim()||!activeCount){setValidation(true);return}
    update(editorId,{name:name.trim(),colorId,targetMode:mode,...(mode==="markers"?{region:{selections:[]}}:{pins:[]})});
    if(!attachedIds.has(editorId))onChange([...value,{type:"manualDetail",id:editorId}]);
    reset();
  }
  function reset(){stopTransientTargeting();setEditorId(null);setPendingId(null);setIsNew(false);setValidation(false)}
  function cancel(){if(pendingId&&!attachedIds.has(pendingId))remove(pendingId);reset()}

  const editorOpen=isNew||Boolean(editorId);
  return <section>
    <div className="flex items-center justify-between">
      <h4 className="text-xs font-semibold">{t("editor.workflow.details")}</h4>
      {!editorOpen?<button type="button" onClick={add} className={secondaryButtonClass}><Plus className="size-3.5"/>{t("editor.workflow.addDetail")}</button>:null}
    </div>
    {attached.length?<div className="mt-2 space-y-1">{attached.map(detail=>{const color=detail.colorId?palette.find(candidate=>candidate.id===detail.colorId):null,count=detail.region?.selections.reduce((sum,selection)=>sum+selection.triangleIndices.length,0)??0;return <article key={detail.id} className="flex min-w-0 items-center gap-2 rounded-lg bg-[var(--card)] p-2">
      {color?<span className="size-5 shrink-0 rounded-md border" style={{backgroundColor:color.hex}}/>:<MapPin className="size-4"/>}
      <span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{detail.name}</span><span className="block truncate text-[10px] text-[var(--text-secondary)]">{color?.name??t("editor.colors.unassigned")} · {detail.targetMode==="region"?t("editor.region.selectedCount",{count}):t("editor.workflow.markerCount",{count:detail.pins.length})}</span></span>
      <button type="button" onClick={()=>edit(detail.id)} title={t("editor.workflow.editDetailNamed",{name:detail.name})} aria-label={t("editor.workflow.editDetailNamed",{name:detail.name})} className={toolButtonClass}><Pencil className="size-3.5"/></button>
      <button type="button" onClick={()=>onChange(value.filter(reference=>!(reference.type==="manualDetail"&&reference.id===detail.id)))} title={t("editor.workflow.deleteDetailNamed",{name:detail.name})} aria-label={t("editor.workflow.deleteDetailNamed",{name:detail.name})} className={`${toolButtonClass} border-red-500/20 text-red-400 hover:border-red-400 hover:bg-red-500/10 hover:text-red-400`}><Trash2 className="size-3.5"/></button>
    </article>})}</div>:!editorOpen?<p className="mt-2 text-xs text-[var(--text-secondary)]">{t("editor.workflow.noDetails")}</p>:null}
    {editorOpen?<div className="mt-3 space-y-3 rounded-lg bg-[var(--card)] p-3">
      <label className="block text-xs">{t("editor.workflow.detailName")}<input value={name} disabled={targeting} onChange={event=>setName(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3"/></label>
      <SimpleDetailColorSelect value={colorId} colors={palette} disabled={targeting} onChange={setColorId} label={t("editor.workflow.detailColor")}/>
      {validation?<p role="alert" className="text-xs text-red-400">{t("editor.region.targetRequired")}</p>:null}
      {markerDraft?<MarkerControls count={markerDraft.pins.length} finish={finishMarkers}/>:regionDraft?<RegionControls/>:<div className="flex flex-wrap gap-2">
        <button type="button" onClick={beginTargeting} aria-label={t(mode==="markers"?markerCount?"editor.region.editMarkers":"editor.workflow.placeMarkers":regionCount?"editor.region.editSelectedRegion":"editor.region.selectRegion")} className={primaryButtonClass}>{mode==="region"?<Paintbrush className="size-4"/>:<MapPin className="size-4"/>}{t(mode==="markers"?markerCount?"editor.region.editMarkers":"editor.workflow.placeMarkers":regionCount?"editor.region.editSelectedRegion":"editor.region.selectRegion")}</button>
        <button type="button" onClick={save} disabled={!editorId||!activeCount} className={primaryButtonClass}>{t("editor.workflow.saveDetail")}</button>
        <button type="button" onClick={cancel} className={secondaryButtonClass}>{t("common.cancel")}</button>
      </div>}
    </div>:null}
  </section>
}

function MarkerControls({count,finish}:{count:number;finish:()=>void}){
  const{t}=useTranslation();
  const undo=useModelEditorStore(state=>state.undoDraftManualDetailPin);
  const clear=useModelEditorStore(state=>state.clearDraftManualDetailPins);
  const cancel=useModelEditorStore(state=>state.cancelManualDetailPlacement);
  return <div className="space-y-2">
    <p className="text-xs text-[var(--text-secondary)]">{t("editor.workflow.markerPlacementHelp")}</p>
    <p className="text-xs font-medium">{t("editor.workflow.markerCount",{count})}</p>
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={!count} onClick={undo} className={secondaryButtonClass}><Undo2 className="size-3.5"/>{t("editor.workflow.undoLast")}</button>
      <button type="button" disabled={!count} onClick={clear} className={secondaryButtonClass}><Trash2 className="size-3.5"/>{t("editor.workflow.clearMarkers")}</button>
      <button type="button" onClick={cancel} className={secondaryButtonClass}><X className="size-3.5"/>{t("common.cancel")}</button>
      <button type="button" disabled={!count} onClick={finish} className={primaryButtonClass}><Check className="size-3.5"/>{t("editor.region.finishPlacement")}</button>
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
  const finish=useModelEditorStore(state=>state.finishRegionPlacement);
  const cancel=useModelEditorStore(state=>state.cancelRegionPlacement);
  const count=draft?.selections.reduce((sum,selection)=>sum+selection.triangleIndices.length,0)??0;
  if(!draft)return null;
  return <div className="sticky bottom-2 z-10 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--card)]/95 p-2 shadow-lg backdrop-blur">
    <p className="px-1 text-xs text-[var(--text-secondary)]">{t("editor.region.placing")} · {t("editor.region.selectedCount",{count})}</p>
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1 border-r border-[var(--border)] pr-2">
        <IconButton icon={Brush} label={t("editor.region.paint")} active={!draft.erase} onClick={()=>setErase(false)}/>
        <IconButton icon={Eraser} label={t("editor.region.erase")} active={draft.erase} destructive={draft.erase} onClick={()=>setErase(true)}/>
      </div>
      <label className="flex min-w-40 flex-1 items-center gap-2 border-r border-[var(--border)] pr-2 text-xs">
        <span className="shrink-0">{t("editor.region.brushSize")}</span>
        <input type="range" min="0" max="100" step="1" value={draft.brush} onChange={event=>setBrush(Number(event.target.value))} aria-label={t("editor.region.brushSize")} className="min-w-20 flex-1 accent-[var(--accent)]"/>
        <span className="w-10 text-right tabular-nums text-[var(--text-secondary)]">{(.3+(8-.3)*(draft.brush/100)**2).toFixed(1)}%</span>
      </label>
      <div className="flex gap-1">
        <IconButton icon={Undo2} label={t("common.undo")} disabled={!draft.history.length} onClick={undo}/>
        <IconButton icon={Redo2} label={t("common.redo")} disabled={!draft.future.length} onClick={redo}/>
        <IconButton icon={Trash2} label={t("common.clear")} disabled={!count} onClick={clear}/>
      </div>
      <div className="ml-auto flex gap-1">
        <IconButton icon={X} label={t("common.cancel")} onClick={cancel}/>
        <IconButton icon={Check} label={t("editor.region.finish")} disabled={!count} onClick={finish} primary/>
      </div>
    </div>
  </div>
}

function IconButton({icon:Icon,label,disabled=false,active=false,primary=false,destructive=false,onClick}:{icon:ComponentType<{className?:string}>;label:string;disabled?:boolean;active?:boolean;primary?:boolean;destructive?:boolean;onClick:()=>void}){
  return <button type="button" title={label} aria-label={label} aria-pressed={active||undefined} disabled={disabled} onClick={onClick} className={`${toolButtonClass} ${active?destructive?"border-red-400 bg-red-500/15 text-red-400":"border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]":""} ${primary?"border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]":""}`}><Icon className="size-4"/></button>
}
