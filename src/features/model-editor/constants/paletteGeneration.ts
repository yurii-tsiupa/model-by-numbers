import { PaletteOptimization } from "../types/PaletteGeneration";

export const optimizationOptions: {
  value: PaletteOptimization;
  title: string;
  description: string;
}[] = [
  {
    value: "none",
    title: "None",
    description:
      "Keep every original material color.",
  },
  {
    value: "low",
    title: "Low",
    description:
      "Merge only nearly identical colors.",
  },
  {
    value: "medium",
    title: "Medium",
    description:
      "Balanced palette for most miniatures.",
  },
  {
    value: "high",
    title: "High",
    description:
      "Create the smallest practical palette.",
  },
];