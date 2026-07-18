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

type ClassicGuidePreviewProps = {
  guide: ModelGuide;
};

export function ClassicGuidePreview({
  guide,
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
  const references = guide.references ?? [];

  return (
    <div className="space-y-16 px-5 py-6 sm:px-10 sm:py-10">
      <GuideCoverSection
        guide={guide}
        locale={locale}
      />

      <GuideSectionAnchor id="project-overview">
        <GuideProjectSection
          guide={guide}
          locale={locale}
        />
      </GuideSectionAnchor>

      {modelViews.length > 0 ? (
        <GuideSectionAnchor id="model-views">
          <ClassicModelViewsSection
            guide={guide}
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

      <GuideSectionAnchor id="palette">
        <GuidePalettePreviewSection
          palette={guide.palette}
          locale={locale}
        />
      </GuideSectionAnchor>

      {settings.includePartsTable ? (
        <GuideSectionAnchor id="parts-overview">
          <GuidePartsPreviewSection
            parts={guide.parts}
            locale={locale}
          />
        </GuideSectionAnchor>
      ) : null}
    </div>
  );
}