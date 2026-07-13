import type { ProjectStatus } from "./ProjectStatus";

export type PrinterType = "fdm" | "resin" | "other";

export type ProjectMaterial =
  | "pla"
  | "petg"
  | "abs"
  | "tpu"
  | "resin"
  | "other";

export type Project = {
  id: string;
  userId: string;

  name: string;
  description: string;

  modelUrl: string | null;
  modelStoragePath: string | null;
  originalFileName: string;
  originalFileSize: number;
  originalFileType: string;

  thumbnailUrl: string | null;

  status: ProjectStatus;

  printerType: PrinterType;
  material: ProjectMaterial;
  baseColor: string;

  createdAt: Date;
  updatedAt: Date;
};

export type CreateProjectInput = {
  userId: string;

  name: string;
  description: string;

  file: File;

  printerType: PrinterType;
  material: ProjectMaterial;
  baseColor: string;
};