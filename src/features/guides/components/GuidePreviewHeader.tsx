import {
  ArrowLeft,
  CircleAlert,
  Download,
  Layers3,
  LoaderCircle,
} from "lucide-react";
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
      <div data-guide-controls className="print:hidden"><AppHeader variant="guide" showNavigation={false}/></div>

      <section
        data-guide-controls
        className="border-b border-[var(--border)] bg-[var(--bg)] print:hidden"
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="flex flex-col gap-1"
                >
                  <span className="h-1 w-7 rounded-full bg-[var(--accent)]" />
                  <span className="h-1 w-5 rounded-full bg-[var(--accent)] opacity-60" />
                  <span className="h-1 w-3 rounded-full bg-[var(--accent)] opacity-30" />
                </div>

                <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs font-medium uppercase tracking-[0.16em] text-[var(--accent)]">
                  {t("guide.preview")}
                </p>
              </div>

              <div className="flex min-w-0 items-start gap-4">
                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] sm:flex">
                  <Layers3
                    className="h-5 w-5 text-[var(--accent)]"
                    strokeWidth={1.8}
                  />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-[-0.035em] text-[var(--text)] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]">
                    {title}
                  </h1>

                  <p className="mt-4 max-w-xl font-[family-name:var(--font-inter)] text-sm leading-6 text-[var(--text-secondary)] sm:text-base sm:leading-7">
                    {t("guide.preview")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap lg:justify-end">
              <Link
                href={`/models/${projectId}`}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-3 font-[family-name:var(--font-inter)] text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] sm:w-auto"
              >
                <ArrowLeft
                  className="h-4 w-4"
                  strokeWidth={2}
                />
                {t("guide.backEditor")}
              </Link>

              <button
                type="button"
                disabled={isExporting}
                onClick={onDownload}
                className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 font-[family-name:var(--font-inter)] text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
                  className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] bg-transparent px-5 py-3 font-[family-name:var(--font-inter)] text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--card)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {t("guide.delete")}
                </button>
              ) : null}
            </div>
          </div>

          {isExporting && statusKey ? (
            <div
              role="status"
              className="mt-8 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]"
            >
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="font-[family-name:var(--font-inter)] text-sm text-[var(--text-secondary)]">
                  {t(statusKey)}
                </span>

                <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs font-medium text-[var(--accent)]">
                  {progress}%
                </span>
              </div>

              <div className="h-1 bg-[var(--border)]">
                <div
                  className="h-full bg-[var(--accent)] transition-[width] duration-300"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          {exportStatus === "success" ? (
            <div
              role="status"
              className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3"
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
              className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3"
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
