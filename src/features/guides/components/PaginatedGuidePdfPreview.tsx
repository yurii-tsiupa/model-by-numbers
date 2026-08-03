"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

import { translate } from "@/features/i18n/lib/i18n";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";

import type { GuideSectionId, GuideViewModel } from "../lib/getGuideViewModel";
type PreviewPage = {
  pageNumber: number;
  sectionId?: GuideSectionId;
  isSectionStart: boolean;
};

function PdfPageCanvas({ page, scale }: { page: PDFPageProxy; scale: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas || scale <= 0) return;
    const cssViewport = page.getViewport({ scale });
    const outputScale = Math.max(1, window.devicePixelRatio || 1);
    const renderViewport = page.getViewport({ scale: scale * outputScale });
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    canvas.width = Math.ceil(renderViewport.width);
    canvas.height = Math.ceil(renderViewport.height);
    canvas.style.width = `${cssViewport.width}px`;
    canvas.style.height = `${cssViewport.height}px`;
    const renderTask = page.render({ canvas, canvasContext: context, viewport: renderViewport });
    void renderTask.promise.catch((error: unknown) => {
      if (!cancelled && !(error instanceof Error && error.name === "RenderingCancelledException")) {
        console.error("Failed to render guide preview page", error);
      }
    });

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [page, scale]);

  return <canvas ref={canvasRef} className="block" aria-hidden="true" />;
}

export function PaginatedGuidePdfPreview({
  viewModel,
  templateSettings,
}: {
  viewModel: GuideViewModel;
  templateSettings: GuideTemplateSettings;
}) {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [pdfPages, setPdfPages] = useState<PDFPageProxy[]>([]);
  const [pages, setPages] = useState<PreviewPage[]>([]);
  const [pageGeometry, setPageGeometry] = useState<{ width: number; height: number } | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const previewRef = useRef<HTMLDivElement>(null);
  const t = (key: Parameters<typeof translate>[1], values?: Parameters<typeof translate>[2]) => translate(viewModel.locale, key, values);

  useEffect(() => {
    let cancelled = false;
    let loadedDocument: PDFDocumentProxy | undefined;
    let destroyLoadingTask: (() => Promise<void>) | undefined;
    let objectUrl: string | undefined;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setStatus("loading");
      const [{ generateGuidePdf }, pdfjs] = await Promise.all([
        import("../pdf/generateGuidePdf"),
        import("pdfjs-dist"),
      ]);
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
      const blob = await generateGuidePdf(viewModel, templateSettings, undefined, undefined, "preview");
      if (cancelled) return;
      objectUrl = URL.createObjectURL(blob);
      const loadingTask = pdfjs.getDocument({ url: objectUrl });
      destroyLoadingTask = () => loadingTask.destroy();
      loadedDocument = await loadingTask.promise;
      const loadedPages = await Promise.all(Array.from({ length: loadedDocument.numPages }, (_, index) => loadedDocument!.getPage(index + 1)));
      const documentViewport = loadedPages[0].getViewport({ scale: 1 });

      const starts = (await Promise.all(viewModel.sections.map(async (section) => {
        const destination = await loadedDocument?.getDestination(section.id);
        if (!destination || !loadedDocument) return null;
        return { sectionId: section.id, pageIndex: await loadedDocument.getPageIndex(destination[0]) };
      }))).filter((start): start is { sectionId: GuideSectionId; pageIndex: number } => start !== null)
        .sort((a, b) => a.pageIndex - b.pageIndex);

      const nextPages = Array.from({ length: loadedDocument.numPages }, (_, pageIndex) => {
        const start = starts.filter((candidate) => candidate.pageIndex <= pageIndex).at(-1);
        return {
          pageNumber: pageIndex + 1,
          sectionId: start?.sectionId,
          isSectionStart: start?.pageIndex === pageIndex,
        };
      });

      if (cancelled) {
        await destroyLoadingTask?.();
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        return;
      }
      setDocument(loadedDocument);
      setPdfPages(loadedPages);
      setPages(nextPages);
      setPageGeometry({ width: documentViewport.width, height: documentViewport.height });
      setStatus("ready");
    })().catch((error: unknown) => {
      if (!cancelled) {
        console.error("Failed to generate paginated guide preview", error);
        setStatus("failed");
      }
    });

    return () => {
      cancelled = true;
      if (destroyLoadingTask) void destroyLoadingTask();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [templateSettings, viewModel]);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || !pageGeometry) return;
    const observer = new ResizeObserver((entries) => {
      const availableWidth = entries[0]?.contentRect.width ?? 0;
      if (availableWidth > 0) setPreviewScale(availableWidth / pageGeometry.width);
    });
    observer.observe(preview);
    return () => observer.disconnect();
  }, [pageGeometry]);

  if (status === "failed") {
    return <div role="alert" className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-sm text-[var(--text-secondary)]">{t("guide.error")}</div>;
  }

  if (status !== "ready" || !document || !pageGeometry || !pages.length || pdfPages.length !== pages.length) {
    return <div role="status" className="grid min-h-80 place-items-center text-sm text-[var(--text-secondary)]">{t("guide.generating")}</div>;
  }

  return (
    <div ref={previewRef} className="w-full space-y-6">
      {pages.map((page) => (
        <section
          key={page.pageNumber}
          id={page.isSectionStart ? page.sectionId : undefined}
          data-guide-section={page.sectionId}
          data-guide-page={page.pageNumber}
          data-pdf-page={page.pageNumber}
          tabIndex={page.isSectionStart ? -1 : undefined}
          className="guide-pdf-page mx-auto overflow-hidden bg-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] ring-1 ring-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          style={{ width: pageGeometry.width * previewScale, height: pageGeometry.height * previewScale }}
          aria-label={t("guide.page", { page: page.pageNumber })}
        >
          <PdfPageCanvas page={pdfPages[page.pageNumber - 1]} scale={previewScale} />
        </section>
      ))}
    </div>
  );
}
