import type { Locale } from "@/features/i18n/types/Locale";

import type { GuidePaletteColor } from "../../../types/ModelGuide";
import { GuidePaletteSection } from "../../GuidePaletteSection";

type GuidePalettePreviewSectionProps = {
  palette: GuidePaletteColor[];
  locale: Locale;
};

export function GuidePalettePreviewSection({
  palette,
  locale,
}: GuidePalettePreviewSectionProps) {
  return (
    <GuidePaletteSection
      palette={palette}
      locale={locale}
    />
  );
}