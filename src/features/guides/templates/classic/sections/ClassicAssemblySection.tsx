/* eslint-disable @next/next/no-img-element */

import type { TranslationKey } from "@/features/i18n/locales/en";

import type { GuideAssemblyStep } from "../../../types/ModelGuide";
import { ClassicSectionHeading } from "../ClassicSectionHeading";
import { classicPreviewStyles as styles } from "../classic.styles";

type ClassicAssemblySectionProps = {
  steps: readonly GuideAssemblyStep[];
  showImages: boolean;
  t: (
    key: TranslationKey,
    values?: Readonly<Record<string, string | number>>,
  ) => string;
};

export function ClassicAssemblySection({
  steps,
  showImages,
  t,
}: ClassicAssemblySectionProps) {
  return (
    <section className={styles.section}>
      <ClassicSectionHeading
        eyebrow={t("guide.assembly.eyebrow")}
        title={t("guide.assembly.title")}
        description={t("guide.assembly.description")}
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {steps.map((step) => (
          <article
            key={step.id}
            className={`${styles.card} overflow-hidden`}
          >
            {showImages ? (
              <div className="flex aspect-[4/3] items-center justify-center border-b border-[#E3DEEC] bg-[#FAF9FC] p-4">
                {step.image ? (
                  <img
                    src={step.image}
                    alt={step.title}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <p className="font-[family-name:var(--font-inter)] text-sm text-[#716A79]">
                    {t("guide.assembly.imageMissing")}
                  </p>
                )}
              </div>
            ) : null}

            <div className="p-5">
              <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#76558F]">
                {t("guide.assembly.step", {
                  number: String(step.order).padStart(2, "0"),
                })}
              </p>

              <h3 className="mt-2 font-[family-name:var(--font-space-grotesk)] text-lg font-semibold tracking-[-0.02em] text-[#181221]">
                {step.title}
              </h3>

              {step.description ? (
                <p className="mt-3 font-[family-name:var(--font-inter)] text-sm leading-6 text-[#5F5866]">
                  {step.description}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                {step.parts.map((part) => (
                  <span
                    key={part.id}
                    className="inline-flex items-center rounded-full border border-[#D6CAE0] bg-[#F7F3FA] px-3 py-1.5 font-[family-name:var(--font-inter)] text-xs font-medium text-[#5F5866]"
                  >
                    <span className="mr-2 font-[family-name:var(--font-jetbrains-mono)] text-[#76558F]">
                      {String(part.number).padStart(2, "0")}
                    </span>

                    <span>{part.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}