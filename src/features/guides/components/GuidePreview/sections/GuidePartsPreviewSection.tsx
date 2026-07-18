import type { Locale } from "@/features/i18n/types/Locale";

import type { GuidePart } from "../../../types/ModelGuide";
import { GuidePartsSection } from "../../GuidePartsSection";

type GuidePartsPreviewSectionProps = {
  parts: GuidePart[];
  locale: Locale;
};

export function GuidePartsPreviewSection({
  parts,
  locale,
}: GuidePartsPreviewSectionProps) {
  return (
    <GuidePartsSection
      parts={parts}
      locale={locale}
    />
  );
}