import type { Locale } from "@/features/i18n/types/Locale";

import type { GuideViewModel } from "../../../lib/getGuideViewModel";
import { GuideProjectOverview } from "../../GuideProjectOverview";

type GuideProjectSectionProps = {
  viewModel: GuideViewModel;
  locale: Locale;
};

export function GuideProjectSection({
  viewModel,
  locale,
}: GuideProjectSectionProps) {
  return (
    <GuideProjectOverview
      viewModel={viewModel}
      locale={locale}
    />
  );
}
