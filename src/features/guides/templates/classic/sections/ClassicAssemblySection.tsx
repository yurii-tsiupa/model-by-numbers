/* eslint-disable @next/next/no-img-element */

import type { TranslationKey } from "@/features/i18n/locales/en";

import type { GuideAssemblyData } from "../../../types/GuideAssembly";
import { ClassicSectionHeading } from "../ClassicSectionHeading";
import { classicPreviewInlineStyles as inlineStyles, classicPreviewStyles as styles } from "../classic.styles";

type ClassicAssemblySectionProps = {
  data: GuideAssemblyData;
  showImages: boolean;
  t: (
    key: TranslationKey,
    values?: Readonly<Record<string, string | number>>,
  ) => string;
};

export function ClassicAssemblySection({
  data,
  showImages,
  t,
}: ClassicAssemblySectionProps) {
  if (data.mode === "overview") {
    return (
      <section className={styles.section}>
        <ClassicSectionHeading eyebrow={t("guide.assembly.sectionEyebrow")} title={t("guide.assembly.sectionTitle")} description={t("guide.assembly.overviewDescription")} />
        <h3 className="mt-7 font-[family-name:var(--font-display)] text-sm font-medium text-[var(--accent)]">{t("guide.assembly.modelParts")}</h3>
        <ul className="mt-2 grid border-t border-[var(--border)] sm:grid-cols-2">
          {data.parts.map((part) => <li key={part.id} className="flex min-h-10 items-center border-b border-[var(--border)] py-2 text-sm"><span className="w-10 font-[family-name:var(--font-mono)] text-xs text-[var(--accent)]">{String(part.number).padStart(2, "0")}</span><span className="text-[var(--text)]">{part.name}</span></li>)}
        </ul>
        {data.views.length ? <div className={`mt-7 grid gap-4 ${data.views.length > 1 ? "sm:grid-cols-2" : ""}`}>{data.views.map((view) => <figure key={view.id}><div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] p-3"><img src={view.image} alt={t(view.labelKey)} className="h-full w-full object-contain" /></div><figcaption className="mt-2 text-center text-xs text-[var(--text-secondary)]">{t(view.labelKey)}</figcaption></figure>)}</div> : null}
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <ClassicSectionHeading
        eyebrow={t("guide.assembly.sectionEyebrow")}
        title={t("guide.assembly.sectionTitle")}
        description={t("guide.assembly.description")}
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {data.steps.map((step) => (
          <article
            key={step.id}
            className={`${styles.card} overflow-hidden`}
            style={inlineStyles.card}
          >
            {showImages && step.image ? (
              <div className="flex aspect-[4/3] items-center justify-center border-b border-[#E3DEEC] bg-[#FAF9FC] p-4">
                <img
                  src={step.image}
                  alt={step.title}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : null}

            <div className="p-5">
              <p className="font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#76558F]">
                {t("guide.assembly.step", {
                  number: String(step.order).padStart(2, "0"),
                })}
              </p>

              <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em] text-[#181221]">
                {step.title}
              </h3>

              {step.description ? (
                <p className="mt-3 font-[family-name:var(--font-body)] text-sm leading-6 text-[#5F5866]">
                  {step.description}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                {step.parts.map((part) => (
                  <span
                    key={part.id}
                    className="inline-flex items-center rounded-full border border-[#D6CAE0] bg-[#F7F3FA] px-3 py-1.5 font-[family-name:var(--font-body)] text-xs font-medium text-[#5F5866]"
                  >
                    <span className="mr-2 font-[family-name:var(--font-mono)] text-[#76558F]">
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
