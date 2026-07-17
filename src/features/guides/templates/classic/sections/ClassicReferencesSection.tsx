/* eslint-disable @next/next/no-img-element */
import type { GuideReferenceImage } from "../../../types/ModelGuide";
import type { TranslationKey } from "@/features/i18n/locales/en";
import { classicPreviewStyles as styles } from "../classic.styles";
import { ClassicSectionHeading } from "../ClassicSectionHeading";
export function ClassicReferencesSection({references,t}:{references:readonly GuideReferenceImage[];t:(key:TranslationKey,values?:Readonly<Record<string,string|number>>)=>string}){return <section className={styles.section}><ClassicSectionHeading eyebrow={t("guide.source")} title={t("guide.references")} description={t("guide.referencesDescription")}/><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{references.map(reference=><article key={reference.id} className={styles.card}><img src={reference.dataUrl} alt={reference.name} className="aspect-[4/3] w-full object-contain"/><div className="p-4">{reference.name}</div></article>)}</div></section>}
