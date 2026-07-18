import type { Locale } from "@/features/i18n/types/Locale";

import type { ModelGuide } from "../../../types/ModelGuide";
import type {GuidePaintingStepViewModel} from "../../../types/GuidePaintingStep";
import { GuidePaintingWorkflowPreview } from "../../GuidePaintingWorkflowPreview";

type GuidePaintingWorkflowSectionProps = {
  guide: ModelGuide;
  locale: Locale;
  steps:readonly GuidePaintingStepViewModel[];
};

export function GuidePaintingWorkflowSection({
  guide,
  locale,
  steps,
}: GuidePaintingWorkflowSectionProps) {
  return (
    <div
      className="
        [&>div]:mx-auto
        [&>div]:max-w-none
        [&>div]:px-6
        [&>div]:py-10
        sm:[&>div]:px-10
        lg:[&>div]:px-12

        [&>div>section:nth-child(1)]:hidden
        [&>div>section:nth-child(2)]:hidden
      "
    >
      <GuidePaintingWorkflowPreview
        guide={guide}
        locale={locale}
        steps={steps}
      />
    </div>
  );
}
