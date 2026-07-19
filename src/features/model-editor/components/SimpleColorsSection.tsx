"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { PAINT_COLORS } from "../constants/paintColors";
import { normalizeHexColor } from "../lib/normalizeHexColor";
import { useModelEditorStore } from "../store/modelEditorStore";

const QUICK_COLOR_IDS = new Set([
  "white", "black", "gray", "red", "blue", "yellow", "green", "brown",
]);
const QUICK_COLORS = PAINT_COLORS.filter((color) => QUICK_COLOR_IDS.has(color.id));

export function SimpleColorsSection() {
  const { t } = useTranslation();
  const [showColorForm, setShowColorForm] = useState(false);
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#F97316");
  const parts = useModelEditorStore((state) => state.parts);
  const manualDetails = useModelEditorStore((state) => state.manualDetails);
  const palette = useModelEditorStore((state) => state.palette);
  const selectedPartId = useModelEditorStore((state) => state.selectedPartId);
  const selectedPartIds = useModelEditorStore((state) => state.selectedPartIds);
  const selectedManualDetailId = useModelEditorStore((state) => state.selectedManualDetailId);
  const selectPart = useModelEditorStore((state) => state.selectPart);
  const selectManualDetail = useModelEditorStore((state) => state.selectManualDetail);
  const addPaletteColor = useModelEditorStore((state) => state.addPaletteColor);
  const assignColor = useModelEditorStore((state) => state.createAndAssignPaletteColorToTarget);

  const selectedPart = parts.find((part) => part.id === selectedPartId) ?? null;
  const selectedManualDetail = manualDetails.find((detail) => detail.id === selectedManualDetailId) ?? null;
  const target = selectedPart
    ? { type: "part" as const, id: selectedPart.id }
    : selectedManualDetail
      ? { type: "manualDetail" as const, id: selectedManualDetail.id }
      : null;
  const targetName = selectedPart?.name ?? selectedManualDetail?.name ?? null;
  const selectedColorId = selectedPart?.paletteColorId ?? selectedManualDetail?.colorId ?? null;
  const selectedColor = palette.find((color) => color.id === selectedColorId) ?? null;
  const hasSingleTarget = target !== null && selectedPartIds.length <= 1;
  const selectionValue = selectedPart
    ? `part:${selectedPart.id}`
    : selectedManualDetail
      ? `manualDetail:${selectedManualDetail.id}`
      : "";

  function selectTarget(value: string) {
    const separator = value.indexOf(":");
    const type = value.slice(0, separator);
    const id = value.slice(separator + 1);
    if (type === "part") selectPart(id);
    if (type === "manualDetail") selectManualDetail(id);
  }

  function createColor() {
    const hex = normalizeHexColor(colorHex);
    if (!hex) return;
    addPaletteColor({ name: colorName, hex });
    if (target) assignColor(target, hex);
    setColorName("");
    setShowColorForm(false);
  }

  return <section>
    <h3 className="text-sm font-semibold">{t("editor.colors.title")}</h3>
    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
      {targetName ? t("editor.colors.assignTo", { name: targetName }) : t("editor.colors.selectDetail")}
    </p>
    {parts.length + manualDetails.length > 0 ? <select
      aria-label={t("editor.accessibility.detailSelect")}
      value={selectionValue}
      onChange={(event) => selectTarget(event.target.value)}
      className="mt-3 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-sm"
    >
      <option value="" disabled>{t("editor.colors.selectDetail")}</option>
      {parts.map((part) => <option key={part.id} value={`part:${part.id}`}>{part.name}</option>)}
      {manualDetails.map((detail) => <option key={detail.id} value={`manualDetail:${detail.id}`}>{detail.name}</option>)}
    </select> : null}

    {hasSingleTarget ? <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
      <p className="text-xs font-medium">{t("properties.quick")}</p>
      <div className="mt-2 grid grid-cols-8 gap-1.5">
        {QUICK_COLORS.map((color) => {
          const name = t(`color.${color.id}`);
          const selected = normalizeHexColor(selectedColor?.hex ?? "") === normalizeHexColor(color.value);
          return <button
            key={color.id}
            type="button"
            aria-label={t("properties.useColor", { name })}
            aria-pressed={selected}
            title={name}
            onClick={() => assignColor(target, color.value)}
            className={`relative aspect-square min-h-7 rounded-md border p-0.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] active:scale-90 ${selected ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/25" : "border-[var(--border)] hover:scale-105 hover:border-[var(--accent)]"}`}
          >
            <span aria-hidden="true" className="block size-full rounded-[4px] border border-black/15" style={{ backgroundColor: color.value }} />
            {selected ? <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center"><Check className="size-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]" /></span> : null}
          </button>;
        })}
      </div>
    </div> : null}

    {palette.length === 0 ? <p className="mt-5 text-sm text-[var(--text-secondary)]">{t("editor.colors.empty")}</p> : <div className="mt-3 grid grid-cols-2 gap-2">
      {palette.map((color) => <button key={color.id} type="button" disabled={!target} aria-pressed={selectedColorId === color.id} onClick={() => target && assignColor(target, color.hex)} className={`flex min-w-0 items-center gap-2 rounded-lg border p-2 text-left text-xs disabled:opacity-40 ${selectedColorId === color.id ? "border-[var(--accent)] bg-[var(--bg)]" : "border-[var(--border)]"}`}><span className="size-6 shrink-0 rounded-md border border-[var(--border)]" style={{ backgroundColor: color.hex }} /><span className="min-w-0"><span className="block truncate">{color.name}</span><span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[var(--text-secondary)]">{color.hex}</span></span></button>)}
    </div>}
    <button type="button" onClick={() => setShowColorForm((value) => !value)} className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><Plus className="size-4" />{t("editor.colors.add")}</button>
    {showColorForm ? <div className="mt-3 space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3"><label className="block text-xs">{t("editor.colors.name")}<input value={colorName} onChange={(event) => setColorName(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm" /></label><label className="block text-xs">{t("editor.colors.value")}<div className="mt-1 flex gap-2"><input type="color" value={colorHex} onChange={(event) => setColorHex(event.target.value)} className="h-9 w-12 rounded-lg border border-[var(--border)] bg-[var(--card)] p-1" /><input value={colorHex} onChange={(event) => setColorHex(event.target.value)} className="h-9 min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 font-[family-name:var(--font-jetbrains-mono)] text-xs" /></div></label><button type="button" disabled={!normalizeHexColor(colorHex)} onClick={createColor} className="min-h-9 w-full rounded-lg bg-[var(--accent)] px-3 text-sm text-[var(--accent-foreground)] disabled:opacity-40">{t("editor.colors.add")}</button></div> : null}
  </section>;
}
