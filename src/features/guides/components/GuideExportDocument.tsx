import {defaultGuideTemplate} from "../templates/registry/guideTemplates";
import type {GuideViewModel} from "../lib/getGuideViewModel";
import {GuidePaintingWorkflowSection} from "./GuidePreview/sections/GuidePaintingWorkflowSection";
import {GuideSectionAnchor} from "./GuideSectionAnchor";
import {GuideRenderModeProvider} from "./GuideRenderModeProvider";

export function GuideExportDocument({viewModel}:{viewModel:GuideViewModel}){const TemplatePreview=defaultGuideTemplate.Preview;return <div data-guide-export-root data-guide-render-mode="pdf" aria-hidden="true" className="guide-pdf-export-root"><GuideRenderModeProvider mode="pdf"><article className="guide-document overflow-hidden bg-neutral-950"><TemplatePreview guide={viewModel.guide}/>{viewModel.hasPaintingWorkflow?<GuideSectionAnchor id="painting-workflow"><GuidePaintingWorkflowSection guide={viewModel.workflowGuide} locale={viewModel.locale}/></GuideSectionAnchor>:null}</article></GuideRenderModeProvider></div>}
