"use client";

import { ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useDeleteGeneratedGuide } from "../hooks/useDeleteGeneratedGuide";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { formatLocalizedDate } from "@/features/i18n/lib/i18n";
import { guideRoutes } from "../lib/guideRoutes";
import type { SavedGuide } from "../types/SavedGuide";

export function GuideLibraryCard({ item }: { item: SavedGuide }) {
  const { t, locale } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deletion = useDeleteGeneratedGuide(item.project.id);
  const guideTitle = t("guides.card.guideTitle", { version: item.guide.version });
  const guideLocale = item.guide.snapshot.locale ?? locale;
  const localeCode = guideLocale === "uk" ? "UA" : "EN";
  return <>
    <div className="grid min-h-11 grid-cols-[minmax(6.5rem,auto)_auto_minmax(0,1fr)_1.75rem_1.75rem] items-center gap-2 px-3 py-2 transition-colors hover:bg-[var(--surface-hover)]">
      <h3 className="truncate font-[family-name:var(--font-display)] text-xs font-semibold text-[var(--text)]">{guideTitle}</h3>
      <span title={item.guide.changedAfterDownload ? t("guides.status.changedAfterDownload") : undefined} className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${item.status === "ready" ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--accent-soft)] text-[var(--accent)]"}`}>{t(`guides.status.${item.status}`)}</span>
      <span className="truncate text-right text-[11px] text-[var(--text-secondary)]">{localeCode} · {formatLocalizedDate(item.guide.updatedAt, locale, { day: "2-digit", month: "short", year: "numeric" })}</span>
      <Link href={guideRoutes.savedGuide(item.project.id,item.guide.id)} aria-label={t("guides.accessibility.openGuide",{title:guideTitle})} className="grid size-7 cursor-pointer place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><ChevronRight className="size-4" aria-hidden="true" /></Link>
      <button type="button" aria-label={t("guides.deleteGuide", { title: guideTitle })} title={t("guides.deleteGuide", { title: guideTitle })} onClick={() => setConfirmDelete(true)} className="grid size-7 cursor-pointer place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><Trash2 className="size-3.5" aria-hidden="true" /></button>
    </div>
    <ConfirmationModal isOpen={confirmDelete} title={t("guides.deleteGuideTitle", { title: guideTitle })} description={t("guides.deleteGuideDescription")} confirmLabel={t("common.delete")} variant="danger" isLoading={deletion.isPending} onClose={() => { if (!deletion.isPending) setConfirmDelete(false); }} onConfirm={() => deletion.mutate(item.guide.id, { onSuccess: () => setConfirmDelete(false) })} />
  </>;
}
