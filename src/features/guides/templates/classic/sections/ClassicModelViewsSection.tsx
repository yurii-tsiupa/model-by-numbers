/* eslint-disable @next/next/no-img-element */

import type { TranslationKey } from "@/features/i18n/locales/en";

import type { GuideModelView } from "../../../lib/getGuideViewModel";
import { ClassicSectionHeading } from "../ClassicSectionHeading";
import { defaultGuideDesignTokens as tokens } from "../../../design/guideDesignTokens";
import { classicPreviewStyles as styles } from "../classic.styles";

type ClassicModelViewsSectionProps = {
  views: readonly GuideModelView[];
  t: (
    key: TranslationKey,
    values?: Readonly<Record<string, string | number>>,
  ) => string;
};

export function ClassicModelViewsSection({
  views,
  t,
}: ClassicModelViewsSectionProps) {
  return (
    <section className={styles.section}>
      <ClassicSectionHeading
        eyebrow={t("guide.visual")}
        title={t("guide.modelOverview")}
        description={t("guide.modelOverviewDescription")}
      />

      <div
        className="flex flex-col"
        style={{
          gap: tokens.spacingLg,
          marginTop: tokens.spacingLg,
        }}
      >
        {views.map((view) => {
          const image = view.image;

          return (
            <article
              key={view.id}
              className="break-inside-avoid page-break-inside-avoid"
            >
              <h3
                className="font-semibold tracking-[-0.01em]"
                style={{
                  color: tokens.inkPrimary,
                  fontFamily: tokens.bodyFont,
                  fontSize: tokens.sizeBody,
                  marginBottom: tokens.spacingXs,
                }}
              >
                {view.caption??t(view.labelKey)}
              </h3>
              {image ? (
                <img
                  src={image}
                  alt={view.caption??t(view.labelKey)}
                  className="block h-auto w-full object-contain"
                />
              ) : (
                <p
                  style={{
                    color: tokens.inkMuted,
                    fontSize: tokens.sizeBody,
                    paddingBlock: tokens.spacingLg,
                  }}
                >
                  {t("pdf.missingView")}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
