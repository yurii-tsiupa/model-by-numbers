import type { ModelGuide } from "./ModelGuide";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";

export type GeneratedGuideStatus = "draft" | "ready";

export type GeneratedGuide = {
  id: string;
  projectId: string;
  version: number;
  status: GeneratedGuideStatus;
  changedAfterDownload?: boolean;
  fileName: string;
  snapshot: ModelGuide;
  templateSettings?: GuideTemplateSettings;
  pdfBlob: Blob | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SaveGeneratedGuideInput = Pick<
  GeneratedGuide,
  "projectId" | "snapshot" | "templateSettings" | "pdfBlob" | "fileName" | "status"
> & { id?: string; changedAfterDownload?: boolean };
