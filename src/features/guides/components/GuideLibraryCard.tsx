"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { formatLocalizedDate } from "@/features/i18n/lib/i18n";
import { guideRoutes } from "../lib/guideRoutes";
import type { SavedGuide } from "../types/SavedGuide";

export function GuideLibraryCard({ item }: { item: SavedGuide }) {
  const { t, locale } = useTranslation();
  const guideTitle = t("guides.card.guideTitle", { version: item.guide.version });
  const guideLocale = item.guide.snapshot.locale ?? locale;
  const localeCode = guideLocale === "uk" ? "UA" : "EN";
  return (
    <Link href={guideRoutes.savedGuide(item.project.id,item.guide.id)} aria-label={t("guides.accessibility.openGuide",{title:guideTitle})} className="grid min-h-11 cursor-pointer grid-cols-[minmax(6.5rem,auto)_auto_minmax(0,1fr)_1.75rem] items-center gap-3 px-3 py-2 transition-colors hover:bg-[var(--surface-hover)] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]">
      <h3 className="truncate font-[family-name:var(--font-display)] text-xs font-semibold text-[var(--text)]">{guideTitle}</h3>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${item.status === "ready" ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"}`}>{t(`guides.status.${item.status}`)}</span>
      <span className="truncate text-right text-[11px] text-[var(--text-secondary)]">{localeCode} · {formatLocalizedDate(item.guide.updatedAt, locale, { day: "2-digit", month: "short", year: "numeric" })}</span>
      <span className="grid size-7 place-items-center rounded-md text-[var(--text-muted)]" aria-hidden="true"><ChevronRight className="size-4" /></span>
    </Link>
  );
}
