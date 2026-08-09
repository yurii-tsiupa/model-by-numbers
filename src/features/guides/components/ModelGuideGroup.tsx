"use client";

import { Box, ChevronDown, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatCount, formatLocalizedDate } from "@/features/i18n/lib/i18n";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { guideRoutes } from "../lib/guideRoutes";
import type { ModelGuideGroup as ModelGuideGroupType } from "../types/ModelGuideGroup";
import { GuideLibraryCard } from "./GuideLibraryCard";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useDeleteGeneratedGuidesByProject } from "../hooks/useDeleteGeneratedGuidesByProject";
import { createGuideObjectUrl } from "../services/assets/createGuideObjectUrl";
import { loadGuideAsset } from "../services/assets/loadGuideAsset";

export function ModelGuideGroup({ group, defaultExpanded = false, expandForSearch = false }: { group: ModelGuideGroupType; defaultExpanded?: boolean; expandForSearch?: boolean }) {
  const { t, locale } = useTranslation(); const [failedThumbnailUrl,setFailedThumbnailUrl]=useState<string|null>(null); const [guideThumbnailUrl,setGuideThumbnailUrl]=useState<string|null>(null); const [expanded,setExpanded]=useState(defaultExpanded); const [confirmDelete,setConfirmDelete]=useState(false); const deletion=useDeleteGeneratedGuidesByProject(group.project.id); const headingId=`guide-group-${group.project.id}`; const panelId=`${headingId}-panel`;
  const localUrl=useMemo(()=>group.thumbnail?URL.createObjectURL(group.thumbnail.blob):null,[group.thumbnail]); useEffect(()=>()=>{if(localUrl)URL.revokeObjectURL(localUrl)},[localUrl]); const thumbnailUrl=localUrl??group.project.thumbnailUrl;
  const latestGuide = group.guides[0]?.guide.snapshot;
  const directGuideThumbnailUrl = latestGuide ? latestGuide.images.painted ?? latestGuide.images.base ?? latestGuide.images.original ?? latestGuide.images.numbers : null;
  const usableDirectGuideThumbnailUrl = directGuideThumbnailUrl?.startsWith("blob:") ? null : directGuideThumbnailUrl;
  useEffect(() => {
    if (thumbnailUrl || usableDirectGuideThumbnailUrl) return;
    let active = true;
    let revoke: (() => void) | undefined;
    const priorities = ["model-painted", "model-base", "model-original", "model-numbers"];
    const reference = latestGuide?.assetReferences?.find(candidate => priorities.includes(candidate.kind));
    if (!reference) return;
    void loadGuideAsset(reference).then(blob => {
      if (!blob || !active) return;
      const owner = createGuideObjectUrl(blob);
      revoke = owner.revoke;
      setGuideThumbnailUrl(owner.url);
    }).catch(() => undefined);
    return () => { active = false; revoke?.(); };
  }, [latestGuide, thumbnailUrl, usableDirectGuideThumbnailUrl]);
  const resolvedThumbnailUrl = [thumbnailUrl, usableDirectGuideThumbnailUrl, guideThumbnailUrl].find(url => url && url !== failedThumbnailUrl) ?? null;
  const isExpanded = expandForSearch || expanded;
  const toggleExpanded = () => setExpanded((value) => !value);
  return <><section aria-labelledby={headingId} className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]"><header role="button" tabIndex={0} aria-expanded={isExpanded} aria-controls={panelId} onClick={toggleExpanded} onKeyDown={(event) => { if (event.target !== event.currentTarget) return; if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggleExpanded(); } }} className="flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]"><div className="relative size-8 shrink-0 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--card)]">{resolvedThumbnailUrl?<Image unoptimized fill sizes="32px" src={resolvedThumbnailUrl} alt="" onError={()=>setFailedThumbnailUrl(resolvedThumbnailUrl)} className="object-cover"/>:<div className="grid h-full place-items-center"><Box className="size-4 text-[var(--accent)]"/></div>}</div><div className="min-w-0 flex-1"><h2 id={headingId} className="truncate font-[family-name:var(--font-display)] text-sm font-semibold">{group.project.name}</h2><p className="mt-0.5 truncate text-[11px] text-[var(--text-secondary)]">{formatCount(locale,group.guides.length,"guide")} · {t("guides.group.updated",{date:formatLocalizedDate(group.updatedAt,locale,{day:"2-digit",month:"short",year:"numeric"})})}</p></div><Link href={guideRoutes.editor(group.project.id)} onClick={(event) => event.stopPropagation()} aria-label={t("guides.accessibility.openModel",{model:group.project.name})} className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-[9px] border border-[var(--border)] px-3 text-xs font-medium hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("guides.card.openModel")}</Link><button type="button" aria-label={t("guides.deleteAll", { model: group.project.name })} title={t("guides.deleteAll", { model: group.project.name })} onClick={(event) => { event.stopPropagation(); setConfirmDelete(true); }} className="inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-[9px] px-2.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><Trash2 className="size-3.5" aria-hidden="true" />{t("guides.deleteAllShort")}</button><span aria-hidden="true" className="grid size-9 shrink-0 place-items-center text-[var(--text-secondary)]"><ChevronDown className={`size-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} /></span></header>{isExpanded ? <div id={panelId} aria-labelledby={headingId} className="divide-y divide-[var(--border)] border-t border-[var(--border)]">{group.guides.map(item=><GuideLibraryCard key={item.guide.id} item={item}/>)}</div> : null}</section><ConfirmationModal isOpen={confirmDelete} title={t("guides.deleteAllTitle", { model: group.project.name })} description={t("guides.deleteAllDescription", { count: group.guides.length })} confirmLabel={t("guides.deleteAllShort")} variant="danger" isLoading={deletion.isPending} onClose={() => { if (!deletion.isPending) setConfirmDelete(false); }} onConfirm={() => deletion.mutate(undefined, { onSuccess: () => setConfirmDelete(false) })} /></>;
}
