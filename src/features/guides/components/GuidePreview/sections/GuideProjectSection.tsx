import type { Locale } from "@/features/i18n/types/Locale";
import type { ModelGuide } from "../../../types/ModelGuide";
import { GuideProjectOverview } from "../../GuideProjectOverview";
export function GuideProjectSection({guide,locale}:{guide:ModelGuide;locale:Locale}){return <GuideProjectOverview guide={guide} locale={locale}/>}
