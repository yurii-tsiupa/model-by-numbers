"use client";

import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { translate } from "@/features/i18n/lib/i18n";
import type { Locale } from "@/features/i18n/types/Locale";
import { createReferenceImages, type ReferenceValidationError } from "@/features/references/lib/createReferenceImages";

import type { GuideReferenceImage } from "../types/ModelGuide";

const errorKey = (error: ReferenceValidationError) => `references.${error.code}` as const;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("invalid-image"));
    reader.onerror = () => reject(new Error("invalid-image"));
    reader.readAsDataURL(blob);
  });
}

type Props = {
  projectId: string;
  locale: Locale;
  references: readonly GuideReferenceImage[];
  onChange: (references: GuideReferenceImage[]) => void;
};

export function GuideReferencesManager({ projectId, locale, references, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const t = (key: Parameters<typeof translate>[1], values?: Parameters<typeof translate>[2]) => translate(locale, key, values);
  const ordered = references.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const included = ordered.filter((reference) => reference.includedInGuide !== false);

  function commit(next: GuideReferenceImage[]) {
    onChange(next.map((reference, index) => ({ ...reference, order: index })));
  }

  function update(id: string, changes: Partial<GuideReferenceImage>) {
    commit(ordered.map((reference) => reference.id === id ? { ...reference, ...changes } : reference));
  }

  function moveIncluded(referenceId: string, offset: -1 | 1) {
    const currentIndex = included.findIndex((reference) => reference.id === referenceId);
    const target = currentIndex + offset;
    if (currentIndex < 0 || target < 0 || target >= included.length) return;
    const currentOrderedIndex = ordered.findIndex((reference) => reference.id === included[currentIndex]!.id);
    const targetOrderedIndex = ordered.findIndex((reference) => reference.id === included[target]!.id);
    const next = [...ordered];
    [next[currentOrderedIndex], next[targetOrderedIndex]] = [next[targetOrderedIndex]!, next[currentOrderedIndex]!];
    commit(next);
  }

  function beginCaptionEdit(reference: GuideReferenceImage) {
    setEditingId(reference.id);
    setCaptionDraft(reference.caption ?? "");
  }

  function saveCaption(id: string) {
    update(id, { caption: captionDraft });
    setEditingId(null);
  }

  async function upload(files: FileList) {
    if (ordered.length + files.length > 10) {
      setErrors([t("references.limit")]);
      return;
    }
    const result = await createReferenceImages(projectId, Array.from(files), []);
    setErrors(result.errors.map((error) => t(errorKey(error), { name: error.fileName ?? "" })));
    const uploaded = await Promise.all(result.references.map(async (reference, index): Promise<GuideReferenceImage> => ({
      id: `guide-reference-${reference.id}`,
      name: reference.name,
      caption: "",
      type: reference.type,
      dataUrl: await blobToDataUrl(reference.blob),
      width: reference.width,
      height: reference.height,
      source: "guide",
      includedInGuide: true,
      order: ordered.length + index,
    })));
    if (uploaded.length) commit([...ordered, ...uploaded]);
  }

  return <section data-guide-controls className="guide-side-panel rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-[var(--text)]">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[13px] font-semibold">{t("guide.references.manage")}</h2>
      </div>
      <p className="shrink-0 text-right text-[11px] text-[var(--text-secondary)]">{t("guide.references.count", { available: ordered.length, included: included.length })}</p>
    </div>

    {ordered.length ? <div className="mt-3 space-y-2">
      {ordered.map((reference) => {
        const isIncluded = reference.includedInGuide !== false;
        const includedIndex = included.findIndex((item) => item.id === reference.id);
        const isEditing = editingId === reference.id;
        const referenceLabel = t(reference.source === "guide" ? "guide.references.guideOnly" : "guide.references.project");
        return <article key={reference.id} className="grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={reference.dataUrl} alt="" className="size-14 shrink-0 rounded-lg bg-white object-cover" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold">{referenceLabel}</p>
            {isEditing ? <div className="mt-1.5">
              <input autoFocus aria-label={t("guide.references.captionFor", { name: t("guide.references.item") })} value={captionDraft} onChange={(event) => setCaptionDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveCaption(reference.id); if (event.key === "Escape") setEditingId(null); }} placeholder={t("guide.references.caption")} className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-xs outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" />
              <div className="mt-1.5 flex gap-1.5">
                <button type="button" onClick={() => saveCaption(reference.id)} className="inline-flex min-h-7 cursor-pointer items-center rounded-md bg-[var(--accent)] px-2.5 text-[11px] font-semibold leading-none text-[var(--accent-foreground)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("guide.references.saveCaption")}</button>
                <button type="button" onClick={() => setEditingId(null)} className="inline-flex min-h-7 cursor-pointer items-center rounded-md px-2 text-[11px] font-medium leading-none text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("guide.references.cancelCaption")}</button>
              </div>
            </div> : <>
              <p className="mt-0.5 truncate text-[11px] text-[var(--text-secondary)]">{reference.caption?.trim() || t("guide.references.noCaption")}</p>
            </>}
          </div>
          {!isEditing ? <div className="flex flex-col items-end gap-1">
            <button type="button" aria-pressed={isIncluded} onClick={() => update(reference.id, { includedInGuide: !isIncluded })} className="guide-row-text-action inline-flex min-h-7 cursor-pointer items-center px-1.5">{t(isIncluded ? "guide.references.excludeShort" : "guide.references.includeShort")}</button>
            <div className="flex items-center gap-1">
              <button type="button" title={t("guide.references.editCaption")} aria-label={t("guide.references.editCaption")} onClick={() => beginCaptionEdit(reference)} className="grid size-7 cursor-pointer place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><Pencil className="size-3.5" aria-hidden="true" /></button>
              {isIncluded && includedIndex > 0 ? <button type="button" title={t("guide.references.moveUp", { name: referenceLabel })} aria-label={t("guide.references.moveUp", { name: referenceLabel })} onClick={() => moveIncluded(reference.id, -1)} className="grid size-7 cursor-pointer place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><ChevronUp className="size-3.5" aria-hidden="true" /></button> : null}
              {isIncluded && includedIndex < included.length - 1 ? <button type="button" title={t("guide.references.moveDown", { name: referenceLabel })} aria-label={t("guide.references.moveDown", { name: referenceLabel })} onClick={() => moveIncluded(reference.id, 1)} className="grid size-7 cursor-pointer place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><ChevronDown className="size-3.5" aria-hidden="true" /></button> : null}
              {reference.source === "guide" ? <button type="button" title={t("guide.references.delete")} aria-label={t("guide.references.delete")} onClick={() => commit(ordered.filter((item) => item.id !== reference.id))} className="grid size-7 cursor-pointer place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><Trash2 className="size-3.5" aria-hidden="true" /></button> : null}
            </div>
          </div> : null}
        </article>;
      })}
    </div> : <p className="mt-4 text-xs text-[var(--text-secondary)]">{t("guide.references.none")}</p>}
    <button type="button" onClick={() => inputRef.current?.click()} className="guide-add-action mt-2.5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-1.5 px-3">
      <Plus className="size-3.5" aria-hidden="true" />{t("guide.references.add")}
    </button>
    <input ref={inputRef} hidden multiple type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(event) => { if (event.target.files) void upload(event.target.files); event.target.value = ""; }} />
    {errors.map((error) => <p key={error} role="alert" className="mt-2 text-xs text-[var(--danger)]">{error}</p>)}
  </section>;
}
