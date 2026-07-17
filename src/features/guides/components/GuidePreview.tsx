"use client";
import { useRef, useState } from "react";
import { useSaveGeneratedGuide } from "../hooks/useSaveGeneratedGuide";

import type { ModelGuide } from "../types/ModelGuide";
import { defaultGuideTemplate } from "../templates/registry/guideTemplates";
import { translate } from "@/features/i18n/lib/i18n";
import { GuidePreviewHeader } from "./GuidePreviewHeader";
import { GuidePaintingWorkflowSection } from "./GuidePreview/sections/GuidePaintingWorkflowSection";
import { useGuideViewModel } from "../hooks/useGuideViewModel";
import { GuideNavigation } from "./GuideNavigation";
import { GuideSectionAnchor } from "./GuideSectionAnchor";
import { useGuidePdfExport } from "../hooks/useGuidePdfExport";
import { GuideExportDocument } from "./GuideExportDocument";
import { GuideExportWarningDialog } from "./GuideExportWarningDialog";

type GuidePreviewProps = {
  guide: ModelGuide;
  savedFileName?: string;
  savedPdfBlob?: Blob | null;
  skipSave?: boolean;
  onDelete?: () => void;
};

export function GuidePreview({ guide, savedFileName, savedPdfBlob, skipSave = false, onDelete }: GuidePreviewProps) {
  const viewModel=useGuideViewModel(guide);
  const{locale,workflowGuide,hasPaintingWorkflow,sections}=viewModel;
  const text=(key:Parameters<typeof translate>[1],values?:Parameters<typeof translate>[2])=>translate(locale,key,values);
  const savedGuideIdRef = useRef<string | null>(null);
  const saveGuide = useSaveGeneratedGuide();
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const pdfExport=useGuidePdfExport({viewModel,existingBlob:savedPdfBlob,fileName:savedFileName,onImageWarning:()=>setSaveWarning(text("guide.pdfExport.imageWarning")),beforeDownload:async({blob,fileName})=>{if(skipSave||savedGuideIdRef.current)return;try{const saved=await saveGuide.mutateAsync({projectId:guide.projectId,snapshot:guide,pdfBlob:blob,fileName});savedGuideIdRef.current=saved.id;}catch{setSaveWarning(text("guide.saveWarning"));}}});

  const TemplatePreview=defaultGuideTemplate.Preview;

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <GuidePreviewHeader
        projectId={guide.projectId}
        title={guide.title}
        exportStatus={pdfExport.status}
        exportProgress={pdfExport.progress}
        exportError={pdfExport.error}
        onDownload={() => {void pdfExport.exportPdf();}}
        onRetry={() => {void pdfExport.retryExport();}}
        onReset={pdfExport.resetExport}
        onDelete={onDelete}
        locale={locale}
      />
      {pdfExport.isExporting?<GuideExportDocument viewModel={viewModel}/>:null}
      {pdfExport.status==="awaitingConfirmation"?<GuideExportWarningDialog locale={locale} warnings={pdfExport.warnings} onConfirm={()=>{void pdfExport.confirmExport();}} onReview={()=>{pdfExport.resetExport();document.querySelector(".guide-document")?.scrollIntoView({behavior:"smooth",block:"start"});}}/>:null}

      {saveWarning ? <p role="alert" className="mx-auto max-w-7xl px-5 pt-5 text-sm text-amber-300 sm:px-6 lg:px-8">{saveWarning}</p> : null}

      <div className="guide-layout mx-auto grid max-w-[82rem] items-start lg:grid-cols-[14rem_minmax(0,56rem)] lg:justify-center lg:gap-6 lg:px-6 lg:py-8">
        <GuideNavigation sections={sections} locale={locale}/>
        <article data-guide-render-mode="preview" className="guide-document min-w-0 overflow-hidden bg-neutral-950 sm:mx-5 sm:my-6 sm:rounded-xl sm:border sm:border-white/10 sm:shadow-2xl sm:shadow-black/30 lg:m-0"><TemplatePreview guide={guide}/>
          {hasPaintingWorkflow ? <GuideSectionAnchor id="painting-workflow"><GuidePaintingWorkflowSection guide={workflowGuide} locale={locale}/></GuideSectionAnchor> : null}
        </article>
      </div>
    </main>
  );
}
