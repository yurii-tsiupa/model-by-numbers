import type { EditorMode } from "../types/EditorMode";

const EDITOR_MODE_KEY = "editorMode";
const listeners = new Set<() => void>();

export function readEditorModePreference(): EditorMode {
  if (typeof window === "undefined") return "simple";
  const value = window.localStorage.getItem(EDITOR_MODE_KEY);
  return value === "advanced" || value === "simple" ? value : "simple";
}

export function writeEditorModePreference(mode: EditorMode): void {
  window.localStorage.setItem(EDITOR_MODE_KEY, mode);
  listeners.forEach((listener) => listener());
}

export function subscribeToEditorModePreference(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
