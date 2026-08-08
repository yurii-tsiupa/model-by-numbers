"use client";

import { useRef, useState } from "react";
import { Check, ImagePlus, Link2, Pencil, Plus, Trash2, X } from "lucide-react";
import type { TranslationKey } from "@/features/i18n/locales/en";
import { blobToDataUrl } from "../lib/blobToDataUrl";
import { GUIDE_FONT_OPTIONS, type GuideFontId } from "../design/guideFontRegistry";
import type { GuidePageFormat } from "../types/GuidePageFormat";
import { normalizeGuideBrandUrl, type GuideBrandSocialLink, type GuideBrandSocialLinkType } from "../types/GuideBrandSettings";
import { getGuideSocialLabel, getGuideSocialPlatformLabel } from "../lib/guideBrandContacts";

const PAGE_FORMATS: readonly { id: GuidePageFormat; labelKey: TranslationKey }[] = [
  { id: "a4", labelKey: "guide.pdfDesign.pageFormat.a4" },
  { id: "letter", labelKey: "guide.pdfDesign.pageFormat.letter" },
];

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
}: {
  disabled: boolean;
  label: TranslationKey;
  maxLength: number;
  onSave: (value: string | null) => void;
  t: (key: TranslationKey) => string;
  type?: "text" | "url";
  value: string | null;
  validate?: (value: string) => { error: TranslationKey | null; value: string | null };
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

  return (
    <div>
      <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">{t(label)}</p>
      <div className="flex items-center gap-1.5">
        <input ref={inputRef} type={type} aria-label={t(label)} value={draft} maxLength={maxLength} readOnly={!editing} disabled={disabled} onClick={() => { if (!disabled && !editing) startEditing(); }} onChange={(event) => { setDraft(event.target.value); setError(null); }} onKeyDown={(event) => { if (!editing) return; if (event.key === "Enter") { event.preventDefault(); save(); } if (event.key === "Escape") { event.preventDefault(); cancel(); } }} className={`h-8 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-xs text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-text"}`} />
        {editing ? <>
          <button type="button" title={t("guide.pdfDesign.branding.save")} aria-label={t("guide.pdfDesign.branding.save")} disabled={disabled} onClick={save} className={`grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:opacity-90"}`}><Check className="size-3.5" aria-hidden="true" /></button>
          <button type="button" title={t("guide.pdfDesign.branding.cancel")} aria-label={t("guide.pdfDesign.branding.cancel")} disabled={disabled} onClick={cancel} className={`grid size-8 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"}`}><X className="size-3.5" aria-hidden="true" /></button>
        </> : <button type="button" title={t("guide.pdfDesign.branding.editField")} aria-label={t("guide.pdfDesign.branding.editField")} disabled={disabled} onClick={startEditing} className={`grid size-8 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"}`}><Pencil className="size-3.5" aria-hidden="true" /></button>}
      </div>
      {error ? <p role="alert" className="mt-1.5 text-[11px] leading-4 text-[var(--accent)]">{t(error)}</p> : null}
    </div>
  );
}

const SOCIAL_LINK_TYPES: readonly GuideBrandSocialLinkType[] = ["instagram", "tiktok", "facebook", "youtube", "other"];

function SocialLinksEditor({ disabled, links, onChange, t }: { disabled: boolean; links: GuideBrandSocialLink[]; onChange: (links: GuideBrandSocialLink[]) => void; t: (key: TranslationKey) => string }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<GuideBrandSocialLinkType>("instagram");
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<TranslationKey | null>(null);

  function edit(link?: GuideBrandSocialLink) {
    setEditingId(link?.id ?? "new");
    setType(link?.type ?? "instagram");
    setUrl(link?.url ?? "");
    setLabel(link?.label ?? "");
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
    const next: GuideBrandSocialLink = { id: editingId === "new" ? crypto.randomUUID() : editingId ?? crypto.randomUUID(), type, url: normalizedUrl, label: label.trim().slice(0, 60) || null };
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
          <Link2 className="size-3 shrink-0 text-[var(--text-secondary)]" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate text-[11px] text-[var(--text)]">{getGuideSocialPlatformLabel(link.type)} · {getGuideSocialLabel(link)}</span>
          <button type="button" title={t("guide.pdfDesign.branding.editSocial")} aria-label={t("guide.pdfDesign.branding.editSocial")} disabled={disabled || editingId !== null} onClick={() => edit(link)} className={`grid size-6 shrink-0 place-items-center rounded text-[var(--text-secondary)] ${disabled || editingId !== null ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:text-[var(--accent)]"}`}><Pencil className="size-3" aria-hidden="true" /></button>
          <button type="button" title={t("guide.pdfDesign.branding.removeSocial")} aria-label={t("guide.pdfDesign.branding.removeSocial")} disabled={disabled || editingId !== null} onClick={() => onChange(links.filter((item) => item.id !== link.id))} className={`grid size-6 shrink-0 place-items-center rounded text-[var(--text-secondary)] ${disabled || editingId !== null ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:text-[var(--accent)]"}`}><Trash2 className="size-3" aria-hidden="true" /></button>
        </div>)}
        {editingId !== null ? <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
          <div className="grid grid-cols-2 gap-1.5">
            <label><span className="sr-only">{t("guide.pdfDesign.branding.socialType")}</span><select value={type} disabled={disabled} onChange={(event) => setType(event.target.value as GuideBrandSocialLinkType)} className={`h-8 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-1.5 text-[11px] text-[var(--text)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>{SOCIAL_LINK_TYPES.map((item) => <option key={item} value={item}>{t(`guide.pdfDesign.branding.socialType.${item}`)}</option>)}</select></label>
            <label><span className="sr-only">{t("guide.pdfDesign.branding.socialLabel")}</span><input value={label} maxLength={60} disabled={disabled} placeholder={t("guide.pdfDesign.branding.socialLabel")} onChange={(event) => setLabel(event.target.value)} className={`h-8 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-[11px] text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : ""}`} /></label>
          </div>
          <div className="mt-1.5 flex gap-1.5">
            <label className="min-w-0 flex-1"><span className="sr-only">{t("guide.pdfDesign.branding.socialUrl")}</span><input type="url" value={url} disabled={disabled} placeholder={t("guide.pdfDesign.branding.socialUrl")} onChange={(event) => { setUrl(event.target.value); setError(null); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); save(); } if (event.key === "Escape") { event.preventDefault(); cancel(); } }} className={`h-8 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-[11px] text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : ""}`} /></label>
            <button type="button" title={t("guide.pdfDesign.branding.save")} aria-label={t("guide.pdfDesign.branding.save")} disabled={disabled} onClick={save} className={`grid size-8 shrink-0 place-items-center rounded-md bg-[var(--accent)] text-[var(--accent-foreground)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:opacity-90"}`}><Check className="size-3.5" aria-hidden="true" /></button>
            <button type="button" title={t("guide.pdfDesign.branding.cancel")} aria-label={t("guide.pdfDesign.branding.cancel")} disabled={disabled} onClick={cancel} className={`grid size-8 shrink-0 place-items-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:text-[var(--text)]"}`}><X className="size-3.5" aria-hidden="true" /></button>
          </div>
          {error ? <p role="alert" className="mt-1 text-[10px] text-[var(--accent)]">{t(error)}</p> : null}
        </div> : null}
      </div>
    </div>
  );
}

export function GuidePdfDesignPanel({
  accentColor,
  brandName,
  ctaText,
  bodyFontId,
  disabled,
  displayFontId,
  monoFontId,
  logoUrl,
  qrValue,
  socialLinks,
  websiteUrl,
  pageFormat,
  onPageFormatChange,
  onAccentColorChange,
  onBodyFontChange,
  onDisplayFontChange,
  onMonoFontChange,
  onBrandNameChange,
  onCtaTextChange,
  onLogoChange,
  onQrValueChange,
  onSocialLinksChange,
  onWebsiteUrlChange,
  t,
}: {
  accentColor: string;
  brandName: string | null;
  ctaText: string | null;
  bodyFontId: GuideFontId;
  disabled: boolean;
  displayFontId: GuideFontId;
  monoFontId: GuideFontId;
  logoUrl: string | null;
  qrValue: string | null;
  socialLinks: GuideBrandSocialLink[];
  websiteUrl: string | null;
  pageFormat: GuidePageFormat;
  onPageFormatChange: (pageFormat: GuidePageFormat) => void;
  onAccentColorChange: (accentColor: string) => void;
  onBodyFontChange: (fontId: GuideFontId) => void;
  onDisplayFontChange: (fontId: GuideFontId) => void;
  onMonoFontChange: (fontId: GuideFontId) => void;
  onBrandNameChange: (name: string | null) => void;
  onCtaTextChange: (ctaText: string | null) => void;
  onLogoChange: (logoUrl: string | null) => void;
  onQrValueChange: (qrValue: string | null) => void;
  onSocialLinksChange: (socialLinks: GuideBrandSocialLink[]) => void;
  onWebsiteUrlChange: (websiteUrl: string | null) => void;
  t: (key: TranslationKey) => string;
}) {
  const [nameDraft, setNameDraft] = useState(brandName ?? "");
  const [previousBrandName, setPreviousBrandName] = useState(brandName);
  const [isEditingBrandName, setIsEditingBrandName] = useState(false);
  const [logoError, setLogoError] = useState<TranslationKey | null>(null);
  const brandNameInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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

      <div className="mt-3 border-t-[0.5px] border-[var(--border)] pt-3">
        <h2 className="font-[family-name:var(--font-display)] text-[13px] font-medium text-[var(--text)]">{t("guide.pdfDesign.typography.label")}</h2>
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
      </div>

      <div className="mt-3 border-t-[0.5px] border-[var(--border)] pt-3">
        <h2 className="font-[family-name:var(--font-display)] text-[13px] font-medium text-[var(--text)]">{t("guide.pdfDesign.branding.title")}</h2>
        <div className="mt-2.5 flex items-start gap-2.5">
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
          <CompactBrandField disabled={disabled} label="guide.pdfDesign.branding.link" maxLength={2048} type="url" value={websiteUrl} validate={normalizeUrlDraft} onSave={onWebsiteUrlChange} t={t} />
          <div className="col-span-2"><CompactBrandField disabled={disabled} label="guide.pdfDesign.branding.qr" maxLength={2048} type="url" value={qrValue} validate={normalizeUrlDraft} onSave={onQrValueChange} t={t} /></div>
        </div>
        <SocialLinksEditor disabled={disabled} links={socialLinks} onChange={onSocialLinksChange} t={t} />
      </div>
    </section>
  );
}
