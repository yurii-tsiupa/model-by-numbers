"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import type { ModelPart } from "../../types/ModelPart";

type Filter = "all" | "selected" | "unselected";

export function AssemblyPartsSelector({ parts, selectedIds, onChange }: { parts: readonly ModelPart[]; selectedIds: readonly string[]; onChange: (ids: string[]) => void }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const visibleParts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return parts.filter((part) => (!query || part.name.toLowerCase().includes(query)) && (filter === "all" || (filter === "selected" ? selected.has(part.id) : !selected.has(part.id))));
  }, [filter, parts, search, selected]);
  return <div><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600"/><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("assembly.searchPlaceholder")} className="h-10 w-full rounded-xl border border-white/10 bg-black/20 pl-9 pr-3 text-sm outline-none"/></div><div className="mt-2 flex gap-1.5">{(["all","selected","unselected"] as const).map((option)=><button key={option} type="button" onClick={()=>setFilter(option)} className={`rounded-full border px-2.5 py-1 text-[11px] ${filter===option?"border-orange-400/30 bg-orange-400/10 text-orange-300":"border-white/10 text-neutral-500"}`}>{t(`assembly.filters.${option}`)}</button>)}</div><p className="mt-2 text-xs text-neutral-500">{t("assembly.selectedCount",{count:selected.size})}</p><div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-white/10 p-2">{visibleParts.length===0?<p className="p-4 text-center text-xs text-neutral-500">{t("assembly.noMatchingParts")}</p>:visibleParts.map((part)=><label key={part.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-white/5"><input type="checkbox" checked={selected.has(part.id)} onChange={()=>onChange(selected.has(part.id)?selectedIds.filter((id)=>id!==part.id):[...selectedIds,part.id])} className="accent-orange-400"/><span className="min-w-0 flex-1 truncate text-xs text-neutral-200">{String(part.index+1).padStart(2,"0")} — {part.name}</span><span className="text-[10px] text-neutral-600">{part.includeInGuide?t("assembly.included"):t("assembly.excluded")}</span></label>)}</div></div>;
}
