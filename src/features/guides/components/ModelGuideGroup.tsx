"use client";

import { Box } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatCount, formatLocalizedDate } from "@/features/i18n/lib/i18n";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { guideRoutes } from "../lib/guideRoutes";
import type { ModelGuideGroup as ModelGuideGroupType } from "../types/ModelGuideGroup";
import { GuideLibraryCard } from "./GuideLibraryCard";

export function ModelGuideGroup({ group }: { group: ModelGuideGroupType }) {
  const { t, locale } = useTranslation(); const [failed,setFailed]=useState(false); const headingId=`guide-group-${group.project.id}`;
  const localUrl=useMemo(()=>group.thumbnail?URL.createObjectURL(group.thumbnail.blob):null,[group.thumbnail]); useEffect(()=>()=>{if(localUrl)URL.revokeObjectURL(localUrl)},[localUrl]); const thumbnailUrl=localUrl??group.project.thumbnailUrl;
  return <section aria-labelledby={headingId} className="border-b border-[var(--border)] pb-6"><header className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center"><div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">{thumbnailUrl&&!failed?<Image unoptimized fill src={thumbnailUrl} alt="" onError={()=>setFailed(true)} className="object-cover"/>:<div className="grid h-full place-items-center"><Box className="size-5 text-[var(--accent)]"/></div>}</div><div className="min-w-0 flex-1"><h2 id={headingId} className="truncate font-[family-name:var(--font-space-grotesk)] text-base font-semibold">{group.project.name}</h2><p className="mt-1 text-xs text-[var(--text-secondary)]">{formatCount(locale,group.guides.length,"guide")} · {t("guides.group.updated",{date:formatLocalizedDate(group.updatedAt,locale,{day:"2-digit",month:"short",year:"numeric"})})}</p></div><Link href={guideRoutes.editor(group.project.id)} aria-label={t("guides.accessibility.openModel",{model:group.project.name})} className="inline-flex min-h-10 items-center justify-center rounded-[10px] border border-[var(--border)] px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:shrink-0">{t("guides.card.openModel")}</Link></header><div aria-labelledby={headingId} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{group.guides.map(item=><GuideLibraryCard key={item.guide.id} item={item}/>)}</div></section>;
}
