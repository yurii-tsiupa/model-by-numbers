"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useRef,
} from "react";

import { saveProjectParts } from "@/features/models/services/projects.service";
import type { Project } from "@/features/models/types/Project";
import type { ProjectPart } from "@/features/models/types/ProjectPart";

import { useModelEditorStore } from "../store/modelEditorStore";

const AUTOSAVE_DELAY = 1000;

function serializeParts(): ProjectPart[] {
  return useModelEditorStore
    .getState()
    .parts.map((part) => ({
      id: part.id,
      name: part.name,
      visible: part.visible,
      color: part.color,
    }));
}

export function useProjectAutosave({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}) {
  const queryClient = useQueryClient();

  const timeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  const isSavingRef = useRef(false);

  const isDirty = useModelEditorStore(
    (state) => state.isDirty,
  );

  const saveStatus = useModelEditorStore(
    (state) => state.saveStatus,
  );

  const changeVersion = useModelEditorStore(
    (state) => state.changeVersion,
  );

  const saveNow = useCallback(async () => {
    const editorState =
      useModelEditorStore.getState();

    if (
      !editorState.isDirty ||
      isSavingRef.current
    ) {
      return;
    }

    const savedVersion =
      editorState.changeVersion;

    const serializedParts = serializeParts();

    isSavingRef.current = true;
    editorState.markSaving();

    try {
      await saveProjectParts({
        projectId,
        userId,
        parts: serializedParts,
      });

      useModelEditorStore
        .getState()
        .markSaved(savedVersion);

      queryClient.setQueryData<Project>(
        ["project", projectId],
        (currentProject) => {
          if (!currentProject) {
            return currentProject;
          }

          return {
            ...currentProject,
            parts: serializedParts,
            updatedAt: new Date(),
          };
        },
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save project changes.";

      useModelEditorStore
        .getState()
        .markSaveError(message);
    } finally {
      isSavingRef.current = false;
    }
  }, [projectId, queryClient, userId]);

  useEffect(() => {
    if (
      !isDirty ||
      saveStatus === "saving"
    ) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      void saveNow();
    }, AUTOSAVE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    changeVersion,
    isDirty,
    saveNow,
    saveStatus,
  ]);

  return {
    saveNow,
  };
}