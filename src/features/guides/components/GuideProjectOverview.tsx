import type { ModelGuide } from "../types/ModelGuide";
import type { Locale } from "@/features/i18n/types/Locale";
import { formatLocalizedDate,translate } from "@/features/i18n/lib/i18n";

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
  const t=(key:Parameters<typeof translate>[1])=>translate(locale,key);
  const details = [
    { label: t("guide.author"), value: guide.author },
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
      value: formatLocalizedDate(guide.generatedAt,locale),
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-orange-400/[0.09] via-white/[0.035] to-transparent p-6 shadow-2xl shadow-black/30 sm:p-10">
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl"/>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">{t("guide.classic")}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t("guide.overview")}</h2>

      {guide.description ? (
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-400">
          {guide.description}
        </p>
      ) : null}

      <dl className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="rounded-2xl border border-white/[0.08] bg-neutral-950/60 p-4 shadow-lg shadow-black/10"
          >
            <dt className="text-xs uppercase tracking-wider text-neutral-600">
              {detail.label}
            </dt>
            <dd className="mt-2 text-sm font-medium text-neutral-200">
              {detail.value}
            </dd>
          </div>
        ))}

        <div className="rounded-2xl border border-white/[0.07] bg-neutral-950/50 p-4">
          <dt className="text-xs uppercase tracking-wider text-neutral-600">
            {t("guide.baseColor")}
          </dt>
          <dd className="mt-2 flex items-center gap-2 text-sm font-medium text-neutral-200">
            <span
              className="h-5 w-5 rounded-md border border-white/20"
              style={{ backgroundColor: guide.baseColor }}
            />
            {guide.baseColor.toUpperCase()}
          </dd>
        </div>
      </dl>
    </section>
  );
}
