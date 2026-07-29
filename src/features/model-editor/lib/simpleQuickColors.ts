import { PAINT_COLORS } from "../constants/paintColors";

const QUICK_COLOR_IDS = new Set([
  "white", "black", "gray", "red", "blue", "yellow", "green", "brown",
]);

export const SIMPLE_QUICK_COLORS = PAINT_COLORS.filter((color) => QUICK_COLOR_IDS.has(color.id));
