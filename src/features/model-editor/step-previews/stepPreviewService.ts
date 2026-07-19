import type { ModelFormat } from "@/features/model-import/types/ModelFormat";
import type { ManualDetail } from "@/features/models/types/ManualDetail";
import type { PaletteColor } from "@/features/models/types/PaletteColor";
import type { ProjectPart } from "@/features/models/types/ProjectPart";

import type { PaintingStage,PaintingStepPreviewShot } from "../types/PaintingWorkflow";
import { useModelEditorStore } from "../store/modelEditorStore";
import {
  getCachedStepPreview,
  invalidateStepPreview,
  invalidateStepPreviewsForStep,
  setCachedStepPreview,
} from "./cache";
import { STEP_PREVIEW_HEIGHT, STEP_PREVIEW_WIDTH } from "./constants";
import { createStepPreviewBlob } from "./createStepPreviewBlob";
import { loadStepPreviewModel } from "./loadStepPreviewModel";
import type { StepPreviewResult } from "./types";

export type StepPreviewRequest = {
  projectId: string;
  userId?: string;
  modelFormat?: ModelFormat;
  modelVersion?: string;
  baseColor?: string;
  step: PaintingStage;
  parts: ProjectPart[];
  manualDetails: ManualDetail[];
  palette: PaletteColor[];
  cacheKey: string;
  shot?:PaintingStepPreviewShot;
};

type LoadedModel = Awaited<ReturnType<typeof loadStepPreviewModel>>;
const models = new Map<string, Promise<LoadedModel>>();
const inflight = new Map<string, Promise<StepPreviewResult>>();
const generations = new Map<string, number>();
const sources = new Map<string, Required<Pick<StepPreviewRequest, "userId" | "modelFormat" | "modelVersion" | "baseColor">>>();
let queue: Promise<void> = Promise.resolve();

export function configureStepPreviewSource(projectId: string, source: Required<Pick<StepPreviewRequest, "userId" | "modelFormat" | "modelVersion" | "baseColor">>): void {
  sources.set(projectId, source);
}

export function hasStepPreviewGenerator(projectId: string): boolean {
  return sources.has(projectId);
}

function completeRequest(request: StepPreviewRequest): StepPreviewRequest & Required<Pick<StepPreviewRequest, "userId" | "modelFormat" | "modelVersion" | "baseColor">> {
  const source = sources.get(request.projectId);
  const userId = request.userId ?? source?.userId;
  const modelFormat = request.modelFormat ?? source?.modelFormat;
  const modelVersion = request.modelVersion ?? source?.modelVersion;
  const baseColor = request.baseColor ?? source?.baseColor;
  if (!userId || !modelFormat || !modelVersion || !baseColor) throw new Error("modelUnavailable");
  return { ...request, userId, modelFormat, modelVersion, baseColor };
}

function modelKey(request: StepPreviewRequest & Required<Pick<StepPreviewRequest, "userId" | "modelFormat" | "modelVersion">>): string {
  return `${request.projectId}:${request.userId}:${request.modelFormat}:${request.modelVersion}`;
}

function getModel(request: StepPreviewRequest & Required<Pick<StepPreviewRequest, "userId" | "modelFormat" | "modelVersion">>): Promise<LoadedModel> {
  const key = modelKey(request);
  const existing = models.get(key);
  if (existing) return existing;
  const loading = loadStepPreviewModel({
    projectId: request.projectId,
    userId: request.userId,
    modelFormat: request.modelFormat,
    savedParts: request.parts,
  });
  models.set(key, loading);
  void loading.catch(() => { if (models.get(key) === loading) models.delete(key); });
  return loading;
}

async function renderWithRetry(request: StepPreviewRequest): Promise<{ blob: Blob; framing: StepPreviewResult["framing"] }> {
  const complete = completeRequest(request);
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const loaded = await getModel(complete);
      return await createStepPreviewBlob({
        model: loaded.model,
        step: request.step,
        parts: loaded.parts,
        manualDetails: request.manualDetails,
        palette: request.palette,
        baseColor: complete.baseColor,
        shot:request.shot,
      });
    } catch (error) {
      lastError = error;
      if (process.env.NODE_ENV === "development") {
        console.warn("Step preview render failed", { projectId: request.projectId, stepId: request.step.id, attempt: attempt + 1, error });
      }
      if (attempt === 0 && error instanceof Error && error.message === "modelUnavailable") models.delete(modelKey(complete));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("renderUnavailable");
}

export function invalidatePaintingStepPreview(projectId: string, stepId: string): void {
  const keys=new Set(invalidateStepPreviewsForStep(projectId, stepId));
  for(const key of inflight.keys()){try{const value=JSON.parse(key) as {projectId?:unknown;stepId?:unknown};if(value.projectId===projectId&&value.stepId===stepId)keys.add(key)}catch{/* Ignore obsolete cache keys. */}}
  for (const key of keys) {
    generations.set(key, (generations.get(key) ?? 0) + 1);
    inflight.delete(key);
  }
}

export function requestStepPreview(request: StepPreviewRequest, force = false): Promise<StepPreviewResult> {
  const { cacheKey } = request;
  if (force) {
    invalidateStepPreview(cacheKey);
    inflight.delete(cacheKey);
    generations.set(cacheKey, (generations.get(cacheKey) ?? 0) + 1);
  }
  const cached = getCachedStepPreview(cacheKey);
  if (cached) return Promise.resolve(cached);
  const pending = inflight.get(cacheKey);
  if (pending) return pending;
  const generation = generations.get(cacheKey) ?? 0;
  const task = async (): Promise<StepPreviewResult> => {
    const { blob, framing } = await renderWithRetry(request);
    if ((generations.get(cacheKey) ?? 0) !== generation) throw new Error("generationCancelled");
    const existing = getCachedStepPreview(cacheKey);
    if (existing) return existing;
    const result: StepPreviewResult = {
      stepId: request.step.id,
      imageUrl: URL.createObjectURL(blob),
      width: STEP_PREVIEW_WIDTH,
      height: STEP_PREVIEW_HEIGHT,
      generatedAt: Date.now(),
      framing,
      cacheKey,
    };
    setCachedStepPreview(cacheKey, result);
    return result;
  };
  const result = queue.then(task, task);
  queue = result.then(() => undefined, () => undefined);
  inflight.set(cacheKey, result);
  void result.finally(() => { if (inflight.get(cacheKey) === result) inflight.delete(cacheKey); }).catch(() => undefined);
  return result;
}

export function getOrGenerateStepPreview(projectId: string, stepId: string, cacheKey: string, force = false,shot?:PaintingStepPreviewShot): Promise<StepPreviewResult> {
  const state = useModelEditorStore.getState();
  const step = state.parts.flatMap(part => part.paintingWorkflow.stages).find(candidate => candidate.id === stepId);
  if (!step) return Promise.reject(new Error("targetsUnavailable"));
  return requestStepPreview({
    projectId,
    step,
    parts: state.parts,
    manualDetails: state.manualDetails,
    palette: state.palette,
    cacheKey,
    shot,
  }, force);
}
