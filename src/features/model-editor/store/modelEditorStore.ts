import { create } from "zustand";

import type { ModelPart } from "../types/ModelPart";
import { PaletteColor } from "@/features/models/types/PaletteColor";
import { syncPaletteFromParts } from "../lib/syncPaletteFromParts";
import { normalizeHexColor } from "../lib/normalizeHexColor";
import { EditorSidebarTab } from "../types/EditorSidebarTab";
import { GeneratePaletteOptions } from "../types/PaletteGeneration";
import { generatePalette } from "../utils/generatePalette";
import { ViewerMode } from "../types/ViewerMode";

export type EditorSaveStatus =
  | "saved"
  | "dirty"
  | "saving"
  | "error";

export type SelectionMode =
  | "single"
  | "assignPalette";

type ModelEditorState = {
  parts: ModelPart[];
  selectedPartId: string | null;

  isDirty: boolean;
  saveStatus: EditorSaveStatus;
  changeVersion: number;
  saveError: string | null;

  palette: PaletteColor[];

  activeSidebarTab: EditorSidebarTab;
  highlightedPaletteColorId: string | null;

  selectionMode: SelectionMode;

  selectedPartIds: string[];

  setSelectedPartIds: (
    partIds: string[],
  ) => void;

  setHighlightedPaletteColorId: (
    colorId: string | null,
  ) => void;

  viewerMode: ViewerMode;

  setViewerMode: (
    mode: ViewerMode,
  ) => void;

  setActiveSidebarTab: (
    tab: EditorSidebarTab,
  ) => void;

  updatePaletteColor: (
    colorId: string,
    changes: {
      name?: string;
      hex?: string;
    },
  ) => void;

  deletePaletteColor: (
    colorId: string,
  ) => void;

  setPalette: (palette: PaletteColor[]) => void;
  syncPaletteFromParts: () => void;

  setParts: (parts: ModelPart[]) => void;
  selectPart: (partId: string | null) => void;

  togglePartVisibility: (
    partId: string,
  ) => void;

  setPartIncludedInGuide: (
    partId: string,
    included: boolean,
  ) => void;

  setPartsIncludedInGuide: (
    partIds: string[],
    included: boolean,
  ) => void;

  assignPaletteColor: (
    partId: string,
    paletteColorId: string,
  ) => void;

  createAndAssignPaletteColor: (
    partId: string,
    hex: string,
  ) => void;

  clearPaletteColor: (partId: string) => void;

  addPaletteColor: ({
    name,
    hex,
  }: {
    name: string;
    hex: string;
  }) => void;

  highlightPaletteColor: (
    colorId: string | null,
  ) => void;

  selectPartsByPaletteColor: (
    colorId: string,
  ) => void;

  startAssignPaletteMode: () => void;

  cancelAssignPaletteMode: () => void;

  toggleSelectedPart: (
    partId: string,
  ) => void;

  applyPaletteColorToSelection: (
    paletteColorId: string,
  ) => void;

  generatePalette: (
    options: GeneratePaletteOptions,
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

function getNextPaletteColorNumber(
  palette: PaletteColor[],
): number {
  return (
    palette.reduce(
      (largestNumber, color) =>
        Math.max(largestNumber, color.number),
      0,
    ) + 1
  );
}

function createPaletteColorId(
  palette: PaletteColor[],
  number: number,
): string {
  let candidateId = `color-${number}`;
  let suffix = 1;

  while (
    palette.some((color) => color.id === candidateId)
  ) {
    candidateId = `color-${number}-${suffix}`;
    suffix += 1;
  }

  return candidateId;
}

function createPaletteColorName(
  number: number,
): string {
  return `C${String(number).padStart(2, "0")}`;
}

export const useModelEditorStore =
  create<ModelEditorState>()((set) => ({
    parts: [],
    selectedPartId: null,

    palette: [],
    activeSidebarTab: "parts",

    highlightedPaletteColorId: null,

    selectionMode: "single",

    selectedPartIds: [],

    viewerMode: "painted",

    setSelectedPartIds: (selectedPartIds) => {
      set({
        selectedPartIds: [...selectedPartIds],
      });
    },

    setHighlightedPaletteColorId: (
      highlightedPaletteColorId,
    ) => {
      set({ highlightedPaletteColorId });
    },

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

    setPalette: (palette) => {
      set({
        palette,
      });
    },

    syncPaletteFromParts: () => {
      set((state) => {
        const result = syncPaletteFromParts(
          state.parts,
          state.palette,
        );

        const hasChanges =
          result.palette.length !== state.palette.length ||
          result.parts.some(
            (part, index) =>
              part.paletteColorId !==
                state.parts[index]?.paletteColorId ||
              part.color !== state.parts[index]?.color,
          );

        if (!hasChanges) {
          return state;
        }

        return {
          palette: result.palette,
          parts: result.parts,
          ...markStateDirty(state),
        };
      });
    },

    selectPart: (partId) => {
      set({
        selectedPartId: partId,
        highlightedPaletteColorId: null,
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

    setPartIncludedInGuide: (partId, included) => {
      set((state) => {
        const part = state.parts.find((item) => item.id === partId);
        if (!part || part.includeInGuide === included) return state;
        return {
          parts: state.parts.map((item) => item.id === partId ? { ...item, includeInGuide: included } : item),
          ...markStateDirty(state),
        };
      });
    },

    setPartsIncludedInGuide: (partIds, included) => {
      set((state) => {
        const ids = new Set(partIds);
        const hasChanges = state.parts.some((part) => ids.has(part.id) && part.includeInGuide !== included);
        if (!hasChanges) return state;
        return {
          parts: state.parts.map((part) => ids.has(part.id) && part.includeInGuide !== included ? { ...part, includeInGuide: included } : part),
          ...markStateDirty(state),
        };
      });
    },

    assignPaletteColor: (
      partId,
      paletteColorId,
    ) => {
      set((state) => {
        const paletteColorExists = state.palette.some(
          (color) => color.id === paletteColorId,
        );

        if (!paletteColorExists) {
          return state;
        }

        const selectedPart = state.parts.find(
          (part) => part.id === partId,
        );

        if (
          !selectedPart ||
          selectedPart.paletteColorId === paletteColorId
        ) {
          return state;
        }

        return {
          parts: state.parts.map((part) =>
            part.id === partId
              ? {
                  ...part,
                  color: null,
                  paletteColorId,
                }
              : part,
          ),
          ...markStateDirty(state),
        };
      });
    },

    createAndAssignPaletteColor: (
      partId,
      hex,
    ) => {
      set((state) => {
        const normalizedHex = normalizeHexColor(hex);

        if (!normalizedHex) {
          return state;
        }

        const existingColor = state.palette.find(
          (color) =>
            normalizeHexColor(color.hex) === normalizedHex,
        );

        if (existingColor) {
          const selectedPart = state.parts.find(
            (part) => part.id === partId,
          );

          if (
            !selectedPart ||
            selectedPart.paletteColorId ===
              existingColor.id
          ) {
            return state;
          }

          return {
            parts: state.parts.map((part) =>
              part.id === partId
                ? {
                    ...part,
                    color: null,
                    paletteColorId: existingColor.id,
                  }
                : part,
            ),
            ...markStateDirty(state),
          };
        }

        const number = getNextPaletteColorNumber(
          state.palette,
        );

        const newPaletteColor: PaletteColor = {
          id: createPaletteColorId(
            state.palette,
            number,
          ),
          number,
          name: createPaletteColorName(number),
          hex: normalizedHex,
        };

        return {
          palette: [...state.palette, newPaletteColor],
          parts: state.parts.map((part) =>
            part.id === partId
              ? {
                  ...part,
                  color: null,
                  paletteColorId: newPaletteColor.id,
                }
              : part,
          ),
          ...markStateDirty(state),
        };
      });
    },

    clearPaletteColor: (partId) => {
      set((state) => {
        const selectedPart = state.parts.find(
          (part) => part.id === partId,
        );

        if (
          !selectedPart ||
          (!selectedPart.paletteColorId &&
            !selectedPart.color)
        ) {
          return state;
        }

        return {
          parts: state.parts.map((part) =>
            part.id === partId
              ? {
                  ...part,
                  color: null,
                  paletteColorId: null,
                }
              : part,
          ),
          ...markStateDirty(state),
        };
      });
    },

    setActiveSidebarTab: (activeSidebarTab) => {
      set({
        activeSidebarTab,
      });
    },

    updatePaletteColor: (
      colorId,
      changes,
    ) => {
      set((state) => {
        const existingColor = state.palette.find(
          (color) => color.id === colorId,
        );

        if (!existingColor) {
          return state;
        }

        const normalizedHex =
          changes.hex !== undefined
            ? normalizeHexColor(changes.hex)
            : existingColor.hex;

        if (!normalizedHex) {
          return state;
        }

        const nextName =
          changes.name !== undefined
            ? changes.name.trim()
            : existingColor.name;

        const nextColor = {
          ...existingColor,
          name: nextName || existingColor.name,
          hex: normalizedHex,
        };

        if (
          nextColor.name === existingColor.name &&
          nextColor.hex === existingColor.hex
        ) {
          return state;
        }

        return {
          palette: state.palette.map((color) =>
            color.id === colorId
              ? nextColor
              : color,
          ),
          ...markStateDirty(state),
        };
      });
    },

    deletePaletteColor: (colorId) => {
      set((state) => {
        const usageCount = state.parts.filter(
          (part) =>
            part.paletteColorId === colorId,
        ).length;

        if (usageCount > 0) {
          return state;
        }

        const colorExists = state.palette.some(
          (color) => color.id === colorId,
        );

        if (!colorExists) {
          return state;
        }

        return {
          palette: state.palette.filter(
            (color) => color.id !== colorId,
          ),
          ...markStateDirty(state),
        };
      });
    },

    addPaletteColor: ({ name, hex }) => {
      set((state) => {
        const normalizedHex = normalizeHexColor(hex);

        if (!normalizedHex) {
          return state;
        }

        const existingColor = state.palette.find(
          (color) =>
            normalizeHexColor(color.hex) === normalizedHex,
        );

        if (existingColor) {
          return {
            highlightedPaletteColorId: existingColor.id,
            activeSidebarTab: "palette",
          };
        }

        const number = getNextPaletteColorNumber(
          state.palette,
        );

        const newColor: PaletteColor = {
          id: createPaletteColorId(
            state.palette,
            number,
          ),
          number,
          name:
            name.trim() ||
            createPaletteColorName(number),
          hex: normalizedHex,
        };

        return {
          palette: [...state.palette, newColor],
          highlightedPaletteColorId: newColor.id,
          ...markStateDirty(state),
        };
      });
    },

    highlightPaletteColor: (colorId) => {
      set((state) => ({
        highlightedPaletteColorId:
          state.highlightedPaletteColorId === colorId
            ? null
            : colorId,
      }));
    },

    selectPartsByPaletteColor: (colorId) => {
      set((state) => {
        const matchingPart = state.parts.find(
          (part) =>
            part.paletteColorId === colorId,
        );

        if (!matchingPart) {
          return {
            highlightedPaletteColorId: colorId,
          };
        }

        return {
          selectedPartId: matchingPart.id,
          highlightedPaletteColorId: colorId,
          activeSidebarTab: "parts",
        };
      });
    },

    startAssignPaletteMode: () => {
      set({
        selectionMode: "assignPalette",
        selectedPartIds: [],
      });
    },

    cancelAssignPaletteMode: () => {
      set({
        selectionMode: "single",
        selectedPartIds: [],
      });
    },

    toggleSelectedPart: (partId) => {
      set((state) => {
        if (
          state.selectionMode !==
          "assignPalette"
        ) {
          return state;
        }

        const exists =
          state.selectedPartIds.includes(partId);

        return {
          selectedPartIds: exists
            ? state.selectedPartIds.filter(
                (id) => id !== partId,
              )
            : [
                ...state.selectedPartIds,
                partId,
              ],
        };
      });
    },

    applyPaletteColorToSelection: (
      paletteColorId,
    ) => {
      set((state) => {
        if (
          state.selectedPartIds.length === 0
        ) {
          return state;
        }

        const lastSelectedPartId =
          state.selectedPartIds.at(-1) ?? null;

        return {
          parts: state.parts.map((part) =>
            state.selectedPartIds.includes(part.id)
              ? {
                  ...part,
                  paletteColorId,
                }
              : part,
          ),

          selectedPartId: lastSelectedPartId,

          selectedPartIds: [],

          highlightedPaletteColorId: null,

          selectionMode: "single",

          ...markStateDirty(state),
        };
      });
    },

    generatePalette: (
      options: GeneratePaletteOptions,
    ) => {
      set((state) => {
        const generated = generatePalette(
          state.parts,
          options,
        );

        return {
          palette: generated.palette,
          parts: generated.parts,
          selectedPartId:
            generated.parts[0]?.id ?? null,
          highlightedPaletteColorId: null,
          ...markStateDirty(state),
        };
      });
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

    setViewerMode: (viewerMode) => {
      set({
        viewerMode,
      });
    },

    resetEditor: () => {
      set({
        parts: [],
        selectedPartId: null,
        palette: [],
        activeSidebarTab: "parts",
        highlightedPaletteColorId: null,
        selectionMode: "single",
        selectedPartIds: [],
        viewerMode: "painted",
        isDirty: false,
        saveStatus: "saved",
        changeVersion: 0,
        saveError: null,
      });
    },
  }));
