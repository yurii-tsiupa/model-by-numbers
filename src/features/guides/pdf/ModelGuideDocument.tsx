import type { GuideViewModel } from "../lib/getGuideViewModel";
import { defaultGuideTemplate } from "../templates/registry/guideTemplates";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";

export type ModelGuideDocumentProps = {
  viewModel: GuideViewModel;
  templateSettings: GuideTemplateSettings;
};

export function ModelGuideDocument({
  viewModel,
  templateSettings,
}: ModelGuideDocumentProps) {
  const PdfDocument=defaultGuideTemplate.PdfDocument;
  return <PdfDocument guide={viewModel.guide} viewModel={viewModel} templateSettings={templateSettings}/>;
}
