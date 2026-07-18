/* eslint-disable @next/next/no-img-element */

import { ImageIcon } from "lucide-react";

import type { TranslationKey } from "@/features/i18n/locales/en";

import type { GuideModelView } from "../../../lib/getGuideViewModel";
import type { ModelGuide } from "../../../types/ModelGuide";
import { ClassicSectionHeading } from "../ClassicSectionHeading";
import { classicPreviewStyles as styles } from "../classic.styles";

type ClassicModelViewsSectionProps = {
  guide: ModelGuide;
  views: readonly GuideModelView[];
  t: (
    key: TranslationKey,
    values?: Readonly<Record<string, string | number>>,
  ) => string;
};

export function ClassicModelViewsSection({
  guide,
  views,
  t,
}: ClassicModelViewsSectionProps) {
  return (
    <section className={styles.section}>
      <ClassicSectionHeading
        eyebrow={t("guide.visual")}
        title={t("guide.modelViews")}
        description={t("guide.modelViewsDescription")}
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {views.map((view) => {
          const image = guide.images[view.key];

          return (
            <article
              key={view.key}
              className={`${styles.card} overflow-hidden`}
            >
              <div className="flex aspect-[4/3] items-center justify-center border-b border-[#E3DEEC] bg-[#FAF9FC] p-4">
                {image ? (
                  <img
                    src={image}
                    alt={t(view.labelKey)}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#AAA2B1]">
                    <ImageIcon
                      className="h-7 w-7"
                      strokeWidth={1.6}
                    />

                    <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.12em]">
                      No Preview
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-base font-semibold tracking-[-0.02em] text-[#181221]">
                  {t(view.labelKey)}
                </h3>

                <p className="mt-2 font-[family-name:var(--font-inter)] text-sm leading-6 text-[#716A79]">
                  {t(view.captionKey)}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}