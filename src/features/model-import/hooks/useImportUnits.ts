"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Object3D } from "three";
import { calculateModelSourceDimensions, convertModelDimensions } from "../lib/modelDimensions";
import type { ImportTransform } from "../types/ImportTransform";
import type { ModelAnalysis } from "../types/ModelAnalysis";
import type { ModelDimensions, ModelUnits } from "../types/ModelUnits";

export function useImportUnits(analysis: ModelAnalysis | null, scene: Object3D | null, transform: ImportTransform, includedMeshUuids: ReadonlySet<string>) {
  const [sourceUnit, setSourceUnit] = useState<ModelUnits | null>(null);
  const [displayUnit, setDisplayUnit] = useState<ModelUnits | null>(null);
  const analysisRef = useRef<ModelAnalysis | null>(null);
  useEffect(() => {
    if (!analysis || analysisRef.current === analysis) return;
    analysisRef.current = analysis;
    const initial = analysis.format === "stl" ? null : "mm";
    setSourceUnit(initial); setDisplayUnit(initial);
  }, [analysis]);
  const originalDimensions = useMemo<ModelDimensions | null>(() => scene ? calculateModelSourceDimensions(scene, transform.rotation, includedMeshUuids) : null, [includedMeshUuids, scene, transform.rotation]);
  const displayDimensions = useMemo(() => originalDimensions && sourceUnit && displayUnit ? convertModelDimensions(originalDimensions, sourceUnit, displayUnit) : originalDimensions, [displayUnit, originalDimensions, sourceUnit]);
  const warning = useMemo<"small" | "large" | null>(() => {
    if (!sourceUnit || !originalDimensions) return null;
    const millimeters = convertModelDimensions(originalDimensions, sourceUnit, "mm");
    const largest = Math.max(millimeters.width, millimeters.height, millimeters.depth);
    return largest < 1 ? "small" : largest > 500 ? "large" : null;
  }, [sourceUnit, originalDimensions]);
  const selectUnit = useCallback((value: ModelUnits) => { if (!sourceUnit) setSourceUnit(value); setDisplayUnit(value); }, [sourceUnit]);
  const reset = useCallback(() => { analysisRef.current = null; setSourceUnit(null); setDisplayUnit(null); }, []);
  return { modelUnits: sourceUnit, selectedUnits: displayUnit, selectUnit, originalDimensions, displayDimensions, warning, reset };
}
