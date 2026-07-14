import { create } from "zustand";

import type { ModelPart } from "../types/ModelPart";

export type EditorSaveStatus =
  | "saved"
  | "dirty"
  | "saving"
  | "error";

type ModelEditorState = {
  parts: ModelPart[];
  selectedPartId: string | null;

  isDirty: boolean;
  saveStatus: EditorSaveStatus;
  changeVersion: number;
  saveError: string | null;

  setParts: (parts: ModelPart[]) => void;
  selectPart: (partId: string | null) => void;

  togglePartVisibility: (
    partId: string,
  ) => void;

  assignPartColor: (
    partId: string,
    color: string,
  ) => void;

  resetPartColor: (
    partId: string,
  ) => void;

  showAllParts: () => void;
  hideSelectedPart: () => void;
  isolateSelectedPart: () => void;

  markSaving: () => void;
  markSaved: (savedVersion: number) => void;
  markSaveError: (message: string) => void;

  resetEditor: () => void;
};

function markStateDirty(
  state: ModelEditorState,
): Pick<
  ModelEditorState,
  | "isDirty"
  | "saveStatus"
  | "changeVersion"
  | "saveError"
> {
  return {
    isDirty: true,
    saveStatus: "dirty",
    changeVersion: state.changeVersion + 1,
    saveError: null,
  };
}

export const useModelEditorStore =
  create<ModelEditorState>()((set) => ({
    parts: [],
    selectedPartId: null,

    isDirty: false,
    saveStatus: "saved",
    changeVersion: 0,
    saveError: null,

    setParts: (parts) => {
      set({
        parts,
        selectedPartId: null,
        isDirty: false,
        saveStatus: "saved",
        changeVersion: 0,
        saveError: null,
      });
    },

    selectPart: (partId) => {
      set({
        selectedPartId: partId,
      });
    },

    togglePartVisibility: (partId) => {
      set((state) => ({
        parts: state.parts.map((part) =>
          part.id === partId
            ? {
                ...part,
                visible: !part.visible,
              }
            : part,
        ),
        ...markStateDirty(state),
      }));
    },

    assignPartColor: (partId, color) => {
      set((state) => ({
        parts: state.parts.map((part) =>
          part.id === partId
            ? {
                ...part,
                color,
              }
            : part,
        ),
        ...markStateDirty(state),
      }));
    },

    resetPartColor: (partId) => {
      set((state) => ({
        parts: state.parts.map((part) =>
          part.id === partId
            ? {
                ...part,
                color: null,
              }
            : part,
        ),
        ...markStateDirty(state),
      }));
    },

    showAllParts: () => {
      set((state) => ({
        parts: state.parts.map((part) => ({
          ...part,
          visible: true,
        })),
        ...markStateDirty(state),
      }));
    },

    hideSelectedPart: () => {
      set((state) => {
        if (!state.selectedPartId) {
          return state;
        }

        return {
          parts: state.parts.map((part) =>
            part.id === state.selectedPartId
              ? {
                  ...part,
                  visible: false,
                }
              : part,
          ),
          selectedPartId: null,
          ...markStateDirty(state),
        };
      });
    },

    isolateSelectedPart: () => {
      set((state) => {
        if (!state.selectedPartId) {
          return state;
        }

        return {
          parts: state.parts.map((part) => ({
            ...part,
            visible:
              part.id === state.selectedPartId,
          })),
          ...markStateDirty(state),
        };
      });
    },

    markSaving: () => {
      set({
        saveStatus: "saving",
        saveError: null,
      });
    },

    markSaved: (savedVersion) => {
      set((state) => {
        const hasNewerChanges =
          state.changeVersion !== savedVersion;

        return {
          isDirty: hasNewerChanges,
          saveStatus: hasNewerChanges
            ? "dirty"
            : "saved",
          saveError: null,
        };
      });
    },

    markSaveError: (message) => {
      set({
        isDirty: true,
        saveStatus: "error",
        saveError: message,
      });
    },

    resetEditor: () => {
      set({
        parts: [],
        selectedPartId: null,
        isDirty: false,
        saveStatus: "saved",
        changeVersion: 0,
        saveError: null,
      });
    },
  }));