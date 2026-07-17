"use client";
import { useRef, useState } from "react";
import { useSaveGeneratedGuide } from "../hooks/useSaveGeneratedGuide";

import { createGuideFileName } from "../lib/createGuideFileName";
import { downloadGuidePdf } from "../lib/downloadGuidePdf";
import type { ModelGuide } from "../types/ModelGuide";
import { defaultGuideTemplate } from "../templates/registry/guideTemplates";
import { translate } from "@/features/i18n/lib/i18n";
import { GuidePreviewHeader } from "./GuidePreviewHeader";
import { GuidePaintingWorkflowPreview } from "./GuidePaintingWorkflowPreview";

type GuidePreviewProps = {
  guide: ModelGuide;
  savedFileName?: string;
  savedPdfBlob?: Blob | null;
  skipSave?: boolean;
  onDelete?: () => void;
};

type DownloadStatus = "idle" | "generating" | "error";

export function GuidePreview({ guide, savedFileName, savedPdfBlob, skipSave = false, onDelete }: GuidePreviewProps) {
  const locale=guide.locale??"en";
  const text=(key:Parameters<typeof translate>[1],values?:Parameters<typeof translate>[2])=>translate(locale,key,values);
  const [downloadStatus, setDownloadStatus] =
    useState<DownloadStatus>("idle");
  const isDownloadingRef = useRef(false);
  const savedGuideIdRef = useRef<string | null>(null);
  const saveGuide = useSaveGeneratedGuide();
  const [saveWarning, setSaveWarning] = useState<string | null>(null);

  const TemplatePreview=defaultGuideTemplate.Preview;

  async function handleDownloadPdf() {
    if (isDownloadingRef.current) {
      return;
    }

    isDownloadingRef.current = true;
    setDownloadStatus("generating");

    try {
      let blob = savedPdfBlob;
      if (!blob) {
        const { generateGuidePdf } = await import("../pdf/generateGuidePdf");
        blob = await generateGuidePdf(guide, () => {
          setSaveWarning(text("guide.pdfImageWarning"));
        });
      }
      const fileName = savedFileName ?? createGuideFileName(guide.title);
      if (!skipSave && !savedGuideIdRef.current) {
        try { const saved = await saveGuide.mutateAsync({ projectId: guide.projectId, snapshot: guide, pdfBlob: blob, fileName }); savedGuideIdRef.current = saved.id; }
        catch { setSaveWarning(text("guide.saveWarning")); }
      }
      downloadGuidePdf(blob, fileName);
      setDownloadStatus("idle");
    } catch (error) {
      console.error("Failed to generate guide PDF:", error);
      setDownloadStatus("error");
    } finally {
      isDownloadingRef.current = false;
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <GuidePreviewHeader
        projectId={guide.projectId}
        title={guide.title}
        downloadStatus={downloadStatus}
        onDownload={() => {
          void handleDownloadPdf();
        }}
        onDelete={onDelete}
        locale={locale}
      />

      {saveWarning ? <p role="alert" className="mx-auto max-w-7xl px-5 pt-5 text-sm text-amber-300 sm:px-6 lg:px-8">{saveWarning}</p> : null}

      <TemplatePreview guide={guide}/>
      {guide.paintingSummary ? (
        <div className="[&>div>section:nth-child(1)]:hidden [&>div>section:nth-child(2)]:hidden">
          <GuidePaintingWorkflowPreview guide={{...guide,parts:guide.workflowParts??guide.parts}} locale={locale}/>
        </div>
      ) : null}
    </main>
  );
}
