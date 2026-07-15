import type { PaletteOptimization } from "../types/PaletteGeneration";

export const PALETTE_THRESHOLDS: Record<
  Exclude<PaletteOptimization, "none">,
  number
> = {
  low: 8,
  medium: 18,
  high: 32,
} as const;