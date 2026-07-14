import { create } from "zustand";

import type { ModelPart } from "../types/ModelPart";

type ModelEditorState = {
  parts: ModelPart[];
  selectedPartId: string | null;

  setParts: (parts: ModelPart[]) => void;
  selectPart: (partId: string | null) => void;
  togglePartVisibility: (partId: string) => void;

  showAllParts: () => void;
  hideSelectedPart: () => void;
  isolateSelectedPart: () => void;

  resetEditor: () => void;
};

export const useModelEditorStore =
  create<ModelEditorState>()((set) => ({
    parts: [],
    selectedPartId: null,

    setParts: (parts) => {
      set({
        parts,
        selectedPartId: null,
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
      }));
    },

    showAllParts: () => {
      set((state) => ({
        parts: state.parts.map((part) => ({
          ...part,
          visible: true,
        })),
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
            visible: part.id === state.selectedPartId,
          })),
        };
      });
    },

    resetEditor: () => {
      set({
        parts: [],
        selectedPartId: null,
      });
    },
  }));