import { CircleAlert } from "lucide-react";

import { translate } from "@/features/i18n/lib/i18n";
import type { Locale } from "@/features/i18n/types/Locale";

import {
  getGuideExportWarningTranslationKey,
} from "../services/pdf/validateGuideExport";
import type {
  ExportValidationWarning,
} from "../services/pdf/validateGuideExport";

type Props = {
  locale: Locale;
  warnings: ExportValidationWarning[];
  onConfirm: () => void;
  onReview: () => void;
};

export function GuideExportWarningDialog({
  locale,
  warnings,
  onConfirm,
  onReview,
}: Props) {
  const t = (
    key: Parameters<typeof translate>[1],
    values?: Parameters<typeof translate>[2],
  ) => translate(locale, key, values);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-export-warning-title"
      aria-describedby="guide-export-warning-description"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--text)] sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <CircleAlert
              className="h-5 w-5 text-[var(--accent)]"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Export check
            </p>

            <h2
              id="guide-export-warning-title"
              className="mt-1 font-[family-name:var(--font-space-grotesk)] text-xl font-semibold tracking-[-0.02em] text-[var(--text)]"
            >
              {t("guide.pdfExport.warningTitle", {
                count: warnings.length,
              })}
            </h2>

            <p
              id="guide-export-warning-description"
              className="mt-2 font-[family-name:var(--font-inter)] text-sm leading-6 text-[var(--text-secondary)]"
            >
              {t("guide.pdfExport.warningDescription")}
            </p>
          </div>
        </div>

        <div className="my-6 h-px bg-[var(--border)]" />

        <ul className="space-y-2">
          {warnings.map((warning, index) => (
            <li
              key={warning.code}
              className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-semibold text-[var(--accent)]">
                {String(index + 1).padStart(2, "0")}
              </span>

              <p className="pt-0.5 font-[family-name:var(--font-inter)] text-sm leading-6 text-[var(--text-secondary)]">
                {t(
                  getGuideExportWarningTranslationKey(
                    warning.code,
                  ),
                  {
                    count: warning.count ?? 1,
                  },
                )}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onReview}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 font-[family-name:var(--font-inter)] text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
          >
            {t("guide.pdfExport.reviewGuide")}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-[var(--accent)] px-4 font-[family-name:var(--font-inter)] text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
          >
            {t("guide.pdfExport.exportAnyway")}
          </button>
        </div>
      </div>
    </div>
  );
}