"use client";

import { useEffect } from "react";

import type { Project } from "@/features/models/types/Project";

import { useModelEditorStore } from "../store/modelEditorStore";
import { EditorHeader } from "./EditorHeader";
import { ModelViewer } from "./ModelViewer";
import { PartsSidebar } from "./PartsSidebar";
import { PropertiesPanel } from "./PropertiesPanel";
import { useProjectAutosave } from "../hooks/useProjectAutosave";

type ModelEditorProps = {
  project: Project;
  userId: string;
};

export function ModelEditor({
  project,
  userId,
}: ModelEditorProps) {
  const resetEditor = useModelEditorStore(
    (state) => state.resetEditor,
  );

  const { saveNow } = useProjectAutosave({
    projectId: project.id,
    userId,
  });

  useEffect(() => {
    resetEditor();

    return () => {
      resetEditor();
    };
  }, [project.id, resetEditor]);

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-neutral-950 text-white">
      <EditorHeader
        project={project}
        onSave={() => {
          void saveNow();
        }}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <PartsSidebar />

        <ModelViewer
          project={project}
          userId={userId}
        />

        <PropertiesPanel />
      </div>
    </main>
  );
}