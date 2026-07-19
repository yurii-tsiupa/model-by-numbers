import type { ManualDetail } from "@/features/models/types/ManualDetail";
import type { PaletteColor } from "@/features/models/types/PaletteColor";
import type { ModelPart } from "../types/ModelPart";
import { normalizeHexColor } from "./normalizeHexColor";

export type ColorAssignmentTarget =
  | { type: "part"; id: string }
  | { type: "manualDetail"; id: string };

type ColorAssignmentState = {
  palette: PaletteColor[];
  parts: ModelPart[];
  manualDetails: ManualDetail[];
};

export function assignColorToTarget(
  state: ColorAssignmentState,
  target: ColorAssignmentTarget,
  value: string,
): (ColorAssignmentState & { changed: boolean }) | null {
  const hex = normalizeHexColor(value);
  if (!hex) return null;
  const targetExists = target.type === "part"
    ? state.parts.some((item) => item.id === target.id)
    : state.manualDetails.some((item) => item.id === target.id);
  if (!targetExists) return null;

  let color = state.palette.find(
    (item) => normalizeHexColor(item.hex) === hex,
  );
  let palette = state.palette;

  if (!color) {
    const number = state.palette.reduce(
      (largest, item) => Math.max(largest, item.number),
      0,
    ) + 1;
    let id = `color-${number}`;
    let suffix = 1;
    while (state.palette.some((item) => item.id === id)) {
      id = `color-${number}-${suffix}`;
      suffix += 1;
    }
    color = {
      id,
      number,
      name: `C${String(number).padStart(2, "0")}`,
      hex,
    };
    palette = [...state.palette, color];
  }

  if (target.type === "part") {
    const part = state.parts.find((item) => item.id === target.id);
    if (!part || part.paletteColorId === color.id) {
      return { ...state, palette, changed: palette !== state.palette };
    }
    return {
      palette,
      parts: state.parts.map((item) => item.id === target.id
        ? { ...item, color: null, paletteColorId: color.id }
        : item),
      manualDetails: state.manualDetails,
      changed: true,
    };
  }

  const detail = state.manualDetails.find((item) => item.id === target.id);
  if (!detail || detail.colorId === color.id) {
    return { ...state, palette, changed: palette !== state.palette };
  }
  return {
    palette,
    parts: state.parts,
    manualDetails: state.manualDetails.map((item) => item.id === target.id
      ? { ...item, colorId: color.id, updatedAt: Date.now() }
      : item),
    changed: true,
  };
}
