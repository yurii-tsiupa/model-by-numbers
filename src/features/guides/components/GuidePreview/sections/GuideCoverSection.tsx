import type { Locale } from "@/features/i18n/types/Locale";
import { formatLocalizedDate,translate } from "@/features/i18n/lib/i18n";
import { formatPaintingTime } from "@/features/model-editor/lib/paintingWorkflow";
import type { ModelGuide } from "../../../types/ModelGuide";
import Image from "next/image";

export function GuideCoverSection({guide,locale}:{guide:ModelGuide;locale:Locale}){
  const t=(key:Parameters<typeof translate>[1])=>translate(locale,key);
  const summary=guide.paintingSummary;
  const thumbnail=guide.images.painted??guide.images.base??guide.images.original??guide.images.numbers;
  const difficulty=summary?.difficulties.length?summary.difficulties.map(value=>t(`painting.difficulty.${value}`)).join(" · "):t("guide.workflow.notSpecified");
  const paintingTime=summary?.estimatedTimeMinutes?formatPaintingTime(summary.estimatedTimeMinutes,locale):t("guide.workflow.notSpecified");
  return <section className="guide-cover flex min-h-[38rem] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/70 p-6 sm:p-10">
    <header><p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">{t("guide.cover.document")}</p><h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">{guide.title}</h1>{summary?.modelName?<p className="mt-3 break-words text-lg text-neutral-400">{summary.modelName}</p>:null}</header>
    <div className="my-8 flex min-h-0 flex-1 items-center justify-center">{thumbnail?<Image src={thumbnail} alt={guide.title} width={1200} height={800} unoptimized className="max-h-[22rem] w-full max-w-2xl object-contain"/>:<div className="h-48 w-full max-w-xl rounded-xl border border-dashed border-white/10"/>}</div>
    <div><p className="text-sm text-neutral-500">{t("guide.generated")} · {formatLocalizedDate(guide.generatedAt,locale)}</p><dl className="mt-5 grid gap-x-6 gap-y-4 border-t border-white/10 pt-5 sm:grid-cols-3"><CoverFact label={t("guide.visibleParts")} value={String(guide.partsCount)}/><CoverFact label={t("guide.workflow.difficulty")} value={difficulty}/><CoverFact label={t("guide.workflow.totalTime")} value={paintingTime}/></dl>{guide.description?<p className="mt-6 max-w-3xl text-sm leading-6 text-neutral-400">{guide.description}</p>:null}</div>
  </section>;
}
function CoverFact({label,value}:{label:string;value:string}){return <div><dt className="text-xs uppercase tracking-wider text-neutral-500">{label}</dt><dd className="mt-1 text-base font-medium text-neutral-100">{value}</dd></div>}
