import type { ComponentType } from "react";
import type { ModelGuide } from "../../types/ModelGuide";

export type GuideTemplateComponentProps = { guide: ModelGuide };

/** A presentation pair for the same immutable guide data. */
export type GuideTemplate = {
  id: string;
  name: string;
  Preview: ComponentType<GuideTemplateComponentProps>;
  PdfDocument: ComponentType<GuideTemplateComponentProps>;
  settings?: Readonly<Record<string, unknown>>;
};
