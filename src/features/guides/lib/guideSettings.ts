import type { GuideSettings, ModelGuide } from "../types/ModelGuide";
export const PAINTING_GUIDE_SETTINGS:GuideSettings={includeOriginalView:true,includeBaseView:true,includePaintedView:true,includeNumbersView:true,includePartsTable:true,includeProjectDescription:true,includeReferenceImages:true,includeExplodedView:false,includeAssemblyInstructions:false,includeAssemblyStepImages:false};
export function getGuideSettings(guide:Pick<ModelGuide,"settings">):GuideSettings{return {...PAINTING_GUIDE_SETTINGS,...guide.settings};}
