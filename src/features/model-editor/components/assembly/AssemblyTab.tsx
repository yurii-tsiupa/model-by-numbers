"use client";

import { Plus, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import type { AssemblyStep, CreateAssemblyStepInput } from "@/features/models/types/AssemblyStep";
import { useModelEditorStore } from "../../store/modelEditorStore";
import { AssemblyStepCard } from "./AssemblyStepCard";
import { AssemblyStepFormModal } from "./AssemblyStepFormModal";

export function AssemblyTab({ onShowParts }: { onShowParts: (partIds: string[]) => void }) {
  const { t } = useTranslation();
  const parts = useModelEditorStore((state)=>state.parts);
  const steps = useModelEditorStore((state)=>state.assemblySteps);
  const addStep = useModelEditorStore((state)=>state.addAssemblyStep);
  const updateStep = useModelEditorStore((state)=>state.updateAssemblyStep);
  const deleteStep = useModelEditorStore((state)=>state.deleteAssemblyStep);
  const moveStep = useModelEditorStore((state)=>state.moveAssemblyStep);
  const [editing, setEditing] = useState<AssemblyStep|null|"new">(null);
  const [deleting, setDeleting] = useState<AssemblyStep|null>(null);
  const partsById = useMemo(()=>new Map(parts.map((part)=>[part.id,part])),[parts]);
  function save(input: CreateAssemblyStepInput) { if (editing === "new") addStep(input); else if (editing) updateStep(editing.id,input); setEditing(null); }
  return <div className="flex min-h-0 flex-1 flex-col"><div className="flex items-center justify-between border-b border-white/10 p-4"><div><p className="text-xs uppercase tracking-[.18em] text-neutral-600">{t("assembly.description")}</p><h2 className="mt-2 text-lg font-semibold">{t("assembly.title")}</h2></div>{steps.length>0?<button type="button" onClick={()=>setEditing("new")} className="flex items-center gap-1 rounded-lg bg-orange-400 px-2.5 py-2 text-xs font-semibold text-black"><Plus className="h-3.5 w-3.5"/>{t("assembly.addStep")}</button>:null}</div>{steps.length===0?<div className="flex flex-1 items-center justify-center p-5 text-center"><div><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10"><Wrench className="h-5 w-5 text-neutral-600"/></div><h3 className="mt-4 text-sm font-medium text-neutral-300">{t("assembly.emptyTitle")}</h3><p className="mt-2 text-xs leading-5 text-neutral-500">{t("assembly.emptyDescription")}</p><button type="button" disabled={parts.length===0} onClick={()=>setEditing("new")} className="mt-4 rounded-xl bg-orange-400 px-4 py-2 text-xs font-semibold text-black disabled:opacity-40">{t("assembly.addFirstStep")}</button></div></div>:<div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">{steps.map((step,index)=><AssemblyStepCard key={step.id} step={step} partsById={partsById} isFirst={index===0} isLast={index===steps.length-1} onEdit={()=>setEditing(step)} onDelete={()=>setDeleting(step)} onMove={(direction)=>moveStep(step.id,direction)} onShowParts={()=>onShowParts(step.partIds.filter((id)=>partsById.has(id)))}/>)}</div>}{editing?<AssemblyStepFormModal step={editing==="new"?null:editing} parts={parts} onClose={()=>setEditing(null)} onSave={save}/>:null}<ConfirmationModal isOpen={Boolean(deleting)} title={t("assembly.deleteTitle",{number:String(deleting?.order??0).padStart(2,"0")})} description={t("assembly.deleteDescription")} confirmLabel={t("common.delete")} variant="danger" onClose={()=>setDeleting(null)} onConfirm={()=>{if(deleting)deleteStep(deleting.id);setDeleting(null);}}/></div>;
}
