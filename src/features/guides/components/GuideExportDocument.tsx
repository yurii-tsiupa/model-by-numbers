import type { GuideViewModel } from "../lib/getGuideViewModel";
import { defaultGuideTemplate } from "../templates/registry/guideTemplates";
import { GuidePaintingWorkflowSection } from "./GuidePreview/sections/GuidePaintingWorkflowSection";
import { GuideRenderModeProvider } from "./GuideRenderModeProvider";
import { GuideSectionAnchor } from "./GuideSectionAnchor";

type GuideExportDocumentProps = {
  viewModel: GuideViewModel;
};

export function GuideExportDocument({
  viewModel,
}: GuideExportDocumentProps) {
  const TemplatePreview =
    defaultGuideTemplate.Preview;

  return (
    <div
      data-guide-export-root
      data-guide-render-mode="pdf"
      aria-hidden="true"
      className="guide-pdf-export-root"
    >
      <GuideRenderModeProvider mode="pdf">
        <article className="guide-document overflow-hidden bg-white text-[#181221]">
          <TemplatePreview
            guide={viewModel.guide}
          />

          {viewModel.hasPaintingWorkflow ? (
            <GuideSectionAnchor id="painting-workflow">
              <GuidePaintingWorkflowSection
                guide={viewModel.workflowGuide}
                locale={viewModel.locale}
              />
            </GuideSectionAnchor>
          ) : null}
        </article>
      </GuideRenderModeProvider>
    </div>
  );
}