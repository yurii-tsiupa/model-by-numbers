"use client";

import { CircleAlert } from "lucide-react";
import { useRef, useState } from "react";

import { translate } from "@/features/i18n/lib/i18n";

import { useGuidePdfExport } from "../hooks/useGuidePdfExport";
import { useResolvedGuideAssets } from "../hooks/useResolvedGuideAssets";
import { useGuideViewModel } from "../hooks/useGuideViewModel";
import { useSaveGeneratedGuide } from "../hooks/useSaveGeneratedGuide";
import { defaultGuideTemplate } from "../templates/registry/guideTemplates";
import type { ModelGuide } from "../types/ModelGuide";
import { GuideExportDocument } from "./GuideExportDocument";
import { GuideExportWarningDialog } from "./GuideExportWarningDialog";
import { GuideNavigation } from "./GuideNavigation";
import { GuidePaintingWorkflowSection } from "./GuidePreview/sections/GuidePaintingWorkflowSection";
import { GuidePreviewHeader } from "./GuidePreviewHeader";
import { GuideSectionAnchor } from "./GuideSectionAnchor";

type GuidePreviewProps = {
  guide: ModelGuide;
  savedFileName?: string;
  savedPdfBlob?: Blob | null;
  skipSave?: boolean;
  onDelete?: () => void;
};

export function GuidePreview({
  guide,
  savedFileName,
  savedPdfBlob,
  skipSave = false,
  onDelete,
}: GuidePreviewProps) {
  const resolvedGuide = useResolvedGuideAssets(guide);
  const viewModel = useGuideViewModel(resolvedGuide);

  const {
    locale,
    workflowGuide,
    hasPaintingWorkflow,
    sections,
  } = viewModel;

  const text = (
    key: Parameters<typeof translate>[1],
    values?: Parameters<typeof translate>[2],
  ) => translate(locale, key, values);

  const savedGuideIdRef = useRef<string | null>(null);

  const saveGuide = useSaveGeneratedGuide();

  const [saveWarning, setSaveWarning] = useState<string | null>(
    null,
  );

  const pdfExport = useGuidePdfExport({
    viewModel,
    existingBlob: savedPdfBlob,
    fileName: savedFileName,
    onImageWarning: () => {
      setSaveWarning(text("guide.pdfExport.imageWarning"));
    },
    beforeDownload: async ({ blob, fileName }) => {
      if (skipSave || savedGuideIdRef.current) {
        return;
      }

      try {
        const saved = await saveGuide.mutateAsync({
          projectId: guide.projectId,
          snapshot: guide,
          pdfBlob: blob,
          fileName,
        });

        savedGuideIdRef.current = saved.id;
      } catch {
        setSaveWarning(text("guide.saveWarning"));
      }
    },
  });

  const TemplatePreview = defaultGuideTemplate.Preview;

  function handleDownload() {
    void pdfExport.exportPdf();
  }

  function handleRetry() {
    void pdfExport.retryExport();
  }

  function handleConfirmExport() {
    void pdfExport.confirmExport();
  }

  function handleReviewWarnings() {
    pdfExport.resetExport();

    document
      .querySelector(".guide-document")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <GuidePreviewHeader
        projectId={resolvedGuide.projectId}
        title={resolvedGuide.title}
        exportStatus={pdfExport.status}
        exportProgress={pdfExport.progress}
        exportError={pdfExport.error}
        onDownload={handleDownload}
        onRetry={handleRetry}
        onReset={pdfExport.resetExport}
        onDelete={onDelete}
        locale={locale}
      />

      {pdfExport.isExporting ? (
        <GuideExportDocument viewModel={viewModel} />
      ) : null}

      {pdfExport.status === "awaitingConfirmation" ? (
        <GuideExportWarningDialog
          locale={locale}
          warnings={pdfExport.warnings}
          onConfirm={handleConfirmExport}
          onReview={handleReviewWarnings}
        />
      ) : null}

      {saveWarning ? (
        <div className="mx-auto max-w-[82rem] px-5 pt-5 sm:px-6 lg:px-8">
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)]">
              <CircleAlert
                className="h-4 w-4 text-[var(--text-secondary)]"
                aria-hidden="true"
              />
            </div>

            <p className="pt-1 text-sm leading-6 text-[var(--text-secondary)]">
              {saveWarning}
            </p>
          </div>
        </div>
      ) : null}

      <div className="guide-layout mx-auto grid max-w-[82rem] items-start lg:grid-cols-[15rem_minmax(0,56rem)] lg:justify-center lg:gap-8 lg:px-6 lg:py-8">
        <GuideNavigation
          sections={sections}
          locale={locale}
        />

        <article
          data-guide-render-mode="preview"
          className="
            guide-document
            min-w-0
            overflow-hidden
            bg-white
            text-[#181221]
            sm:mx-5
            sm:my-6
            sm:rounded-2xl
            sm:border
            sm:border-[#E3DEEC]
            lg:m-0
          "
        >
          <TemplatePreview guide={resolvedGuide} />

          {hasPaintingWorkflow ? (
            <GuideSectionAnchor id="painting-workflow">
              <GuidePaintingWorkflowSection
                guide={workflowGuide}
                locale={locale}
              />
            </GuideSectionAnchor>
          ) : null}
        </article>
      </div>
    </main>
  );
}
