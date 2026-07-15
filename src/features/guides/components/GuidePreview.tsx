import { ImageIcon } from "lucide-react";

import type { ModelGuide } from "../types/ModelGuide";
import { GuidePaletteSection } from "./GuidePaletteSection";
import { GuidePartsSection } from "./GuidePartsSection";
import { GuidePreviewHeader } from "./GuidePreviewHeader";
import { GuideProjectOverview } from "./GuideProjectOverview";

type GuidePreviewProps = {
  guide: ModelGuide;
};

const modelViewLabels = [
  "Original",
  "Base",
  "Painted",
  "Numbers",
];

export function GuidePreview({ guide }: GuidePreviewProps) {
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
          <p className="mt-2 text-sm text-neutral-500">
            Model views will appear here after capture.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {modelViewLabels.map((label) => (
              <div
                key={label}
                aria-disabled="true"
                className="flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.015] text-neutral-600"
              >
                <ImageIcon className="h-6 w-6" />
                <p className="mt-3 text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <GuidePaletteSection palette={guide.palette} />
        <GuidePartsSection parts={guide.parts} />
      </div>
    </main>
  );
}
