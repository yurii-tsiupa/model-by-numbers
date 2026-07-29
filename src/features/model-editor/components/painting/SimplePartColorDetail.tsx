"use client";

import {Check} from "lucide-react";

import {useTranslation} from "@/features/i18n/hooks/useTranslation";
import {normalizeHexColor} from "../../lib/normalizeHexColor";
import {SIMPLE_QUICK_COLORS} from "../../lib/simpleQuickColors";
import {resolveSavedPartColorAssignments} from "../../step-previews/resolveStepPreviewComposition";
import {useModelEditorStore} from "../../store/modelEditorStore";

const focusClass="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]";

export function SimplePartColorDetail({stageId,partId,colorId,onChange}:{stageId:string;partId:string|null;colorId:string|null;onChange:(partId:string|null,colorId:string|null)=>void}){
  const{t}=useTranslation();
  const parts=useModelEditorStore(state=>state.parts);
  const palette=useModelEditorStore(state=>state.palette);
  const selectPart=useModelEditorStore(state=>state.selectPart);
  const setDraft=useModelEditorStore(state=>state.setSimplePartColorDraft);
  const assignDraft=useModelEditorStore(state=>state.assignSimplePartColorDraft);
  const assignments=useModelEditorStore(state=>state.simplePartColorAssignments);
  const stepDraftAssignments=useModelEditorStore(state=>state.simplePartColorStepDraftAssignments);
  const stepOrder=useModelEditorStore(state=>state.simplePaintingStepOrder);
  const clearAssignments=useModelEditorStore(state=>state.clearSimplePartColorAssignments);
  const selectedColor=palette.find(color=>color.id===colorId)??null;

  function choosePart(nextPartId:string){
    const saved=resolveSavedPartColorAssignments(parts,undefined,stageId,stepOrder);
    const nextColorId=Object.hasOwn(stepDraftAssignments,nextPartId)?stepDraftAssignments[nextPartId]:Object.hasOwn(assignments,nextPartId)?assignments[nextPartId]:saved.get(nextPartId)??null;
    if(partId&&partId!==nextPartId)clearAssignments([partId]);
    selectPart(nextPartId);
    onChange(nextPartId,nextColorId);
    setDraft({stageId,partId:nextPartId,paletteColorId:nextColorId});
  }

  function chooseColor(hex:string){
    if(!partId)return;
    assignDraft(partId,hex,stageId);
    const next=useModelEditorStore.getState().simplePartColorDraft;
    onChange(partId,next?.paletteColorId??null);
  }

  return <section className="space-y-3">
    <label className="simple-editor-label block text-[10px] font-semibold uppercase tracking-wide">{t("editor.parts.modelPart")}<select value={partId??""} onChange={event=>choosePart(event.target.value)} className="simple-editor-control mt-1 h-10 w-full cursor-pointer px-3 text-sm normal-case tracking-normal"><option value="" disabled>{t("editor.parts.selectPart")}</option>{parts.map(part=><option key={part.id} value={part.id}>{part.name}</option>)}</select></label>
    {!partId?<p className="text-xs text-[var(--text-muted)]">{t("editor.parts.chooseBeforeColor")}</p>:null}
    <div>
      <p className="simple-editor-label text-[10px] font-semibold uppercase tracking-wide">{t("editor.parts.currentColor")}</p>
      <div className="mt-1.5 flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3">
        <span className="size-5 shrink-0 rounded-md border border-black/15" style={{backgroundColor:selectedColor?.hex??"var(--text-muted)"}}/>
        <span className="min-w-0 truncate text-xs font-medium">{selectedColor?.name??t("editor.colors.unassigned")}</span>
      </div>
    </div>
    <div>
      <p className="simple-editor-label text-[10px] font-semibold uppercase tracking-wide">{t("properties.quick")}</p>
      <div className="mt-2 flex flex-wrap gap-2">{SIMPLE_QUICK_COLORS.map(color=>{const selected=normalizeHexColor(selectedColor?.hex??"")===normalizeHexColor(color.value);return <button key={color.id} type="button" disabled={!partId} title={t(`color.${color.id}`)} aria-label={t("properties.useColor",{name:t(`color.${color.id}`)})} aria-pressed={selected} onClick={()=>chooseColor(color.value)} className={`relative size-7 shrink-0 cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}><span className="block size-full rounded-[5px] border border-black/15" style={{backgroundColor:color.value}}/>{selected?<Check className="absolute inset-0 m-auto size-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,.95)]"/>:null}</button>})}</div>
    </div>
    <div>
      <p className="simple-editor-label text-[10px] font-semibold uppercase tracking-wide">{t("editor.parts.changeColor")}</p>
      {palette.length?<div className="mt-1.5 max-h-48 space-y-1.5 overflow-y-auto pr-1">{palette.map(color=><button key={color.id} type="button" disabled={!partId} aria-pressed={colorId===color.id} onClick={()=>chooseColor(color.hex)} className={`simple-palette-color-card flex min-h-[48px] w-full cursor-pointer items-center gap-3 rounded-lg border bg-[var(--card)] px-3 py-2 text-left text-xs disabled:cursor-not-allowed disabled:opacity-40 ${colorId===color.id?"border-[var(--accent)] ring-1 ring-[var(--accent)]":"border-[var(--border)]"} ${focusClass}`}><span className="size-7 shrink-0 rounded-lg border border-black/15" style={{backgroundColor:color.hex}}/><span className="min-w-0 truncate font-semibold text-[var(--text)]">{color.name}</span></button>)}</div>:<p className="mt-1.5 text-xs text-[var(--text-muted)]">{t("editor.colors.empty")}</p>}
    </div>
  </section>;
}
