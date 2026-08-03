import { translate } from "@/features/i18n/lib/i18n";

import { GuidePalettePreviewSection } from "../../components/GuidePreview/sections/GuidePalettePreviewSection";
import { GuidePartsPreviewSection } from "../../components/GuidePreview/sections/GuidePartsPreviewSection";
import { GuideProjectSection } from "../../components/GuidePreview/sections/GuideProjectSection";
import { GuideCoverSection } from "../../components/GuidePreview/sections/GuideCoverSection";
import { GuidePaintingWorkflowSection } from "../../components/GuidePreview/sections/GuidePaintingWorkflowSection";
import { GuideLegendSection } from "../../components/GuidePreview/sections/GuideLegendSection";
import { GuideKitSection } from "../../components/GuidePreview/sections/GuideKitSection";
import { GuideSectionAnchor } from "../../components/GuideSectionAnchor";
import { getGuideViewModel } from "../../lib/getGuideViewModel";
import type { ModelGuide } from "../../types/ModelGuide";
import { ClassicAssemblySection } from "./sections/ClassicAssemblySection";
import { ClassicExplodedSection } from "./sections/ClassicExplodedSection";
import { ClassicFinishingSection } from "./sections/ClassicFinishingSection";
import { ClassicTroubleshootingSection } from "./sections/ClassicTroubleshootingSection";
import { ClassicBackCoverSection } from "./sections/ClassicBackCoverSection";
import { ClassicModelViewsSection } from "./sections/ClassicModelViewsSection";
import { ClassicReferencesSection } from "./sections/ClassicReferencesSection";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";

type ClassicGuidePreviewProps = {
  guide: ModelGuide;
  templateSettings?: GuideTemplateSettings;
};

export function ClassicGuidePreview({
  guide,
  templateSettings,
}: ClassicGuidePreviewProps) {
  const viewModel = getGuideViewModel(guide, templateSettings?.pageFormat);

  const { locale, settings } = viewModel;

  const t = (
    key: Parameters<typeof translate>[1],
    values?: Parameters<typeof translate>[2],
  ) => translate(locale, key, values);

  const renderedSections = viewModel.documentSections.map((section) => {
    switch (section.id) {
      case "cover":
        return <GuideCoverSection key={section.id} viewModel={viewModel} locale={locale} />;
      case "project-overview":
        return <GuideSectionAnchor key={section.id} id={section.contentSectionId}><GuideProjectSection viewModel={viewModel} locale={locale} /></GuideSectionAnchor>;
      case "legend":
        return <GuideSectionAnchor key={section.id} id={section.contentSectionId}><GuideLegendSection locale={locale} targetMode={viewModel.targetMode} /></GuideSectionAnchor>;
      case "kit":
        return <GuideSectionAnchor key={section.id} id={section.contentSectionId}><GuideKitSection items={viewModel.kitItems} locale={locale} /></GuideSectionAnchor>;
      case "palette":
        return <GuideSectionAnchor key={section.id} id={section.contentSectionId}><GuidePalettePreviewSection palette={viewModel.usedPalette} locale={locale} /></GuideSectionAnchor>;
      case "model-views":
        return <GuideSectionAnchor key={section.id} id={section.contentSectionId}><ClassicModelViewsSection views={viewModel.modelViews} t={t} /></GuideSectionAnchor>;
      case "exploded-view":
        return <GuideSectionAnchor key={section.id} id={section.contentSectionId}><ClassicExplodedSection view={guide.explodedView!} t={t} /></GuideSectionAnchor>;
      case "assembly":
        return <GuideSectionAnchor key={section.id} id={section.contentSectionId}><ClassicAssemblySection data={viewModel.assemblyData!} showImages={settings.includeAssemblyStepImages} t={t} /></GuideSectionAnchor>;
      case "references":
        return <GuideSectionAnchor key={section.id} id={section.contentSectionId}><ClassicReferencesSection references={viewModel.includedReferences} t={t} /></GuideSectionAnchor>;
      case "parts-overview":
        return <GuideSectionAnchor key={section.id} id={section.contentSectionId}><GuidePartsPreviewSection parts={viewModel.referencedParts} locale={locale} /></GuideSectionAnchor>;
      case "painting-workflow":
        return <GuideSectionAnchor key={section.id} id={section.contentSectionId}><GuidePaintingWorkflowSection guide={viewModel.workflowGuide} locale={locale} steps={viewModel.paintingSteps} /></GuideSectionAnchor>;
      case "finishing":
        return <GuideSectionAnchor key={section.id} id={section.contentSectionId}><ClassicFinishingSection data={viewModel.finishingData!} t={t} /></GuideSectionAnchor>;
      case "troubleshooting":
        return <GuideSectionAnchor key={section.id} id={section.contentSectionId}><ClassicTroubleshootingSection data={viewModel.troubleshootingData!} t={t} /></GuideSectionAnchor>;
      case "back-cover":
        return <GuideSectionAnchor key={section.id} id={section.contentSectionId}><ClassicBackCoverSection data={viewModel.backCoverData!} /></GuideSectionAnchor>;
      default:
        return null;
    }
  });
  const paintingWorkflowIndex = viewModel.documentSections.findIndex((section) => section.id === "painting-workflow");
  const primarySectionCount = paintingWorkflowIndex < 0 ? renderedSections.length : paintingWorkflowIndex;

  return (
    <>
      <div className="space-y-6" style={{color:templateSettings?.textColor}}>
        {renderedSections.slice(0, primarySectionCount)}
      </div>
      {renderedSections.slice(primarySectionCount)}
    </>
  );
}
