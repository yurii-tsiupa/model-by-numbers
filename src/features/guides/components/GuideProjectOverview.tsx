import {
  formatLocalizedDate,
  translate,
} from "@/features/i18n/lib/i18n";
import type { Locale } from "@/features/i18n/types/Locale";

import type { GuideViewModel } from "../lib/getGuideViewModel";

type GuideProjectOverviewProps = {
  viewModel: GuideViewModel;
  locale: Locale;
};

function formatLabel(value: string): string {
  return value.replaceAll("-", " ").toUpperCase();
}

export function GuideProjectOverview({
  viewModel,
  locale,
}: GuideProjectOverviewProps) {
  const { guide, metrics, targetMode } = viewModel;
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
      value: [guide.printerType, guide.material]
        .filter(Boolean)
        .map(formatLabel)
        .join(" · "),
    },
    {
      label: t("guide.metrics.steps"),
      value: String(metrics.stepCount),
    },
    {
      label: t("guide.usedColors"),
      value: String(metrics.usedColorCount),
    },
    {
      label: t(targetMode === "markers" ? "guide.metrics.paintingTargets" : targetMode === "region" ? "guide.metrics.paintedAreas" : "guide.metrics.modelParts"),
      value: String(metrics.targetCount),
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

        <p className="font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.18em] text-[#76558F]">
          {t("guide.classic")}
        </p>
      </div>

      <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.04em] text-[#181221] sm:text-4xl">
        {t("guide.overview")}
      </h2>

      {guide.description ? (
        <p className="mt-5 max-w-3xl whitespace-pre-wrap font-[family-name:var(--font-body)] text-base leading-7 text-[#5F5866]">
          {guide.description}
        </p>
      ) : null}

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="rounded-2xl border border-[#E3DEEC] bg-white p-4"
          >
            <dt className="font-[family-name:var(--font-mono)] text-[10px] font-medium uppercase tracking-[0.12em] text-[#8A8291]">
              {detail.label}
            </dt>

            <dd className="mt-2 break-words font-[family-name:var(--font-body)] text-sm font-semibold leading-6 text-[#312A37]">
              {detail.value}
            </dd>
          </div>
        ))}

        <div className="rounded-2xl border border-[#E3DEEC] bg-white p-4">
          <dt className="font-[family-name:var(--font-mono)] text-[10px] font-medium uppercase tracking-[0.12em] text-[#8A8291]">
            {t("guide.baseColor")}
          </dt>

          <dd className="mt-2 flex items-center gap-3">
            <span
              className="h-6 w-6 rounded-lg border border-[#D5CFDD]"
              style={{
                backgroundColor: guide.baseColor,
              }}
            />

            <span className="font-[family-name:var(--font-mono)] text-xs font-semibold tracking-[0.08em] text-[#312A37]">
              {guide.baseColor.toUpperCase()}
            </span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
