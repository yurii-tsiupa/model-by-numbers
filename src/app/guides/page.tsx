"use client";

import { useMemo, useState } from "react";
import { ProtectedAppShell } from "@/components/layout/ProtectedAppShell";
import { ModelGuideGroup } from "@/features/guides/components/ModelGuideGroup";
import { GuidesLibraryHeader } from "@/features/guides/components/GuidesLibraryHeader";
import { GuidesEmptyState, GuidesErrorState, GuidesLoadingState } from "@/features/guides/components/GuidesLibraryStates";
import { useSavedGuides } from "@/features/guides/hooks/useSavedGuides";
import { filterModelGuideGroups, groupGuidesByModel, sortModelGuideGroups, type ModelGuideGroupSort } from "@/features/guides/lib/groupGuidesByModel";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export default function GuidesPage() {
  const { user } = useAuth(); const { t, locale } = useTranslation(); const library = useSavedGuides(user?.uid); const [search,setSearch]=useState(""); const [sort,setSort]=useState<ModelGuideGroupSort>("recent");
  const groups=useMemo(()=>groupGuidesByModel(library.guides),[library.guides]);
  const visibleGroups=useMemo(()=>sortModelGuideGroups(filterModelGuideGroups(groups,search,locale,item=>t("guides.card.guideTitle",{version:item.guide.version})),sort,locale),[groups,locale,search,sort,t]);
  return <ProtectedAppShell><GuidesLibraryHeader guideCount={library.guides.length} modelCount={groups.length}/><div className="mt-5 flex flex-col gap-3 sm:flex-row"><label className="min-w-0 flex-1 text-sm text-[var(--text)]"><span className="sr-only">{t("guides.search.label")}</span><input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder={t("guides.search.placeholder")} className="h-10 w-full rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"/></label><label className="text-sm"><span className="sr-only">{t("guides.sort.label")}</span><select value={sort} onChange={event=>setSort(event.target.value as ModelGuideGroupSort)} className="h-10 w-full rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:w-auto"><option value="recent">{t("guides.sort.recent")}</option><option value="oldest">{t("guides.sort.oldest")}</option><option value="alphabetical">{t("guides.sort.alphabetical")}</option></select></label></div><section className="mt-5">{library.isLoading?<GuidesLoadingState/>:library.isError?<GuidesErrorState onRetry={()=>void library.refetch()}/>:library.guides.length===0?<GuidesEmptyState hasModels={library.projectCount>0}/>:visibleGroups.length===0?<p role="status" className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-sm text-[var(--text-secondary)]">{t("guides.search.noResults")}</p>:<div className="space-y-6">{visibleGroups.map(group=><ModelGuideGroup key={group.project.id} group={group}/>)}</div>}</section></ProtectedAppShell>;
}
