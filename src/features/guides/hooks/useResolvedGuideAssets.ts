import { useEffect, useState } from "react";

import { getCachedStepPreview, setCachedStepPreview } from "@/features/model-editor/step-previews/cache";
import { STEP_PREVIEW_HEIGHT, STEP_PREVIEW_WIDTH } from "@/features/model-editor/step-previews/constants";
import { getStepPreviewCacheKey } from "@/features/model-editor/step-previews/getStepPreviewCacheKey";
import { configureStepPreviewSource, requestStepPreview } from "@/features/model-editor/step-previews/stepPreviewService";
import type { Project } from "@/features/models/types/Project";

import { createGuideObjectUrl } from "../services/assets/createGuideObjectUrl";
import { loadGuideAsset } from "../services/assets/loadGuideAsset";
import { imageSourceToBlob, saveGuideAsset } from "../services/assets/saveGuideAsset";
import type { ModelGuide } from "../types/ModelGuide";

export function useResolvedGuideAssets(guide: ModelGuide, project?: Project): ModelGuide {
  const [resolved, setResolved] = useState(guide);

  useEffect(() => {
    let active = true;
    const ownedUrls: Array<{ revoke: () => void }> = [];

    async function resolve(): Promise<void> {
      if (project) configureStepPreviewSource(project.id, { userId: project.userId, modelFormat: project.modelFormat, modelVersion: `${project.originalFileSize}:${project.updatedAt.getTime()}`, baseColor: project.baseColor });
      const loaded = await Promise.all((guide.assetReferences ?? []).map(async reference => {
        try {
          const blob = await loadGuideAsset(reference);
          if (!blob || !active) return null;
          const owner = createGuideObjectUrl(blob);
          return { reference, url: owner.url, owner };
        } catch {
          return null;
        }
      }));
      if (!active) return;
      const found = loaded.filter((item): item is NonNullable<typeof item> => item !== null);
      const workflowParts = guide.workflowParts ?? guide.parts;
      const details = guide.manualDetails ?? [];
      const palette = guide.previewPalette ?? guide.workflowPalette ?? guide.palette;

      for (const item of found) {
        if (item.reference.kind !== "step-preview") {
          ownedUrls.push(item.owner);
          continue;
        }
        const [stageId,shotId] = item.reference.assetId.split(":");
        const stage = workflowParts.flatMap(part => part.paintingWorkflow?.stages ?? []).find(candidate => candidate.id === stageId);
        if (!stage) { ownedUrls.push(item.owner); continue; }
        if(!shotId&&stage.overviewPreviewEnabled===false){ownedUrls.push(item.owner);continue;}
        const shot=shotId?stage.previewShots?.find(candidate=>candidate.id===shotId):undefined;
        const cacheKey = getStepPreviewCacheKey(guide.projectId, stage, workflowParts, details, palette,shot);
        if (item.reference.contentKey !== cacheKey) { ownedUrls.push(item.owner); continue; }
        setCachedStepPreview(cacheKey, {
          stepId: stage.id,
          imageUrl: item.url,
          width: STEP_PREVIEW_WIDTH,
          height: STEP_PREVIEW_HEIGHT,
          generatedAt: Date.now(),
          cacheKey,
          framing: { cameraPosition: { x: 0, y: 0, z: 0 }, target: { x: 0, y: 0, z: 0 }, up: { x: 0, y: 1, z: 0 }, targetRadius: 0 },
        });
      }

      if (project) {
        const stages = project.parts.flatMap(part => part.paintingWorkflow?.stages ?? []).filter(stage => stage.targetReferences?.length);
        for (const stage of stages) { for(const shot of [...(stage.overviewPreviewEnabled!==false?[undefined]:[]),...(stage.previewShots??[])]){
          if (!active) return;
          const cacheKey = getStepPreviewCacheKey(project.id, stage, project.parts, project.manualDetails, project.palette,shot);
          if (getCachedStepPreview(cacheKey)) continue;
          try {
            const preview = await requestStepPreview({
              projectId: project.id,
              userId: project.userId,
              modelFormat: project.modelFormat,
              modelVersion: `${project.originalFileSize}:${project.updatedAt.getTime()}`,
              baseColor: project.baseColor,
              step: stage,
              parts: project.parts,
              manualDetails: project.manualDetails,
              palette: project.palette,
              cacheKey,
              shot,
            });
            await saveGuideAsset({ projectId: project.id, kind: "step-preview", assetId: shot?`${stage.id}:${shot.id}`:stage.id, contentKey: cacheKey, blob: await imageSourceToBlob(preview.imageUrl) });
          } catch (error) {
            if (process.env.NODE_ENV === "development") console.warn("Guide step preview unavailable", { projectId: project.id, stepId: stage.id, error });
          }
        }}
      }

      if (!active) return;
      const byKind = new Map(found.map(item => [`${item.reference.kind}:${item.reference.assetId}`, item.url]));
      setResolved({
        ...guide,
        images: {
          original: byKind.get("model-original:current") ?? guide.images.original,
          base: byKind.get("model-base:current") ?? guide.images.base,
          painted: byKind.get("model-painted:current") ?? guide.images.painted,
          numbers: byKind.get("model-numbers:current") ?? guide.images.numbers,
        },
        explodedView: guide.explodedView ? { ...guide.explodedView, image: byKind.get("exploded:current") ?? guide.explodedView.image } : guide.explodedView,
        assemblySteps: guide.assemblySteps?.map(step => ({ ...step, image: byKind.get(`assembly:${step.id}`) ?? step.image })),
      });
    }

    void resolve();
    return () => { active = false; ownedUrls.forEach(owner => owner.revoke()); };
  }, [guide, project]);

  return resolved;
}
