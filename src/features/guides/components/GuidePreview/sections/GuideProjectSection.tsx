import type { Locale } from "@/features/i18n/types/Locale";

import type { ModelGuide } from "../../../types/ModelGuide";
import { GuideProjectOverview } from "../../GuideProjectOverview";

type GuideProjectSectionProps = {
  guide: ModelGuide;
  locale: Locale;
};

export function GuideProjectSection({
  guide,
  locale,
}: GuideProjectSectionProps) {
  return (
    <GuideProjectOverview
      guide={guide}
      locale={locale}
    />
  );
}