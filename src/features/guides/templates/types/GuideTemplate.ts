import type { ComponentType } from "react";
import type { ModelGuide } from "../../types/ModelGuide";
import type { GuideViewModel } from "../../lib/getGuideViewModel";

export type GuideTemplateComponentProps = { guide: ModelGuide };
export type GuidePdfTemplateComponentProps = { guide: ModelGuide; viewModel?: GuideViewModel };

/** A presentation pair for the same immutable guide data. */
export type GuideTemplate = {
  id: string;
  name: string;
  Preview: ComponentType<GuideTemplateComponentProps>;
  PdfDocument: ComponentType<GuidePdfTemplateComponentProps>;
  settings?: Readonly<Record<string, unknown>>;
};
