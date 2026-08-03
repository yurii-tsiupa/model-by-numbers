import {
  getGuideViewModel,
  type GuideViewModel,
} from "../../lib/getGuideViewModel";
import {
  GuideAssemblyPages,
} from "../../pdf/GuideAssemblyPages";
import {
  GuideCoverPage,
} from "../../pdf/GuideCoverPage";
import {
  GuideDocument,
} from "../../pdf/GuideDocument";
import {
  GuideExplodedPage,
} from "../../pdf/GuideExplodedPage";
import {
  GuideModelViewsPage,
} from "../../pdf/GuideModelViewsPage";
import {
  GuidePaintingWorkflowPages,
} from "../../pdf/GuidePaintingWorkflowPages";
import {
  GuidePalettePage,
} from "../../pdf/GuidePalettePage";
import {
  GuidePartsPage,
} from "../../pdf/GuidePartsPage";
import {
  GuideProjectPage,
} from "../../pdf/GuideProjectPage";
import {
  GuideReferencesPage,
} from "../../pdf/GuideReferencesPage";
import {
  GuideTableOfContentsPage,
} from "../../pdf/GuideTableOfContentsPage";
import type { ModelGuide } from "../../types/ModelGuide";
import { createPdfDocumentMetadata } from "../../pdf/pdfDocumentMetadata";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";
import { GuidePdfTemplateProvider } from "../../pdf/GuidePdfTemplateContext";
import { GuidePdfRenderModeProvider, type GuidePdfRenderMode } from "../../pdf/GuidePdfRenderModeContext";
import { resolveGuidePdfPagePlan } from "../../pdf/resolveGuidePdfPagePlan";

type ClassicGuideDocumentProps = {
  guide: ModelGuide;
  viewModel?: GuideViewModel;
  templateSettings?: GuideTemplateSettings;
  renderMode?: GuidePdfRenderMode;
};

export function ClassicGuideDocument({
  guide,
  viewModel,
  templateSettings,
  renderMode = "export",
}: ClassicGuideDocumentProps) {
  const model =
    viewModel ?? getGuideViewModel(guide);
  const exportDate = new Date();
  const metadata = createPdfDocumentMetadata(guide, exportDate);
  const pagePlan = resolveGuidePdfPagePlan(model);

  return (
    <GuideDocument
      {...metadata}
    >
      <GuidePdfRenderModeProvider value={renderMode}><GuidePdfTemplateProvider settings={templateSettings}>
      <GuideCoverPage viewModel={model} exportDate={exportDate} pageNumber={pagePlan.cover} templateSettings={templateSettings} totalPages={pagePlan.totalPages} />

      {pagePlan.tableOfContents ? <GuideTableOfContentsPage pageNumber={pagePlan.tableOfContents} totalPages={pagePlan.totalPages} viewModel={model} /> : null}

      {model.sections.map((section) => {
        const pageRange = pagePlan.sections[section.id];
        if (!pageRange) return null;
        switch (section.id) {
          case "project-overview":
            return (
              <GuideProjectPage
                key={section.id}
                pageNumber={pageRange.start}
                totalPages={pagePlan.totalPages}
                viewModel={model}
              />
            );

          case "model-views":
            return (
              <GuideModelViewsPage
                key={section.id}
                pageNumberStart={pageRange.start}
                totalPages={pagePlan.totalPages}
                viewModel={model}
              />
            );

          case "exploded-view":
            return (
              <GuideExplodedPage
                key={section.id}
                guide={guide}
                pageNumber={pageRange.start}
                totalPages={pagePlan.totalPages}
              />
            );

          case "assembly":
            return (
              <GuideAssemblyPages
                key={section.id}
                guide={guide}
                pageNumberStart={pageRange.start}
                totalPages={pagePlan.totalPages}
              />
            );

          case "references":
            return (
              <GuideReferencesPage
                key={section.id}
                references={
                  model.includedReferences
                }
                locale={model.locale}
                pageNumberStart={pageRange.start}
                projectName={guide.title}
                totalPages={pagePlan.totalPages}
              />
            );

          case "palette":
            return (
              <GuidePalettePage
                key={section.id}
                pageNumberStart={pageRange.start}
                totalPages={pagePlan.totalPages}
                viewModel={model}
              />
            );

          case "parts-overview":
            return (
              <GuidePartsPage
                key={section.id}
                guide={guide}
                pageNumberStart={pageRange.start}
                parts={model.referencedParts}
                totalPages={pagePlan.totalPages}
              />
            );

          case "painting-workflow":
            return (
              <GuidePaintingWorkflowPages
                key={section.id}
                pageNumberStart={pageRange.start}
                totalPages={pagePlan.totalPages}
                viewModel={model}
              />
            );

          default:
            return null;
        }
      })}
      </GuidePdfTemplateProvider></GuidePdfRenderModeProvider>
    </GuideDocument>
  );
}
