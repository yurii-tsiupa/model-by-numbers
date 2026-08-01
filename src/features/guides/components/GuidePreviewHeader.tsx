import { ArrowLeft, CircleAlert, Download, LoaderCircle } from "lucide-react";
import Link from "next/link";

import { AppHeader } from "@/components/layout/AppHeader";
import { translate } from "@/features/i18n/lib/i18n";
import type { Locale } from "@/features/i18n/types/Locale";

import {
  getPdfExportErrorTranslationKey,
} from "../services/pdf/pdfExportErrors";
import type { PdfExportError } from "../services/pdf/pdfExportErrors";
import type { PdfExportStatus } from "../services/pdf/types";

type Props = {
  projectId: string;
  title: string;
  exportStatus: PdfExportStatus;
  exportProgress: number;
  exportError: PdfExportError | null;
  onDownload: () => void;
  onRetry: () => void;
  onReset: () => void;
  onDelete?: () => void;
  locale: Locale;
};

export function GuidePreviewHeader({
  projectId,
  title,
  exportStatus,
  exportProgress,
  exportError,
  onDownload,
  onRetry,
  onReset,
  onDelete,
  locale,
}: Props) {
  const t = (
    key: Parameters<typeof translate>[1],
    values?: Parameters<typeof translate>[2],
  ) => translate(locale, key, values);

  const isExporting = [
    "preparing",
    "loadingAssets",
    "rendering",
    "generating",
  ].includes(exportStatus);

  const statusKey =
    exportStatus === "preparing"
      ? "guide.pdfExport.preparing"
      : exportStatus === "loadingAssets"
        ? "guide.pdfExport.loadingAssets"
        : exportStatus === "rendering"
          ? "guide.pdfExport.rendering"
          : exportStatus === "generating"
            ? "guide.pdfExport.generating"
            : null;

  const progress = Math.min(
    100,
    Math.max(0, exportProgress),
  );

  return (
    <>
      <AppHeader variant="guide" showNavigation={false} className="print:hidden" />

      <section
        data-guide-controls
        className="bg-[var(--bg)] print:hidden"
      >
        <div className="relative mx-auto flex w-full max-w-[100rem] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <Link
                href={`/models/${projectId}`}
                className="guide-back-action inline-flex min-h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                <ArrowLeft
                  className="h-4 w-4 text-inherit"
                  strokeWidth={2}
                />
                {t("guide.backEditor")}
              </Link>

              <span className="hidden h-9 w-px shrink-0 bg-[var(--border)] sm:block" aria-hidden="true" />

              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold tracking-[-0.01em] text-[var(--text)] sm:text-[17px]">{title}</h1>
                <p className="hidden truncate text-xs text-[var(--text-secondary)] sm:block">{t("guide.preview")}</p>
              </div>
          </div>

              <div className="ml-auto flex shrink-0 items-center justify-end gap-2"><button
                type="button"
                disabled={isExporting}
                onClick={onDownload}
                className="guide-download-button inline-flex min-h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)] transition duration-200 hover:-translate-y-px hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isExporting ? (
                  <LoaderCircle
                    className="h-4 w-4 animate-spin"
                    strokeWidth={2}
                  />
                ) : exportStatus === "error" ? (
                  <CircleAlert
                    className="h-4 w-4"
                    strokeWidth={2}
                  />
                ) : (
                  <Download
                    className="h-4 w-4"
                    strokeWidth={2}
                  />
                )}

                {isExporting
                  ? t("guide.pdfExport.exporting")
                  : t("guide.download")}
              </button>

              {onDelete ? (
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={onDelete}
                  className="hidden min-h-9 cursor-pointer items-center justify-center rounded-lg px-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex"
                >
                  {t("guide.delete")}
                </button>
              ) : null}</div>
          {isExporting && statusKey ? (
            <div
              role="status"
              className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--border)]"
            >
                <div
                  className="h-full bg-[var(--accent)] transition-[width] duration-300"
                  aria-label={`${t(statusKey)} ${progress}%`}
                  style={{
                    width: `${progress}%`,
                  }}
                />
            </div>
          ) : null}

          {exportStatus === "success" ? (
            <div
              role="status"
              className="absolute right-4 top-full mt-2 flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 shadow-lg sm:right-6"
            >
              <span className="font-[family-name:var(--font-inter)] text-sm font-medium text-[var(--accent-2)]">
                {t("guide.pdfExport.success")}
              </span>

              <button
                type="button"
                onClick={onReset}
                className="cursor-pointer font-[family-name:var(--font-inter)] text-sm text-[var(--text-secondary)] underline underline-offset-4 transition-colors hover:text-[var(--text)]"
              >
                {t("common.close")}
              </button>
            </div>
          ) : null}

          {exportStatus === "error" ? (
            <div
              role="alert"
              className="absolute left-4 right-4 top-full mt-2 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-lg sm:left-auto sm:right-6 sm:max-w-xl"
            >
              <div className="flex min-w-0 items-start gap-3">
                <CircleAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-secondary)]"
                  strokeWidth={1.8}
                />

                <span className="font-[family-name:var(--font-inter)] text-sm leading-6 text-[var(--text-secondary)]">
                  {t("guide.pdfExport.failed")}{" "}
                  {exportError
                    ? t(
                        getPdfExportErrorTranslationKey(
                          exportError.code,
                        ),
                      )
                    : t("guide.pdfExport.errors.unknown")}
                </span>
              </div>

              <button
                type="button"
                onClick={onRetry}
                className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-lg bg-[var(--accent)] px-4 font-[family-name:var(--font-inter)] text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {t("guide.pdfExport.retry")}
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
