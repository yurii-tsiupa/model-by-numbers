"use client";

import { useState } from "react";

import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import type { GuideLibraryTemplate, UserGuideTemplate } from "@/features/templates/types/GuideLibraryTemplate";

import { TemplatePickerModal } from "./TemplatePickerModal";

export function GuideTemplateSection({ current, userTemplates, isSelecting, onSelect }: { current: GuideLibraryTemplate; userTemplates: readonly UserGuideTemplate[]; isSelecting: boolean; onSelect: (id: string) => Promise<void> }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState(false);
  const name = current.source === "builtIn" ? t(`templates.presets.${current.nameKey}`) : current.name;

  async function select(id: string) {
    await onSelect(id);
    setOpen(false);
    setNotice(true);
  }

  return <section>
    <p className="text-xs font-medium text-[var(--text-secondary)]">{t("guide.template.current")}</p>
    <div className="mt-2 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] p-3">
      <div className="min-w-0 flex-1"><h2 className="truncate text-sm font-medium">{name}</h2><p className="mt-0.5 text-xs text-[var(--text-secondary)]">{t(current.source === "builtIn" ? "guide.template.builtIn" : "guide.template.mine")}</p></div>
      <button type="button" onClick={() => { setNotice(false); setOpen(true); }} className="inline-flex min-h-8 shrink-0 cursor-pointer items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 text-[11px] font-semibold leading-none text-[var(--accent)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("guide.template.change")}</button>
    </div>
    {notice ? <p role="status" className="mt-2 text-xs text-[var(--accent-2)]">{t("guide.template.applied")}</p> : null}
    {open ? <TemplatePickerModal currentId={current.id} userTemplates={userTemplates} busy={isSelecting} onSelect={select} onClose={() => setOpen(false)} /> : null}
  </section>;
}
