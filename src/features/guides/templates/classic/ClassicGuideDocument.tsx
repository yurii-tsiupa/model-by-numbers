import {GuideDocument} from "../../pdf/GuideDocument";
import {GuideCoverPage} from "../../pdf/GuideCoverPage";
import {GuideModelViewsPage} from "../../pdf/GuideModelViewsPage";
import {GuidePalettePage} from "../../pdf/GuidePalettePage";
import {GuidePartsPage} from "../../pdf/GuidePartsPage";
import {GuideProjectPage} from "../../pdf/GuideProjectPage";
import {GuideReferencesPage} from "../../pdf/GuideReferencesPage";
import {GuideExplodedPage} from "../../pdf/GuideExplodedPage";
import {GuideAssemblyPages} from "../../pdf/GuideAssemblyPages";
import {GuideTableOfContentsPage} from "../../pdf/GuideTableOfContentsPage";
import {GuidePaintingWorkflowPages} from "../../pdf/GuidePaintingWorkflowPages";
import {getGuideViewModel,type GuideViewModel} from "../../lib/getGuideViewModel";
import type {ModelGuide} from "../../types/ModelGuide";

export function ClassicGuideDocument({guide,viewModel}:{guide:ModelGuide;viewModel?:GuideViewModel}){const model=viewModel??getGuideViewModel(guide);return <GuideDocument title={guide.title} author={guide.author} creator="Model by Numbers"><GuideCoverPage guide={guide}/><GuideTableOfContentsPage viewModel={model}/>{model.sections.map(section=>{switch(section.id){case"project-overview":return <GuideProjectPage key={section.id} guide={guide}/>;case"model-views":return <GuideModelViewsPage key={section.id} guide={guide}/>;case"exploded-view":return <GuideExplodedPage key={section.id} guide={guide}/>;case"assembly":return <GuideAssemblyPages key={section.id} guide={guide}/>;case"references":return <GuideReferencesPage key={section.id} references={guide.references??[]} locale={model.locale}/>;case"palette":return <GuidePalettePage key={section.id} guide={guide}/>;case"parts-overview":return <GuidePartsPage key={section.id} guide={guide}/>;case"painting-workflow":return <GuidePaintingWorkflowPages key={section.id} viewModel={model}/>;default:return null;}})}</GuideDocument>}
