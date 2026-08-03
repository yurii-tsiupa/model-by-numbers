import type { GuideViewModel } from "../lib/getGuideViewModel";
import { defaultGuideTemplate } from "../templates/registry/guideTemplates";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";
import type { GuidePdfRenderMode } from "./GuidePdfRenderModeContext";

export type ModelGuideDocumentProps = {
  viewModel: GuideViewModel;
  templateSettings: GuideTemplateSettings;
  renderMode?: GuidePdfRenderMode;
};

export function ModelGuideDocument({
  viewModel,
  templateSettings,
  renderMode = "export",
}: ModelGuideDocumentProps) {
  const PdfDocument=defaultGuideTemplate.PdfDocument;
  return <PdfDocument guide={viewModel.guide} viewModel={viewModel} templateSettings={templateSettings} renderMode={renderMode}/>;
}
