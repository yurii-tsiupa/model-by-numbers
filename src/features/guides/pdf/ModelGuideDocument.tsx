import type { ModelGuide } from "../types/ModelGuide";
import { defaultGuideTemplate } from "../templates/registry/guideTemplates";

export type ModelGuideDocumentProps = {
  guide: ModelGuide;
};

export function ModelGuideDocument({
  guide,
}: ModelGuideDocumentProps) {
  const PdfDocument=defaultGuideTemplate.PdfDocument;
  return <PdfDocument guide={guide}/>;
}
