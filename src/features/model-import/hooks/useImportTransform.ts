"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getImportTransformBounds } from "../lib/getImportTransformBounds";
import { DEFAULT_IMPORT_TRANSFORM, type ImportTransform, type Vector3Tuple } from "../types/ImportTransform";
import type { ModelAnalysis } from "../types/ModelAnalysis";
import type { OrientationSuggestion } from "../types/OrientationSuggestion";

const QUARTER = Math.PI / 2;
const DEFAULT_SIZE = 4;

export function useImportTransform(analysis: ModelAnalysis | null, suggestion: OrientationSuggestion | null) {
  const [transform, setTransform] = useState<ImportTransform>(DEFAULT_IMPORT_TRANSFORM);
  const [hasManualOrientationOverride, setManualOrientationOverride] = useState(false);
  const appliedSuggestionRef = useRef<OrientationSuggestion | null>(null);
  const bounds = useMemo(() => analysis ? getImportTransformBounds(analysis, transform) : null, [analysis, transform]);

  useEffect(() => {
    if (!suggestion || appliedSuggestionRef.current === suggestion) return;
    appliedSuggestionRef.current = suggestion;
    setManualOrientationOverride(false);
    const shouldApply = suggestion.confidence !== "low";
    setTransform((current) => ({
      ...current,
      rotation: shouldApply ? [suggestion.rotation.x, suggestion.rotation.y, suggestion.rotation.z] : [0, 0, 0],
    }));
  }, [suggestion]);

  const resetSession = useCallback(() => {
    appliedSuggestionRef.current = null;
    setManualOrientationOverride(false);
    setTransform(DEFAULT_IMPORT_TRANSFORM);
  }, []);
  const markManual = useCallback(() => setManualOrientationOverride(true), []);
  const reset = useCallback(() => { markManual(); setTransform(DEFAULT_IMPORT_TRANSFORM); }, [markManual]);
  const resetRotation = useCallback(() => { markManual(); setTransform((current) => ({ ...current, rotation: [0, 0, 0] })); }, [markManual]);
  const resetSuggestedOrientation = resetRotation;
  const rotate = useCallback((axis: 0 | 1 | 2, direction: -1 | 1) => {
    markManual();
    setTransform((current) => {
      const rotation = [...current.rotation] as Vector3Tuple;
      rotation[axis] += direction * QUARTER;
      return { ...current, rotation };
    });
  }, [markManual]);
  const setView = useCallback((rotation: Vector3Tuple) => {
    markManual();
    setTransform((current) => ({ ...current, rotation }));
  }, [markManual]);
  const autoCenter = useCallback(() => {
    if (!analysis) return;
    setTransform((current) => {
      const currentBounds = getImportTransformBounds(analysis, { ...current, centerOffset: [0, 0, 0] });
      return { ...current, centerOffset: currentBounds.center.map((value) => -value) as Vector3Tuple };
    });
  }, [analysis]);
  const autoNormalize = useCallback(() => {
    if (!analysis) return;
    setTransform((current) => {
      const unscaled = getImportTransformBounds(analysis, { ...current, scale: 1, centerOffset: [0, 0, 0] });
      const largest = Math.max(unscaled.width, unscaled.height, unscaled.depth);
      const scale = Number.isFinite(largest) && largest > 0 ? DEFAULT_SIZE / largest : 1;
      const scaled = getImportTransformBounds(analysis, { ...current, scale, centerOffset: [0, 0, 0] });
      return { ...current, scale, centerOffset: scaled.center.map((value) => -value) as Vector3Tuple };
    });
  }, [analysis]);

  return { transform, bounds, hasManualOrientationOverride, rotate, setView, resetRotation, resetSuggestedOrientation, reset, resetSession, autoCenter, autoNormalize };
}
