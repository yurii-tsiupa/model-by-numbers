/* eslint-disable @next/next/no-img-element */
import { ImageIcon } from "lucide-react";
import { GuidePaletteSection } from "../../components/GuidePaletteSection";
import { GuidePartsSection } from "../../components/GuidePartsSection";
import { GuideProjectOverview } from "../../components/GuideProjectOverview";
import type { GuideImages, ModelGuide } from "../../types/ModelGuide";
import { classicPreviewStyles as styles } from "./classic.styles";

const views: Array<{key:keyof GuideImages;label:string;caption:string}>=[
  {key:"original",label:"Original model",caption:"Unpainted source geometry"},
  {key:"base",label:"Base coat",caption:"Uniform base color reference"},
  {key:"painted",label:"Painted model",caption:"Final color placement"},
  {key:"numbers",label:"Number map",caption:"Part-by-part painting reference"},
];
const Heading=({eyebrow,title,description}:{eyebrow:string;title:string;description:string})=><header><p className={styles.eyebrow}>{eyebrow}</p><h2 className={styles.title}>{title}</h2><p className={styles.description}>{description}</p></header>;

export function ClassicGuidePreview({guide}:{guide:ModelGuide}) {
 const missing=views.some(view=>!guide.images[view.key]);
 return <div className="mx-auto max-w-7xl space-y-20 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
  <GuideProjectOverview guide={guide}/>
  <section className={styles.section}><Heading eyebrow="Visual reference" title="Model views" description="Compare every stage from the original model to the numbered paint map."/>{missing?<p className="mt-4 rounded-xl border border-amber-400/15 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-200/80">Some model views are missing. Generate the guide again for a complete PDF.</p>:null}<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{views.map(view=>{const image=guide.images[view.key];return <article key={view.key} className={styles.card}><div className="flex aspect-[4/3] items-center justify-center border-b border-white/10 bg-black/25 p-2">{image?<img src={image} alt={view.label} className="h-full w-full rounded-lg object-contain"/>:<div className="flex flex-col items-center text-neutral-600"><ImageIcon className="h-7 w-7"/><span className="mt-3 text-xs">Not captured</span></div>}</div><div className="p-4"><h3 className="text-sm font-semibold text-white">{view.label}</h3><p className="mt-1 text-xs leading-5 text-neutral-500">{view.caption}</p></div></article>})}</div></section>
  {(guide.references?.length??0)>0?<section className={styles.section}><Heading eyebrow="Source material" title="Reference images" description="Visual references included as context for painting and finishing."/><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{guide.references?.map(reference=><article key={reference.id} className={styles.card}><div className="flex aspect-[4/3] items-center justify-center border-b border-white/10 bg-black/25 p-3"><img src={reference.dataUrl} alt={reference.name} className="max-h-full max-w-full rounded-lg object-contain"/></div><div className="p-4"><p className="truncate text-sm font-semibold text-white">{reference.name}</p><p className="mt-1 text-xs capitalize tracking-wide text-neutral-500">{reference.type} reference</p></div></article>)}</div></section>:null}
  <GuidePaletteSection palette={guide.palette}/><GuidePartsSection parts={guide.parts}/>
 </div>;
}
