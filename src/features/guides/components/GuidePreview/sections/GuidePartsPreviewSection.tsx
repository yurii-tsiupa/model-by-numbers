import type { Locale } from "@/features/i18n/types/Locale";
import type { GuidePart } from "../../../types/ModelGuide";
import { GuidePartsSection } from "../../GuidePartsSection";
export function GuidePartsPreviewSection({parts,locale}:{parts:GuidePart[];locale:Locale}){return <GuidePartsSection parts={parts} locale={locale}/>}
