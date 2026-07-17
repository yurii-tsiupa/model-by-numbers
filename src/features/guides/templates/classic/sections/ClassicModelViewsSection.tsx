/* eslint-disable @next/next/no-img-element */
import { ImageIcon } from "lucide-react";
import type { GuideModelView } from "../../../lib/getGuideViewModel";
import type { ModelGuide } from "../../../types/ModelGuide";
import type { TranslationKey } from "@/features/i18n/locales/en";
import { classicPreviewStyles as styles } from "../classic.styles";
import { ClassicSectionHeading } from "../ClassicSectionHeading";
export function ClassicModelViewsSection({guide,views,t}:{guide:ModelGuide;views:readonly GuideModelView[];t:(key:TranslationKey,values?:Readonly<Record<string,string|number>>)=>string}){return <section className={styles.section}><ClassicSectionHeading eyebrow={t("guide.visual")} title={t("guide.modelViews")} description={t("guide.modelViewsDescription")}/><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{views.map(view=><article key={view.key} className={styles.card}><div className="flex aspect-[4/3] items-center justify-center bg-black/25 p-2">{guide.images[view.key]?<img src={guide.images[view.key]??""} alt={t(view.labelKey)} className="h-full w-full object-contain"/>:<ImageIcon className="text-neutral-600"/>}</div><div className="p-4"><h3>{t(view.labelKey)}</h3><p className="text-xs text-neutral-500">{t(view.captionKey)}</p></div></article>)}</div></section>}
