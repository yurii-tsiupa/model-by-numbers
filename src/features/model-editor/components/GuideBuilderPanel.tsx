"use client";

import { Check, Circle, ListOrdered, Paintbrush, Palette } from "lucide-react";
import { useMemo, useState } from "react";
import { SimpleReferencesSection } from "@/features/references/components/SimpleReferencesSection";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { getGuideBuilderReadiness } from "../lib/getGuideBuilderReadiness";
import { useModelEditorStore } from "../store/modelEditorStore";
import type { GuideBuilderSection } from "../types/EditorMode";
import { ManualDetailsSection } from "./ManualDetailsSection";
import { SimpleColorsSection } from "./SimpleColorsSection";
import { SimplePaintingSteps } from "./painting/SimplePaintingSteps";

const SECTIONS: Array<{ id: GuideBuilderSection; icon: typeof Palette }> = [
  { id: "details", icon: Circle },
  { id: "colors", icon: Palette },
  { id: "steps", icon: ListOrdered },
  { id: "guide", icon: Paintbrush },
];

type GuideBuilderPanelProps = {
  projectId: string;
  onOpenGuide: () => void;
  canOpenGuide: boolean;
  activeReferenceId: string | null;
  onSelectReference: (id: string) => void;
  onShowReference: (id: string) => void;
  onReferenceDeleted: (id: string) => void;
};

export function GuideBuilderPanel({
  projectId,
  onOpenGuide,
  canOpenGuide,
  activeReferenceId,
  onSelectReference,
  onShowReference,
  onReferenceDeleted,
}: GuideBuilderPanelProps) {
  const { t } = useTranslation();
  const [section, setSection] = useState<GuideBuilderSection>("details");
  const parts = useModelEditorStore((state) => state.parts);
  const palette = useModelEditorStore((state) => state.palette);
  const manualDetails = useModelEditorStore((state) => state.manualDetails);
  const readiness = useMemo(
    () => getGuideBuilderReadiness(parts, palette, manualDetails),
    [manualDetails, palette, parts],
  );

  return <aside className="flex max-h-[26rem] min-h-0 w-full shrink-0 flex-col overflow-hidden border-t border-[var(--border)] bg-[var(--card)] lg:h-full lg:max-h-none lg:w-80 lg:border-l lg:border-t-0">
    <header className="shrink-0 border-b border-[var(--border)] p-4">
      <h2 className="font-[family-name:var(--font-space-grotesk)] text-base font-semibold">{t("editor.guideBuilder.title")}</h2>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">{t("editor.guideBuilder.description")}</p>
      <nav aria-label={t("editor.accessibility.builderSections")} className="mt-3 grid grid-cols-4 gap-1">
        {SECTIONS.map((item, index) => {
          const Icon = item.icon;
          const active = section === item.id;
          return <button key={item.id} type="button" aria-current={active ? "step" : undefined} onClick={() => setSection(item.id)} className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${active ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg)]"}`}><span aria-hidden="true" className="flex items-center gap-1"><span>{index + 1}</span><Icon className="size-3.5" /></span><span className="max-w-full truncate">{t(`editor.guideBuilder.sections.${item.id}`)}</span></button>;
        })}
      </nav>
    </header>
    <SimpleReferencesSection projectId={projectId} activeReferenceId={activeReferenceId} onSelect={onSelectReference} onShow={onShowReference} onDeleted={onReferenceDeleted} />
    <div className="min-h-0 flex-1 overflow-y-auto p-4">
      {section === "details" ? <ManualDetailsSection /> : null}
      {section === "colors" ? <SimpleColorsSection /> : null}
      {section === "steps" ? <SimplePaintingSteps projectId={projectId} /> : null}
      {section === "guide" ? <section>
        <h3 className="text-sm font-semibold">{t("editor.guide.title")}</h3>
        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{t("editor.guide.readiness")}</p>
        <ul className="mt-4 space-y-3">{(["hasDetails", "hasAssignedColors", "hasPaintingSteps"] as const).map((key) => {
          const complete = readiness[key];
          const labelKey = key === "hasDetails" ? "details" : key === "hasAssignedColors" ? "colors" : "steps";
          return <li key={key} className="flex items-center gap-2 text-sm">{complete ? <Check aria-hidden="true" className="size-4 text-[var(--accent-2)]" /> : <Circle aria-hidden="true" className="size-4 text-[var(--text-secondary)]" />}<span>{t(`editor.readiness.${labelKey}`)} — {t(complete ? "editor.readiness.complete" : "editor.readiness.incomplete")}</span></li>;
        })}</ul>
        {Object.values(readiness).some((value) => !value) ? <p className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-xs leading-5 text-[var(--text-secondary)]">{t("editor.guide.incomplete")}</p> : null}
        <button type="button" disabled={!canOpenGuide} onClick={onOpenGuide} className="mt-4 min-h-10 w-full rounded-lg bg-[var(--accent)] px-3 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-40">{t("editor.guide.open")}</button>
      </section> : null}
    </div>
  </aside>;
}
