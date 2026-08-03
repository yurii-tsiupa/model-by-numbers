import type { GuideViewModel } from "../lib/getGuideViewModel";
import { paginateGuideSteps } from "../lib/paginateGuideSteps";
import { prepareImageForPdf } from "../services/pdf/prepareImageForPdf";

export async function prepareGuideStepPreviewsForPdf(viewModel: GuideViewModel) {
  let hasFailures = false;
  const paintingSteps = [];
  for (const step of viewModel.paintingSteps) {
    const previews = [];
    for (const preview of step.previews) {
      if (preview.status !== "ready") {
        previews.push(preview);
        continue;
      }
      try {
        const image = await prepareImageForPdf(preview.image.src, { applyWhiteBackground: true });
        previews.push({ ...preview, image: { ...preview.image, src: image.source } });
      } catch {
        hasFailures = true;
        previews.push({
          id: preview.id,
          label: preview.label,
          status: "unavailable" as const,
          reason: "generation-failed" as const,
        });
      }
    }
    paintingSteps.push({ ...step, previews });
  }

  const finishingData = viewModel.finishingData
    ? {
        ...viewModel.finishingData,
        items: await Promise.all(viewModel.finishingData.items.map(async (item) => {
          if (!item.image) return item;
          try {
            const image = await prepareImageForPdf(item.image.src, { applyWhiteBackground: true });
            return { ...item, image: { ...item.image, src: image.source } };
          } catch {
            hasFailures = true;
            return { ...item, image: null };
          }
        })),
      }
    : null;

  return {
    viewModel: {
      ...viewModel,
      finishingData,
      paintingSteps,
      paintingPages: paginateGuideSteps(paintingSteps),
    },
    hasFailures,
  };
}
