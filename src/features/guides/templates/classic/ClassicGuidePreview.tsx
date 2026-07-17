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
import { GuideSectionAnchor } from "../../components/GuideSectionAnchor";

export function ClassicGuidePreview({guide}:{guide:ModelGuide}){
  const viewModel=getGuideViewModel(guide);
  const{locale,settings,modelViews}=viewModel;
  const t=(key:Parameters<typeof translate>[1],values?:Parameters<typeof translate>[2])=>translate(locale,key,values);
  return <div className="mx-auto max-w-7xl space-y-20 px-5 py-10">
    <GuideSectionAnchor id="project-overview"><GuideProjectSection guide={guide} locale={locale}/></GuideSectionAnchor>
    {modelViews.length?<GuideSectionAnchor id="model-views"><ClassicModelViewsSection guide={guide} views={modelViews} t={t}/></GuideSectionAnchor>:null}
    {settings.includeExplodedView&&guide.explodedView?<GuideSectionAnchor id="exploded-view"><ClassicExplodedSection view={guide.explodedView} t={t}/></GuideSectionAnchor>:null}
    {settings.includeAssemblyInstructions&&(guide.assemblySteps?.length??0)>0?<GuideSectionAnchor id="assembly"><ClassicAssemblySection steps={guide.assemblySteps??[]} showImages={settings.includeAssemblyStepImages} t={t}/></GuideSectionAnchor>:null}
    {(guide.references?.length??0)>0?<GuideSectionAnchor id="references"><ClassicReferencesSection references={guide.references??[]} t={t}/></GuideSectionAnchor>:null}
    <GuideSectionAnchor id="palette"><GuidePalettePreviewSection palette={guide.palette} locale={locale}/></GuideSectionAnchor>
    {settings.includePartsTable?<GuideSectionAnchor id="parts-overview"><GuidePartsPreviewSection parts={guide.parts} locale={locale}/></GuideSectionAnchor>:null}
  </div>;
}
