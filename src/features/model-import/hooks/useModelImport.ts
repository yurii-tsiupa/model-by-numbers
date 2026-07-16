"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getModelImporter } from "../adapters/modelImporterRegistry";
import { analyzeImportedModel } from "../analysis/analyzeImportedModel";
import { analyzeModelOrientation } from "../analysis/analyzeModelOrientation";
import { disposeImportedScene } from "../analysis/disposeImportedScene";
import { validateModelFile } from "../lib/validateModelFile";
import type { ImportedModel } from "../types/ImportedModel";
import type { ModelAnalysis } from "../types/ModelAnalysis";
import type { ModelImportError } from "../types/ModelImportError";
import type { ModelImportStatus } from "../types/ModelImportStatus";
import type { ModelImportWarning } from "../types/ModelImportWarning";
import type { OrientationSuggestion } from "../types/OrientationSuggestion";
import type { ReviewedDetectedModelPart } from "../types/ReviewedDetectedModelPart";

const normalizeEditedName = (value: string) => value.trim().replace(/\s+/g, " ").slice(0, 120);

export function useModelImport() {
  const [status, setStatus] = useState<ModelImportStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("idle");
  const [analysis, setAnalysis] = useState<ModelAnalysis | null>(null);
  const [warnings, setWarnings] = useState<ModelImportWarning[]>([]);
  const [errors, setErrors] = useState<ModelImportError[]>([]);
  const [importedModel, setImportedModel] = useState<ImportedModel | null>(null);
  const [reviewedParts, setReviewedParts] = useState<ReviewedDetectedModelPart[]>([]);
  const [isReviewDirty, setReviewDirty] = useState(false);
  const [orientationSuggestion, setOrientationSuggestion] = useState<OrientationSuggestion | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const modelRef = useRef<ImportedModel | null>(null);

  const cleanup = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    if (modelRef.current) {
      disposeImportedScene(modelRef.current.scene);
      modelRef.current = null;
    }
  }, []);

  const clearResult = useCallback(() => {
    setAnalysis(null);
    setOrientationSuggestion(null);
    setImportedModel(null);
    setReviewedParts([]);
    setReviewDirty(false);
  }, []);

  const resetImport = useCallback(() => {
    cleanup();
    setStatus("idle");
    setProgress(0);
    setStage("idle");
    clearResult();
    setWarnings([]);
    setErrors([]);
  }, [cleanup, clearResult]);

  const cancelImport = useCallback(() => {
    cleanup();
    setStatus("cancelled");
    setProgress(0);
    setStage("idle");
    clearResult();
  }, [cleanup, clearResult]);

  const startImport = useCallback(async (file: File) => {
    cleanup();
    clearResult();
    const validation = validateModelFile(file);
    setWarnings(validation.warnings);
    setErrors(validation.errors);
    if (validation.errors.length) { setStatus("error"); return; }
    const importer = getModelImporter(file);
    if (!importer) {
      setErrors([{ code: "unsupported-format", messageKey: "modelImport.errors.unsupported-format" }]);
      setStatus("error");
      return;
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      setStatus("reading"); setStage("reading"); setProgress(8);
      await Promise.resolve();
      setStatus("parsing"); setStage("parsing"); setProgress(20);
      const imported = await importer.parse(file, controller.signal);
      modelRef.current = imported;
      setImportedModel(imported);
      setProgress(40); setStatus("analyzing");
      const result = await analyzeImportedModel(imported, controller.signal, (nextStage, nextProgress) => {
        setStage(nextStage); setProgress(nextProgress);
      });
      const suggestion = analyzeModelOrientation(imported.scene);
      setAnalysis(result);
      setOrientationSuggestion(suggestion);
      setReviewedParts(result.parts.map((part) => ({ ...part, includeInProject: !part.empty, editedName: part.suggestedName })));
      setWarnings([...validation.warnings, ...result.warnings.filter((warning) => !validation.warnings.some((item) => item.code === warning.code))]);
      setErrors(result.errors);
      setProgress(100); setStage("report"); setStatus(result.errors.length ? "error" : "review");
    } catch (error) {
      if (controller.signal.aborted || error instanceof DOMException && error.name === "AbortError") {
        setStatus("cancelled");
        setErrors([{ code: "analysis-cancelled", messageKey: "modelImport.errors.analysis-cancelled" }]);
      } else {
        setStatus("error");
        setErrors([{ code: "parse-failed", messageKey: "modelImport.errors.parse-failed", technicalDetails: error instanceof Error ? error.name : undefined }]);
      }
      if (modelRef.current) {
        disposeImportedScene(modelRef.current.scene);
        modelRef.current = null;
        setImportedModel(null);
      }
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, [cleanup, clearResult]);

  const updateReviewedPart = useCallback((id: string, changes: Partial<Pick<ReviewedDetectedModelPart, "includeInProject" | "editedName">>) => {
    setReviewedParts((current) => current.map((part) => part.id === id ? { ...part, ...changes, ...(changes.editedName === undefined ? {} : { editedName: changes.editedName.slice(0, 120) }) } : part));
    setReviewDirty(true);
  }, []);
  const setReviewedInclusion = useCallback((ids: readonly string[], included: boolean) => {
    const selected = new Set(ids);
    setReviewedParts((current) => current.map((part) => selected.has(part.id) ? { ...part, includeInProject: included } : part));
    setReviewDirty(true);
  }, []);
  const resetReviewedParts = useCallback(() => {
    setReviewedParts((current) => current.map((part) => ({ ...part, includeInProject: !part.empty, editedName: part.suggestedName })));
    setReviewDirty(false);
  }, []);
  const applySuggestedNames = useCallback(() => {
    setReviewedParts((current) => current.map((part) => ({ ...part, editedName: part.suggestedName })));
    setReviewDirty(true);
  }, []);
  const reviewedPartsValid = reviewedParts.some((part) => part.includeInProject)
    && reviewedParts.filter((part) => part.includeInProject).every((part) => normalizeEditedName(part.editedName).length > 0);

  useEffect(() => cleanup, [cleanup]);
  return { status, progress, currentStage: stage, analysis, warnings, errors, importedModel, reviewedParts, isReviewDirty, reviewedPartsValid, orientationSuggestion, startImport, cancelImport, resetImport, updateReviewedPart, setReviewedInclusion, resetReviewedParts, applySuggestedNames };
}
