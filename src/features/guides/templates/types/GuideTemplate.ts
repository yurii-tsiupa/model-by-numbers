import type { ComponentType } from "react";
import type { ModelGuide } from "../../types/ModelGuide";
import type { GuideViewModel } from "../../lib/getGuideViewModel";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";

export type GuideTemplateComponentProps = { guide: ModelGuide; templateSettings?: GuideTemplateSettings };
export type GuidePdfTemplateComponentProps = { guide: ModelGuide; viewModel?: GuideViewModel; templateSettings?: GuideTemplateSettings };

/** A presentation pair for the same immutable guide data. */
export type GuideTemplate = {
  id: string;
  name: string;
  Preview: ComponentType<GuideTemplateComponentProps>;
  PdfDocument: ComponentType<GuidePdfTemplateComponentProps>;
  settings?: Readonly<Record<string, unknown>>;
};
