import { GuidePalettePreviewSection } from "../../components/GuidePreview/sections/GuidePalettePreviewSection";
import { GuidePartsPreviewSection } from "../../components/GuidePreview/sections/GuidePartsPreviewSection";
import { GuideProjectSection } from "../../components/GuidePreview/sections/GuideProjectSection";
import { getGuideViewModel } from "../../lib/getGuideViewModel";
import type { ModelGuide } from "../../types/ModelGuide";
import { translate } from "@/features/i18n/lib/i18n";
import { ClassicAssemblySection } from "./sections/ClassicAssemblySection";
import { ClassicExplodedSection } from "./sections/ClassicExplodedSection";
import { ClassicModelViewsSection } from "./sections/ClassicModelViewsSection";
import { ClassicReferencesSection } from "./sections/ClassicReferencesSection";

export function ClassicGuidePreview({guide}:{guide:ModelGuide}){
  const viewModel=getGuideViewModel(guide);
  const{locale,settings,modelViews}=viewModel;
  const t=(key:Parameters<typeof translate>[1],values?:Parameters<typeof translate>[2])=>translate(locale,key,values);
  return <div className="mx-auto max-w-7xl space-y-20 px-5 py-10">
    <GuideProjectSection guide={guide} locale={locale}/>
    <ClassicModelViewsSection guide={guide} views={modelViews} t={t}/>
    {settings.includeExplodedView&&guide.explodedView?<ClassicExplodedSection view={guide.explodedView} t={t}/>:null}
    {settings.includeAssemblyInstructions&&(guide.assemblySteps?.length??0)>0?<ClassicAssemblySection steps={guide.assemblySteps??[]} showImages={settings.includeAssemblyStepImages} t={t}/>:null}
    {(guide.references?.length??0)>0?<ClassicReferencesSection references={guide.references??[]} t={t}/>:null}
    <GuidePalettePreviewSection palette={guide.palette} locale={locale}/>
    {settings.includePartsTable?<GuidePartsPreviewSection parts={guide.parts} locale={locale}/>:null}
  </div>;
}
