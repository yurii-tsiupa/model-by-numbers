export type PaletteSource =
  | "original";
// | "citadel"
// | "vallejo"
// | "armyPainter";

export type PaletteOptimization =
  | "none"
  | "low"
  | "medium"
  | "high";

export type GeneratePaletteOptions = {
  source: PaletteSource;
  optimization: PaletteOptimization;
};