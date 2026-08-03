import type { TranslationKey } from "@/features/i18n/locales/en";

import type { GuideAssemblyPart, GuideAssemblyStep } from "./ModelGuide";

export type GuideAssemblyView = {
  id: string;
  image: string;
  labelKey: TranslationKey;
};

export type GuideAssemblyData =
  | {
      mode: "steps";
      parts: readonly GuideAssemblyPart[];
      steps: readonly GuideAssemblyStep[];
      views: readonly GuideAssemblyView[];
    }
  | {
      mode: "overview";
      parts: readonly GuideAssemblyPart[];
      steps: readonly [];
      views: readonly GuideAssemblyView[];
    };
