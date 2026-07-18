import {
  formatLocalizedDate,
  translate,
} from "@/features/i18n/lib/i18n";
import type { Locale } from "@/features/i18n/types/Locale";

import type { ModelGuide } from "../types/ModelGuide";

type GuideProjectOverviewProps = {
  guide: ModelGuide;
  locale: Locale;
};

function formatLabel(value: string): string {
  return value.replaceAll("-", " ").toUpperCase();
}

export function GuideProjectOverview({
  guide,
  locale,
}: GuideProjectOverviewProps) {
  const t = (
    key: Parameters<typeof translate>[1],
  ) => translate(locale, key);

  const details = [
    {
      label: t("guide.author"),
      value: guide.author,
    },
    {
      label: t("guide.printer"),
      value: formatLabel(guide.printerType),
    },
    {
      label: t("guide.material"),
      value: formatLabel(guide.material),
    },
    {
      label: t("guide.visibleParts"),
      value: String(guide.partsCount),
    },
    {
      label: t("guide.usedColors"),
      value: String(guide.colorsCount),
    },
    {
      label: t("guide.generated"),
      value: formatLocalizedDate(
        guide.generatedAt,
        locale,
      ),
    },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="flex items-center gap-3">
        <span className="h-px w-10 bg-[#76558F]" />

        <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-semibold uppercase tracking-[0.18em] text-[#76558F]">
          {t("guide.classic")}
        </p>
      </div>

      <h2 className="mt-5 font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-[-0.04em] text-[#181221] sm:text-4xl">
        {t("guide.overview")}
      </h2>

      {guide.description ? (
        <p className="mt-5 max-w-3xl whitespace-pre-wrap font-[family-name:var(--font-inter)] text-base leading-7 text-[#5F5866]">
          {guide.description}
        </p>
      ) : null}

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="rounded-2xl border border-[#E3DEEC] bg-white p-4"
          >
            <dt className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium uppercase tracking-[0.12em] text-[#8A8291]">
              {detail.label}
            </dt>

            <dd className="mt-2 break-words font-[family-name:var(--font-inter)] text-sm font-semibold leading-6 text-[#312A37]">
              {detail.value}
            </dd>
          </div>
        ))}

        <div className="rounded-2xl border border-[#E3DEEC] bg-white p-4">
          <dt className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium uppercase tracking-[0.12em] text-[#8A8291]">
            {t("guide.baseColor")}
          </dt>

          <dd className="mt-2 flex items-center gap-3">
            <span
              className="h-6 w-6 rounded-lg border border-[#D5CFDD]"
              style={{
                backgroundColor: guide.baseColor,
              }}
            />

            <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs font-semibold tracking-[0.08em] text-[#312A37]">
              {guide.baseColor.toUpperCase()}
            </span>
          </dd>
        </div>
      </dl>
    </section>
  );
}