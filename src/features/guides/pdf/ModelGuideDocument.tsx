import type { GuideViewModel } from "../lib/getGuideViewModel";
import { defaultGuideTemplate } from "../templates/registry/guideTemplates";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";
import type { GuidePdfRenderMode } from "./GuidePdfRenderModeContext";
import type { GuideSectionId } from "../config/guideSectionRegistry";

export type GuidePdfSectionSelection = {
  sectionIds: readonly GuideSectionId[];
  includeTableOfContents?: boolean;
};

export type ModelGuideDocumentProps = {
  brandQrImageUrl?: string | null;
  viewModel: GuideViewModel;
  templateSettings: GuideTemplateSettings;
  renderMode?: GuidePdfRenderMode;
  sectionSelection?: GuidePdfSectionSelection;
};

export function ModelGuideDocument({
  brandQrImageUrl,
  viewModel,
  templateSettings,
  renderMode = "export",
  sectionSelection,
}: ModelGuideDocumentProps) {
  const PdfDocument=defaultGuideTemplate.PdfDocument;
  return <PdfDocument brandQrImageUrl={brandQrImageUrl} guide={viewModel.guide} viewModel={viewModel} templateSettings={templateSettings} renderMode={renderMode} sectionSelection={sectionSelection}/>;
}
