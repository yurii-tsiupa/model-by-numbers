import Image from "next/image";

import {
  formatLocalizedDate,
  translate,
} from "@/features/i18n/lib/i18n";
import type { Locale } from "@/features/i18n/types/Locale";
import { formatPaintingTime } from "@/features/model-editor/lib/paintingWorkflow";

import type { ModelGuide } from "../../../types/ModelGuide";

type GuideCoverSectionProps = {
  guide: ModelGuide;
  locale: Locale;
};

export function GuideCoverSection({
  guide,
  locale,
}: GuideCoverSectionProps) {
  const t = (
    key: Parameters<typeof translate>[1],
  ) => translate(locale, key);

  const summary = guide.paintingSummary;

  const thumbnail =
    guide.images.painted ??
    guide.images.base ??
    guide.images.original ??
    guide.images.numbers;

  const difficulty = summary?.difficulties.length
    ? summary.difficulties
        .map((value) =>
          t(`painting.difficulty.${value}`),
        )
        .join(" · ")
    : t("guide.workflow.notSpecified");

  const paintingTime =
    summary?.estimatedTimeMinutes
      ? formatPaintingTime(
          summary.estimatedTimeMinutes,
          locale,
        )
      : t("guide.workflow.notSpecified");

  return (
    <section className="guide-cover flex min-h-[38rem] flex-col justify-between overflow-hidden rounded-3xl border border-[#E3DEEC] bg-[#FAF9FC] p-6 text-[#181221] sm:p-10">
      <header>
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-[#76558F]" />

          <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-semibold uppercase tracking-[0.18em] text-[#76558F]">
            {t("guide.cover.document")}
          </p>
        </div>

        <h1 className="mt-5 max-w-3xl break-words font-[family-name:var(--font-space-grotesk)] text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-[#181221] sm:text-5xl">
          {guide.title}
        </h1>

        {summary?.modelName ? (
          <p className="mt-3 break-words font-[family-name:var(--font-inter)] text-lg text-[#716A79]">
            {summary.modelName}
          </p>
        ) : null}
      </header>

      <div className="my-10 flex min-h-0 flex-1 items-center justify-center">
        {thumbnail ? (
          <div className="flex w-full max-w-3xl items-center justify-center rounded-2xl border border-[#E3DEEC] bg-white p-6 sm:p-8">
            <Image
              src={thumbnail}
              alt={guide.title}
              width={1200}
              height={800}
              unoptimized
              className="max-h-[22rem] w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-56 w-full max-w-3xl items-center justify-center rounded-2xl border border-dashed border-[#D5CFDD] bg-white">
            <div className="space-y-2 text-center">
              <div className="mx-auto h-10 w-10 rounded-xl border border-[#E3DEEC] bg-[#FAF9FC]" />

              <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.12em] text-[#AAA2B1]">
                {t("guide.workflow.notSpecified")}
              </p>
            </div>
          </div>
        )}
      </div>

      <div>
        <p className="font-[family-name:var(--font-inter)] text-sm text-[#8A8291]">
          {t("guide.generated")}
          {" · "}
          {formatLocalizedDate(
            guide.generatedAt,
            locale,
          )}
        </p>

        <dl className="mt-5 grid gap-x-6 gap-y-4 border-t border-[#E3DEEC] pt-5 sm:grid-cols-3">
          <CoverFact
            label={t("guide.visibleParts")}
            value={String(guide.partsCount)}
          />

          <CoverFact
            label={t(
              "guide.workflow.difficulty",
            )}
            value={difficulty}
          />

          <CoverFact
            label={t(
              "guide.workflow.totalTime",
            )}
            value={paintingTime}
          />
        </dl>

        {guide.description ? (
          <p className="mt-6 max-w-3xl whitespace-pre-wrap font-[family-name:var(--font-inter)] text-sm leading-6 text-[#5F5866]">
            {guide.description}
          </p>
        ) : null}
      </div>
    </section>
  );
}

type CoverFactProps = {
  label: string;
  value: string;
};

function CoverFact({
  label,
  value,
}: CoverFactProps) {
  return (
    <div>
      <dt className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium uppercase tracking-[0.12em] text-[#8A8291]">
        {label}
      </dt>

      <dd className="mt-2 break-words font-[family-name:var(--font-inter)] text-base font-semibold text-[#312A37]">
        {value}
      </dd>
    </div>
  );
}