import { translate } from "@/features/i18n/lib/i18n";

import { GuidePalettePreviewSection } from "../../components/GuidePreview/sections/GuidePalettePreviewSection";
import { GuidePartsPreviewSection } from "../../components/GuidePreview/sections/GuidePartsPreviewSection";
import { GuideProjectSection } from "../../components/GuidePreview/sections/GuideProjectSection";
import { GuideCoverSection } from "../../components/GuidePreview/sections/GuideCoverSection";
import { GuideSectionAnchor } from "../../components/GuideSectionAnchor";
import { getGuideViewModel } from "../../lib/getGuideViewModel";
import type { ModelGuide } from "../../types/ModelGuide";
import { ClassicAssemblySection } from "./sections/ClassicAssemblySection";
import { ClassicExplodedSection } from "./sections/ClassicExplodedSection";
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
  const viewModel = getGuideViewModel(guide);

  const {
    locale,
    settings,
    modelViews,
  } = viewModel;

  const t = (
    key: Parameters<typeof translate>[1],
    values?: Parameters<typeof translate>[2],
  ) => translate(locale, key, values);

  const assemblySteps = guide.assemblySteps ?? [];
  const references = viewModel.includedReferences;

  return (
    <div className="space-y-6" style={{color:templateSettings?.textColor}}>
      <GuideCoverSection
        viewModel={viewModel}
        locale={locale}
      />

      <GuideSectionAnchor id="project-overview">
        <GuideProjectSection
          viewModel={viewModel}
          locale={locale}
        />
      </GuideSectionAnchor>

      {viewModel.usedPalette.length > 0 ? (
        <GuideSectionAnchor id="palette">
          <GuidePalettePreviewSection
            palette={viewModel.usedPalette}
            locale={locale}
          />
        </GuideSectionAnchor>
      ) : null}

      {modelViews.length > 0 ? (
        <GuideSectionAnchor id="model-views">
          <ClassicModelViewsSection
            views={modelViews}
            t={t}
          />
        </GuideSectionAnchor>
      ) : null}

      {settings.includeExplodedView &&
      guide.explodedView ? (
        <GuideSectionAnchor id="exploded-view">
          <ClassicExplodedSection
            view={guide.explodedView}
            t={t}
          />
        </GuideSectionAnchor>
      ) : null}

      {settings.includeAssemblyInstructions &&
      assemblySteps.length > 0 ? (
        <GuideSectionAnchor id="assembly">
          <ClassicAssemblySection
            steps={assemblySteps}
            showImages={
              settings.includeAssemblyStepImages
            }
            t={t}
          />
        </GuideSectionAnchor>
      ) : null}

      {references.length > 0 ? (
        <GuideSectionAnchor id="references">
          <ClassicReferencesSection
            references={references}
            t={t}
          />
        </GuideSectionAnchor>
      ) : null}

      {viewModel.sections.some((section) => section.id === "parts-overview") ? (
        <GuideSectionAnchor id="parts-overview">
          <GuidePartsPreviewSection
            parts={viewModel.referencedParts}
            locale={locale}
          />
        </GuideSectionAnchor>
      ) : null}
    </div>
  );
}
