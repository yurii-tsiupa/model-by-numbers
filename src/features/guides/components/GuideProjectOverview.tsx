import type { ModelGuide } from "../types/ModelGuide";

type GuideProjectOverviewProps = {
  guide: ModelGuide;
};

function formatLabel(value: string): string {
  return value.replaceAll("-", " ").toUpperCase();
}

export function GuideProjectOverview({
  guide,
}: GuideProjectOverviewProps) {
  const details = [
    { label: "Author", value: guide.author },
    {
      label: "Printer type",
      value: formatLabel(guide.printerType),
    },
    {
      label: "Material",
      value: formatLabel(guide.material),
    },
    {
      label: "Visible parts",
      value: String(guide.partsCount),
    },
    {
      label: "Used colors",
      value: String(guide.colorsCount),
    },
    {
      label: "Generated",
      value: guide.generatedAt.toLocaleDateString(),
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-orange-400/[0.09] via-white/[0.035] to-transparent p-6 shadow-2xl shadow-black/30 sm:p-10">
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl"/>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">Classic painting guide</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Project overview</h2>

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
            Base color
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
