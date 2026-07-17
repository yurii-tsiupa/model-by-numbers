/* eslint-disable @next/next/no-img-element */
import type { GuideExplodedView } from "../../../types/ModelGuide";
import type { TranslationKey } from "@/features/i18n/locales/en";
import { classicPreviewStyles as styles } from "../classic.styles";
import { ClassicSectionHeading } from "../ClassicSectionHeading";
export function ClassicExplodedSection({view,t}:{view:GuideExplodedView;t:(key:TranslationKey,values?:Readonly<Record<string,string|number>>)=>string}){return <section className={styles.section}><ClassicSectionHeading eyebrow={t("guide.visual")} title={t("guide.exploded.title")} description={t("guide.exploded.description")}/><div className="mt-8 rounded-2xl border border-white/10 bg-black/25 p-4">{view.image?<img src={view.image} alt={t("guide.exploded.title")} className="mx-auto aspect-[4/3] w-full object-contain"/>:<p className="py-20 text-center text-neutral-500">{t("guide.exploded.imageMissing")}</p>}<p className="mt-3 text-sm text-neutral-400">{t("guide.exploded.partsCount",{count:view.partsCount})}</p></div></section>}
