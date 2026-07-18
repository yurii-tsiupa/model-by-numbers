import type { PaintMarker } from "@/features/models/types/PaintMarker";
import type { ModelPart } from "../types/ModelPart";
import type { PaintingStage, PaintingTargetReference } from "../types/PaintingWorkflow";

export function resolvePaintingTargetReferences(references: readonly PaintingTargetReference[] | undefined, parts: readonly ModelPart[], markers: readonly PaintMarker[]) {
  const partById = new Map(parts.map((part) => [part.id, part]));
  const markerById = new Map(markers.map((marker) => [marker.id, marker]));
  const resolvedParts: ModelPart[] = [], resolvedMarkers: PaintMarker[] = [], missingReferences: PaintingTargetReference[] = [];
  for (const reference of references ?? []) { const target = reference.type === "part" ? partById.get(reference.id) : markerById.get(reference.id); if (!target) missingReferences.push(reference); else if (reference.type === "part") resolvedParts.push(target as ModelPart); else resolvedMarkers.push(target as PaintMarker); }
  return { parts: resolvedParts, markers: resolvedMarkers, missingReferences };
}

export function getPaintingStepTargetSummary(stage: PaintingStage, parts: readonly ModelPart[], markers: readonly PaintMarker[]) {
  const resolved = resolvePaintingTargetReferences(stage.targetReferences, parts, markers);
  return { partCount: resolved.parts.length, markerCount: resolved.markers.length, isGeneral: (stage.targetReferences?.length ?? 0) === 0, missingCount: resolved.missingReferences.length };
}

export function getStepsReferencingMarker(parts: readonly ModelPart[], markerId: string): PaintingStage[] { return parts.flatMap((part) => part.paintingWorkflow.stages).filter((stage) => stage.targetReferences?.some((reference) => reference.type === "marker" && reference.id === markerId)); }
