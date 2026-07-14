import { create } from "zustand";

import type { ModelPart } from "../types/ModelPart";

type ModelEditorState = {
  parts: ModelPart[];
  selectedPartId: string | null;

  setParts: (parts: ModelPart[]) => void;
  selectPart: (partId: string | null) => void;
  togglePartVisibility: (partId: string) => void;
  showAllParts: () => void;
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

    resetEditor: () => {
      set({
        parts: [],
        selectedPartId: null,
      });
    },
  }));