"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { AlignCenter, AlignLeft, AlignRight, Check, ChevronDown, Eye, EyeOff, ImagePlus, Link2, Palette, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import type { TranslationKey } from "@/features/i18n/locales/en";
import { blobToDataUrl } from "../lib/blobToDataUrl";
import { GUIDE_FONT_OPTIONS, type GuideFontId } from "../design/guideFontRegistry";
import type { GuidePageFormat } from "../types/GuidePageFormat";
import { normalizeGuideBrandUrl, type GuideBrandCustomLink, type GuideBrandSocialLink, type GuideBrandSocialPlatform } from "../types/GuideBrandSettings";
import { getGuideSocialLabel, getGuideSocialPlatformLabel } from "../lib/guideBrandContacts";
import { GUIDE_SOCIAL_PLATFORM_DEFINITIONS, GUIDE_SOCIAL_PLATFORMS } from "../lib/guideSocialPlatforms";
import { DEFAULT_BACK_COVER_BRAND_LAYOUT, DEFAULT_CONTENT_PAGES_BRAND_LAYOUT, DEFAULT_COVER_BRAND_LAYOUT, GUIDE_BRAND_ALIGNMENTS, GUIDE_BRAND_CONTENT_QR_SCALE_MAX, GUIDE_BRAND_CONTENT_QR_SCALE_MIN, GUIDE_BRAND_LOGO_SCALE_MAX, GUIDE_BRAND_LOGO_SCALE_MIN, GUIDE_BRAND_POSITIONS, GUIDE_BRAND_QR_SCALE_MAX, GUIDE_BRAND_QR_SCALE_MIN } from "../lib/guideBrandLayout";
import type { GuideBrandContentElementLayout, GuideBrandContentElementType, GuideBrandContentPageLayout, GuideBrandElementType, GuideBrandPageLayout } from "../types/GuideBrandLayout";
import { GUIDE_SECTION_REGISTRY, type GuideContentSectionId } from "../config/guideSectionRegistry";
import type { GuidePdfBackgroundItems, GuidePdfBackgroundScope, GuidePdfBackgroundSectionId, GuidePdfBackgroundTarget } from "../types/GuidePdfBackground";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUserBrandBackgroundAssets, type ResolvedUserBrandBackgroundAsset } from "@/features/auth/hooks/useUserBrandBackgroundAssets";

const PAGE_FORMATS: readonly { id: GuidePageFormat; labelKey: TranslationKey }[] = [
  { id: "a4", labelKey: "guide.pdfDesign.pageFormat.a4" },
  { id: "letter", labelKey: "guide.pdfDesign.pageFormat.letter" },
];

type PdfDesignAccordionId = "background" | "typography" | "branding" | "layout";
const PDF_DESIGN_ACCORDION_CONFIG = { allowMultiple: false } as const;
const GuidePdfDesignSectionsContext = createContext<readonly GuideContentSectionId[]>([]);

export function GuidePdfDesignSectionsProvider({ children, sectionIds }: { children: ReactNode; sectionIds: readonly GuideContentSectionId[] }) {
  return <GuidePdfDesignSectionsContext.Provider value={sectionIds}>{children}</GuidePdfDesignSectionsContext.Provider>;
}

function PdfDesignAccordionSection<Id extends string>({ action, children, expanded, id, leading, onToggle, summary, title }: { action?: ReactNode; children: ReactNode; expanded: boolean; id: Id; leading?: ReactNode; onToggle: (id: Id) => void; summary?: ReactNode; title: string }) {
  const bodyId = `pdf-design-${id}-body`;
  return <div className="border-t-[0.5px] border-[var(--border)]">
    <div className="flex min-h-11 items-center gap-1"><button type="button" aria-expanded={expanded} aria-controls={bodyId} onClick={() => onToggle(id)} className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-2 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]">
      {leading}
      <span className="min-w-0 flex-1 font-[family-name:var(--font-display)] text-[13px] font-medium text-[var(--text)]">{title}</span>
      {!expanded && summary !== undefined ? <span className="flex min-w-0 items-center text-[10px] text-[var(--text-secondary)]">{summary}</span> : null}
      <ChevronDown aria-hidden="true" className={`size-4 shrink-0 text-[var(--text-secondary)] transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`} />
    </button>{action}</div>
    {expanded ? <div id={bodyId} className={`pb-3 ${id === "layout" ? "[&_.mt-2.grid-cols-3>button]:h-auto [&_.mt-2.grid-cols-3>button]:min-h-9 [&_.mt-2.grid-cols-3>button]:px-1 [&_.mt-2.grid-cols-3>button]:py-1 [&_.mt-2.grid-cols-3>button]:text-[10px] [&_.mt-2.grid-cols-3>button]:leading-tight" : ""}`}>{children}</div> : null}
  </div>;
}

function normalizeUrlDraft(value: string): { error: TranslationKey | null; value: string | null } {
  if (!value.trim()) return { error: null, value: null };
  const normalized = normalizeGuideBrandUrl(value);
  return normalized
    ? { error: null, value: normalized }
    : { error: "guide.pdfDesign.branding.invalidUrl", value: null };
}

function CompactBrandField({
  disabled,
  label,
  maxLength,
  onSave,
  t,
  type = "text",
  value,
  validate,
  validateOnBlur = false,
}: {
  disabled: boolean;
  label: TranslationKey;
  maxLength: number;
  onSave: (value: string | null) => void;
  t: (key: TranslationKey) => string;
  type?: "text" | "url";
  value: string | null;
  validate?: (value: string) => { error: TranslationKey | null; value: string | null };
  validateOnBlur?: boolean;
}) {
  const [draft, setDraft] = useState(value ?? "");
  const [persistedValue, setPersistedValue] = useState(value);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<TranslationKey | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!editing && value !== persistedValue) {
    setPersistedValue(value);
    setDraft(value ?? "");
    setError(null);
  }

  function startEditing() {
    setEditing(true);
    setError(null);
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }

  function cancel() {
    setDraft(value ?? "");
    setPersistedValue(value);
    setError(null);
    setEditing(false);
  }

  function save() {
    const normalized = validate?.(draft) ?? { error: null, value: draft.trim().slice(0, maxLength) || null };
    if (normalized.error) {
      setError(normalized.error);
      return;
    }
    setDraft(normalized.value ?? "");
    setPersistedValue(normalized.value);
    setError(null);
    setEditing(false);
    if (normalized.value !== value) onSave(normalized.value);
  }

  function validateDraft() {
    if (!validateOnBlur || !validate) return;
    setError(validate(draft).error);
  }

  return (
    <div>
      <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">{t(label)}</p>
      <div className="flex items-center gap-1.5">
        <input ref={inputRef} type={type} aria-label={t(label)} aria-invalid={Boolean(error)} value={draft} maxLength={maxLength} readOnly={!editing} disabled={disabled} onClick={() => { if (!disabled && !editing) startEditing(); }} onBlur={validateDraft} onChange={(event) => { setDraft(event.target.value); setError(null); }} onKeyDown={(event) => { if (!editing) return; if (event.key === "Enter") { event.preventDefault(); save(); } if (event.key === "Escape") { event.preventDefault(); cancel(); } }} className={`h-8 min-w-0 flex-1 rounded-md border bg-[var(--card)] px-2 text-xs text-[var(--text)] outline-none focus-visible:ring-2 ${error ? "border-[var(--danger)] focus-visible:ring-[var(--danger)]" : "border-[var(--border)] focus-visible:ring-[var(--accent)]"} ${disabled ? "cursor-not-allowed opacity-60" : "cursor-text"}`} />
        {editing ? <>
          <button type="button" title={t("guide.pdfDesign.branding.save")} aria-label={t("guide.pdfDesign.branding.save")} disabled={disabled} onClick={save} className={`grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:opacity-90"}`}><Check className="size-3.5" aria-hidden="true" /></button>
          <button type="button" title={t("guide.pdfDesign.branding.cancel")} aria-label={t("guide.pdfDesign.branding.cancel")} disabled={disabled} onClick={cancel} className={`grid size-8 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"}`}><X className="size-3.5" aria-hidden="true" /></button>
        </> : <button type="button" title={t("guide.pdfDesign.branding.editField")} aria-label={t("guide.pdfDesign.branding.editField")} disabled={disabled} onClick={startEditing} className={`grid size-8 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"}`}><Pencil className="size-3.5" aria-hidden="true" /></button>}
      </div>
      {error ? <p role="alert" className="mt-1.5 text-[11px] leading-4 text-[var(--danger)]">{t(error)}</p> : null}
    </div>
  );
}

function SocialPlatformIcon({ platform }: { platform: GuideBrandSocialPlatform }) {
  return <svg aria-hidden="true" className="size-3 shrink-0" viewBox="0 0 24 24">{GUIDE_SOCIAL_PLATFORM_DEFINITIONS[platform].paths.map((path) => <path key={path} d={path} fill="currentColor" />)}</svg>;
}

export function GuideBrandSocialLinksEditor({ disabled, links, onChange, t }: { disabled: boolean; links: GuideBrandSocialLink[]; onChange: (links: GuideBrandSocialLink[]) => void; t: (key: TranslationKey) => string }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<GuideBrandSocialPlatform>("instagram");
  const [url, setUrl] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<TranslationKey | null>(null);

  function edit(link?: GuideBrandSocialLink) {
    setEditingId(link?.id ?? "new");
    setPlatform(link?.platform ?? "instagram");
    setUrl(link?.url ?? "");
    setHandle(link?.handle ?? "");
    setError(null);
  }

  function cancel() {
    setEditingId(null);
    setError(null);
  }

  function save() {
    const normalizedUrl = normalizeGuideBrandUrl(url);
    if (!normalizedUrl) {
      setError("guide.pdfDesign.branding.invalidUrl");
      return;
    }
    const next: GuideBrandSocialLink = { id: editingId === "new" ? crypto.randomUUID() : editingId ?? crypto.randomUUID(), platform, url: normalizedUrl, handle: handle.trim().slice(0, 60) || null };
    onChange(editingId === "new" ? [...links, next] : links.map((link) => link.id === editingId ? next : link));
    setEditingId(null);
    setError(null);
  }

  return (
    <div className="mt-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">{t("guide.pdfDesign.branding.socialLinks")}</p>
        {editingId === null && links.length < 8 ? <button type="button" title={t("guide.pdfDesign.branding.addSocial")} aria-label={t("guide.pdfDesign.branding.addSocial")} disabled={disabled} onClick={() => edit()} className={`grid size-7 place-items-center rounded-md text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--accent)]"}`}><Plus className="size-3.5" aria-hidden="true" /></button> : null}
      </div>
      <div className="mt-1.5 space-y-1.5">
        {links.map((link) => editingId === link.id ? null : <div key={link.id} className="flex h-8 items-center gap-1.5 rounded-md bg-[var(--surface)] px-2">
          <span className="text-[var(--text-secondary)]"><SocialPlatformIcon platform={link.platform} /></span>
          <span className="min-w-0 flex-1 truncate text-[11px] text-[var(--text)]">{getGuideSocialPlatformLabel(link.platform)} · {getGuideSocialLabel(link)}</span>
          <button type="button" title={t("guide.pdfDesign.branding.editSocial")} aria-label={t("guide.pdfDesign.branding.editSocial")} disabled={disabled || editingId !== null} onClick={() => edit(link)} className={`grid size-6 shrink-0 place-items-center rounded text-[var(--text-secondary)] ${disabled || editingId !== null ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:text-[var(--accent)]"}`}><Pencil className="size-3" aria-hidden="true" /></button>
          <button type="button" title={t("guide.pdfDesign.branding.removeSocial")} aria-label={t("guide.pdfDesign.branding.removeSocial")} disabled={disabled || editingId !== null} onClick={() => onChange(links.filter((item) => item.id !== link.id))} className={`grid size-6 shrink-0 place-items-center rounded text-[var(--text-secondary)] ${disabled || editingId !== null ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:text-[var(--accent)]"}`}><Trash2 className="size-3" aria-hidden="true" /></button>
        </div>)}
        {editingId !== null ? <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
          <p className="mb-1.5 text-[10px] font-medium text-[var(--text)]">{t(editingId === "new" ? "guide.pdfDesign.branding.addSocial" : "guide.pdfDesign.branding.editSocial")}</p>
          <div className="grid grid-cols-2 gap-1.5">
            <label><span className="sr-only">{t("guide.pdfDesign.branding.socialType")}</span><select value={platform} disabled={disabled} onChange={(event) => setPlatform(event.target.value as GuideBrandSocialPlatform)} className={`h-8 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-1.5 text-[11px] text-[var(--text)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>{GUIDE_SOCIAL_PLATFORMS.map((item) => <option key={item} value={item}>{t(`guide.pdfDesign.branding.socialType.${item}`)}</option>)}</select></label>
            <label><span className="sr-only">{t("guide.pdfDesign.branding.socialLabel")}</span><input value={handle} maxLength={60} disabled={disabled} placeholder={t("guide.pdfDesign.branding.socialLabel")} onChange={(event) => setHandle(event.target.value)} className={`h-8 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-[11px] text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : ""}`} /></label>
          </div>
          <div className="mt-1.5 flex gap-1.5">
            <label className="min-w-0 flex-1"><span className="sr-only">{t("guide.pdfDesign.branding.socialUrl")}</span><input type="url" value={url} disabled={disabled} placeholder={t("guide.pdfDesign.branding.socialUrl")} onChange={(event) => { setUrl(event.target.value); setError(null); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); save(); } if (event.key === "Escape") { event.preventDefault(); cancel(); } }} className={`h-8 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-[11px] text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : ""}`} /></label>
            <button type="button" title={t("guide.pdfDesign.branding.save")} aria-label={t("guide.pdfDesign.branding.save")} disabled={disabled} onClick={save} className={`grid size-8 shrink-0 place-items-center rounded-md bg-[var(--accent)] text-[var(--accent-foreground)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:opacity-90"}`}><Check className="size-3.5" aria-hidden="true" /></button>
            <button type="button" title={t("guide.pdfDesign.branding.cancel")} aria-label={t("guide.pdfDesign.branding.cancel")} disabled={disabled} onClick={cancel} className={`grid size-8 shrink-0 place-items-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:text-[var(--text)]"}`}><X className="size-3.5" aria-hidden="true" /></button>
          </div>
          {error ? <p role="alert" className="mt-1 text-[10px] text-[var(--danger)]">{t(error)}</p> : null}
        </div> : null}
      </div>
    </div>
  );
}

function CustomLinksEditor({ disabled, links, onChange, t }: { disabled: boolean; links: GuideBrandCustomLink[]; onChange: (links: GuideBrandCustomLink[]) => void; t: (key: TranslationKey) => string }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<TranslationKey | null>(null);
  function edit(link?: GuideBrandCustomLink) { setEditingId(link?.id ?? "new"); setLabel(link?.label ?? ""); setUrl(link?.url ?? ""); setError(null); }
  function cancel() { setEditingId(null); setError(null); }
  function save() {
    const normalizedUrl = normalizeGuideBrandUrl(url);
    if (!label.trim()) { setError("guide.pdfDesign.branding.customLabelRequired"); return; }
    if (!normalizedUrl) { setError("guide.pdfDesign.branding.invalidUrl"); return; }
    const next = { id: editingId === "new" ? crypto.randomUUID() : editingId ?? crypto.randomUUID(), label: label.trim().slice(0, 60), url: normalizedUrl };
    onChange((editingId === "new" ? [...links, next] : links.map((link) => link.id === editingId ? next : link)).slice(0, 5));
    setEditingId(null); setError(null);
  }
  return <div className="mt-2.5">
    <div className="flex items-center justify-between gap-2"><p className="text-[9px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">{t("guide.pdfDesign.branding.customLinks")}</p>{editingId === null && links.length < 5 ? <button type="button" title={t("guide.pdfDesign.branding.addCustomLink")} aria-label={t("guide.pdfDesign.branding.addCustomLink")} disabled={disabled} onClick={() => edit()} className={`grid size-7 place-items-center rounded-md text-[var(--text-secondary)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--accent)]"}`}><Plus className="size-3.5" aria-hidden="true" /></button> : null}</div>
    <div className="mt-1.5 space-y-1.5">
      {links.map((link) => editingId === link.id ? null : <div key={link.id} className="flex h-8 items-center gap-1.5 rounded-md bg-[var(--surface)] px-2"><Link2 className="size-3 shrink-0 text-[var(--text-secondary)]" aria-hidden="true" /><span className="min-w-0 flex-1 truncate text-[11px] text-[var(--text)]">{link.label}</span><button type="button" title={t("guide.pdfDesign.branding.editCustomLink")} aria-label={t("guide.pdfDesign.branding.editCustomLink")} disabled={disabled || editingId !== null} onClick={() => edit(link)} className={`grid size-6 place-items-center text-[var(--text-secondary)] ${disabled || editingId !== null ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:text-[var(--accent)]"}`}><Pencil className="size-3" /></button><button type="button" title={t("guide.pdfDesign.branding.removeCustomLink")} aria-label={t("guide.pdfDesign.branding.removeCustomLink")} disabled={disabled || editingId !== null} onClick={() => onChange(links.filter((item) => item.id !== link.id))} className={`grid size-6 place-items-center text-[var(--text-secondary)] ${disabled || editingId !== null ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:text-[var(--accent)]"}`}><Trash2 className="size-3" /></button></div>)}
      {editingId !== null ? <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2"><p className="mb-1.5 text-[10px] font-medium text-[var(--text)]">{t(editingId === "new" ? "guide.pdfDesign.branding.addCustomLink" : "guide.pdfDesign.branding.editCustomLink")}</p><div className="grid grid-cols-2 gap-1.5"><input value={label} maxLength={60} disabled={disabled} aria-label={t("guide.pdfDesign.branding.customLabel")} placeholder={t("guide.pdfDesign.branding.customLabel")} onChange={(event) => { setLabel(event.target.value); setError(null); }} className="h-8 min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-[11px] text-[var(--text)]" /><input type="url" value={url} disabled={disabled} aria-label={t("guide.pdfDesign.branding.customUrl")} placeholder={t("guide.pdfDesign.branding.customUrl")} onChange={(event) => { setUrl(event.target.value); setError(null); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); save(); } if (event.key === "Escape") { event.preventDefault(); cancel(); } }} className="h-8 min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-[11px] text-[var(--text)]" /></div><div className="mt-1.5 flex justify-end gap-1.5"><button type="button" aria-label={t("guide.pdfDesign.branding.save")} title={t("guide.pdfDesign.branding.save")} disabled={disabled} onClick={save} className={`grid size-8 place-items-center rounded-md bg-[var(--accent)] text-[var(--accent-foreground)] ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}><Check className="size-3.5" /></button><button type="button" aria-label={t("guide.pdfDesign.branding.cancel")} title={t("guide.pdfDesign.branding.cancel")} disabled={disabled} onClick={cancel} className={`grid size-8 place-items-center rounded-md border border-[var(--border)] bg-[var(--card)] ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}><X className="size-3.5" /></button></div>{error ? <p role="alert" className="mt-1 text-[10px] text-[var(--danger)]">{t(error)}</p> : null}</div> : null}
    </div>
  </div>;
}

const BACKGROUND_SECTION_TARGETS: { id: GuidePdfBackgroundTarget; label: TranslationKey }[] = GUIDE_SECTION_REGISTRY.reduce<{ id: GuidePdfBackgroundTarget; label: TranslationKey }[]>((targets, section) => {
  if (!section.titleKey) return targets;
  if (section.id === "cover") return [...targets, { id: "cover", label: "guide.pdfDesign.background.cover" }];
  if (section.contentSectionId === "projectOverview" || targets.some((target) => target.id === section.contentSectionId)) return targets;
  return [...targets, { id: section.contentSectionId, label: section.titleKey }];
}, []);
function BackgroundOpacitySlider({ disabled, onCommit, t, value }: { disabled: boolean; onCommit: (value: number) => void; t: (key: TranslationKey) => string; value: number }) {
  const [draft, setDraft] = useState(value);
  const commit = () => { if (draft !== value) onCommit(draft); };
  const updateDraft = (next: number) => setDraft(Math.min(100, Math.max(0, Math.round(next))));
  return <div className="mt-1.5">
    <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">{t("guide.pdfDesign.background.opacity")}</p>
    <div className="mt-0.5 flex items-center gap-2">
      <input type="range" min={0} max={100} step={1} value={draft} aria-label={t("guide.pdfDesign.background.opacity")} disabled={disabled} onChange={(event) => updateDraft(Number(event.target.value))} onPointerUp={commit} onKeyUp={commit} onBlur={commit} className={`h-5 min-w-0 flex-1 accent-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`} />
      <div className="flex h-7 w-[4.25rem] shrink-0 items-center rounded-md border border-[var(--border)] bg-[var(--card)] px-1.5 focus-within:ring-2 focus-within:ring-[var(--accent)]">
        <input type="number" min={0} max={100} step={1} value={draft} aria-label={t("guide.pdfDesign.background.opacityValue")} disabled={disabled} onChange={(event) => updateDraft(Number(event.target.value))} onBlur={commit} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); commit(); event.currentTarget.blur(); } }} className={`min-w-0 flex-1 bg-transparent text-right font-[family-name:var(--font-mono)] text-[10px] text-[var(--text)] outline-none ${disabled ? "cursor-not-allowed opacity-60" : ""}`} />
        <span className="text-[9px] text-[var(--text-secondary)]">%</span>
      </div>
    </div>
  </div>;
}

function BackgroundScopeEditor({ disabled, onSave, scope, t }: { disabled: boolean; onSave: (scope: GuidePdfBackgroundScope) => void; scope: GuidePdfBackgroundScope; t: (key: TranslationKey) => string }) {
  const cloneScope = (value: GuidePdfBackgroundScope): GuidePdfBackgroundScope => value.mode === "sections" ? { mode: "sections", sectionIds: [...value.sectionIds] } : { mode: value.mode };
  const [draftScope, setDraftScope] = useState(() => cloneScope(scope));
  const dirty = JSON.stringify(draftScope) !== JSON.stringify(scope);
  const toggleSection = (id: GuidePdfBackgroundSectionId) => {
    const sectionIds = draftScope.mode === "sections" ? [...draftScope.sectionIds] : [];
    const next = sectionIds.includes(id) ? sectionIds.filter((sectionId) => sectionId !== id) : [...sectionIds, id];
    setDraftScope(next.length ? { mode: "sections", sectionIds: [...next] } : { mode: "none" });
  };
  return <fieldset disabled={disabled} className="block"><legend className="mb-1 text-[9px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">{t("guide.pdfDesign.background.applyTo")}</legend>
    <label className={`flex min-h-7 items-center gap-2 text-[10px] text-[var(--text)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}><input type="checkbox" checked={draftScope.mode === "all"} onChange={(event) => setDraftScope(event.target.checked ? { mode: "all" } : { mode: "none" })} className="accent-[var(--accent)]" />{t("guide.pdfDesign.background.entirePdf")}</label>
    <div className="grid grid-cols-2 gap-x-2">{BACKGROUND_SECTION_TARGETS.map((target) => <label key={target.id} className={`flex min-h-7 min-w-0 items-center gap-2 text-[10px] text-[var(--text)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}><input type="checkbox" checked={draftScope.mode === "sections" && draftScope.sectionIds.includes(target.id as GuidePdfBackgroundSectionId)} onChange={() => toggleSection(target.id as GuidePdfBackgroundSectionId)} className="shrink-0 accent-[var(--accent)]" /><span className="truncate" title={t(target.label)}>{t(target.label)}</span></label>)}</div>
    <div className="mt-1 flex justify-end gap-1"><button type="button" title={t("guide.pdfDesign.branding.save")} aria-label={t("guide.pdfDesign.branding.save")} disabled={disabled || !dirty} onClick={() => onSave(cloneScope(draftScope))} className={`grid size-7 place-items-center rounded-md bg-[var(--accent)] text-[var(--accent-foreground)] ${disabled || !dirty ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:opacity-90"}`}><Check className="size-3.5" aria-hidden="true" /></button><button type="button" title={t("guide.pdfDesign.branding.cancel")} aria-label={t("guide.pdfDesign.branding.cancel")} disabled={disabled || !dirty} onClick={() => setDraftScope(cloneScope(scope))} className={`grid size-7 place-items-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] ${disabled || !dirty ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"}`}><X className="size-3.5" aria-hidden="true" /></button></div>
  </fieldset>;
}

function BackgroundEditor({ disabled, items, library, onChange, t }: { disabled: boolean; items: GuidePdfBackgroundItems; library: ResolvedUserBrandBackgroundAsset[]; onChange: (items: GuidePdfBackgroundItems) => void; t: (key: TranslationKey) => string }) {
  const [error, setError] = useState<TranslationKey | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);
  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  const localItems = [...items].reverse().filter((item) => item.sourceType === "guide");
  function addBackground() {
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  }
  function chooseBackground(background: ResolvedUserBrandBackgroundAsset) {
    const currentItems = itemsRef.current;
    const existing = currentItems.find((item) => item.sourceType === "profile" && item.assetId === background.id);
    if (existing) { setSelectedId(existing.id); return; }
    const newItem = { id: crypto.randomUUID(), assetId: background.id, sourceType: "profile" as const, imageUrl: background.imageUrl, localAssetId: background.localAssetId, opacity: 20, scope: { mode: "none" } as const };
    const nextItems = [...currentItems, newItem];
    itemsRef.current = nextItems;
    setSelectedId(newItem.id);
    onChange(nextItems);
  }
  async function upload(file: File, input: HTMLInputElement) {
    setError(null);
    if (!(file.type === "image/png" || file.type === "image/jpeg")) { setError("guide.pdfDesign.background.unsupported"); input.value = ""; return; }
    if (!file.size || file.size > 700 * 1024) { setError("guide.pdfDesign.background.tooLarge"); input.value = ""; return; }
    try {
      const imageUrl = await blobToDataUrl(file);
      const currentItems = itemsRef.current;
      {
        const id = crypto.randomUUID();
        const newItem = { id, assetId: id, sourceType: "guide" as const, imageUrl, localAssetId: null, opacity: 20, scope: { mode: "none" } as const };
        const nextItems = [...currentItems, newItem];
        itemsRef.current = nextItems;
        setSelectedId(newItem.id);
        onChange(nextItems);
      }
    } catch { setError("guide.pdfDesign.background.unreadable"); }
    finally { input.value = ""; }
  }
  function changeScope(id: string, scope: GuidePdfBackgroundScope) {
    setError(null);
    const itemIndex = itemsRef.current.findIndex((item) => item.id === id);
    if (itemIndex < 0) return;
    const nextItems = [...itemsRef.current];
    const ownedScope: GuidePdfBackgroundScope = scope.mode === "sections"
      ? { mode: "sections", sectionIds: [...scope.sectionIds] }
      : { mode: scope.mode };
    nextItems[itemIndex] = { ...nextItems[itemIndex], scope: ownedScope };
    itemsRef.current = nextItems;
    onChange(nextItems);
  }
  return <div>
    <div className="flex max-w-full gap-2 overflow-x-auto pb-1" role="list" aria-label={t("guide.pdfDesign.background.title")}>
      <button type="button" title={t("guide.pdfDesign.background.add")} aria-label={t("guide.pdfDesign.background.add")} disabled={disabled} onClick={addBackground} className={`grid size-10 shrink-0 place-items-center rounded-md border border-dashed border-[var(--border-strong)] text-[var(--text-secondary)] ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent)]"}`}><Plus className="size-4" aria-hidden="true" /></button>
      {library.map((background) => { const item = items.find((candidate) => candidate.sourceType === "profile" && candidate.assetId === background.id); return <div key={background.id} role="listitem" className="group relative size-10 shrink-0"><button type="button" title={background.name ?? t("guide.pdfDesign.background.chooseMine")} aria-label={background.name ?? t("guide.pdfDesign.background.chooseMine")} aria-pressed={Boolean(item && selected?.id === item.id)} disabled={disabled} onClick={() => chooseBackground(background)} className={`size-10 overflow-hidden rounded-md bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${item && selected?.id === item.id ? "ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--card)]" : "ring-1 ring-[var(--border)]"}`}><Image unoptimized src={background.imageUrl} alt="" width={40} height={40} className="size-full object-cover" /></button>{item ? <button type="button" title={t("guide.pdfDesign.background.remove")} aria-label={t("guide.pdfDesign.background.remove")} disabled={disabled} onClick={() => { const nextItems = itemsRef.current.filter((entry) => entry.id !== item.id); itemsRef.current = nextItems; onChange(nextItems); if (selected?.id === item.id) setSelectedId(nextItems[0]?.id ?? null); }} className={`absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] shadow-sm opacity-0 focus:opacity-100 group-hover:opacity-100 ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:text-[var(--accent)]"}`}><Trash2 className="size-2.5" aria-hidden="true" /></button> : null}</div>; })}
      {localItems.map((item) => <div key={item.id} role="listitem" className="group relative size-10 shrink-0"><button type="button" aria-pressed={selected?.id === item.id} aria-label={t("guide.pdfDesign.background.title")} disabled={disabled} onClick={() => setSelectedId(item.id)} className={`size-10 overflow-hidden rounded-md bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${selected?.id === item.id ? "ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--card)]" : "ring-1 ring-[var(--border)]"}`}>{item.imageUrl ? <Image unoptimized src={item.imageUrl} alt="" width={40} height={40} className="size-full object-cover" /> : null}</button><button type="button" title={t("guide.pdfDesign.background.remove")} aria-label={t("guide.pdfDesign.background.remove")} disabled={disabled} onClick={() => { const nextItems = itemsRef.current.filter((entry) => entry.id !== item.id); itemsRef.current = nextItems; onChange(nextItems); if (selected?.id === item.id) setSelectedId(nextItems[0]?.id ?? null); }} className={`absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] shadow-sm opacity-0 focus:opacity-100 group-hover:opacity-100 ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:text-[var(--accent)]"}`}><Trash2 className="size-2.5" aria-hidden="true" /></button></div>)}
    </div>
    {selected ? <div className="mt-2.5">
      <BackgroundScopeEditor key={selected.id} disabled={disabled} scope={selected.scope} onSave={(scope) => changeScope(selected.id, scope)} t={t} />
      <BackgroundOpacitySlider key={`${selected.id}-${selected.opacity}`} disabled={disabled} value={selected.opacity} onCommit={(opacity) => { const nextItems = itemsRef.current.map((entry) => entry.id === selected.id ? { ...entry, opacity } : entry); itemsRef.current = nextItems; onChange(nextItems); }} t={t} />
    </div> : <p className="py-1 text-[10px] text-[var(--text-secondary)]">{t("guide.pdfDesign.background.none")}</p>}
    <input ref={inputRef} hidden type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, event.currentTarget); else event.currentTarget.value = ""; }} />
    {error ? <p role="alert" className="mt-1 text-[10px] text-[var(--accent)]">{t(error)}</p> : null}
  </div>;
}

function BrandScaleSlider({ disabled, label, max, min, onCommit, t, value }: { disabled: boolean; label: TranslationKey; max: number; min: number; onCommit: (value: number) => void; t: (key: TranslationKey) => string; value: number }) {
  const [draft, setDraft] = useState(value);
  const commit = () => { if (draft !== value) onCommit(draft); };
  return <>
    <div className="mb-1 flex items-center justify-between gap-2"><p className="text-[9px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">{t(label)}</p><output className="font-[family-name:var(--font-mono)] text-[9px] text-[var(--text-secondary)]">{draft}%</output></div>
    <input type="range" min={min} max={max} step={1} value={draft} aria-label={t(label)} disabled={disabled} onChange={(event) => setDraft(Number(event.target.value))} onPointerUp={commit} onKeyUp={commit} onBlur={commit} className={`h-6 w-full accent-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`} />
  </>;
}

function BrandPositionMiniMap({ disabled, onChange, pageFormat, t, value }: { disabled: boolean; onChange: (position: GuideBrandPageLayout[GuideBrandElementType]["position"]) => void; pageFormat: GuidePageFormat; t: (key: TranslationKey) => string; value: GuideBrandPageLayout[GuideBrandElementType]["position"] }) {
  return <div className="w-11">
    <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">{t("guide.pdfDesign.branding.layout.position")}</p>
    <div className="grid w-11 grid-cols-3 grid-rows-3 overflow-hidden rounded-md border border-[var(--border-strong)] bg-[var(--surface)]" style={{ aspectRatio: pageFormat === "a4" ? "210 / 297" : "8.5 / 11" }} role="group" aria-label={t("guide.pdfDesign.branding.layout.position")}>
      {GUIDE_BRAND_POSITIONS.map((position) => <button key={position} type="button" title={t(`guide.pdfDesign.branding.layout.position.${position}`)} aria-label={t(`guide.pdfDesign.branding.layout.position.${position}`)} aria-pressed={value === position} disabled={disabled} onClick={() => onChange(position)} className={`grid min-h-0 min-w-0 place-items-center transition-colors motion-reduce:transition-none ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[var(--accent-soft)]"} ${value === position ? "bg-[var(--accent-soft)]" : "bg-transparent"}`}><span className={`size-1.5 rounded-full bg-[var(--accent)] ${value === position ? "opacity-100" : "opacity-0"}`} /></button>)}
    </div>
  </div>;
}

function BrandAlignmentControl({ disabled, onChange, t, value }: { disabled: boolean; onChange: (alignment: GuideBrandPageLayout[GuideBrandElementType]["alignment"]) => void; t: (key: TranslationKey) => string; value: GuideBrandPageLayout[GuideBrandElementType]["alignment"] }) {
  const icons = { left: AlignLeft, center: AlignCenter, right: AlignRight } as const;
  return <div>
    <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">{t("guide.pdfDesign.branding.layout.alignment")}</p>
    <div className="inline-grid grid-cols-3 gap-0.5 rounded-md bg-[var(--surface)] p-0.5" role="group" aria-label={t("guide.pdfDesign.branding.layout.alignment")}>
      {GUIDE_BRAND_ALIGNMENTS.map((alignment) => {
        const Icon = icons[alignment];
        return <button key={alignment} type="button" title={t(`guide.pdfDesign.branding.layout.alignment.${alignment}`)} aria-label={t(`guide.pdfDesign.branding.layout.alignment.${alignment}`)} disabled={disabled} aria-pressed={value === alignment} onClick={() => onChange(alignment)} className={`grid size-7 place-items-center rounded text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${value === alignment ? "bg-[var(--card)] text-[var(--accent)] shadow-sm" : "hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"}`}><Icon className="size-3.5" aria-hidden="true" /></button>;
      })}
    </div>
  </div>;
}

function BrandVisibilityButton({ disabled, element, onClick, t, visible }: { disabled: boolean; element: GuideBrandElementType | GuideBrandContentElementType; onClick: () => void; t: (key: TranslationKey) => string; visible: boolean }) {
  const action = t(visible ? "guide.pdfDesign.branding.visibility.hide" : "guide.pdfDesign.branding.visibility.show");
  const label = t(`guide.pdfDesign.branding.layout.element.${element}`);
  return <button type="button" title={`${action}: ${label}`} aria-label={`${action}: ${label}`} aria-pressed={visible} disabled={disabled} onClick={onClick} className={`grid size-7 shrink-0 place-items-center rounded-md ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[var(--surface-hover)]"} ${visible ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>{visible ? <Eye className="size-3.5" aria-hidden="true" /> : <EyeOff className="size-3.5" aria-hidden="true" />}</button>;
}

function LayoutContextTabs({ disabled, page, setPage, t, tabs }: { disabled: boolean; page: "cover" | "backCover" | "contentPages"; setPage: (page: "cover" | "backCover" | "contentPages") => void; t: (key: TranslationKey) => string; tabs: readonly ("cover" | "backCover" | "contentPages")[] }) {
  return <div className="mt-2 flex gap-0.5 rounded-lg bg-[var(--surface)] p-0.5">{tabs.map(item => <button key={item} type="button" disabled={disabled} aria-pressed={page === item} onClick={() => setPage(item)} className={`min-h-9 min-w-0 flex-1 rounded-md px-1 py-1 text-[10px] font-medium leading-tight ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${page === item ? "bg-[var(--card)] text-[var(--accent)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text)]"}`}>{t(`guide.pdfDesign.branding.layout.page.${item}`)}</button>)}</div>;
}

function ContentPagePlacementControl({ disabled, element, onChange, pageFormat, settings, t }: { disabled: boolean; element: GuideBrandContentElementType; onChange: (settings: GuideBrandContentElementLayout) => void; pageFormat: GuidePageFormat; settings: GuideBrandContentElementLayout; t: (key: TranslationKey) => string }) {
  const position = <BrandPositionMiniMap disabled={disabled} pageFormat={pageFormat} value={settings.position} onChange={value => onChange({ ...settings, position: value })} t={t}/>;
  if (element !== "logo" && element !== "qr") return position;
  return <div className="grid grid-cols-[2.75rem_1fr] gap-3">{position}<div>{element === "logo" ? <BrandScaleSlider key={`content-logo-${settings.logoScale}`} disabled={disabled} label="guide.pdfDesign.branding.layout.logoSize" min={GUIDE_BRAND_LOGO_SCALE_MIN} max={GUIDE_BRAND_LOGO_SCALE_MAX} value={settings.logoScale} onCommit={logoScale => onChange({ ...settings, logoScale })} t={t}/> : <BrandScaleSlider key={`content-qr-${settings.qrScale}`} disabled={disabled} label="guide.pdfDesign.branding.layout.qrSize" min={GUIDE_BRAND_CONTENT_QR_SCALE_MIN} max={GUIDE_BRAND_CONTENT_QR_SCALE_MAX} value={settings.qrScale} onCommit={qrScale => onChange({ ...settings, qrScale })} t={t}/>}</div></div>;
}

function BrandLayoutEditor({ backCoverLayout, contentPagesLayout, coverLayout, customLinkCount, disabled, onBackCoverLayoutChange, onContentPagesLayoutChange, onCoverLayoutChange, pageFormat, socialLinkCount, t }: { backCoverLayout: GuideBrandPageLayout; contentPagesLayout: GuideBrandContentPageLayout; coverLayout: GuideBrandPageLayout; customLinkCount: number; disabled: boolean; onBackCoverLayoutChange: (layout: GuideBrandPageLayout) => void; onContentPagesLayoutChange: (layout: GuideBrandContentPageLayout) => void; onCoverLayoutChange: (layout: GuideBrandPageLayout) => void; pageFormat: GuidePageFormat; socialLinkCount: number; t: (key: TranslationKey) => string }) {
  const renderedContentSectionIds = useContext(GuidePdfDesignSectionsContext);
  const [page, setPage] = useState<"cover" | "backCover" | "contentPages">("cover");
  const contentPageSections: readonly { id: GuideContentSectionId | "all"; title: string }[] = [{ id: "all", title: t("guide.pdfDesign.branding.layout.section.all") }, ...GUIDE_SECTION_REGISTRY.filter(section => renderedContentSectionIds.includes(section.contentSectionId) && section.id !== "cover" && section.id !== "back-cover" && section.titleKey).filter((section, index, sections) => sections.findIndex(candidate => candidate.contentSectionId === section.contentSectionId) === index).map(section => ({ id: section.contentSectionId, title: t(section.titleKey!) }))];
  const [contentSectionId, setContentSectionId] = useState<GuideContentSectionId | "all">("all");
  const [expandedElement, setExpandedElement] = useState<GuideBrandElementType | GuideBrandContentElementType | null>(null);
  const toggleElement = (element: GuideBrandElementType | GuideBrandContentElementType) => setExpandedElement(current => current === element ? null : element);
  const tabs = ["cover", "backCover", "contentPages"] as const;
  if (page === "contentPages") {
    const elements: readonly GuideBrandContentElementType[] = ["logo", "brand", "socialLinks", "qr"];
    const selectedSectionId = contentPageSections.some(section => section.id === contentSectionId) ? contentSectionId : "all";
    const layout = selectedSectionId === "all" ? contentPagesLayout : contentPagesLayout.sections?.[selectedSectionId] ?? contentPagesLayout;
    const update = (next: GuideBrandContentPageLayout) => onContentPagesLayoutChange(selectedSectionId === "all" ? { ...next, sections: contentPagesLayout.sections } : { ...contentPagesLayout, sections: { ...contentPagesLayout.sections, [selectedSectionId]: next } });
    return <div><div className="flex items-center justify-end"><button type="button" title={t("guide.pdfDesign.branding.layout.reset")} aria-label={t("guide.pdfDesign.branding.layout.reset")} disabled={disabled} onClick={() => update(DEFAULT_CONTENT_PAGES_BRAND_LAYOUT)} className={`grid size-7 place-items-center rounded-md text-[var(--text-secondary)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--accent)]"}`}><RotateCcw className="size-3.5" /></button></div><LayoutContextTabs disabled={disabled} page={page} setPage={setPage} t={t} tabs={tabs}/><label className="mt-2 block text-[10px] font-medium text-[var(--text-secondary)]">{t("guide.pdfDesign.branding.layout.section")}<select value={selectedSectionId} disabled={disabled} onChange={event => { setContentSectionId(event.target.value as GuideContentSectionId | "all"); setExpandedElement(null); }} className={`mt-1 h-8 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-xs text-[var(--text)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>{contentPageSections.map(section => <option key={section.id} value={section.id}>{section.title}</option>)}</select></label><div className="mt-2">{elements.map(element => { const settings = layout[element]; return <PdfDesignAccordionSection key={element} id={element} title={t(`guide.pdfDesign.branding.layout.element.${element}`)} expanded={expandedElement === element} onToggle={toggleElement} leading={<span className={`size-[7px] rounded-full ${settings.visible ? "bg-[var(--accent)]" : "bg-[var(--text-muted)]"}`} />} action={<BrandVisibilityButton disabled={disabled} element={element} visible={settings.visible} onClick={() => update({ ...layout, [element]: { ...settings, visible: !settings.visible } })} t={t} />}><div className={`pl-[17px] transition-opacity ${settings.visible ? "opacity-100" : "opacity-40"}`}><ContentPagePlacementControl disabled={disabled || !settings.visible} element={element} pageFormat={pageFormat} settings={settings} onChange={next => update({ ...layout, [element]: next })} t={t}/></div></PdfDesignAccordionSection>; })}</div></div>;
  }
  const layout = page === "cover" ? coverLayout : backCoverLayout;
  const update = page === "cover" ? onCoverLayoutChange : onBackCoverLayoutChange;
  const defaults = page === "cover" ? DEFAULT_COVER_BRAND_LAYOUT : DEFAULT_BACK_COVER_BRAND_LAYOUT;
  const elements: readonly GuideBrandElementType[] = ["logo", "brand", "cta", "qr", "socialLinks", "customLinks"];
  return <div><div className="flex items-center justify-end"><button type="button" title={t("guide.pdfDesign.branding.layout.reset")} aria-label={t("guide.pdfDesign.branding.layout.reset")} disabled={disabled} onClick={() => update(defaults)} className={`grid size-7 place-items-center rounded-md text-[var(--text-secondary)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--accent)]"}`}><RotateCcw className="size-3.5" /></button></div><div className="mt-2 grid grid-cols-3 gap-0.5 rounded-lg bg-[var(--surface)] p-0.5">{tabs.map(item => <button key={item} type="button" disabled={disabled} aria-pressed={page === item} onClick={() => setPage(item)} className={`h-7 rounded-md text-[9px] font-medium ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${page === item ? "bg-[var(--card)] text-[var(--accent)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text)]"}`}>{t(`guide.pdfDesign.branding.layout.page.${item}`)}</button>)}</div><div className="mt-2">{elements.map(element => { const settings = layout[element]; const fallback = defaults[element]; const customized = settings.visible !== fallback.visible || settings.position !== fallback.position || settings.alignment !== fallback.alignment || settings.logoScale !== fallback.logoScale || settings.qrScale !== fallback.qrScale; return <PdfDesignAccordionSection key={element} id={element} title={t(`guide.pdfDesign.branding.layout.element.${element}`)} expanded={expandedElement === element} onToggle={toggleElement} leading={<span className={`size-[7px] rounded-full ${customized ? "bg-[var(--accent)]" : "bg-[var(--text-muted)]"}`} />} summary={element === "socialLinks" ? socialLinkCount : element === "customLinks" ? customLinkCount : undefined} action={<BrandVisibilityButton disabled={disabled} element={element} visible={settings.visible} onClick={() => update({ ...layout, [element]: { ...settings, visible: !settings.visible } })} t={t} />}><div className={`pl-[17px] pr-1 transition-opacity ${settings.visible ? "opacity-100" : "opacity-40"}`}>{element === "logo" || element === "qr" ? <div className="grid grid-cols-[2.75rem_1fr] gap-3"><BrandPositionMiniMap disabled={disabled || !settings.visible} pageFormat={pageFormat} value={settings.position} onChange={position => update({ ...layout, [element]: { ...settings, position } })} t={t} /><div>{element === "logo" ? <BrandScaleSlider key={`${page}-logo-${settings.logoScale}`} disabled={disabled || !settings.visible} label="guide.pdfDesign.branding.layout.logoSize" min={GUIDE_BRAND_LOGO_SCALE_MIN} max={GUIDE_BRAND_LOGO_SCALE_MAX} value={settings.logoScale} onCommit={logoScale => update({ ...layout, logo: { ...settings, logoScale } })} t={t} /> : <BrandScaleSlider key={`${page}-qr-${settings.qrScale}`} disabled={disabled || !settings.visible} label="guide.pdfDesign.branding.layout.qrSize" min={GUIDE_BRAND_QR_SCALE_MIN} max={GUIDE_BRAND_QR_SCALE_MAX} value={settings.qrScale} onCommit={qrScale => update({ ...layout, qr: { ...settings, qrScale } })} t={t} />}</div></div> : element === "socialLinks" ? <BrandPositionMiniMap disabled={disabled || !settings.visible} pageFormat={pageFormat} value={settings.position} onChange={position => update({ ...layout, socialLinks: { ...settings, position } })} t={t} /> : <BrandAlignmentControl disabled={disabled || !settings.visible} value={settings.alignment} onChange={alignment => update({ ...layout, [element]: { ...settings, alignment } })} t={t} />}</div></PdfDesignAccordionSection>; })}</div></div>;
}

export function GuidePdfDesignPanel({
  accentColor,
  brandingEnabled,
  backCoverLayout,
  contentPagesLayout,
  brandName,
  ctaText,
  coverLayout,
  bodyFontId,
  disabled,
  displayFontId,
  monoFontId,
  logoUrl,
  qrValue,
  socialLinks,
  customLinks,
  backgroundItems,
  pageFormat,
  onPageFormatChange,
  onAccentColorChange,
  onBackCoverLayoutChange,
  onContentPagesLayoutChange,
  onBodyFontChange,
  onDisplayFontChange,
  onMonoFontChange,
  onBrandNameChange,
  onBrandingEnabledChange,
  onCtaTextChange,
  onCoverLayoutChange,
  onLogoChange,
  onQrValueChange,
  onSocialLinksChange,
  onCustomLinksChange,
  onBackgroundItemsChange,
  t,
}: {
  accentColor: string;
  brandingEnabled: boolean;
  backCoverLayout: GuideBrandPageLayout;
  contentPagesLayout: GuideBrandContentPageLayout;
  brandName: string | null;
  ctaText: string | null;
  coverLayout: GuideBrandPageLayout;
  bodyFontId: GuideFontId;
  disabled: boolean;
  displayFontId: GuideFontId;
  monoFontId: GuideFontId;
  logoUrl: string | null;
  qrValue: string | null;
  socialLinks: GuideBrandSocialLink[];
  customLinks: GuideBrandCustomLink[];
  backgroundItems: GuidePdfBackgroundItems;
  pageFormat: GuidePageFormat;
  onPageFormatChange: (pageFormat: GuidePageFormat) => void;
  onAccentColorChange: (accentColor: string) => void;
  onBackCoverLayoutChange: (layout: GuideBrandPageLayout) => void;
  onContentPagesLayoutChange: (layout: GuideBrandContentPageLayout) => void;
  onBodyFontChange: (fontId: GuideFontId) => void;
  onDisplayFontChange: (fontId: GuideFontId) => void;
  onMonoFontChange: (fontId: GuideFontId) => void;
  onBrandNameChange: (name: string | null) => void;
  onBrandingEnabledChange: () => void;
  onCtaTextChange: (ctaText: string | null) => void;
  onCoverLayoutChange: (layout: GuideBrandPageLayout) => void;
  onLogoChange: (logoUrl: string | null) => void;
  onQrValueChange: (qrValue: string | null) => void;
  onSocialLinksChange: (socialLinks: GuideBrandSocialLink[]) => void;
  onCustomLinksChange: (customLinks: GuideBrandCustomLink[]) => void;
  onBackgroundItemsChange: (items: GuidePdfBackgroundItems) => void;
  t: (key: TranslationKey) => string;
}) {
  const { profile } = useAuth();
  const profileBackgrounds = useUserBrandBackgroundAssets(profile?.brandAssets.backgrounds ?? []);
  const [nameDraft, setNameDraft] = useState(brandName ?? "");
  const [previousBrandName, setPreviousBrandName] = useState(brandName);
  const [isEditingBrandName, setIsEditingBrandName] = useState(false);
  const [logoError, setLogoError] = useState<TranslationKey | null>(null);
  const [expandedSections, setExpandedSections] = useState<PdfDesignAccordionId[]>([]);
  const brandNameInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const toggleAccordionSection = (id: PdfDesignAccordionId) => setExpandedSections((current) => current.includes(id)
    ? current.filter((item) => item !== id)
    : PDF_DESIGN_ACCORDION_CONFIG.allowMultiple ? [...current, id] : [id]);

  if (!isEditingBrandName && brandName !== previousBrandName) {
    setPreviousBrandName(brandName);
    setNameDraft(brandName ?? "");
  }

  function commitBrandName() {
    const normalized = nameDraft.trim().slice(0, 100);
    setNameDraft(normalized);
    setPreviousBrandName(normalized || null);
    setIsEditingBrandName(false);
    if (normalized !== (brandName ?? "")) onBrandNameChange(normalized || null);
  }

  function cancelBrandNameEdit() {
    setNameDraft(brandName ?? "");
    setPreviousBrandName(brandName);
    setIsEditingBrandName(false);
  }

  function startBrandNameEdit() {
    setIsEditingBrandName(true);
    window.requestAnimationFrame(() => {
      brandNameInputRef.current?.focus();
      brandNameInputRef.current?.select();
    });
  }

  async function uploadLogo(file: File) {
    setLogoError(null);
    if (!(["image/png", "image/jpeg"] as const).includes(file.type as "image/png" | "image/jpeg")) {
      setLogoError("guide.pdfDesign.branding.logoUnsupported");
      return;
    }
    if (!file.size || file.size > 512 * 1024) {
      setLogoError("guide.pdfDesign.branding.logoTooLarge");
      return;
    }
    try {
      onLogoChange(await blobToDataUrl(file));
    } catch {
      setLogoError("guide.pdfDesign.branding.logoUnreadable");
    }
  }
  const backgroundSummaryUrl = backgroundItems.find((item) => item.scope.mode === "all")?.imageUrl ?? backgroundItems.find((item) => item.scope.mode === "sections")?.imageUrl;

  return (
    <section className="guide-side-panel rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">{t("guide.pdfDesign.page")}</p>
        <div className="grid w-36 grid-cols-2 gap-0.5 rounded-lg bg-[var(--surface)] p-0.5" role="group" aria-label={t("guide.pdfDesign.pageFormat.label")}>
          {PAGE_FORMATS.map((format) => {
            const selected = pageFormat === format.id;
            return <button key={format.id} type="button" aria-pressed={selected} disabled={disabled} onClick={() => onPageFormatChange(format.id)} className={`h-7 rounded-md px-2 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] motion-reduce:transition-none ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${selected ? "bg-[var(--card)] text-[var(--accent)] shadow-sm" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"}`}>{t(format.labelKey)}</button>;
          })}
        </div>
      </div>

      <div className="mt-3">
        <PdfDesignAccordionSection id="background" title={t("guide.pdfDesign.background.title")} expanded={expandedSections.includes("background")} onToggle={toggleAccordionSection} summary={backgroundSummaryUrl ? <span className="size-5 overflow-hidden rounded-md ring-1 ring-[var(--border)]">
          {/* eslint-disable-next-line @next/next/no-img-element -- local runtime URL cannot use the Next image optimizer. */}
          <img src={backgroundSummaryUrl} alt="" className="size-full object-cover" />
        </span> : t("guide.pdfDesign.background.none")}>
          <BackgroundEditor disabled={disabled} items={backgroundItems} library={profileBackgrounds} onChange={onBackgroundItemsChange} t={t} />
        </PdfDesignAccordionSection>

        <PdfDesignAccordionSection id="typography" title={t("guide.pdfDesign.typography.label")} expanded={expandedSections.includes("typography")} onToggle={toggleAccordionSection} summary={<span className="size-3 rounded-full" style={{ backgroundColor: accentColor }} />}>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {([
            ["guide.pdfDesign.typography.display", displayFontId, onDisplayFontChange],
            ["guide.pdfDesign.typography.body", bodyFontId, onBodyFontChange],
            ["guide.pdfDesign.typography.mono", monoFontId, onMonoFontChange],
          ] as const).map(([label, value, onChange], index) => (
            <label key={label} className={`min-w-0 ${index === 2 ? "col-span-2" : ""}`}>
              <span title={t(label)} className="mb-1 block truncate text-[9px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">{t(label)}</span>
              <select title={GUIDE_FONT_OPTIONS.find((font) => font.id === value)?.label} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value as GuideFontId)} className={`h-8 w-full min-w-0 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-[11px] text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                {GUIDE_FONT_OPTIONS.map((font) => <option key={font.id} value={font.id}>{font.label}</option>)}
              </select>
            </label>
          ))}
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <span className="text-[11px] font-medium text-[var(--text-secondary)]">{t("guide.pdfDesign.accentColor.label")}</span>
          <div className="flex items-center gap-2">
            <label className={`relative block size-6 shrink-0 rounded-full ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`} style={{ backgroundColor: accentColor }}>
              <input type="color" value={accentColor} disabled={disabled} aria-label={t("guide.pdfDesign.accentColor.label")} onChange={(event) => onAccentColorChange(event.target.value)} className={`absolute inset-0 size-full opacity-0 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`} />
            </label>
            <span className="font-[family-name:var(--font-mono)] text-[11px] font-medium text-[var(--text)]">{accentColor}</span>
          </div>
        </div>
        </PdfDesignAccordionSection>

        {!brandingEnabled ? <div className="mt-3 rounded-xl bg-[var(--surface)] p-3"><div className="flex items-start gap-2.5"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]"><Palette className="size-4" aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-[var(--text)]">{t("guide.pdfDesign.branding.add")}</p><p className="mt-1 text-[10px] leading-4 text-[var(--text-secondary)]">{t("guide.pdfDesign.branding.addDescription")}</p></div></div><button type="button" disabled={disabled} onClick={onBrandingEnabledChange} className={`mt-3 h-8 rounded-lg bg-[var(--accent)] px-3 text-xs font-medium text-[var(--accent-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:opacity-90"}`}>{t("guide.pdfDesign.branding.add")}</button></div> : <>
        <PdfDesignAccordionSection id="branding" title={t("guide.pdfDesign.branding.title")} expanded={expandedSections.includes("branding")} onToggle={toggleAccordionSection} summary={<span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[9px] font-medium text-[var(--accent)]">{socialLinks.length + customLinks.length} {t("guide.pdfDesign.branding.linksSummary")}</span>}>
        <div className="flex items-start gap-2.5">
          <div className="relative size-12 shrink-0">
            {logoUrl ? <>
              {/* eslint-disable-next-line @next/next/no-img-element -- user-provided data URL is not compatible with next/image. */}
              <img src={logoUrl} alt="" className="size-12 rounded-lg border border-[var(--border)] bg-[var(--surface)] object-contain p-1" />
              <button type="button" title={t("guide.pdfDesign.branding.replace")} aria-label={t("guide.pdfDesign.branding.replace")} disabled={disabled} onClick={() => logoInputRef.current?.click()} className={`absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--text)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:text-[var(--accent)]"}`}><Pencil className="size-3" aria-hidden="true" /></button>
              <button type="button" title={t("guide.pdfDesign.branding.remove")} aria-label={t("guide.pdfDesign.branding.remove")} disabled={disabled} onClick={() => onLogoChange(null)} className={`absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:text-[var(--accent)]"}`}><Trash2 className="size-2.5" aria-hidden="true" /></button>
            </> : <button type="button" title={t("guide.pdfDesign.branding.upload")} aria-label={t("guide.pdfDesign.branding.upload")} disabled={disabled} onClick={() => logoInputRef.current?.click()} className={`grid size-12 place-items-center rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent)]"}`}><ImagePlus className="size-4" aria-hidden="true" /></button>}
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">{t("guide.pdfDesign.branding.name")}</p>
            <span className="flex items-center gap-1">
            <input
              ref={brandNameInputRef}
              type="text"
              aria-label={t("guide.pdfDesign.branding.name")}
              value={nameDraft}
              maxLength={100}
              readOnly={!isEditingBrandName}
              disabled={disabled}
              onClick={() => { if (!disabled && !isEditingBrandName) startBrandNameEdit(); }}
              onChange={(event) => setNameDraft(event.target.value)}
              onKeyDown={(event) => {
                if (!isEditingBrandName) return;
                if (event.key === "Enter") { event.preventDefault(); commitBrandName(); }
                if (event.key === "Escape") { event.preventDefault(); cancelBrandNameEdit(); }
              }}
              className={`h-8 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-xs font-normal normal-case tracking-normal text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-text"}`}
            />
            {isEditingBrandName ? (
              <>
                <button type="button" title={t("guide.pdfDesign.branding.save")} aria-label={t("guide.pdfDesign.branding.save")} disabled={disabled} onClick={commitBrandName} className={`grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:opacity-90"}`}><Check className="size-3.5" aria-hidden="true" /></button>
                <button type="button" title={t("guide.pdfDesign.branding.cancel")} aria-label={t("guide.pdfDesign.branding.cancel")} disabled={disabled} onClick={cancelBrandNameEdit} className={`grid size-8 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"}`}><X className="size-3.5" aria-hidden="true" /></button>
              </>
            ) : (
              <button type="button" title={t("guide.pdfDesign.branding.edit")} aria-label={t("guide.pdfDesign.branding.edit")} disabled={disabled} onClick={startBrandNameEdit} className={`grid size-8 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"}`}><Pencil className="size-3.5" aria-hidden="true" /></button>
            )}
            </span>
          </div>
        </div>
        <input ref={logoInputRef} hidden type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadLogo(file); event.target.value = ""; }} />
        {logoError ? <p role="alert" className="mt-1.5 text-[11px] leading-4 text-[var(--accent)]">{t(logoError)}</p> : null}
        <div className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-2.5">
          <CompactBrandField disabled={disabled} label="guide.pdfDesign.branding.cta" maxLength={160} value={ctaText} onSave={onCtaTextChange} t={t} />
          <div className="col-span-2"><CompactBrandField disabled={disabled} label="guide.pdfDesign.branding.qr" maxLength={2048} type="url" value={qrValue} validate={normalizeUrlDraft} validateOnBlur onSave={onQrValueChange} t={t} /></div>
        </div>
        <GuideBrandSocialLinksEditor disabled={disabled} links={socialLinks} onChange={onSocialLinksChange} t={t} />
        <CustomLinksEditor disabled={disabled} links={customLinks} onChange={onCustomLinksChange} t={t} />
        </PdfDesignAccordionSection>

        <PdfDesignAccordionSection id="layout" title={t("guide.pdfDesign.branding.layout.title")} expanded={expandedSections.includes("layout")} onToggle={toggleAccordionSection}>
          <BrandLayoutEditor backCoverLayout={backCoverLayout} contentPagesLayout={contentPagesLayout} coverLayout={coverLayout} customLinkCount={customLinks.length} disabled={disabled} onBackCoverLayoutChange={onBackCoverLayoutChange} onContentPagesLayoutChange={onContentPagesLayoutChange} onCoverLayoutChange={onCoverLayoutChange} pageFormat={pageFormat} socialLinkCount={socialLinks.length} t={t} />
        </PdfDesignAccordionSection>
        </>}
      </div>
    </section>
  );
}
