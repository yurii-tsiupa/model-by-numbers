import type { ModelGuide } from "./ModelGuide";

export type GeneratedGuideStatus = "ready" | "failed";

export type GeneratedGuide = {
  id: string;
  projectId: string;
  version: number;
  status: GeneratedGuideStatus;
  fileName: string;
  snapshot: ModelGuide;
  pdfBlob: Blob | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SaveGeneratedGuideInput = Pick<
  GeneratedGuide,
  "projectId" | "snapshot" | "pdfBlob" | "fileName"
>;
