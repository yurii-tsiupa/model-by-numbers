"use client";

import { useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import type { TranslationKey } from "@/features/i18n/locales/en";
import { blobToDataUrl } from "../lib/blobToDataUrl";
import { GUIDE_FONT_OPTIONS, type GuideFontId } from "../design/guideFontRegistry";
import type { GuidePageFormat } from "../types/GuidePageFormat";

const PAGE_FORMATS: readonly { id: GuidePageFormat; labelKey: TranslationKey }[] = [
  { id: "a4", labelKey: "guide.pdfDesign.pageFormat.a4" },
  { id: "letter", labelKey: "guide.pdfDesign.pageFormat.letter" },
];

export function GuidePdfDesignPanel({
  accentColor,
  brandName,
  bodyFontId,
  disabled,
  displayFontId,
  monoFontId,
  logoUrl,
  pageFormat,
  onPageFormatChange,
  onAccentColorChange,
  onBodyFontChange,
  onDisplayFontChange,
  onMonoFontChange,
  onBrandNameChange,
  onLogoChange,
  t,
}: {
  accentColor: string;
  brandName: string | null;
  bodyFontId: GuideFontId;
  disabled: boolean;
  displayFontId: GuideFontId;
  monoFontId: GuideFontId;
  logoUrl: string | null;
  pageFormat: GuidePageFormat;
  onPageFormatChange: (pageFormat: GuidePageFormat) => void;
  onAccentColorChange: (accentColor: string) => void;
  onBodyFontChange: (fontId: GuideFontId) => void;
  onDisplayFontChange: (fontId: GuideFontId) => void;
  onMonoFontChange: (fontId: GuideFontId) => void;
  onBrandNameChange: (name: string | null) => void;
  onLogoChange: (logoUrl: string | null) => void;
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
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">{t("guide.pdfDesign.page")}</p>
        <h2 className="mt-1 text-sm font-semibold text-[var(--text)]">{t("guide.pdfDesign.pageFormat.label")}</h2>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-[var(--surface)] p-1" role="group" aria-label={t("guide.pdfDesign.pageFormat.label")}>
        {PAGE_FORMATS.map((format) => {
          const selected = pageFormat === format.id;
          return (
            <button
              key={format.id}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onPageFormatChange(format.id)}
              className={`min-h-9 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] motion-reduce:transition-none ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${selected ? "bg-[var(--card)] text-[var(--accent)] shadow-sm" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"}`}
            >
              {t(format.labelKey)}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] leading-4 text-[var(--text-secondary)]">{t("guide.pdfDesign.pageFormat.helper")}</p>
      <div className="mt-4 border-t border-[var(--border)] pt-4">
        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text)]">{t("guide.pdfDesign.typography.label")}</h2>
            <p className="mt-1 text-[11px] leading-4 text-[var(--text-secondary)]">{t("guide.pdfDesign.typography.helper")}</p>
          </div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            <span className="mb-1.5 block">{t("guide.pdfDesign.typography.display")}</span>
            <select
              value={displayFontId}
              disabled={disabled}
              onChange={(event) => onDisplayFontChange(event.target.value as GuideFontId)}
              className={`w-full cursor-pointer appearance-none rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-2 pr-8 text-sm text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              {GUIDE_FONT_OPTIONS.map((font) => (
                <option key={font.id} value={font.id}>{font.label}</option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            <span className="mb-1.5 block">{t("guide.pdfDesign.typography.body")}</span>
            <select
              value={bodyFontId}
              disabled={disabled}
              onChange={(event) => onBodyFontChange(event.target.value as GuideFontId)}
              className={`w-full cursor-pointer appearance-none rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-2 pr-8 text-sm text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              {GUIDE_FONT_OPTIONS.map((font) => (
                <option key={font.id} value={font.id}>{font.label}</option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            <span className="mb-1.5 block">{t("guide.pdfDesign.typography.mono")}</span>
            <select
              value={monoFontId}
              disabled={disabled}
              onChange={(event) => onMonoFontChange(event.target.value as GuideFontId)}
              className={`w-full cursor-pointer appearance-none rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-2 pr-8 text-sm text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              {GUIDE_FONT_OPTIONS.map((font) => (
                <option key={font.id} value={font.id}>{font.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="mt-4 border-t border-[var(--border)] pt-4">
        <h2 className="text-sm font-semibold text-[var(--text)]">{t("guide.pdfDesign.accentColor.label")}</h2>
        <div className="mt-2 flex items-center gap-2.5 rounded-xl bg-[var(--surface)] p-2">
          <input
            type="color"
            value={accentColor}
            disabled={disabled}
            aria-label={t("guide.pdfDesign.accentColor.label")}
            onChange={(event) => onAccentColorChange(event.target.value)}
            className={`h-8 w-10 rounded-lg border border-[var(--border)] bg-[var(--card)] p-1 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          />
          <span className="font-[family-name:var(--font-mono)] text-xs font-medium text-[var(--text)]">{accentColor}</span>
        </div>
      </div>
      <div className="mt-4 border-t border-[var(--border)] pt-4">
        <h2 className="text-sm font-semibold text-[var(--text)]">{t("guide.pdfDesign.branding.title")}</h2>
        <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
          <p className="mb-1.5">{t("guide.pdfDesign.branding.name")}</p>
          <span className="flex items-center gap-1.5">
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
              className={`h-8 min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 text-sm font-normal normal-case tracking-normal text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-text"}`}
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
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">{t("guide.pdfDesign.branding.logo")}</p>
          {logoUrl ? (
            <div className="mt-1.5 rounded-xl bg-[var(--surface)] p-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element -- user-provided data URL is not compatible with next/image. */}
              <img src={logoUrl} alt="" className="mx-auto h-14 max-w-full object-contain" />
              <div className="mt-2 flex gap-2">
                <button type="button" disabled={disabled} onClick={() => logoInputRef.current?.click()} className={`min-h-8 flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 text-xs font-medium text-[var(--text)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[var(--surface-hover)]"}`}>{t("guide.pdfDesign.branding.replace")}</button>
                <button type="button" disabled={disabled} onClick={() => onLogoChange(null)} className={`min-h-8 flex-1 rounded-lg px-2 text-xs font-medium text-[var(--accent)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[var(--surface-hover)]"}`}>{t("guide.pdfDesign.branding.remove")}</button>
              </div>
            </div>
          ) : (
            <button type="button" disabled={disabled} onClick={() => logoInputRef.current?.click()} className={`mt-1.5 min-h-9 w-full rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--card)] px-3 text-xs font-medium text-[var(--text)] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-[var(--accent)] hover:bg-[var(--surface-hover)]"}`}>{t("guide.pdfDesign.branding.upload")}</button>
          )}
          <input ref={logoInputRef} hidden type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadLogo(file); event.target.value = ""; }} />
          {logoError ? <p role="alert" className="mt-1.5 text-[11px] leading-4 text-[var(--accent)]">{t(logoError)}</p> : null}
        </div>
      </div>
    </section>
  );
}
