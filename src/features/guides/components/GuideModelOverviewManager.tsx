"use client";

/* eslint-disable @next/next/no-img-element -- Guide captures are local data/blob URLs. */
import { ChevronDown, ChevronUp, Plus, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";

import { translate } from "@/features/i18n/lib/i18n";
import type { Locale } from "@/features/i18n/types/Locale";

import type { GuideTargetMode } from "../lib/getGuideViewModel";
import type { GuideOverviewView } from "../types/ModelGuide";

type Props = {
  locale: Locale;
  targetMode: GuideTargetMode;
  views: readonly GuideOverviewView[];
  editorHref: string;
  onChange: (views: GuideOverviewView[]) => void;
  onCapture: (viewId: string | null, type: GuideOverviewView["type"]) => void;
};

export function GuideModelOverviewManager({ locale, targetMode, views, editorHref, onChange, onCapture }: Props) {
  const t = (key: Parameters<typeof translate>[1], values?: Parameters<typeof translate>[2]) => translate(locale, key, values);
  const removed = views.filter((view) => view.source === "automatic" && view.included === false);
  const ordered = views.filter((view) => view.included !== false).slice().sort((a, b) => a.order - b.order);
  const workflowType: GuideOverviewView["type"] = targetMode === "markers" ? "marker-map" : targetMode === "region" ? "painted-regions" : "colored-parts";
  const label = (type: GuideOverviewView["type"]) => t(type === "clean" ? "guide.cleanModel" : type === "marker-map" ? "guide.markerMap" : type === "painted-regions" ? "guide.paintedRegions" : "guide.coloredParts");
  const countLabel = locale === "uk"
    ? t(ordered.length === 1 ? "guide.overviewViews.countOne" : ordered.length >= 2 && ordered.length <= 4 ? "guide.overviewViews.countFew" : "guide.overviewViews.count", { count: ordered.length })
    : t(ordered.length === 1 ? "guide.overviewViews.countOne" : "guide.overviewViews.count", { count: ordered.length });
  const commit = (next: GuideOverviewView[]) => onChange([...next.map((view, index) => ({ ...view, order: index })), ...removed]);
  const move = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= ordered.length) return;
    const next = [...ordered];
    [next[index], next[target]] = [next[target]!, next[index]!];
    commit(next);
  };

  return <section data-guide-controls className="pt-[18px] text-[var(--text)]">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[13px] font-semibold">{t("guide.modelOverview")}</h2>
      <p className="text-[11px] text-[var(--text-secondary)]">{countLabel}</p>
    </div>

    <div className="mt-2 space-y-1.5">
      {ordered.map((view, index) => <article key={view.id} className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 rounded-[7px] bg-[var(--surface)] p-1.5">
        <img src={view.image} alt="" className="size-8 shrink-0 rounded-md bg-white object-contain" />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">{label(view.type)}</p>
          <p className="truncate text-[10px] leading-3.5 text-[var(--text-secondary)]">{t(view.source === "automatic" ? "guide.overviewViews.automatic" : "guide.overviewViews.custom")}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-0.5">
          <Link href={editorHref} onClick={() => onCapture(view.id, view.type)} className="guide-row-text-action inline-flex min-h-7 cursor-pointer items-center px-1.5">{t("guide.overviewViews.replace")}</Link>
          <div className="flex items-center gap-0.5">
            {index > 0 ? <button type="button" title={t("guide.overviewViews.moveUp", { name: label(view.type) })} aria-label={t("guide.overviewViews.moveUp", { name: label(view.type) })} onClick={() => move(index, -1)} className="grid size-7 cursor-pointer place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><ChevronUp className="size-3.5" aria-hidden="true" /></button> : null}
            {index < ordered.length - 1 ? <button type="button" title={t("guide.overviewViews.moveDown", { name: label(view.type) })} aria-label={t("guide.overviewViews.moveDown", { name: label(view.type) })} onClick={() => move(index, 1)} className="grid size-7 cursor-pointer place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><ChevronDown className="size-3.5" aria-hidden="true" /></button> : null}
            <button type="button" title={t("guide.overviewViews.removeNamed", { name: label(view.type) })} aria-label={t("guide.overviewViews.removeNamed", { name: label(view.type) })} onClick={() => view.source === "automatic" ? onChange(views.map((item) => item.id === view.id ? { ...item, included: false } : item)) : commit(ordered.filter((item) => item.id !== view.id))} className="grid size-7 cursor-pointer place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><Trash2 className="size-3.5" aria-hidden="true" /></button>
          </div>
        </div>
      </article>)}
    </div>
    <details className="group relative mt-2">
      <summary className="guide-add-action flex min-h-9 w-full cursor-pointer list-none items-center justify-center gap-1.5 px-3">
        <Plus className="size-3.5" aria-hidden="true" />{t("guide.overviewViews.addClean")}
      </summary>
      <div className="absolute bottom-9 left-0 z-20 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] p-1 shadow-lg">
        <Link href={editorHref} onClick={() => onCapture(null, "clean")} className="flex min-h-9 cursor-pointer items-center rounded-md px-2.5 text-xs font-medium hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("guide.overviewViews.addClean")}</Link>
        <Link href={editorHref} onClick={() => onCapture(null, workflowType)} className="flex min-h-9 cursor-pointer items-center rounded-md px-2.5 text-xs font-medium hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("guide.overviewViews.addWorkflow")}</Link>
        {removed.length ? <button type="button" onClick={() => onChange(views.filter((view) => view.included !== false))} className="flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-md px-2.5 text-left text-xs font-medium hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><RotateCcw className="size-3.5" aria-hidden="true" />{t("guide.overviewViews.restoreDefaults")}</button> : null}
      </div>
    </details>
  </section>;
}
