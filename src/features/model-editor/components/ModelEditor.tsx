"use client";

import { useEffect, useMemo, useRef } from "react";

import type { Project } from "@/features/models/types/Project";

import { useProjectAutosave } from "../hooks/useProjectAutosave";
import { getGuideReadiness } from "../lib/getGuideReadiness";
import { useModelEditorStore } from "../store/modelEditorStore";
import { EditorHeader } from "./EditorHeader";
import { ModelViewer } from "./ModelViewer";
import type { ModelViewerHandle } from "./ModelViewer";
import { ModelCaptureDevControls } from "./ModelCaptureDevControls";
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
  const initializedProjectIdRef = useRef<string | null>(null);
  const viewerRef = useRef<ModelViewerHandle | null>(null);

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

        {process.env.NODE_ENV === "development" ? (
          <ModelCaptureDevControls viewerRef={viewerRef} />
        ) : null}

        <PropertiesPanel />
      </div>
    </main>
  );
}
