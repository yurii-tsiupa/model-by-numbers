"use client";

import { Check, Circle, ListOrdered, Paintbrush, Palette, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { normalizeHexColor } from "../lib/normalizeHexColor";
import { getGuideBuilderReadiness } from "../lib/getGuideBuilderReadiness";
import { useModelEditorStore } from "../store/modelEditorStore";
import type { GuideBuilderSection } from "../types/EditorMode";
import { ManualDetailsSection } from "./ManualDetailsSection";
import { SimplePaintingSteps } from "./painting/SimplePaintingSteps";
import {SimpleReferencesSection} from "@/features/references/components/SimpleReferencesSection";

const SECTIONS: Array<{ id: GuideBuilderSection; icon: typeof Palette }> = [
  { id: "details", icon: Circle },
  { id: "colors", icon: Palette },
  { id: "steps", icon: ListOrdered },
  { id: "guide", icon: Paintbrush },
];

export function GuideBuilderPanel({ projectId,onOpenGuide,canOpenGuide,activeReferenceId,onSelectReference,onShowReference,onReferenceDeleted }: { projectId:string;onOpenGuide:()=>void;canOpenGuide:boolean;activeReferenceId:string|null;onSelectReference:(id:string)=>void;onShowReference:(id:string)=>void;onReferenceDeleted:(id:string)=>void }) {
  const { t } = useTranslation();
  const [section, setSection] = useState<GuideBuilderSection>("details");
  const [showColorForm, setShowColorForm] = useState(false);
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#F97316");
  const parts = useModelEditorStore((state) => state.parts);
  const palette = useModelEditorStore((state) => state.palette);
  const manualDetails=useModelEditorStore(state=>state.manualDetails);
  const selectedPartId = useModelEditorStore((state) => state.selectedPartId);
  const selectPart = useModelEditorStore((state) => state.selectPart);
  const assignPaletteColor = useModelEditorStore((state) => state.assignPaletteColor);
  const addPaletteColor = useModelEditorStore((state) => state.addPaletteColor);
  const selectedPart = parts.find((part) => part.id === selectedPartId) ?? null;
  const readiness=useMemo(()=>getGuideBuilderReadiness(parts,palette,manualDetails),[manualDetails,palette,parts]);

  function createColor() {
    const hex = normalizeHexColor(colorHex);
    if (!hex) return;
    addPaletteColor({ name: colorName, hex });
    const created = useModelEditorStore.getState().palette.find((color) => normalizeHexColor(color.hex) === hex);
    if (created && selectedPart) assignPaletteColor(selectedPart.id, created.id);
    setColorName("");
    setShowColorForm(false);
  }

  return <aside className="flex max-h-[26rem] min-h-0 w-full shrink-0 flex-col overflow-hidden border-t border-[var(--border)] bg-[var(--card)] lg:h-full lg:max-h-none lg:w-80 lg:border-l lg:border-t-0"><header className="shrink-0 border-b border-[var(--border)] p-4"><h2 className="font-[family-name:var(--font-space-grotesk)] text-base font-semibold">{t("editor.guideBuilder.title")}</h2><p className="mt-1 text-xs text-[var(--text-secondary)]">{t("editor.guideBuilder.description")}</p><nav aria-label={t("editor.accessibility.builderSections")} className="mt-3 grid grid-cols-4 gap-1">{SECTIONS.map((item, index) => { const Icon = item.icon; const active = section === item.id; return <button key={item.id} type="button" aria-current={active ? "step" : undefined} onClick={() => setSection(item.id)} className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${active ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg)]"}`}><span aria-hidden="true" className="flex items-center gap-1"><span>{index + 1}</span><Icon className="size-3.5" /></span><span className="max-w-full truncate">{t(`editor.guideBuilder.sections.${item.id}`)}</span></button>; })}</nav></header><SimpleReferencesSection projectId={projectId} activeReferenceId={activeReferenceId} onSelect={onSelectReference} onShow={onShowReference} onDeleted={onReferenceDeleted}/><div className="min-h-0 flex-1 overflow-y-auto p-4">
    {section === "details" ? <ManualDetailsSection /> : null}
    {section === "colors" ? <section><h3 className="text-sm font-semibold">{t("editor.colors.title")}</h3><p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{selectedPart ? t("editor.colors.assignTo", { name: selectedPart.name }) : t("editor.colors.selectDetail")}</p>{parts.length > 0 ? <select aria-label={t("editor.accessibility.detailSelect")} value={selectedPartId ?? ""} onChange={(event) => selectPart(event.target.value)} className="mt-3 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-sm"><option value="" disabled>{t("editor.colors.selectDetail")}</option>{parts.map((part) => <option key={part.id} value={part.id}>{part.name}</option>)}</select> : null}{palette.length === 0 ? <p className="mt-5 text-sm text-[var(--text-secondary)]">{t("editor.colors.empty")}</p> : <div className="mt-3 grid grid-cols-2 gap-2">{palette.map((color) => <button key={color.id} type="button" disabled={!selectedPart} aria-pressed={selectedPart?.paletteColorId === color.id} onClick={() => selectedPart && assignPaletteColor(selectedPart.id, color.id)} className={`flex min-w-0 items-center gap-2 rounded-lg border p-2 text-left text-xs disabled:opacity-40 ${selectedPart?.paletteColorId === color.id ? "border-[var(--accent)] bg-[var(--bg)]" : "border-[var(--border)]"}`}><span className="size-6 shrink-0 rounded-md border border-[var(--border)]" style={{ backgroundColor: color.hex }} /><span className="min-w-0"><span className="block truncate">{color.name}</span><span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[var(--text-secondary)]">{color.hex}</span></span></button>)}</div>}<button type="button" onClick={() => setShowColorForm((value) => !value)} className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><Plus className="size-4" />{t("editor.colors.add")}</button>{showColorForm ? <div className="mt-3 space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3"><label className="block text-xs">{t("editor.colors.name")}<input value={colorName} onChange={(event) => setColorName(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm" /></label><label className="block text-xs">{t("editor.colors.value")}<div className="mt-1 flex gap-2"><input type="color" value={colorHex} onChange={(event) => setColorHex(event.target.value)} className="h-9 w-12 rounded-lg border border-[var(--border)] bg-[var(--card)] p-1" /><input value={colorHex} onChange={(event) => setColorHex(event.target.value)} className="h-9 min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 font-[family-name:var(--font-jetbrains-mono)] text-xs" /></div></label><button type="button" disabled={!normalizeHexColor(colorHex)} onClick={createColor} className="min-h-9 w-full rounded-lg bg-[var(--accent)] px-3 text-sm text-[var(--accent-foreground)] disabled:opacity-40">{t("editor.colors.add")}</button></div> : null}</section> : null}
    {section === "steps" ? <SimplePaintingSteps projectId={projectId} /> : null}
    {section === "guide" ? <section><h3 className="text-sm font-semibold">{t("editor.guide.title")}</h3><p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{t("editor.guide.readiness")}</p><ul className="mt-4 space-y-3">{(["hasDetails", "hasAssignedColors", "hasPaintingSteps"] as const).map((key) => { const complete = readiness[key]; const labelKey = key === "hasDetails" ? "details" : key === "hasAssignedColors" ? "colors" : "steps"; return <li key={key} className="flex items-center gap-2 text-sm">{complete ? <Check aria-hidden="true" className="size-4 text-[var(--accent-2)]" /> : <Circle aria-hidden="true" className="size-4 text-[var(--text-secondary)]" />}<span>{t(`editor.readiness.${labelKey}`)} — {t(complete ? "editor.readiness.complete" : "editor.readiness.incomplete")}</span></li>; })}</ul>{Object.values(readiness).some((value) => !value) ? <p className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-xs leading-5 text-[var(--text-secondary)]">{t("editor.guide.incomplete")}</p> : null}<button type="button" disabled={!canOpenGuide} onClick={onOpenGuide} className="mt-4 min-h-10 w-full rounded-lg bg-[var(--accent)] px-3 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-40">{t("editor.guide.open")}</button></section> : null}
  </div></aside>;
}
