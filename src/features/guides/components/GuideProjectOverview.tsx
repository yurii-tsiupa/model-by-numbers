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
    <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-white">
        Project overview
      </h2>

      {guide.description ? (
        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
          {guide.description}
        </p>
      ) : null}

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="rounded-2xl border border-white/[0.07] bg-neutral-950/50 p-4"
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
