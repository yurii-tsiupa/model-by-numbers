import type { Locale } from "@/features/i18n/types/Locale";
import type { ModelGuide } from "../../../types/ModelGuide";
import { GuidePaintingWorkflowPreview } from "../../GuidePaintingWorkflowPreview";
export function GuidePaintingWorkflowSection({guide,locale}:{guide:ModelGuide;locale:Locale}){return <div className="[&>div]:max-w-none [&>div]:px-5 [&>div]:py-10 sm:[&>div]:px-10 [&>div>section:nth-child(1)]:hidden [&>div>section:nth-child(2)]:hidden"><GuidePaintingWorkflowPreview guide={guide} locale={locale}/></div>}
