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
    <div className="flex min-h-10 items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-medium text-[var(--text-secondary)]">{t("guide.template.current")}</p>
        <p className="truncate text-xs font-semibold text-[var(--text)]">{name}<span className="ml-1.5 text-[10px] font-normal text-[var(--text-secondary)]">{t(current.source === "builtIn" ? "guide.template.builtIn" : "guide.template.mine")}</span></p>
      </div>
      <button type="button" onClick={() => { setNotice(false); setOpen(true); }} className="inline-flex min-h-7 shrink-0 cursor-pointer items-center rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 text-[11px] font-semibold text-[var(--accent)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("guide.template.change")}</button>
    </div>
    {notice ? <p role="status" className="mt-2 text-xs text-[var(--accent-2)]">{t("guide.template.applied")}</p> : null}
    {open ? <TemplatePickerModal currentId={current.id} userTemplates={userTemplates} busy={isSelecting} onSelect={select} onClose={() => setOpen(false)} /> : null}
  </section>;
}
