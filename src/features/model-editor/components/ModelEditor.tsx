"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

import { GuideCaptureOverlay } from "@/features/guides/components/GuideCaptureOverlay";
import { useGuideGenerationStore } from "@/features/guides/store/guideGenerationStore";
import type { GuideImages } from "@/features/guides/types/ModelGuide";
import type { Project } from "@/features/models/types/Project";

import { useProjectAutosave } from "../hooks/useProjectAutosave";
import { getGuideReadiness } from "../lib/getGuideReadiness";
import { useModelEditorStore } from "../store/modelEditorStore";
import { EditorHeader } from "./EditorHeader";
import { ModelViewer } from "./ModelViewer";
import type { ModelViewerHandle } from "./ModelViewer";
import { PropertiesPanel } from "./PropertiesPanel";
import { EditorSidebar } from "./EditorSidebar";

type ModelEditorProps = {
  project: Project;
  userId: string;
};

export function ModelEditor({
  project,
  userId,
}: ModelEditorProps) {
  const router = useRouter();
  const initializedProjectIdRef = useRef<string | null>(null);
  const viewerRef = useRef<ModelViewerHandle | null>(null);
  const isGeneratingRef = useRef(false);

  const generationStatus = useGuideGenerationStore(
    (state) => state.status,
  );
  const startCapture = useGuideGenerationStore(
    (state) => state.startCapture,
  );
  const setCaptureStep = useGuideGenerationStore(
    (state) => state.setCaptureStep,
  );
  const setImages = useGuideGenerationStore(
    (state) => state.setImages,
  );
  const setGenerationError = useGuideGenerationStore(
    (state) => state.setError,
  );
  const resetGuideGeneration = useGuideGenerationStore(
    (state) => state.reset,
  );

  const resetEditor = useModelEditorStore(
    (state) => state.resetEditor,
  );

  const setPalette = useModelEditorStore(
    (state) => state.setPalette,
  );

  const parts = useModelEditorStore(
    (state) => state.parts,
  );

  const palette = useModelEditorStore(
    (state) => state.palette,
  );

  const isDirty = useModelEditorStore(
    (state) => state.isDirty,
  );

  const saveStatus = useModelEditorStore(
    (state) => state.saveStatus,
  );

  const readiness = useMemo(
    () =>
      getGuideReadiness({
        project,
        parts,
        palette,
      }),
    [palette, parts, project],
  );

  const isGuideReady =
    readiness.isReady &&
    !isDirty &&
    saveStatus === "saved";

  async function generateGuidePreview() {
    if (isGeneratingRef.current) {
      return;
    }

    const viewer = viewerRef.current;
    const editorState = useModelEditorStore.getState();
    const currentReadiness = getGuideReadiness({
      project,
      parts: editorState.parts,
      palette: editorState.palette,
    });

    if (
      !currentReadiness.isReady ||
      editorState.isDirty ||
      editorState.saveStatus !== "saved"
    ) {
      return;
    }

    if (!viewer) {
      startCapture(project.id);
      setGenerationError(
        "The model viewer is not ready. Please try again.",
      );
      return;
    }

    isGeneratingRef.current = true;
    startCapture(project.id);

    const images: GuideImages = {
      original: null,
      base: null,
      painted: null,
      numbers: null,
    };

    try {
      const captureSteps = [
        "original",
        "base",
        "painted",
        "numbers",
      ] as const;

      for (const [index, step] of captureSteps.entries()) {
        setCaptureStep(step, index + 1);
        images[step] = await viewer.captureView(step);
      }

      setImages(project.id, images);
      router.push(`/models/${project.id}/guide`);
    } catch (error) {
      console.error("Failed to prepare guide preview:", error);
      setGenerationError(
        "The model views could not be captured. Please try again.",
      );
    } finally {
      isGeneratingRef.current = false;
    }
  }

  const { saveNow } = useProjectAutosave({
    projectId: project.id,
    userId,
  });

  useEffect(() => {
    if (initializedProjectIdRef.current === project.id) {
      return;
    }

    resetEditor();
    setPalette(project.palette);

    initializedProjectIdRef.current = project.id;
  }, [
    project.id,
    project.palette,
    resetEditor,
    setPalette,
  ]);

  useEffect(() => {
    return () => {
      initializedProjectIdRef.current = null;
      resetEditor();
    };
  }, [resetEditor]);

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-neutral-950 text-white">
      <EditorHeader
        project={project}
        isGuideReady={isGuideReady}
        isGeneratingGuide={generationStatus === "capturing"}
        onGenerateGuide={() => {
          void generateGuidePreview();
        }}
        onSave={() => {
          void saveNow();
        }}
      />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <EditorSidebar project={project} />

        <ModelViewer
          ref={viewerRef}
          project={project}
          userId={userId}
        />

        <PropertiesPanel />
      </div>

      <GuideCaptureOverlay
        onRetry={() => {
          void generateGuidePreview();
        }}
        onCancel={resetGuideGeneration}
      />
    </main>
  );
}
