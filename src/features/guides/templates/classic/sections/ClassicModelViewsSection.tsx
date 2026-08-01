/* eslint-disable @next/next/no-img-element */

import type { TranslationKey } from "@/features/i18n/locales/en";

import type { GuideModelView } from "../../../lib/getGuideViewModel";
import { ClassicSectionHeading } from "../ClassicSectionHeading";
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

      <div className="mt-7 space-y-9">
        {views.map((view) => {
          const image = view.image;

          return (
            <article
              key={view.id}
              className="break-inside-avoid page-break-inside-avoid"
            >
              <h3 className="mb-2 font-[family-name:var(--font-display)] text-sm font-semibold tracking-[-0.01em] text-[#181221]">
                {view.caption??t(view.labelKey)}
              </h3>
              <div className="w-full">
                {image ? (
                  <img
                    src={image}
                    alt={view.caption??t(view.labelKey)}
                    className="block h-auto w-full object-contain"
                  />
                ) : (
                  <p className="py-8 text-sm text-[#716A79]">{t("pdf.missingView")}</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
