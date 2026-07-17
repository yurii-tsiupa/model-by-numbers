import type { Locale } from "@/features/i18n/types/Locale";
import type { GuidePaletteColor } from "../../../types/ModelGuide";
import { GuidePaletteSection } from "../../GuidePaletteSection";
export function GuidePalettePreviewSection({palette,locale}:{palette:GuidePaletteColor[];locale:Locale}){return <GuidePaletteSection palette={palette} locale={locale}/>}
