"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { GuideCaptureOverlay } from "@/features/guides/components/GuideCaptureOverlay";
import { useGuideGenerationStore } from "@/features/guides/store/guideGenerationStore";
import type { GuideImages } from "@/features/guides/types/ModelGuide";
import type { Project } from "@/features/models/types/Project";
import { useProjectThumbnail } from "@/features/models/hooks/useProjectThumbnail";
import { useSaveProjectThumbnail } from "@/features/models/hooks/useSaveProjectThumbnail";
import { createThumbnailBlob } from "@/features/models/lib/createThumbnailBlob";
import { useReferenceImages } from "@/features/references/hooks/useReferenceImages";
import { ReferenceSplitPanel } from "@/features/references/components/ReferenceSplitPanel";

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
  const autoThumbnailAttemptedRef = useRef(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const thumbnailQuery = useProjectThumbnail(project.id);
  const saveThumbnail = useSaveProjectThumbnail();
  const [referenceViewMode,setReferenceViewMode]=useState<"viewer"|"split"|"reference">("viewer");
  const [selectedReferenceId,setSelectedReferenceId]=useState<string|null>(null);
  const referencesQuery=useReferenceImages(project.id);
  const references=referencesQuery.data??[];
  const selectedReference=references.find(reference=>reference.id===selectedReferenceId)??null;
  const effectiveReferenceViewMode=selectedReference?referenceViewMode:"viewer";

  function openReferenceMode(mode: "split" | "reference", preferredReferenceId?: string) {
    const preferredReference = preferredReferenceId ? references.find((reference) => reference.id === preferredReferenceId) : null;
    const currentReference = references.find((reference) => reference.id === selectedReferenceId);
    const nextReference = preferredReference ?? currentReference ?? references[0];
    if (!nextReference) { setSelectedReferenceId(null); setReferenceViewMode("viewer"); return; }
    setSelectedReferenceId(nextReference.id);
    setReferenceViewMode(mode);
  }

  function handleReferenceDeleted(referenceId: string) {
    if (selectedReferenceId !== referenceId) return;
    const deletedIndex = references.findIndex((reference) => reference.id === referenceId);
    const remaining = references.filter((reference) => reference.id !== referenceId);
    const nextReference = remaining[Math.min(Math.max(deletedIndex, 0), remaining.length - 1)];
    if (nextReference) setSelectedReferenceId(nextReference.id);
    else { setSelectedReferenceId(null); setReferenceViewMode("viewer"); }
  }

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

  const generateThumbnail = useCallback(async () => {
    const viewer = viewerRef.current;
    if (!viewer || saveThumbnail.isPending) return;
    setThumbnailError(null);
    try {
      const source = await viewer.captureView("painted");
      const image = await createThumbnailBlob(source);
      const now = new Date();
      await saveThumbnail.mutateAsync({ projectId: project.id, ...image, createdAt: thumbnailQuery.data?.createdAt ?? now, updatedAt: now });
    } catch {
      setThumbnailError("Thumbnail generation failed. The project will continue using the default preview.");
    }
  }, [project.id, saveThumbnail, thumbnailQuery.data]);

  useEffect(() => {
    if (autoThumbnailAttemptedRef.current || thumbnailQuery.isLoading || thumbnailQuery.data || parts.length === 0) return;
    autoThumbnailAttemptedRef.current = true;
    void generateThumbnail();
  }, [generateThumbnail, parts.length, thumbnailQuery.data, thumbnailQuery.isLoading]);

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
        <EditorSidebar project={project} isGeneratingThumbnail={saveThumbnail.isPending} thumbnailError={thumbnailError} onRegenerateThumbnail={() => { void generateThumbnail(); }} onOpenReferenceMode={openReferenceMode} onReferenceDeleted={handleReferenceDeleted} />

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
          <div className={`${effectiveReferenceViewMode==="reference"?"hidden":"flex"} min-h-0 min-w-0 flex-1`}><ModelViewer ref={viewerRef} project={project} userId={userId} /></div>
          {selectedReference&&effectiveReferenceViewMode!=="viewer"?<ReferenceSplitPanel reference={selectedReference} references={references} onSelect={setSelectedReferenceId} onClose={()=>setReferenceViewMode("viewer")}/>:null}
          <div className="absolute right-3 top-3 z-20 flex rounded-full border border-white/10 bg-black/70 p-1 text-xs">{(["viewer","split","reference"] as const).map(mode=><button key={mode} type="button" disabled={mode!=="viewer"&&references.length===0} onClick={()=>{if(mode==="viewer")setReferenceViewMode("viewer");else openReferenceMode(mode);}} className={`rounded-full px-3 py-1.5 capitalize disabled:opacity-40 ${effectiveReferenceViewMode===mode?"bg-orange-400 text-black":"text-neutral-300"}`}>{mode}</button>)}</div>
        </div>

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
