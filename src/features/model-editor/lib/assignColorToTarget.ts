import type { ManualDetail } from "@/features/models/types/ManualDetail";
import type { PaletteColor } from "@/features/models/types/PaletteColor";
import type { ModelPart } from "../types/ModelPart";
import { ensurePaletteColor } from "./ensurePaletteColor";
import { assignDetectedPartColor } from "./assignDetectedPartColor";

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
): (ColorAssignmentState & { changed: boolean; synchronizedBaseColor: string | null }) | null {
  const targetExists = target.type === "part"
    ? state.parts.some((item) => item.id === target.id)
    : state.manualDetails.some((item) => item.id === target.id);
  if (!targetExists) return null;

  const ensured = ensurePaletteColor(state.palette, value);
  if (!ensured) return null;
  const { color, palette } = ensured;

  if (target.type === "part") {
    const assignment = assignDetectedPartColor({ parts: state.parts, palette, partId: target.id, paletteColorId: color.id });
    if (!assignment) return null;
    return {
      palette,
      parts: assignment.parts,
      manualDetails: state.manualDetails,
      changed: assignment.changed || palette !== state.palette,
      synchronizedBaseColor: assignment.synchronizedBaseColor,
    };
  }

  const detail = state.manualDetails.find((item) => item.id === target.id);
  if (!detail || detail.colorId === color.id) {
    return { ...state, palette, changed: palette !== state.palette, synchronizedBaseColor: null };
  }
  return {
    palette,
    parts: state.parts,
    manualDetails: state.manualDetails.map((item) => item.id === target.id
      ? { ...item, colorId: color.id, updatedAt: Date.now() }
      : item),
    changed: true,
    synchronizedBaseColor: null,
  };
}
