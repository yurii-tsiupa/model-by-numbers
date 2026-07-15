import { ImageIcon } from "lucide-react";

import type { ModelGuide } from "../types/ModelGuide";
import type { GuideImages } from "../types/ModelGuide";
import { GuidePaletteSection } from "./GuidePaletteSection";
import { GuidePartsSection } from "./GuidePartsSection";
import { GuidePreviewHeader } from "./GuidePreviewHeader";
import { GuideProjectOverview } from "./GuideProjectOverview";

type GuidePreviewProps = {
  guide: ModelGuide;
};

const modelViews: Array<{
  key: keyof GuideImages;
  label: string;
  alt: string;
}> = [
  {
    key: "original",
    label: "Original Model",
    alt: "Original model view",
  },
  {
    key: "base",
    label: "Base Model",
    alt: "Base-coated model view",
  },
  {
    key: "painted",
    label: "Painted Model",
    alt: "Painted model view",
  },
  {
    key: "numbers",
    label: "Numbered Model",
    alt: "Numbered model painting view",
  },
];

export function GuidePreview({ guide }: GuidePreviewProps) {
  const hasMissingModelViews = modelViews.some(
    ({ key }) => !guide.images[key],
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <GuidePreviewHeader
        projectId={guide.projectId}
        title={guide.title}
      />

      <div className="mx-auto max-w-7xl space-y-12 px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
        <GuideProjectOverview guide={guide} />

        <section>
          <h2 className="text-2xl font-semibold text-white">
            Model views
          </h2>
          {hasMissingModelViews ? (
            <p className="mt-2 text-sm text-amber-300/80">
              Model views were not captured. Return to the editor to
              generate them.
            </p>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {modelViews.map(({ key, label, alt }) => {
              const image = guide.images[key];

              return (
                <article
                  key={key}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900"
                >
                  {image ? (
                    <div className="flex aspect-[4/3] items-center justify-center bg-neutral-900">
                      {/* Data URLs are temporary client-side captures. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt={alt}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div
                      aria-disabled="true"
                      className="flex aspect-[4/3] flex-col items-center justify-center border-b border-dashed border-white/10 bg-white/[0.015] text-neutral-600"
                    >
                      <ImageIcon className="h-6 w-6" />
                      <p className="mt-3 text-xs">Not captured</p>
                    </div>
                  )}
                  <h3 className="px-4 py-3 text-sm font-medium text-neutral-300">
                    {label}
                  </h3>
                </article>
              );
            })}
          </div>
        </section>

        <GuidePaletteSection palette={guide.palette} />
        <GuidePartsSection parts={guide.parts} />
      </div>
    </main>
  );
}
