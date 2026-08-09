"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

import { translate } from "@/features/i18n/lib/i18n";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";

import type { GuideContentSectionId, GuidePdfSectionId, GuideSectionId } from "../config/guideSectionRegistry";
import { defaultGuideDesignTokens as tokens } from "../design/guideDesignTokens";
import { getGuidePreviewSectionSignature } from "../lib/getGuidePreviewSectionSignature";
import type { GuideViewModel } from "../lib/getGuideViewModel";
import { getGuidePageGeometry } from "../pdf/printPageConstants";
import { resolveGuidePdfPagePlan, type GuideResolvedPdfPage } from "../pdf/resolveGuidePdfPagePlan";

type PreviewPage = {
  pageNumber: number;
  sourceSectionId: GuideSectionId;
  sectionId: GuidePdfSectionId;
  sectionPageIndex: number;
  isSectionStart: boolean;
  pdfPage: PDFPageProxy;
};

type SectionPageGroup = {
  id: GuideSectionId;
  metadata: readonly GuideResolvedPdfPage[];
  signature: string;
};

type GuideSectionRenderCache = {
  sectionId: GuideSectionId;
  signature: string;
  pages: readonly PDFPageProxy[];
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
      renderTask.cancel();
    };
  }, [page, scale]);

  return <canvas ref={canvasRef} className="block" aria-hidden="true" />;
}

function resolveSectionGroups(
  viewModel: GuideViewModel,
  templateSettings: GuideTemplateSettings,
): { groups: SectionPageGroup[]; totalPages: number } {
  const pagePlan = resolveGuidePdfPagePlan(viewModel, templateSettings.pageFormat, { brandingEnabled: templateSettings.branding.enabled });
  const groups = viewModel.documentSections.flatMap((section) => {
    const metadata = pagePlan.pages.filter((page) => page.sourceSectionId === section.id || (section.id === "cover" && page.sectionId === "toc"));
    if (!metadata.length) return [];
    return [{
      id: section.id,
      metadata,
      signature: getGuidePreviewSectionSignature(section.id, viewModel, templateSettings),
    }];
  });
  return { groups, totalPages: pagePlan.totalPages };
}

export const PaginatedGuidePdfPreview = memo(function PaginatedGuidePdfPreview({
  onActiveSectionChange,
  pendingSectionIdRef,
  sectionPageMapRef,
  viewModel,
  templateSettings,
}: {
  onActiveSectionChange: (sectionId: GuideContentSectionId) => void;
  pendingSectionIdRef: { current: GuideContentSectionId | null };
  sectionPageMapRef: { current: Map<GuideContentSectionId, HTMLElement> };
  viewModel: GuideViewModel;
  templateSettings: GuideTemplateSettings;
}) {
  const [pages, setPages] = useState<PreviewPage[]>([]);
  const [pageGeometry, setPageGeometry] = useState<{ width: number; height: number } | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const previewRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef(new Map<GuideSectionId, GuideSectionRenderCache>());
  const documentsRef = useRef(new Set<PDFDocumentProxy>());
  const objectUrlsRef = useRef(new Set<string>());
  const hasRenderedRef = useRef(false);
  const t = (key: Parameters<typeof translate>[1], values?: Parameters<typeof translate>[2]) => translate(viewModel.locale, key, values);
  const pageLayout = getGuidePageGeometry(templateSettings.pageFormat);

  useEffect(() => () => {
    for (const document of documentsRef.current) document.cleanup();
    for (const objectUrl of objectUrlsRef.current) URL.revokeObjectURL(objectUrl);
    documentsRef.current.clear();
    objectUrlsRef.current.clear();
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      if (!hasRenderedRef.current) setStatus("loading");
      const [{ generateGuidePdf }, pdfjs] = await Promise.all([
        import("../pdf/generateGuidePdf"),
        import("pdfjs-dist"),
      ]);
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();

      const loadBlob = async (blob: Blob): Promise<{ document: PDFDocumentProxy; pages: PDFPageProxy[] }> => {
        const objectUrl = URL.createObjectURL(blob);
        objectUrlsRef.current.add(objectUrl);
        const loadingTask = pdfjs.getDocument({ url: objectUrl });
        const document = await loadingTask.promise;
        documentsRef.current.add(document);
        const loadedPages = await Promise.all(Array.from({ length: document.numPages }, (_, index) => document.getPage(index + 1)));
        return { document, pages: loadedPages };
      };

      const { groups, totalPages } = resolveSectionGroups(viewModel, templateSettings);
      if (!groups.length) throw new Error("The resolved Guide has no preview pages.");

      if (!cacheRef.current.size) {
        const blob = await generateGuidePdf(viewModel, templateSettings, undefined, undefined, "preview");
        const loaded = await loadBlob(blob);
        if (loaded.pages.length !== totalPages) throw new Error(`Resolved guide page count ${totalPages} does not match rendered PDF page count ${loaded.pages.length}.`);
        for (const group of groups) {
          cacheRef.current.set(group.id, {
            sectionId: group.id,
            signature: group.signature,
            pages: group.metadata.map((page) => loaded.pages[page.pageNumber - 1]),
          });
        }
      } else {
        for (const group of groups) {
          const cached = cacheRef.current.get(group.id);
          if (cached?.signature === group.signature && cached.pages.length === group.metadata.length) continue;
          const blob = await generateGuidePdf(
            viewModel,
            templateSettings,
            undefined,
            undefined,
            "preview",
            { sectionIds: [group.id], includeTableOfContents: group.id === "cover" },
          );
          const loaded = await loadBlob(blob);
          if (loaded.pages.length !== group.metadata.length) throw new Error(`Section ${group.id} resolved ${group.metadata.length} pages but rendered ${loaded.pages.length}.`);
          cacheRef.current.set(group.id, { sectionId: group.id, signature: group.signature, pages: loaded.pages });
        }
      }

      const nextPages = groups.flatMap((group) => {
        const cached = cacheRef.current.get(group.id);
        if (!cached) return [];
        return group.metadata.map((metadata, sectionPageIndex) => ({
          isSectionStart: sectionPageIndex === 0 && metadata.sectionId !== "toc",
          pageNumber: metadata.pageNumber,
          sourceSectionId: group.id,
          sectionId: metadata.sectionId,
          sectionPageIndex,
          pdfPage: cached.pages[sectionPageIndex],
        }));
      });
      if (nextPages.length !== totalPages) throw new Error(`Cached guide page count ${nextPages.length} does not match resolved page count ${totalPages}.`);
      const viewport = nextPages[0].pdfPage.getViewport({ scale: 1 });
      if (cancelled) return;
      setPages(nextPages);
      setPageGeometry({ width: viewport.width, height: viewport.height });
      setStatus("ready");
      hasRenderedRef.current = true;
    })().catch((error: unknown) => {
      if (!cancelled) {
        console.error("Failed to generate paginated guide preview", error);
        if (!hasRenderedRef.current) setStatus("failed");
      }
    });

    return () => {
      cancelled = true;
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

  useEffect(() => {
    const preview = previewRef.current;
    const sectionPageMap = sectionPageMapRef.current;
    sectionPageMap.clear();
    if (!preview || status !== "ready" || !pages.length) return;
    for (const page of preview.querySelectorAll<HTMLElement>("[data-guide-page][data-guide-section]")) {
      const sectionId = page.dataset.guideSection as GuidePdfSectionId | undefined;
      if (sectionId && sectionId !== "toc" && !sectionPageMap.has(sectionId)) sectionPageMap.set(sectionId, page);
    }

    let pendingScrollFrame: number | null = null;
    const pendingSectionId = pendingSectionIdRef.current;
    const pendingTarget = pendingSectionId ? sectionPageMap.get(pendingSectionId) : undefined;
    if (pendingTarget) {
      pendingSectionIdRef.current = null;
      pendingScrollFrame = window.requestAnimationFrame(() => pendingTarget.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
    return () => {
      if (pendingScrollFrame !== null) window.cancelAnimationFrame(pendingScrollFrame);
      sectionPageMap.clear();
    };
  }, [pages, pendingSectionIdRef, sectionPageMapRef, status]);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || !pages.length) return;
    const pageElements = Array.from(preview.querySelectorAll<HTMLElement>("[data-guide-page]"));
    if (!pageElements.length) return;
    let animationFrame: number | null = null;
    const updateActiveSection = () => {
      animationFrame = null;
      const activationY = Math.min(window.innerHeight * 0.35, 320);
      const activePage = pageElements.find((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.top <= activationY && bounds.bottom > activationY;
      }) ?? pageElements.find((element) => element.getBoundingClientRect().top > activationY) ?? pageElements.at(-1);
      const sectionId = activePage?.dataset.guideSection as GuidePdfSectionId | undefined;
      if (sectionId && sectionId !== "toc") onActiveSectionChange(sectionId);
    };
    const scheduleUpdate = () => {
      if (animationFrame === null) animationFrame = window.requestAnimationFrame(updateActiveSection);
    };
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    };
  }, [onActiveSectionChange, pages]);

  if (status === "failed") return <div role="alert" className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-sm text-[var(--text-secondary)]">{t("guide.error")}</div>;
  if (status !== "ready" || !pageGeometry || !pages.length) return <div role="status" className="grid min-h-80 place-items-center text-sm text-[var(--text-secondary)]">{t("guide.generating")}</div>;

  return (
    <div ref={previewRef} className="w-full space-y-6">
      {pages.map((page) => (
        <section
          key={`${page.sourceSectionId}:${page.sectionPageIndex}`}
          id={page.isSectionStart && page.sectionId !== "toc" ? page.sectionId : undefined}
          data-guide-section={page.sectionId}
          data-guide-page={page.pageNumber}
          data-pdf-page={page.pageNumber}
          tabIndex={page.isSectionStart ? -1 : undefined}
          className="guide-pdf-page relative mx-auto scroll-mt-24 overflow-hidden bg-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] ring-1 ring-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          style={{ width: pageGeometry.width * previewScale, height: pageGeometry.height * previewScale }}
          aria-label={t("guide.page", { page: page.pageNumber })}
        >
          <PdfPageCanvas page={page.pdfPage} scale={previewScale} />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute flex items-center justify-end font-[family-name:var(--font-mono)]"
            style={{
              bottom: 0,
              color: tokens.inkMuted,
              fontSize: 7 * previewScale,
              height: pageLayout.footerHeight * previewScale,
              lineHeight: 1,
              paddingRight: pageLayout.paddingRight * previewScale,
              right: 0,
              width: pageGeometry.width * previewScale,
            }}
          >
            {page.pageNumber} / {pages.length}
          </span>
        </section>
      ))}
    </div>
  );
});
