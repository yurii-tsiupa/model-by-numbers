"use client";
/* eslint-disable @next/next/no-img-element */

import { ImageIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useSaveGeneratedGuide } from "../hooks/useSaveGeneratedGuide";

import { createGuideFileName } from "../lib/createGuideFileName";
import { downloadGuidePdf } from "../lib/downloadGuidePdf";
import type { ModelGuide } from "../types/ModelGuide";
import type { GuideImages } from "../types/ModelGuide";
import { GuidePaletteSection } from "./GuidePaletteSection";
import { GuidePartsSection } from "./GuidePartsSection";
import { GuidePreviewHeader } from "./GuidePreviewHeader";
import { GuideProjectOverview } from "./GuideProjectOverview";

type GuidePreviewProps = {
  guide: ModelGuide;
  savedFileName?: string;
  savedPdfBlob?: Blob | null;
  skipSave?: boolean;
  onDelete?: () => void;
};

type DownloadStatus = "idle" | "generating" | "error";

const modelViews: Array<{
  key: keyof GuideImages;
  label: string;
  alt: string;
}> = [
  {
    key: "original",
    label: "Original Model",
    alt: "Original model view",
  },
  {
    key: "base",
    label: "Base Model",
    alt: "Base-coated model view",
  },
  {
    key: "painted",
    label: "Painted Model",
    alt: "Painted model view",
  },
  {
    key: "numbers",
    label: "Numbered Model",
    alt: "Numbered model painting view",
  },
];

export function GuidePreview({ guide, savedFileName, savedPdfBlob, skipSave = false, onDelete }: GuidePreviewProps) {
  const [downloadStatus, setDownloadStatus] =
    useState<DownloadStatus>("idle");
  const isDownloadingRef = useRef(false);
  const savedGuideIdRef = useRef<string | null>(null);
  const saveGuide = useSaveGeneratedGuide();
  const [saveWarning, setSaveWarning] = useState<string | null>(null);

  const hasMissingModelViews = modelViews.some(
    ({ key }) => !guide.images[key],
  );

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
        blob = await generateGuidePdf(guide);
      }
      const fileName = savedFileName ?? createGuideFileName(guide.title);
      if (!skipSave && !savedGuideIdRef.current) {
        try { const saved = await saveGuide.mutateAsync({ projectId: guide.projectId, snapshot: guide, pdfBlob: blob, fileName }); savedGuideIdRef.current = saved.id; }
        catch { setSaveWarning("We could not save this guide in your browser. The PDF can still be downloaded."); }
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
      />

      {saveWarning ? <p role="alert" className="mx-auto max-w-7xl px-5 pt-5 text-sm text-amber-300 sm:px-6 lg:px-8">{saveWarning}</p> : null}

      <div className="mx-auto max-w-7xl space-y-12 px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
        <GuideProjectOverview guide={guide} />

        <section>
          <h2 className="text-2xl font-semibold text-white">
            Model views
          </h2>
          {hasMissingModelViews ? (
            <p className="mt-2 text-sm text-amber-300/80">
              Some model views are missing. Return to the editor and
              generate the guide again for a complete PDF.
            </p>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {modelViews.map(({ key, label, alt }) => {
              const image = guide.images[key];

              return (
                <article
                  key={key}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900"
                >
                  {image ? (
                    <div className="flex aspect-[4/3] items-center justify-center bg-neutral-900">
                      {/* Data URLs are temporary client-side captures. */}
                      <img
                        src={image}
                        alt={alt}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div
                      aria-disabled="true"
                      className="flex aspect-[4/3] flex-col items-center justify-center border-b border-dashed border-white/10 bg-white/[0.015] text-neutral-600"
                    >
                      <ImageIcon className="h-6 w-6" />
                      <p className="mt-3 text-xs">Not captured</p>
                    </div>
                  )}
                  <h3 className="px-4 py-3 text-sm font-medium text-neutral-300">
                    {label}
                  </h3>
                </article>
              );
            })}
          </div>
        </section>

        {(guide.references?.length ?? 0) > 0 ? <section><h2 className="text-2xl font-semibold text-white">Reference Images</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{guide.references?.map(reference=><article key={reference.id} className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900"><div className="flex aspect-[4/3] items-center justify-center p-2"><img src={reference.dataUrl} alt={reference.name} className="max-h-full max-w-full object-contain"/></div><div className="border-t border-white/10 p-3"><p className="truncate text-sm text-white">{reference.name}</p><p className="mt-1 text-xs capitalize text-neutral-500">{reference.type}</p></div></article>)}</div></section>:null}

        <GuidePaletteSection palette={guide.palette} />
        <GuidePartsSection parts={guide.parts} />
      </div>
    </main>
  );
}
