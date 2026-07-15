export type GuideReadinessCheckId =
  | "model-file"
  | "parts"
  | "palette"
  | "painted-parts"
  | "visible-parts-painted"
  | "base-color"
  | "printer-type"
  | "material";

export type GuideReadinessCheck = {
  id: GuideReadinessCheckId;
  label: string;
  description: string;
  isComplete: boolean;
};

export type GuideReadiness = {
  checks: GuideReadinessCheck[];
  completedCount: number;
  totalCount: number;
  progress: number;
  isReady: boolean;
};