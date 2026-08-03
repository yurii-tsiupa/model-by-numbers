import type { TranslationKey } from "@/features/i18n/locales/en";
import type { GuidePageFormat } from "../types/GuidePageFormat";

const PAGE_FORMATS: readonly { id: GuidePageFormat; labelKey: TranslationKey }[] = [
  { id: "a4", labelKey: "guide.pdfDesign.pageFormat.a4" },
  { id: "letter", labelKey: "guide.pdfDesign.pageFormat.letter" },
];

export function GuidePdfDesignPanel({
  accentColor,
  disabled,
  pageFormat,
  onPageFormatChange,
  onAccentColorChange,
  t,
}: {
  accentColor: string;
  disabled: boolean;
  pageFormat: GuidePageFormat;
  onPageFormatChange: (pageFormat: GuidePageFormat) => void;
  onAccentColorChange: (accentColor: string) => void;
  t: (key: TranslationKey) => string;
}) {
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
    </section>
  );
}
