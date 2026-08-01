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

type ClassicGuideDocumentProps = {
  guide: ModelGuide;
  viewModel?: GuideViewModel;
  templateSettings?: GuideTemplateSettings;
};

export function ClassicGuideDocument({
  guide,
  viewModel,
  templateSettings,
}: ClassicGuideDocumentProps) {
  const model =
    viewModel ?? getGuideViewModel(guide);
  const exportDate = new Date();
  const metadata = createPdfDocumentMetadata(guide, exportDate);

  return (
    <GuideDocument
      {...metadata}
    >
      <GuidePdfTemplateProvider settings={templateSettings}>
      <GuideCoverPage viewModel={model} exportDate={exportDate} templateSettings={templateSettings} />

      {model.sections.length > 4 ? <GuideTableOfContentsPage viewModel={model} /> : null}

      {model.sections.map((section) => {
        switch (section.id) {
          case "project-overview":
            return (
              <GuideProjectPage
                key={section.id}
                viewModel={model}
              />
            );

          case "model-views":
            return (
              <GuideModelViewsPage
                key={section.id}
                viewModel={model}
              />
            );

          case "exploded-view":
            return (
              <GuideExplodedPage
                key={section.id}
                guide={guide}
              />
            );

          case "assembly":
            return (
              <GuideAssemblyPages
                key={section.id}
                guide={guide}
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
                projectName={guide.title}
              />
            );

          case "palette":
            return (
              <GuidePalettePage
                key={section.id}
                viewModel={model}
              />
            );

          case "parts-overview":
            return (
              <GuidePartsPage
                key={section.id}
                guide={guide}
                parts={model.referencedParts}
              />
            );

          case "painting-workflow":
            return (
              <GuidePaintingWorkflowPages
                key={section.id}
                viewModel={model}
              />
            );

          default:
            return null;
        }
      })}
      </GuidePdfTemplateProvider>
    </GuideDocument>
  );
}
