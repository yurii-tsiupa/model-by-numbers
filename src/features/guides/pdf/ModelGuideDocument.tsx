import type { GuideViewModel } from "../lib/getGuideViewModel";
import { defaultGuideTemplate } from "../templates/registry/guideTemplates";

export type ModelGuideDocumentProps = {
  viewModel: GuideViewModel;
};

export function ModelGuideDocument({
  viewModel,
}: ModelGuideDocumentProps) {
  const PdfDocument=defaultGuideTemplate.PdfDocument;
  return <PdfDocument guide={viewModel.guide} viewModel={viewModel}/>;
}
