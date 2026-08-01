"use client";

import { ChevronDown, CircleAlert, FileText, Minus, Plus, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { translate } from "@/features/i18n/lib/i18n";

import { useGuidePdfExport } from "../hooks/useGuidePdfExport";
import { useResolvedGuideAssets } from "../hooks/useResolvedGuideAssets";
import type { Project } from "@/features/models/types/Project";
import { useGuideViewModel } from "../hooks/useGuideViewModel";
import { useSaveGeneratedGuide } from "../hooks/useSaveGeneratedGuide";
import { defaultGuideTemplate } from "../templates/registry/guideTemplates";
import type { GuideOverviewView, GuideReferenceImage, ModelGuide } from "../types/ModelGuide";
import { GuideExportDocument } from "./GuideExportDocument";
import { GuideExportWarningDialog } from "./GuideExportWarningDialog";
import { GuideNavigation } from "./GuideNavigation";
import { GuideReferencesManager } from "./GuideReferencesManager";
import { GuideModelOverviewManager } from "./GuideModelOverviewManager";
import { GuidePaintingWorkflowSection } from "./GuidePreview/sections/GuidePaintingWorkflowSection";
import { GuidePreviewHeader } from "./GuidePreviewHeader";
import { GuideSectionAnchor } from "./GuideSectionAnchor";
import { GuideTemplateSection } from "./GuideTemplateSection";
import type { GuideLibraryTemplate, UserGuideTemplate } from "@/features/templates/types/GuideLibraryTemplate";

type GuidePreviewProps = {
  previewProject?: Project;
  guide: ModelGuide;
  savedFileName?: string;
  savedPdfBlob?: Blob | null;
  skipSave?: boolean;
  onDelete?: () => void;
  template: GuideLibraryTemplate;
  userTemplates?: readonly UserGuideTemplate[];
  isSelectingTemplate?: boolean;
  onSelectTemplate?: (id: string) => Promise<void>;
  onReferencesChange?: (references: GuideReferenceImage[]) => void;
  onOverviewViewsChange?: (views: GuideOverviewView[]) => void;
  onCaptureOverview?: (viewId:string|null,type:GuideOverviewView["type"])=>void;
};

export function GuidePreview({
  previewProject,
  guide,
  savedFileName,
  savedPdfBlob,
  skipSave = false,
  onDelete,
  template,
  userTemplates = [],
  isSelectingTemplate = false,
  onSelectTemplate,
  onReferencesChange,
  onOverviewViewsChange,
  onCaptureOverview,
}: GuidePreviewProps) {
  const resolvedGuide = useResolvedGuideAssets(guide, previewProject);
  const viewModel = useGuideViewModel(resolvedGuide);

  const {
    locale,
    workflowGuide,
    sections,
  } = viewModel;

  const text = (
    key: Parameters<typeof translate>[1],
    values?: Parameters<typeof translate>[2],
  ) => translate(locale, key, values);
  const overviewDraftViews:GuideOverviewView[]=guide.overviewViews??viewModel.modelViews.map((view,index)=>({id:view.id,type:index===0?"clean":viewModel.targetMode==="markers"?"marker-map":viewModel.targetMode==="region"?"painted-regions":"colored-parts",image:view.image,order:index}));
  const hasGuideTools = Boolean(onSelectTemplate || (onOverviewViewsChange && onCaptureOverview) || onReferencesChange);

  const savedGuideIdRef = useRef<string | null>(null);

  const saveGuide = useSaveGeneratedGuide();

  const [saveWarning, setSaveWarning] = useState<string | null>(
    null,
  );
  const previewRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [previewZoom, setPreviewZoom] = useState(100);
  const previewPageSignature = sections.map((section) => section.id).join("|");

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    const pages = Array.from(preview.querySelectorAll<HTMLElement>(".guide-cover, .guide-chapter"));
    if (!pages.length) return;
    setPageCount(pages.length);
    const visibility = new Map<Element, number>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visibility.set(entry.target, entry.intersectionRatio));
      let nextIndex = 0;
      let bestRatio = -1;
      pages.forEach((page, index) => {
        const ratio = visibility.get(page) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          nextIndex = index;
        }
      });
      if (bestRatio > 0) setCurrentPage(nextIndex + 1);
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    pages.forEach((page) => observer.observe(page));
    return () => observer.disconnect();
  }, [previewPageSignature]);

  const pdfExport = useGuidePdfExport({
    viewModel,
    templateSettings: template.settings,
    existingBlob: savedPdfBlob,
    fileName: savedFileName,
    onImageWarning: (warning) => {
      setSaveWarning(warning.code === "LOW_RESOLUTION_IMAGE" ? text("guide.pdfExport.warnings.lowResolutionImage", { count: warning.count }) : text("guide.pdfExport.imageWarning"));
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
    <main className="min-h-0 flex-1 bg-[var(--bg)] text-[var(--text)]">
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
        <GuideExportDocument viewModel={viewModel} templateSettings={template.settings} />
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

      <div className={`guide-layout mx-auto grid w-full max-w-[100rem] min-w-0 items-start gap-5 px-4 py-5 sm:px-6 lg:px-8 2xl:justify-center 2xl:gap-6 ${hasGuideTools ? "2xl:grid-cols-[17.5rem_minmax(38.75rem,50rem)_25rem]" : "2xl:grid-cols-[17.5rem_minmax(38.75rem,50rem)]"}`}>
        <GuideNavigation
          sections={sections}
          locale={locale}
        />

        <div className="min-w-0 2xl:col-start-2 2xl:row-start-1">
        {hasGuideTools ? <details data-guide-controls className="group mb-5 border-y border-[var(--border)] bg-[var(--card)] 2xl:hidden">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-3 text-sm font-semibold text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
            <SlidersHorizontal className="size-4 text-[var(--accent)]" aria-hidden="true" />
            {text("guide.tools")}
            <ChevronDown className="ml-auto size-4 text-[var(--text-secondary)] transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="space-y-4 border-t border-[var(--border)] p-3">
            <div className="guide-side-panel rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
              {onSelectTemplate ? <GuideTemplateSection current={template} userTemplates={userTemplates} isSelecting={isSelectingTemplate} onSelect={onSelectTemplate}/> : null}
              {onOverviewViewsChange&&onCaptureOverview?<GuideModelOverviewManager locale={locale} targetMode={viewModel.targetMode} views={overviewDraftViews} editorHref={`/models/${guide.projectId}`} onChange={onOverviewViewsChange} onCapture={(viewId,type)=>{if(!guide.overviewViews)onOverviewViewsChange(overviewDraftViews);onCaptureOverview(viewId,type)}}/>:null}
            </div>
            {onReferencesChange ? <GuideReferencesManager projectId={guide.projectId} locale={locale} references={guide.references ?? []} onChange={onReferencesChange} /> : null}
          </div>
        </details> : null}
        <section data-guide-controls className="mb-3 flex min-h-10 flex-wrap items-center justify-between gap-3 px-1 print:hidden" aria-label={text("guide.preview.pdfTitle")}>
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
            <FileText className="size-4" aria-hidden="true" />
            <h2>{text("guide.preview.pdfTitle")}</h2>
          </div>
          <div className="flex items-center gap-2">
            <p aria-live="polite" className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)]">{text("guide.preview.pageCount", { current: currentPage, total: pageCount })}</p>
            <div className="flex h-8 items-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]">
              <button type="button" disabled={previewZoom <= 70} onClick={() => setPreviewZoom((zoom) => Math.max(70, zoom - 10))} aria-label={text("guide.preview.zoomOut")} className="grid h-full w-8 cursor-pointer place-items-center text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"><Minus className="size-3.5" aria-hidden="true" /></button>
              <output className="grid h-full min-w-12 place-items-center border-x border-[var(--border)] px-1 text-[11px] font-medium text-[var(--text)]">{previewZoom}%</output>
              <button type="button" disabled={previewZoom >= 140} onClick={() => setPreviewZoom((zoom) => Math.min(140, zoom + 10))} aria-label={text("guide.preview.zoomIn")} className="grid h-full w-8 cursor-pointer place-items-center text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"><Plus className="size-3.5" aria-hidden="true" /></button>
            </div>
          </div>
        </section>
        <div ref={previewRef} className="guide-preview-surface min-w-0 overflow-x-auto rounded-xl bg-[var(--surface)] p-4 sm:p-6 print:overflow-visible print:bg-transparent print:p-0">
          <div className="mx-auto w-full max-w-[52rem]" style={{ zoom: `${previewZoom}%` }}>
            <article
              data-guide-render-mode="preview"
              className="guide-document min-w-0 w-full"
              style={{ color: template.settings.textColor }}
            >
              <TemplatePreview guide={resolvedGuide} templateSettings={template.settings} />

          {sections.some((section) => section.id === "painting-workflow") ? (
            <GuideSectionAnchor id="painting-workflow">
              <GuidePaintingWorkflowSection
                guide={workflowGuide}
                locale={locale}
                steps={viewModel.paintingSteps}
              />
            </GuideSectionAnchor>
          ) : null}
            </article>
          </div>
        </div>
        </div>

        {hasGuideTools ? <aside data-guide-controls aria-label={text("guide.tools")} className="sticky top-20 col-start-3 row-start-1 hidden max-h-[calc(100vh-6rem)] min-w-0 space-y-4 overflow-x-hidden overflow-y-auto text-[var(--text)] 2xl:block">
          <div className="guide-side-panel rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="mb-[18px] flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-lg bg-[var(--accent-soft)]"><SlidersHorizontal className="size-3.5 text-[var(--accent)]" aria-hidden="true" /></span>
              <h2 className="text-sm font-semibold">{text("guide.tools")}</h2>
            </div>
            {onSelectTemplate ? <GuideTemplateSection current={template} userTemplates={userTemplates} isSelecting={isSelectingTemplate} onSelect={onSelectTemplate}/> : null}
            {onOverviewViewsChange&&onCaptureOverview?<GuideModelOverviewManager locale={locale} targetMode={viewModel.targetMode} views={overviewDraftViews} editorHref={`/models/${guide.projectId}`} onChange={onOverviewViewsChange} onCapture={(viewId,type)=>{if(!guide.overviewViews)onOverviewViewsChange(overviewDraftViews);onCaptureOverview(viewId,type)}}/>:null}
          </div>
          {onReferencesChange ? <GuideReferencesManager projectId={guide.projectId} locale={locale} references={guide.references ?? []} onChange={onReferencesChange} /> : null}
        </aside> : null}
      </div>
    </main>
  );
}
