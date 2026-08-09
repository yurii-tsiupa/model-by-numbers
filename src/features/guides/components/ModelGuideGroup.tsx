"use client";

import { Box, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatCount, formatLocalizedDate } from "@/features/i18n/lib/i18n";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { guideRoutes } from "../lib/guideRoutes";
import type { ModelGuideGroup as ModelGuideGroupType } from "../types/ModelGuideGroup";
import { GuideLibraryCard } from "./GuideLibraryCard";

export function ModelGuideGroup({ group, defaultExpanded = false, expandForSearch = false }: { group: ModelGuideGroupType; defaultExpanded?: boolean; expandForSearch?: boolean }) {
  const { t, locale } = useTranslation(); const [failed,setFailed]=useState(false); const [expanded,setExpanded]=useState(defaultExpanded); const headingId=`guide-group-${group.project.id}`; const panelId=`${headingId}-panel`;
  const localUrl=useMemo(()=>group.thumbnail?URL.createObjectURL(group.thumbnail.blob):null,[group.thumbnail]); useEffect(()=>()=>{if(localUrl)URL.revokeObjectURL(localUrl)},[localUrl]); const thumbnailUrl=localUrl??group.project.thumbnailUrl;
  const isExpanded = expandForSearch || expanded;
  return <section aria-labelledby={headingId} className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]"><header className="flex items-center gap-3 p-3"><div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]">{thumbnailUrl&&!failed?<Image unoptimized fill src={thumbnailUrl} alt="" onError={()=>setFailed(true)} className="object-cover"/>:<div className="grid h-full place-items-center"><Box className="size-4 text-[var(--accent)]"/></div>}</div><div className="min-w-0 flex-1"><h2 id={headingId} className="truncate font-[family-name:var(--font-display)] text-sm font-semibold">{group.project.name}</h2><p className="mt-0.5 truncate text-[11px] text-[var(--text-secondary)]">{formatCount(locale,group.guides.length,"guide")} · {t("guides.group.updated",{date:formatLocalizedDate(group.updatedAt,locale,{day:"2-digit",month:"short",year:"numeric"})})}</p></div><Link href={guideRoutes.editor(group.project.id)} aria-label={t("guides.accessibility.openModel",{model:group.project.name})} className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-[9px] border border-[var(--border)] px-3 text-xs font-medium hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("guides.card.openModel")}</Link><button type="button" aria-expanded={isExpanded} aria-controls={panelId} aria-label={t(isExpanded ? "guides.group.collapse" : "guides.group.expand", { model: group.project.name })} onClick={() => setExpanded((value) => !value)} className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><ChevronDown className={`size-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} aria-hidden="true" /></button></header>{isExpanded ? <div id={panelId} aria-labelledby={headingId} className="divide-y divide-[var(--border)] border-t border-[var(--border)]">{group.guides.map(item=><GuideLibraryCard key={item.guide.id} item={item}/>)}</div> : null}</section>;
}
