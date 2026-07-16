import type { PaletteOptimization } from "../types/PaletteGeneration";

// Domain values only; labels and descriptions are translated at render time.
export const optimizationOptions: readonly {value:PaletteOptimization}[]=[
  {value:"none"},{value:"low"},{value:"medium"},{value:"high"},
];
