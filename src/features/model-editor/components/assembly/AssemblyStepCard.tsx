"use client";

import { ArrowDown, ArrowUp, Eye, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import type { AssemblyStep } from "@/features/models/types/AssemblyStep";
import type { ModelPart } from "../../types/ModelPart";

type Props = { step: AssemblyStep; partsById: ReadonlyMap<string, ModelPart>; isFirst: boolean; isLast: boolean; onEdit: () => void; onDelete: () => void; onMove: (direction: "up"|"down") => void; onShowParts: () => void };

export function AssemblyStepCard({ step, partsById, isFirst, isLast, onEdit, onDelete, onMove, onShowParts }: Props) {
  const { t, locale } = useTranslation();
  const available = step.partIds.map((id)=>partsById.get(id)).filter((part):part is ModelPart=>Boolean(part));
  const hasMissing = available.length !== step.partIds.length;
  const number = String(step.order).padStart(2,"0");
  const count = available.length;
  const partsCount = locale === "en" ? (count === 1 ? t("assembly.partsCountOne",{count}) : t("assembly.partsCountMany",{count})) : (count%10===1&&count%100!==11 ? t("assembly.partsCountOne",{count}) : count%10>=2&&count%10<=4&&!(count%100>=12&&count%100<=14) ? t("assembly.partsCountFew",{count}) : t("assembly.partsCountMany",{count}));
  return <article className="rounded-2xl border border-white/10 bg-white/[.025] p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-orange-300">{t("assembly.stepLabel",{number})}</p><h3 className="mt-1 truncate text-sm font-semibold text-white">{step.title}</h3></div><div className="flex shrink-0 gap-1"><button type="button" disabled={isFirst} onClick={()=>onMove("up")} title={t("assembly.actions.moveUp")} aria-label={t("assembly.actions.moveUp")} className="p-1.5 text-neutral-400 disabled:opacity-25"><ArrowUp className="h-3.5 w-3.5"/></button><button type="button" disabled={isLast} onClick={()=>onMove("down")} title={t("assembly.actions.moveDown")} aria-label={t("assembly.actions.moveDown")} className="p-1.5 text-neutral-400 disabled:opacity-25"><ArrowDown className="h-3.5 w-3.5"/></button></div></div>{step.description?<p className="mt-2 line-clamp-3 text-xs leading-5 text-neutral-400">{step.description}</p>:null}<p className="mt-3 text-[11px] text-neutral-500">{partsCount}</p><div className="mt-2 flex flex-wrap gap-1">{available.map((part)=><span key={part.id} className="max-w-full truncate rounded-full border border-white/10 px-2 py-1 text-[10px] text-neutral-300">{String(part.index+1).padStart(2,"0")} — {part.name}</span>)}</div>{available.length===0?<p className="mt-2 text-xs text-amber-300">{t("assembly.validation.emptyStep")}</p>:hasMissing?<p className="mt-2 text-xs text-amber-300">{t("assembly.validation.missingPart")}</p>:null}<div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3"><button type="button" disabled={available.length===0} onClick={onShowParts} className="flex items-center gap-1 text-[11px] text-orange-300 disabled:opacity-35"><Eye className="h-3.5 w-3.5"/>{t("assembly.actions.showParts")}</button><button type="button" onClick={onEdit} className="ml-auto flex items-center gap-1 text-[11px] text-neutral-400"><Pencil className="h-3.5 w-3.5"/>{t("assembly.actions.edit")}</button><button type="button" onClick={onDelete} className="flex items-center gap-1 text-[11px] text-red-300"><Trash2 className="h-3.5 w-3.5"/>{t("assembly.actions.delete")}</button></div></article>;
}
