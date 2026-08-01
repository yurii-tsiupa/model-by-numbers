/* eslint-disable @next/next/no-img-element */

import type { TranslationKey } from "@/features/i18n/locales/en";

import type { GuideReferenceImage } from "../../../types/ModelGuide";
import { classicPreviewStyles as styles } from "../classic.styles";
import { ClassicSectionHeading } from "../ClassicSectionHeading";

type ClassicReferencesSectionProps = {
  references: readonly GuideReferenceImage[];
  t: (
    key: TranslationKey,
    values?: Readonly<Record<string, string | number>>,
  ) => string;
};

export function ClassicReferencesSection({
  references,
  t,
}: ClassicReferencesSectionProps) {
  return (
    <section className={styles.section}>
      <ClassicSectionHeading
        eyebrow={t("guide.source")}
        title={t("guide.references")}
        description={t("guide.referencesDescription")}
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {references.map((reference, index) => (
          <article
            key={reference.id}
            className={`${styles.card} overflow-hidden ${references.length === 1 || (references.length === 3 && index === 0) ? "sm:col-span-2" : ""}`}
          >
            <div className="flex aspect-[4/3] items-center justify-center bg-[#FAF9FC] p-4">
              <img
                src={reference.dataUrl}
                alt={reference.caption?.trim() || t("guide.references")}
                className="h-full w-full object-contain"
              />
            </div>

            {reference.caption?.trim() ? <div className="border-t border-[#E3DEEC] p-4">
              <p className="break-words font-[family-name:var(--font-body)] text-sm font-medium leading-6 text-[#312A37]">
                {reference.caption.trim()}
              </p>
            </div> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
