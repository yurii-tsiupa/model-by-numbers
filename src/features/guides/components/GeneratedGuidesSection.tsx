"use client";

import {
  Download,
  ExternalLink,
  FileText,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import {
  formatCount,
  formatLocalizedDate,
} from "@/features/i18n/lib/i18n";

import { useDeleteGeneratedGuide } from "../hooks/useDeleteGeneratedGuide";
import { useGeneratedGuides } from "../hooks/useGeneratedGuides";
import { downloadGuidePdf } from "../lib/downloadGuidePdf";
import { getGuideViewModel } from "../lib/getGuideViewModel";
import { generateGuidePdf } from "../pdf/generateGuidePdf";
import type { GeneratedGuide } from "../types/GeneratedGuide";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useGuideTemplates } from "@/features/templates/hooks/useGuideTemplates";
import { resolveGuideTemplate } from "@/features/templates/lib/resolveGuideTemplate";

type GeneratedGuidesSectionProps = {
  projectId: string;
};

export function GeneratedGuidesSection({
  projectId,
}: GeneratedGuidesSectionProps) {
  const { t, locale } = useTranslation();
  const { user } = useAuth();
  const templates = useGuideTemplates(user?.uid);

  const query = useGeneratedGuides(projectId);
  const deletion = useDeleteGeneratedGuide(projectId);

  const [selected, setSelected] =
    useState<GeneratedGuide | null>(null);

  const [actionError, setActionError] =
    useState<string | null>(null);

  async function download(
    guide: GeneratedGuide,
  ) {
    setActionError(null);

    try {
      const template = resolveGuideTemplate(guide.snapshot.templateId, templates.data ?? []);
      const pdfBlob =
        guide.pdfBlob ??
        (await generateGuidePdf(
          getGuideViewModel(guide.snapshot),
          template.settings,
        ));

      downloadGuidePdf(
        pdfBlob,
        guide.fileName,
      );
    } catch {
      setActionError(
        t("history.downloadError"),
      );
    }
  }

  function handleDelete() {
    if (!selected) {
      return;
    }

    setActionError(null);

    deletion.mutate(selected.id, {
      onSuccess: () => {
        setSelected(null);
      },
      onError: () => {
        setActionError(
          t("history.unavailable"),
        );
      },
    });
  }

  return (
    <section className="mt-8 border-t border-[var(--border)] pt-7">
      <header className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <FileText
            className="h-4 w-4 text-[var(--accent)]"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0">
          <h3 className="font-[family-name:var(--font-space-grotesk)] text-base font-semibold tracking-[-0.02em] text-[var(--text)]">
            {t("history.title")}
          </h3>

          <p className="mt-1 max-w-xl text-xs leading-5 text-[var(--text-secondary)]">
            {t("history.local")}
          </p>
        </div>
      </header>

      {query.isError ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3"
        >
          <p className="text-xs leading-5 text-red-400">
            {t("history.unavailable")}
          </p>
        </div>
      ) : null}

      {actionError ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3"
        >
          <p className="text-xs leading-5 text-red-400">
            {actionError}
          </p>
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        {query.isLoading ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-5">
            <div className="h-3 w-24 animate-pulse rounded-full bg-[var(--border)]" />
            <div className="mt-3 h-3 w-40 animate-pulse rounded-full bg-[var(--border)]" />
          </div>
        ) : null}

        {query.data?.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-5 py-6 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)]">
              <FileText
                className="h-4 w-4 text-[var(--text-secondary)]"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>

            <p className="mt-4 text-sm font-medium text-[var(--text)]">
              {t("history.empty")}
            </p>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[var(--text-secondary)]">
              {t("history.emptyDescription")}
            </p>
          </div>
        ) : null}

        {query.data?.map((guide) => {
          const versionLabel = t(
            "history.version",
            {
              version: guide.version,
            },
          );

          const createdAt =
            guide.createdAt.getTime()
              ? formatLocalizedDate(
                  guide.createdAt,
                  locale,
                  {
                    dateStyle: "medium",
                    timeStyle: "short",
                  },
                )
              : t(
                  "history.dateUnavailable",
                );

          return (
            <article
              key={guide.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:bg-[var(--bg)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-[-0.015em] text-[var(--text)]">
                    {versionLabel}
                  </p>

                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {createdAt}
                  </p>
                </div>

                <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-400">
                  {t("history.ready")}
                </span>
              </div>

              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5">
                <p
                  className="truncate font-mono text-[10px] text-[var(--text-secondary)]"
                  title={guide.fileName}
                >
                  {guide.fileName}
                </p>

                <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                  {formatCount(
                    locale,
                    guide.snapshot.partsCount,
                    "part",
                  )}
                  <span className="mx-2 text-[var(--border)]">
                    ·
                  </span>
                  {formatCount(
                    locale,
                    guide.snapshot.colorsCount,
                    "color",
                  )}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  aria-label={`${t("common.open")} ${versionLabel}`}
                  href={`/models/${projectId}/guides/${guide.id}`}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--border)] px-4 text-xs font-medium text-[var(--text)] transition-colors hover:bg-[var(--bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <ExternalLink
                    className="h-3.5 w-3.5"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  {t("common.open")}
                </Link>

                <button
                  type="button"
                  aria-label={`${t("common.download")} ${versionLabel}`}
                  onClick={() =>
                    void download(guide)
                  }
                  className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <Download
                    className="h-3.5 w-3.5"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </button>

                <button
                  type="button"
                  aria-label={t(
                    "guide.deleteTitle",
                    {
                      version:
                        guide.version,
                    },
                  )}
                  onClick={() =>
                    setSelected(guide)
                  }
                  className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-red-500/20 text-red-400 transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <Trash2
                    className="h-3.5 w-3.5"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <ConfirmationModal
        isOpen={Boolean(selected)}
        title={t("guide.deleteTitle", {
          version:
            selected?.version ?? "",
        })}
        description={t(
          "guide.deleteDescription",
        )}
        confirmLabel={t("guide.delete")}
        variant="danger"
        isLoading={deletion.isPending}
        onClose={() => {
          if (!deletion.isPending) {
            setSelected(null);
          }
        }}
        onConfirm={handleDelete}
      />
    </section>
  );
}
