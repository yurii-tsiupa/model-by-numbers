"use client";

import { Focus, Move3D, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

import { useModelEditorStore } from "../store/modelEditorStore";
import type { ExplodedLabelsMode } from "../types/ExplodedLabelsMode";

export function ExplodedViewToolbar({ onFit }: { onFit: () => void }) {
  const { t } = useTranslation();
  const [confirmation, setConfirmation] = useState<"selected" | "all" | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const factor = useModelEditorStore((state) => state.explosionFactor);
  const mode = useModelEditorStore((state) => state.explodedLabelsMode);
  const parts = useModelEditorStore((state) => state.parts);
  const selectedPartId = useModelEditorStore((state) => state.selectedPartId);
  const isEditing = useModelEditorStore((state) => state.isExplodedLayoutEditing);
  const setFactor = useModelEditorStore((state) => state.setExplosionFactor);
  const setMode = useModelEditorStore((state) => state.setExplodedLabelsMode);
  const resetView = useModelEditorStore((state) => state.resetExplodedViewerState);
  const startEditing = useModelEditorStore((state) => state.startExplodedLayoutEditing);
  const stopEditing = useModelEditorStore((state) => state.stopExplodedLayoutEditing);
  const resetPart = useModelEditorStore((state) => state.resetPartExplodedOffset);
  const resetAll = useModelEditorStore((state) => state.resetAllExplodedOffsets);
  const selectedPart = parts.find((part) => part.id === selectedPartId);
  const hasCustomOffsets = parts.some((part) => part.explodedOffset !== null);
  const options: readonly ExplodedLabelsMode[] = ["none", "numbers", "numbers-and-names"];

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <>
      <aside className="pointer-events-auto absolute left-4 top-4 z-10 w-72 rounded-2xl border border-white/10 bg-black/75 p-4 text-white shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">{t("exploded.title")}</h3>
          {isEditing ? <span className="rounded-full bg-orange-400/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-300">{t("exploded.editingBadge")}</span> : null}
        </div>
        {isEditing ? <div className="mt-3 rounded-xl border border-orange-400/20 bg-orange-400/5 p-3"><p className="text-xs font-semibold text-orange-200">{t("exploded.editingTitle")}</p><p className="mt-1 text-[11px] leading-4 text-neutral-400">{t("exploded.editingDescription")}</p>{selectedPart ? <p className="mt-2 truncate text-xs text-white">{selectedPart.name}</p> : null}</div> : null}
        <div className="mt-4 flex items-center justify-between text-xs text-neutral-400"><label htmlFor="explosion-distance">{t("exploded.distance")}</label><span>{Math.round(factor * 100)}%</span></div>
        <input id="explosion-distance" type="range" min={0} max={100} value={Math.round(factor * 100)} disabled={isEditing} onChange={(event) => setFactor(Number(event.target.value) / 100)} aria-label={t("exploded.distance")} className="mt-2 w-full accent-orange-400 disabled:opacity-50" />
        <label className="mt-4 block text-xs text-neutral-400" htmlFor="exploded-labels">{t("exploded.labels")}</label>
        <select id="exploded-labels" value={mode} onChange={(event) => setMode(event.target.value as ExplodedLabelsMode)} className="mt-2 w-full rounded-lg border border-white/10 bg-neutral-900 px-2 py-2 text-xs">{options.map((option) => <option key={option} value={option}>{option === "none" ? t("exploded.labels.none") : option === "numbers" ? t("exploded.labels.numbers") : t("exploded.labels.names")}</option>)}</select>
        <p className="mt-3 text-[11px] text-neutral-500 md:hidden">{t("exploded.mobileEditingUnavailable")}</p>
        <button type="button" disabled={!isDesktop} onClick={isEditing ? stopEditing : startEditing} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-400 px-3 py-2 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"><Move3D className="h-3.5 w-3.5" />{isEditing ? t("exploded.doneEditing") : t("exploded.editLayout")}</button>
        {isEditing ? <div className="mt-2 grid grid-cols-2 gap-2"><button type="button" disabled={!selectedPart?.explodedOffset} onClick={() => setConfirmation("selected")} className="rounded-lg border border-white/10 px-2 py-2 text-[11px] disabled:opacity-35">{t("exploded.resetSelected")}</button><button type="button" disabled={!hasCustomOffsets} onClick={() => setConfirmation("all")} className="rounded-lg border border-white/10 px-2 py-2 text-[11px] disabled:opacity-35">{t("exploded.resetAll")}</button></div> : null}
        <div className="mt-4 flex gap-2"><button type="button" onClick={resetView} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 px-2 py-2 text-xs"><RotateCcw className="h-3.5 w-3.5" />{t("exploded.reset")}</button><button type="button" onClick={onFit} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-orange-400/50 px-2 py-2 text-xs font-semibold text-orange-300"><Focus className="h-3.5 w-3.5" />{t("exploded.fit")}</button></div>
      </aside>
      <ConfirmationModal isOpen={confirmation !== null} title={confirmation === "selected" ? t("exploded.resetSelectedTitle") : t("exploded.resetAllTitle")} description={confirmation === "selected" ? t("exploded.resetSelectedDescription") : t("exploded.resetAllDescription")} confirmLabel={t("exploded.resetAction")} onClose={() => setConfirmation(null)} onConfirm={() => { if (confirmation === "selected" && selectedPartId) resetPart(selectedPartId); else if (confirmation === "all") resetAll(); setConfirmation(null); }} />
    </>
  );
}
