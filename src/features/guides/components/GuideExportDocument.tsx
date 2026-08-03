import type { GuideViewModel } from "../lib/getGuideViewModel";
import { defaultGuideTemplate } from "../templates/registry/guideTemplates";
import { GuideRenderModeProvider } from "./GuideRenderModeProvider";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";

type GuideExportDocumentProps = {
  viewModel: GuideViewModel;
  templateSettings: GuideTemplateSettings;
};

export function GuideExportDocument({
  viewModel,
  templateSettings,
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
        <article className="guide-document overflow-hidden" style={{backgroundColor:templateSettings.pageBackground,color:templateSettings.textColor}}>
          <TemplatePreview
            guide={viewModel.guide}
            templateSettings={templateSettings}
          />

        </article>
      </GuideRenderModeProvider>
    </div>
  );
}
