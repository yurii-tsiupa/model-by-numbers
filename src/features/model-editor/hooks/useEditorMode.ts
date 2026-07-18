"use client";

import { useSyncExternalStore } from "react";
import { readEditorModePreference, subscribeToEditorModePreference, writeEditorModePreference } from "../storage/editorModePreference";
import type { EditorMode } from "../types/EditorMode";

export function useEditorMode() {
  const mode = useSyncExternalStore<EditorMode>(subscribeToEditorModePreference, readEditorModePreference, () => "simple");

  function setMode(nextMode: EditorMode) {
    writeEditorModePreference(nextMode);
  }

  return { mode, setMode };
}
