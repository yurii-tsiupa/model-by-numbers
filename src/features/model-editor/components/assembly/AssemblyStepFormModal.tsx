"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import type { AssemblyStep, CreateAssemblyStepInput } from "@/features/models/types/AssemblyStep";
import type { ModelPart } from "../../types/ModelPart";
import { AssemblyPartsSelector } from "./AssemblyPartsSelector";

export function AssemblyStepFormModal({ step, parts, onClose, onSave }: { step: AssemblyStep | null; parts: readonly ModelPart[]; onClose: () => void; onSave: (input: CreateAssemblyStepInput) => void }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(step?.title ?? "");
  const [description, setDescription] = useState(step?.description ?? "");
  const [partIds, setPartIds] = useState<string[]>(step?.partIds.filter((id)=>parts.some((part)=>part.id===id)) ?? []);
  const trimmedTitle = title.trim();
  const errors = { title: !trimmedTitle ? t("assembly.validation.titleRequired") : title.length > 120 ? t("assembly.validation.titleTooLong") : null, description: description.length > 1000 ? t("assembly.validation.descriptionTooLong") : null, parts: partIds.length === 0 ? t("assembly.validation.partsRequired") : null };
  const valid = !errors.title && !errors.description && !errors.parts;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"><form onSubmit={(event)=>{event.preventDefault();if(valid)onSave({title,description,partIds});}} className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl"><div className="flex items-center justify-between border-b border-white/10 p-5"><h2 className="text-lg font-semibold">{step?t("assembly.form.editTitle"):t("assembly.form.createTitle")}</h2><button type="button" onClick={onClose} aria-label={t("common.close")}><X className="h-5 w-5"/></button></div><div className="min-h-0 overflow-y-auto p-5"><label className="text-xs text-neutral-400">{t("assembly.form.stepTitle")}<input autoFocus maxLength={120} value={title} onChange={(event)=>setTitle(event.target.value)} className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm outline-none"/></label>{errors.title?<p className="mt-1 text-xs text-red-300">{errors.title}</p>:null}<label className="mt-4 block text-xs text-neutral-400">{t("assembly.form.description")}<textarea maxLength={1000} rows={4} value={description} onChange={(event)=>setDescription(event.target.value)} className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none"/></label>{errors.description?<p className="mt-1 text-xs text-red-300">{errors.description}</p>:null}<fieldset className="mt-4"><legend className="mb-2 text-xs text-neutral-400">{t("assembly.form.selectParts")}</legend><AssemblyPartsSelector parts={parts} selectedIds={partIds} onChange={setPartIds}/>{errors.parts?<p className="mt-1 text-xs text-red-300">{errors.parts}</p>:null}</fieldset></div><div className="flex justify-end gap-2 border-t border-white/10 p-4"><button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-neutral-300">{t("common.cancel")}</button><button type="submit" disabled={!valid} className="rounded-xl bg-orange-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-40">{step?t("assembly.form.update"):t("assembly.form.save")}</button></div></form></div>;
}
