/* eslint-disable @next/next/no-img-element */

import type { TranslationKey } from "@/features/i18n/locales/en";

import type { GuideExplodedView } from "../../../types/ModelGuide";
import { ClassicSectionHeading } from "../ClassicSectionHeading";
import { classicPreviewStyles as styles } from "../classic.styles";

type ClassicExplodedSectionProps = {
  view: GuideExplodedView;
  t: (
    key: TranslationKey,
    values?: Readonly<Record<string, string | number>>,
  ) => string;
};

export function ClassicExplodedSection({
  view,
  t,
}: ClassicExplodedSectionProps) {
  return (
    <section className={styles.section}>
      <ClassicSectionHeading
        eyebrow={t("guide.visual")}
        title={t("guide.exploded.title")}
        description={t("guide.exploded.description")}
      />

      <div className="mt-8 overflow-hidden rounded-2xl border border-[#E3DEEC] bg-white">
        <div className="flex aspect-[4/3] items-center justify-center border-b border-[#E3DEEC] bg-[#FAF9FC] p-5">
          {view.image ? (
            <img
              src={view.image}
              alt={t("guide.exploded.title")}
              className="h-full w-full object-contain"
            />
          ) : (
            <p className="font-[family-name:var(--font-inter)] text-sm text-[#716A79]">
              {t("guide.exploded.imageMissing")}
            </p>
          )}
        </div>

        <div className="p-4">
          <p className="font-[family-name:var(--font-inter)] text-sm text-[#716A79]">
            {t("guide.exploded.partsCount", {
              count: view.partsCount,
            })}
          </p>
        </div>
      </div>
    </section>
  );
}