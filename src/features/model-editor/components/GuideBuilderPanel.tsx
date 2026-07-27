"use client";

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
  return <aside className="order-2 w-full min-w-0 shrink-0 border-t border-[var(--border)] bg-[var(--card)] lg:order-1 lg:h-full lg:w-[340px] lg:overflow-x-hidden lg:overflow-y-auto lg:border-r lg:border-t-0">
    <header className="flex min-h-14 items-center gap-2.5 border-b border-[var(--border)] px-5">
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
      <h2 className="text-sm font-semibold">{t("editor.workflow.palette")}</h2>
    </header>
    <div className="p-5"><SimpleColorsSection /></div>
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
