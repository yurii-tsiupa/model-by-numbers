"use client";

import { ChevronDown, Palette } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { SimpleReferencesSection } from "@/features/references/components/SimpleReferencesSection";
import { SimpleColorsSection } from "./SimpleColorsSection";
import { SimplePaintingSteps } from "./painting/SimplePaintingSteps";

type ReferenceProps = {
  projectId: string;
  activeReferenceId: string | null;
  onSelectReference: (id: string) => void;
  onShowReference: (id: string) => void;
  onReferenceDeleted: (id: string) => void;
};

export function SimplePalettePanel() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return <aside className="order-2 w-full min-w-0 shrink-0 border-t border-[var(--border)] bg-[var(--card)] lg:order-1 lg:h-full lg:w-[340px] lg:overflow-x-hidden lg:overflow-y-auto lg:border-r lg:border-t-0">
    <button type="button" aria-expanded={open} onClick={() => setOpen(value => !value)} className="flex min-h-12 w-full items-center gap-2 px-4 text-left lg:pointer-events-none">
      <Palette className="size-4 text-[var(--accent)]" />
      <span className="flex-1 text-sm font-semibold">{t("editor.workflow.palette")}</span>
      <ChevronDown className={`size-4 transition-transform lg:hidden ${open ? "rotate-180" : ""}`} />
    </button>
    <div className={`${open ? "block" : "hidden"} border-t border-[var(--border)] p-4 lg:block`}><SimpleColorsSection /></div>
  </aside>;
}

export function GuideBuilderPanel(props: ReferenceProps) {
  const { t } = useTranslation();
  return <aside className="order-3 flex max-h-[38rem] min-h-0 w-full min-w-0 shrink-0 flex-col overflow-hidden border-t border-[var(--border)] bg-[var(--card)] lg:h-full lg:max-h-none lg:w-[400px] lg:border-l lg:border-t-0">
    <header className="shrink-0 border-b border-[var(--border)] px-4 py-3">
      <h2 className="font-[family-name:var(--font-space-grotesk)] text-base font-semibold">{t("editor.workflow.title")}</h2>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">{t("editor.workflow.description")}</p>
    </header>
    <div className="min-h-0 flex-1 overflow-y-auto">
      <SimpleReferencesSection projectId={props.projectId} activeReferenceId={props.activeReferenceId} onSelect={props.onSelectReference} onShow={props.onShowReference} onDeleted={props.onReferenceDeleted} />
      <div className="p-4"><SimplePaintingSteps projectId={props.projectId} activeReferenceId={props.activeReferenceId} onSelectReference={props.onSelectReference} onShowReference={props.onShowReference} onReferenceDeleted={props.onReferenceDeleted} /></div>
    </div>
  </aside>;
}
