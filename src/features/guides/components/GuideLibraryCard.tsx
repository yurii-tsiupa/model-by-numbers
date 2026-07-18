"use client";

import Link from "next/link";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { formatLocalizedDate } from "@/features/i18n/lib/i18n";
import { guideRoutes } from "../lib/guideRoutes";
import type { SavedGuide } from "../types/SavedGuide";

export function GuideLibraryCard({ item }: { item: SavedGuide }) {
  const { t, locale } = useTranslation();
  const guideTitle = t("guides.card.guideTitle", { version: item.guide.version });
  const guideLocale = item.guide.snapshot.locale ?? locale;
  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><h3 className="truncate font-[family-name:var(--font-space-grotesk)] text-sm font-semibold text-[var(--text)]">{guideTitle}</h3><p className="mt-1 text-xs text-[var(--text-secondary)]">{t("guides.card.locale", { locale: t(`language.${guideLocale}`) })}</p></div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${item.status === "ready" ? "border-[var(--accent-2)] text-[var(--accent-2)]" : "border-[var(--border)] text-[var(--text-secondary)]"}`}>{t(`guides.status.${item.status}`)}</span>
      </div>
      <dl className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3 text-xs text-[var(--text-secondary)]"><dt>{t("guides.card.updated")}</dt><dd>{formatLocalizedDate(item.guide.updatedAt, locale, { day: "2-digit", month: "short", year: "numeric" })}</dd></dl>
      <Link href={guideRoutes.savedGuide(item.project.id,item.guide.id)} aria-label={t("guides.accessibility.openGuide",{title:guideTitle})} className="mt-4 inline-flex min-h-10 items-center justify-center rounded-[10px] bg-[var(--accent)] px-3 text-sm font-medium text-[var(--accent-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("guides.card.openGuide")}</Link>
    </article>
  );
}
