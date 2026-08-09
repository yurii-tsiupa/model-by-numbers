"use client";

import { ChevronDown, CircleAlert, FileText, SlidersHorizontal } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

import { translate } from "@/features/i18n/lib/i18n";

import { useGuidePdfExport } from "../hooks/useGuidePdfExport";
import { useResolvedGuideAssets } from "../hooks/useResolvedGuideAssets";
import type { Project } from "@/features/models/types/Project";
import { useGuideViewModel } from "../hooks/useGuideViewModel";
import { useSaveGeneratedGuide } from "../hooks/useSaveGeneratedGuide";
import type { GuideOverviewView, GuideReferenceImage, ModelGuide } from "../types/ModelGuide";
import { GuideExportDocument } from "./GuideExportDocument";
import { GuideExportWarningDialog } from "./GuideExportWarningDialog";
import { GuideNavigation } from "./GuideNavigation";
import { GuideReferencesManager } from "./GuideReferencesManager";
import { GuideModelOverviewManager } from "./GuideModelOverviewManager";
import { GuidePreviewHeader } from "./GuidePreviewHeader";
import { PaginatedGuidePdfPreview } from "./PaginatedGuidePdfPreview";
import { GuideTemplateSection } from "./GuideTemplateSection";
import type { GuideLibraryTemplate, GuideTemplateSettings, UserGuideTemplate } from "@/features/templates/types/GuideLibraryTemplate";
import { GUIDE_SECTION_REGISTRY, type GuideContentSectionId } from "../config/guideSectionRegistry";
import type { GuideSectionSettings } from "../types/GuideSectionSettings";
import { GuideSectionManager } from "./GuideSectionManager";
import { GuidePdfDesignPanel } from "./GuidePdfDesignPanel";
import { GuideSidebarPanelSwitcher, type GuideSidebarPanel } from "./GuideSidebarPanelSwitcher";
import { normalizeGuideAccentColor } from "../design/guideDesignTokens";
import type { GuideFontId } from "../design/guideFontRegistry";
import { imageSourceToBlob, saveGuideAsset } from "../services/assets/saveGuideAsset";
import { deleteGuideAssetByStorageKey } from "../services/assets/deleteGuideAsset";
import { serializeGuideTemplateSettings } from "@/features/templates/lib/serializeGuideTemplateSettings";

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
  onTemplateSettingsChange?: (settings: Partial<GuideTemplateSettings>) => Promise<void>;
  isUpdatingTemplateSettings?: boolean;
  onReferencesChange?: (references: GuideReferenceImage[]) => void;
  onOverviewViewsChange?: (views: GuideOverviewView[]) => void;
  onCaptureOverview?: (viewId:string|null,type:GuideOverviewView["type"])=>void;
  onSectionSettingsChange?: (settings: GuideSectionSettings) => Promise<void>;
  isUpdatingSectionSettings?: boolean;
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
  onTemplateSettingsChange,
  isUpdatingTemplateSettings = false,
  onReferencesChange,
  onOverviewViewsChange,
  onCaptureOverview,
  onSectionSettingsChange,
  isUpdatingSectionSettings = false,
}: GuidePreviewProps) {
  const resolvedGuide = useResolvedGuideAssets(guide, previewProject);
  const viewModel = useGuideViewModel(resolvedGuide, template.settings.pageFormat);

  const {
    locale,
    sections,
  } = viewModel;
  const [observedActiveSectionId, setObservedActiveSectionId] = useState<GuideContentSectionId>();
  const [activeSidebarPanel, setActiveSidebarPanel] = useState<GuideSidebarPanel>("tools");
  const observedSectionOrder = GUIDE_SECTION_REGISTRY.findIndex((section) => section.contentSectionId === observedActiveSectionId);
  const nearestSectionId = sections.reduce<{ distance: number; id?: GuideContentSectionId }>((nearest, section) => {
    const sectionOrder = GUIDE_SECTION_REGISTRY.findIndex((definition) => definition.contentSectionId === section.id);
    const distance = Math.abs(sectionOrder - observedSectionOrder);
    return distance < nearest.distance ? { distance, id: section.id } : nearest;
  }, { distance: Number.POSITIVE_INFINITY }).id;
  const activeSectionId = sections.some((section) => section.id === observedActiveSectionId)
    ? observedActiveSectionId
    : nearestSectionId;
  const handleActiveSectionChange = useCallback((sectionId: GuideContentSectionId) => {
    setObservedActiveSectionId(sectionId);
  }, []);
  const sectionPageMapRef = useRef(new Map<GuideContentSectionId, HTMLElement>());
  const pendingSectionIdRef = useRef<GuideContentSectionId | null>(null);
  const templateSettings = useMemo(() => ({
    accentColor: template.settings.accentColor,
    backgroundItems: template.settings.backgroundItems,
    branding: template.settings.branding,
    bodyFont: template.settings.bodyFont,
    coverStyle: template.settings.coverStyle,
    dividerStyle: template.settings.dividerStyle,
    headingFont: template.settings.headingFont,
    monoFont: template.settings.monoFont,
    pageBackground: template.settings.pageBackground,
    pageFormat: template.settings.pageFormat,
    pageNumberPosition: template.settings.pageNumberPosition,
    pageNumberStyle: template.settings.pageNumberStyle,
    spacing: template.settings.spacing,
    textColor: template.settings.textColor,
  }), [
    template.settings.accentColor,
    template.settings.backgroundItems,
    template.settings.branding,
    template.settings.bodyFont,
    template.settings.coverStyle,
    template.settings.dividerStyle,
    template.settings.headingFont,
    template.settings.pageBackground,
    template.settings.pageFormat,
    template.settings.monoFont,
    template.settings.pageNumberPosition,
    template.settings.pageNumberStyle,
    template.settings.spacing,
    template.settings.textColor,
  ]);

  const text = (
    key: Parameters<typeof translate>[1],
    values?: Parameters<typeof translate>[2],
  ) => translate(locale, key, values);
  const overviewDraftViews:GuideOverviewView[]=guide.overviewViews??viewModel.modelViews.map((view,index)=>({id:view.id,type:index===0?"clean":viewModel.targetMode==="markers"?"marker-map":viewModel.targetMode==="region"?"painted-regions":"colored-parts",image:view.image,order:index}));
  const hasGuideTools = Boolean(onSelectTemplate || onTemplateSettingsChange || onSectionSettingsChange || (onOverviewViewsChange && onCaptureOverview) || onReferencesChange);

  const savedGuideIdRef = useRef<string | null>(null);

  const saveGuide = useSaveGeneratedGuide();

  const [saveWarning, setSaveWarning] = useState<string | null>(
    null,
  );

  const pdfExport = useGuidePdfExport({
    viewModel,
    templateSettings,
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
          templateSettings: serializeGuideTemplateSettings(templateSettings) as GuideTemplateSettings,
          pdfBlob: blob,
          fileName,
        });

        savedGuideIdRef.current = saved.id;
      } catch {
        setSaveWarning(text("guide.saveWarning"));
      }
    },
  });

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

  function handlePageFormatChange(pageFormat: GuideTemplateSettings["pageFormat"]) {
    if (!onTemplateSettingsChange || pageFormat === template.settings.pageFormat) return;
    void onTemplateSettingsChange({ pageFormat }).catch(() => setSaveWarning(text("guide.pdfDesign.saveFailed")));
  }

  function handleAccentColorChange(value: string) {
    const accentColor = normalizeGuideAccentColor(value);
    if (!onTemplateSettingsChange || !accentColor || accentColor === template.settings.accentColor) return;
    void onTemplateSettingsChange({ accentColor }).catch(() => setSaveWarning(text("guide.pdfDesign.saveFailed")));
  }

  function handleDisplayFontChange(fontId: GuideFontId) {
    if (!onTemplateSettingsChange || fontId === template.settings.headingFont) return;
    void onTemplateSettingsChange({ headingFont: fontId }).catch(() => setSaveWarning(text("guide.pdfDesign.saveFailed")));
  }

  function handleBodyFontChange(fontId: GuideFontId) {
    if (!onTemplateSettingsChange || fontId === template.settings.bodyFont) return;
    void onTemplateSettingsChange({ bodyFont: fontId }).catch(() => setSaveWarning(text("guide.pdfDesign.saveFailed")));
  }

  function handleMonoFontChange(fontId: GuideFontId) {
    if (!onTemplateSettingsChange || fontId === template.settings.monoFont) return;
    void onTemplateSettingsChange({ monoFont: fontId }).catch(() => setSaveWarning(text("guide.pdfDesign.saveFailed")));
  }

  async function handleBrandingChange(branding: GuideTemplateSettings["branding"]) {
    if (!onTemplateSettingsChange) return;
    try {
      const previousAssetId = template.settings.branding.logoAssetId;
      let nextBranding = branding;
      if (branding.logoUrl && branding.logoUrl !== template.settings.branding.logoUrl) {
        const reference = await saveGuideAsset({ projectId: guide.projectId, kind: "branding-logo", assetId: crypto.randomUUID(), blob: await imageSourceToBlob(branding.logoUrl) });
        nextBranding = { ...branding, logoAssetId: reference.storageKey };
      } else if (!branding.logoUrl && branding.logoAssetId) nextBranding = { ...branding, logoAssetId: null };
      await onTemplateSettingsChange({ branding: nextBranding });
      if (previousAssetId && previousAssetId !== nextBranding.logoAssetId) await deleteGuideAssetByStorageKey(previousAssetId).catch(() => undefined);
    } catch { setSaveWarning(text("guide.pdfDesign.saveFailed")); }
  }

  async function handleBackgroundItemsChange(backgroundItems: GuideTemplateSettings["backgroundItems"]) {
    if (!onTemplateSettingsChange) return;
    try {
      const nextItems = await Promise.all(backgroundItems.map(async (item) => {
        const current = template.settings.backgroundItems.find((candidate) => candidate.id === item.id);
        if (!item.imageUrl || item.localAssetId && item.localAssetId !== current?.localAssetId || item.imageUrl === current?.imageUrl && item.localAssetId) return item;
        const reference = await saveGuideAsset({ projectId: guide.projectId, kind: "pdf-background", assetId: crypto.randomUUID(), blob: await imageSourceToBlob(item.imageUrl) });
        return { ...item, localAssetId: reference.storageKey };
      }));
      await onTemplateSettingsChange({ backgroundItems: nextItems });
      const remainingItemIds = new Set(backgroundItems.map((item) => item.id));
      await Promise.all(template.settings.backgroundItems.flatMap((item) => item.sourceType === "guide" && item.localAssetId && !remainingItemIds.has(item.id) ? [deleteGuideAssetByStorageKey(item.localAssetId).catch(() => undefined)] : []));
    } catch { setSaveWarning(text("guide.pdfDesign.saveFailed")); }
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
        <GuideExportDocument viewModel={viewModel} templateSettings={templateSettings} />
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
          activeSectionId={activeSectionId}
          sections={sections}
          locale={locale}
          pendingSectionIdRef={pendingSectionIdRef}
          sectionPageMapRef={sectionPageMapRef}
        />

        <div className="min-w-0 2xl:col-start-2 2xl:row-start-1">
        {hasGuideTools ? <details data-guide-controls className="group mb-5 border-y border-[var(--border)] bg-[var(--card)] 2xl:hidden">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-3 text-sm font-semibold text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
            <SlidersHorizontal className="size-4 text-[var(--accent)]" aria-hidden="true" />
            {text(activeSidebarPanel === "tools" ? "guide.tools" : "guide.pdfDesign.title")}
            <ChevronDown className="ml-auto size-4 text-[var(--text-secondary)] transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="space-y-4 border-t border-[var(--border)] p-3">
            {onTemplateSettingsChange ? <GuideSidebarPanelSwitcher activePanel={activeSidebarPanel} onChange={setActiveSidebarPanel} t={text} /> : null}
            <div key={activeSidebarPanel} className="space-y-4 transition-[opacity,transform] duration-200 ease-out starting:translate-x-1 starting:opacity-0 motion-reduce:transition-none">
              {activeSidebarPanel === "tools" ? <>
                <div className="guide-side-panel rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                  {onSelectTemplate ? <GuideTemplateSection current={template} userTemplates={userTemplates} isSelecting={isSelectingTemplate} onSelect={onSelectTemplate}/> : null}
                  {onSectionSettingsChange ? <GuideSectionManager controls={viewModel.sectionControls} disabled={isUpdatingSectionSettings} settings={viewModel.sectionSettings} t={text} onChange={(settings) => { void onSectionSettingsChange(settings).catch(() => setSaveWarning(text("guide.sections.saveFailed"))); }} /> : null}
                  {onOverviewViewsChange&&onCaptureOverview?<GuideModelOverviewManager locale={locale} targetMode={viewModel.targetMode} views={overviewDraftViews} editorHref={`/models/${guide.projectId}`} onChange={onOverviewViewsChange} onCapture={(viewId,type)=>{if(!guide.overviewViews)onOverviewViewsChange(overviewDraftViews);onCaptureOverview(viewId,type)}}/>:null}
                </div>
                {onReferencesChange ? <GuideReferencesManager projectId={guide.projectId} locale={locale} references={guide.references ?? []} onChange={onReferencesChange} /> : null}
              </> : onTemplateSettingsChange ? <GuidePdfDesignPanel accentColor={template.settings.accentColor} backgroundItems={template.settings.backgroundItems} backCoverLayout={template.settings.branding.backCoverLayout} brandName={template.settings.branding.name} bodyFontId={template.settings.bodyFont} ctaText={template.settings.branding.ctaText} coverLayout={template.settings.branding.coverLayout} customLinks={template.settings.branding.customLinks} disabled={isUpdatingTemplateSettings} displayFontId={template.settings.headingFont} logoUrl={template.settings.branding.logoUrl} monoFontId={template.settings.monoFont} pageFormat={template.settings.pageFormat} qrValue={template.settings.branding.qrValue} socialLinks={template.settings.branding.socialLinks} onAccentColorChange={handleAccentColorChange} onBackgroundItemsChange={handleBackgroundItemsChange} onBackCoverLayoutChange={(backCoverLayout) => handleBrandingChange({ ...template.settings.branding, backCoverLayout })} onBodyFontChange={handleBodyFontChange} onBrandNameChange={(name) => handleBrandingChange({ ...template.settings.branding, name })} onCtaTextChange={(ctaText) => handleBrandingChange({ ...template.settings.branding, ctaText })} onCoverLayoutChange={(coverLayout) => handleBrandingChange({ ...template.settings.branding, coverLayout })} onCustomLinksChange={(customLinks) => handleBrandingChange({ ...template.settings.branding, customLinks })} onDisplayFontChange={handleDisplayFontChange} onLogoChange={(logoUrl) => handleBrandingChange({ ...template.settings.branding, logoUrl })} onMonoFontChange={handleMonoFontChange} onPageFormatChange={handlePageFormatChange} onQrValueChange={(qrValue) => handleBrandingChange({ ...template.settings.branding, qrValue })} onSocialLinksChange={(socialLinks) => handleBrandingChange({ ...template.settings.branding, socialLinks })} t={text} /> : null}
            </div>
          </div>
        </details> : null}
        <section data-guide-controls className="mb-3 flex min-h-10 items-center px-1 print:hidden" aria-label={text("guide.preview.pdfTitle")}>
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
            <FileText className="size-4" aria-hidden="true" />
            <h2>{text("guide.preview.pdfTitle")}</h2>
          </div>
        </section>
        <div className="guide-preview-surface min-w-0 overflow-x-auto rounded-xl bg-[var(--surface)] p-4 sm:p-6 print:overflow-visible print:bg-transparent print:p-0">
          <div className="mx-auto w-full max-w-[52rem]">
            <PaginatedGuidePdfPreview
              onActiveSectionChange={handleActiveSectionChange}
              pendingSectionIdRef={pendingSectionIdRef}
              sectionPageMapRef={sectionPageMapRef}
              viewModel={viewModel}
              templateSettings={templateSettings}
            />
          </div>
        </div>
        </div>

        {hasGuideTools ? <aside data-guide-controls aria-label={text(activeSidebarPanel === "tools" ? "guide.tools" : "guide.pdfDesign.title")} className="sticky top-20 col-start-3 row-start-1 hidden max-h-[calc(100vh-6rem)] min-w-0 space-y-4 overflow-x-hidden overflow-y-auto text-[var(--text)] 2xl:block">
          {onTemplateSettingsChange ? <GuideSidebarPanelSwitcher activePanel={activeSidebarPanel} onChange={setActiveSidebarPanel} t={text} /> : null}
          <div key={activeSidebarPanel} className="space-y-4 transition-[opacity,transform] duration-200 ease-out starting:translate-x-1 starting:opacity-0 motion-reduce:transition-none">
            {activeSidebarPanel === "tools" ? <>
              <div className="guide-side-panel rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="mb-[18px] flex items-center gap-2.5">
                  <span className="grid size-7 place-items-center rounded-lg bg-[var(--accent-soft)]"><SlidersHorizontal className="size-3.5 text-[var(--accent)]" aria-hidden="true" /></span>
                  <h2 className="text-sm font-semibold">{text("guide.tools")}</h2>
                </div>
                {onSelectTemplate ? <GuideTemplateSection current={template} userTemplates={userTemplates} isSelecting={isSelectingTemplate} onSelect={onSelectTemplate}/> : null}
                {onSectionSettingsChange ? <GuideSectionManager controls={viewModel.sectionControls} disabled={isUpdatingSectionSettings} settings={viewModel.sectionSettings} t={text} onChange={(settings) => { void onSectionSettingsChange(settings).catch(() => setSaveWarning(text("guide.sections.saveFailed"))); }} /> : null}
                {onOverviewViewsChange&&onCaptureOverview?<GuideModelOverviewManager locale={locale} targetMode={viewModel.targetMode} views={overviewDraftViews} editorHref={`/models/${guide.projectId}`} onChange={onOverviewViewsChange} onCapture={(viewId,type)=>{if(!guide.overviewViews)onOverviewViewsChange(overviewDraftViews);onCaptureOverview(viewId,type)}}/>:null}
              </div>
              {onReferencesChange ? <GuideReferencesManager projectId={guide.projectId} locale={locale} references={guide.references ?? []} onChange={onReferencesChange} /> : null}
            </> : onTemplateSettingsChange ? <GuidePdfDesignPanel accentColor={template.settings.accentColor} backgroundItems={template.settings.backgroundItems} backCoverLayout={template.settings.branding.backCoverLayout} brandName={template.settings.branding.name} bodyFontId={template.settings.bodyFont} ctaText={template.settings.branding.ctaText} coverLayout={template.settings.branding.coverLayout} customLinks={template.settings.branding.customLinks} disabled={isUpdatingTemplateSettings} displayFontId={template.settings.headingFont} logoUrl={template.settings.branding.logoUrl} monoFontId={template.settings.monoFont} pageFormat={template.settings.pageFormat} qrValue={template.settings.branding.qrValue} socialLinks={template.settings.branding.socialLinks} onAccentColorChange={handleAccentColorChange} onBackgroundItemsChange={handleBackgroundItemsChange} onBackCoverLayoutChange={(backCoverLayout) => handleBrandingChange({ ...template.settings.branding, backCoverLayout })} onBodyFontChange={handleBodyFontChange} onBrandNameChange={(name) => handleBrandingChange({ ...template.settings.branding, name })} onCtaTextChange={(ctaText) => handleBrandingChange({ ...template.settings.branding, ctaText })} onCoverLayoutChange={(coverLayout) => handleBrandingChange({ ...template.settings.branding, coverLayout })} onCustomLinksChange={(customLinks) => handleBrandingChange({ ...template.settings.branding, customLinks })} onDisplayFontChange={handleDisplayFontChange} onLogoChange={(logoUrl) => handleBrandingChange({ ...template.settings.branding, logoUrl })} onMonoFontChange={handleMonoFontChange} onPageFormatChange={handlePageFormatChange} onQrValueChange={(qrValue) => handleBrandingChange({ ...template.settings.branding, qrValue })} onSocialLinksChange={(socialLinks) => handleBrandingChange({ ...template.settings.branding, socialLinks })} t={text} /> : null}
          </div>
        </aside> : null}
      </div>
    </main>
  );
}
