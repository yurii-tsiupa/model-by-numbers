"use client";

import { Crosshair, MapPin, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { useState } from "react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { getStepsReferencingManualDetail } from "../lib/paintingTargets";
import { useModelEditorStore } from "../store/modelEditorStore";

export function ManualDetailsSection() {
  const { t } = useTranslation();
  const parts = useModelEditorStore((state) => state.parts);
  const details = useModelEditorStore((state) => state.manualDetails);
  const palette = useModelEditorStore((state) => state.palette);
  const selectedPartId = useModelEditorStore((state) => state.selectedPartId);
  const selectedId = useModelEditorStore((state) => state.selectedManualDetailId);
  const draft = useModelEditorStore((state) => state.manualDetailPlacement);
  const selectPart = useModelEditorStore((state) => state.selectPart);
  const selectDetail = useModelEditorStore((state) => state.selectManualDetail);
  const start = useModelEditorStore((state) => state.startManualDetailPlacement);
  const cancel = useModelEditorStore((state) => state.cancelManualDetailPlacement);
  const undo = useModelEditorStore((state) => state.undoDraftManualDetailPin);
  const finish = useModelEditorStore((state) => state.finishManualDetailPlacement);
  const update = useModelEditorStore((state) => state.updateManualDetail);
  const removeDetail = useModelEditorStore((state) => state.deleteManualDetail);
  const removePin = useModelEditorStore((state) => state.deleteManualDetailPin);
  const focusDetail = useModelEditorStore((state) => state.focusManualDetail);
  const focusPin = useModelEditorStore((state) => state.focusManualDetailPin);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [validation, setValidation] = useState(false);
  const [deleting, setDeleting] = useState<{ detailId: string; pinId?: string } | null>(null);
  const colors = new Map(palette.map((color) => [color.id, color]));

  function beginCreate() {
    start(name.trim() || t("editor.manualDetails.defaultName"));
    setValidation(false);
  }

  function complete() {
    if (!draft?.pins.length) {
      setValidation(true);
      return;
    }
    finish();
    setCreating(false);
    setName("");
    setValidation(false);
  }

  function openEditor(detailId: string) {
    if (draft?.detailId && draft.detailId !== detailId) cancel();
    selectDetail(detailId);
    setEditingId(detailId);
    setCreating(false);
  }

  const deletingDetail = deleting ? details.find((detail) => detail.id === deleting.detailId) : null;
  const finalPin = Boolean(deleting?.pinId && deletingDetail?.pins.length === 1);
  const stepCount = deletingDetail ? getStepsReferencingManualDetail(parts, deletingDetail.id).length : 0;

  return <section>
    <h3 className="text-sm font-semibold">{t("editor.details.detectedTitle")}</h3>
    <p className="mt-1 text-xs text-[var(--text-secondary)]">{t("editor.details.detectedHelp")}</p>
    {parts.length === 1 ? <p className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-xs text-[var(--text-secondary)]">{t("editor.details.manualRecommendation")}</p> : null}
    <div className="mt-3 space-y-2">{parts.map((part) => <button key={part.id} type="button" aria-pressed={selectedPartId === part.id} onClick={() => selectPart(part.id)} className={`w-full rounded-lg border p-3 text-left text-sm ${selectedPartId === part.id ? "border-[var(--accent)]" : "border-[var(--border)]"}`}>{part.name}</button>)}</div>

    <div className="mt-5 border-t border-[var(--border)] pt-4">
      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">{t("editor.manualDetails.title")}</h3><span className="text-xs text-[var(--text-secondary)]">{details.length}</span></div>
      {details.length ? <div className="mt-3 space-y-2">{details.map((detail) => {
        const color = detail.colorId ? colors.get(detail.colorId) : null;
        const expanded = editingId === detail.id;
        const placingLocations = draft?.detailId === detail.id;
        return <article key={detail.id} className={`overflow-hidden rounded-lg border ${selectedId === detail.id ? "border-[var(--accent)] bg-[var(--bg)]" : "border-[var(--border)]"}`}>
          <div className="flex items-center gap-1 p-1">
            <button type="button" aria-pressed={selectedId === detail.id} onClick={() => selectDetail(detail.id)} className="flex min-w-0 flex-1 items-center gap-3 rounded-md p-2 text-left">
              <span className="grid min-w-7 place-items-center rounded-full bg-[var(--accent)] px-1 text-xs text-[var(--accent-foreground)]">{detail.number}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm">{t("editor.manualDetails.detailLabel", { number: detail.number, name: detail.name })}</span><span className="block truncate text-xs text-[var(--text-secondary)]">{t("editor.manualDetails.locationCount", { count: detail.pins.length })}{color ? ` · ${color.name}` : ""}</span></span>
            </button>
            <button type="button" aria-expanded={expanded} aria-label={t("editor.manualDetails.editNamed", { name: detail.name })} onClick={() => openEditor(detail.id)} className="grid size-9 shrink-0 place-items-center rounded-md text-[var(--text-secondary)] transition hover:bg-[var(--card)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><Pencil className="size-4" /></button>
          </div>

          {expanded ? <div className="space-y-3 border-t border-[var(--border)] p-3">
            <div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold">{t("editor.manualDetails.detailNumber", { number: detail.number })}</p><button type="button" onClick={() => { if (placingLocations) cancel(); setEditingId(null); setValidation(false); }} aria-label={t("common.close")} className="grid size-8 place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><X className="size-4" /></button></div>
            {placingLocations ? <div className="space-y-2">
              <p className="text-xs text-[var(--text-secondary)]">{t("editor.manualDetails.placement.help")}</p>
              <p className="text-xs">{t("editor.manualDetails.locationCount", { count: draft.pins.length })}</p>
              {validation ? <p role="alert" className="text-xs text-red-300">{t("editor.manualDetails.validation.pinRequired")}</p> : null}
              <div className="flex flex-wrap gap-2"><button type="button" disabled={!draft.pins.length} onClick={undo} className="flex min-h-9 items-center gap-1 rounded-lg border border-[var(--border)] px-2 text-xs disabled:opacity-40"><RotateCcw className="size-3" />{t("editor.manualDetails.undoLocation")}</button><button type="button" onClick={complete} className="min-h-9 rounded-lg bg-[var(--accent)] px-3 text-xs text-[var(--accent-foreground)]">{t("editor.manualDetails.finish")}</button><button type="button" onClick={() => { cancel(); setValidation(false); }} className="min-h-9 rounded-lg border border-[var(--border)] px-3 text-xs">{t("common.cancel")}</button></div>
            </div> : <>
              <label className="block text-xs">{t("editor.manualDetails.name")}<input key={`${detail.id}-${detail.updatedAt}`} defaultValue={detail.name} onBlur={(event) => update(detail.id, { name: event.target.value })} className="mt-1 h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm" /></label>
              <label className="block text-xs">{t("editor.markers.assignColor")}<select value={detail.colorId ?? ""} onChange={(event) => update(detail.id, { colorId: event.target.value || null })} className="mt-1 h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm"><option value="">{t("editor.colors.unassigned")}</option>{palette.map((paletteColor) => <option key={paletteColor.id} value={paletteColor.id}>{paletteColor.name} — {paletteColor.hex}</option>)}</select></label>
              <div><p className="text-xs font-medium">{t("editor.manualDetails.locations")}</p><div className="mt-2 max-h-48 space-y-1 overflow-y-auto">{detail.pins.map((pin, index) => <div key={pin.id} className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-2 py-1.5"><MapPin className="size-3" /><span className="flex-1 text-xs">{t("editor.manualDetails.locationIndex", { current: index + 1, total: detail.pins.length })}</span><button type="button" onClick={() => { selectDetail(detail.id, pin.id); focusPin(detail.id, pin.id); }} aria-label={t("editor.manualDetails.accessibility.focusLocation", { location: index + 1, name: detail.name })}><Crosshair className="size-4" /></button><button type="button" onClick={() => setDeleting({ detailId: detail.id, pinId: pin.id })} aria-label={t("editor.manualDetails.accessibility.deleteLocation", { location: index + 1, name: detail.name })}><Trash2 className="size-4" /></button></div>)}</div></div>
              <div className="flex flex-wrap gap-2"><button type="button" onClick={() => start(detail.name, detail.id)} className="min-h-9 rounded-lg bg-[var(--accent)] px-3 text-xs text-[var(--accent-foreground)]">{t("editor.manualDetails.addLocation")}</button><button type="button" onClick={() => focusDetail(detail.id)} className="min-h-9 rounded-lg border border-[var(--border)] px-3 text-xs">{t("editor.manualDetails.focus")}</button><button type="button" onClick={() => setDeleting({ detailId: detail.id })} className="min-h-9 rounded-lg border border-[var(--border)] px-3 text-xs">{t("editor.manualDetails.delete")}</button></div>
            </>}
          </div> : null}
        </article>;
      })}</div> : <p className="mt-3 text-sm text-[var(--text-secondary)]">{t("editor.manualDetails.empty")}</p>}

      {(!creating || selectedId) && !draft ? <button type="button" onClick={() => { selectDetail(null); setEditingId(null); setCreating(true); }} className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] text-sm text-[var(--accent-foreground)]"><Plus className="size-4" />{t("editor.manualDetails.add")}</button> : null}
      {creating && !selectedId && !draft ? <div className="mt-3 space-y-3 rounded-lg border border-[var(--border)] p-3"><label className="block text-xs">{t("editor.manualDetails.name")}<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" /></label><div className="flex gap-2"><button type="button" onClick={beginCreate} className="min-h-9 flex-1 rounded-lg bg-[var(--accent)] text-sm text-[var(--accent-foreground)]">{t("editor.manualDetails.placeLocations")}</button><button type="button" onClick={() => setCreating(false)} className="min-h-9 rounded-lg border border-[var(--border)] px-3 text-sm">{t("common.cancel")}</button></div></div> : null}
      {draft && !draft.detailId ? <div className="mt-3 space-y-2 rounded-lg border border-[var(--accent)] p-3"><p className="text-sm font-medium">{draft.name}</p><p className="text-xs text-[var(--text-secondary)]">{t("editor.manualDetails.placement.help")}</p><p className="text-xs">{t("editor.manualDetails.locationCount", { count: draft.pins.length })}</p>{validation ? <p role="alert" className="text-xs text-red-300">{t("editor.manualDetails.validation.pinRequired")}</p> : null}<div className="flex flex-wrap gap-2"><button type="button" disabled={!draft.pins.length} onClick={undo} className="flex min-h-9 items-center gap-1 rounded-lg border border-[var(--border)] px-2 text-xs disabled:opacity-40"><RotateCcw className="size-3" />{t("editor.manualDetails.undoLocation")}</button><button type="button" onClick={complete} className="min-h-9 rounded-lg bg-[var(--accent)] px-3 text-xs text-[var(--accent-foreground)]">{t("editor.manualDetails.finish")}</button><button type="button" onClick={() => { cancel(); setCreating(false); }} className="min-h-9 rounded-lg border border-[var(--border)] px-3 text-xs">{t("common.cancel")}</button></div></div> : null}
    </div>
    <ConfirmationModal isOpen={Boolean(deleting)} title={t(finalPin ? "editor.manualDetails.delete.finalLocationTitle" : "editor.manualDetails.delete.title")} description={t(finalPin ? "editor.manualDetails.delete.finalLocationDescription" : stepCount ? "editor.manualDetails.delete.referenced" : "editor.manualDetails.delete.description", stepCount && !finalPin ? { count: stepCount } : undefined)} confirmLabel={t(finalPin ? "editor.manualDetails.delete" : "editor.manualDetails.deleteLocation")} variant="danger" onClose={() => setDeleting(null)} onConfirm={() => { if (deleting) { if (finalPin || !deleting.pinId) removeDetail(deleting.detailId); else removePin(deleting.detailId, deleting.pinId); } setDeleting(null); }} />
  </section>;
}
