import type { ProjectStatus } from "./ProjectStatus";

export type PrinterType =
  | "fdm"
  | "resin"
  | "other"
  | "unknown";

export type ProjectMaterial =
  | "pla"
  | "abs"
  | "petg"
  | "tpu"
  | "resin"
  | "other"
  | "unknown";

export type Project = {
  id: string;
  userId: string;

  name: string;
  description: string;

  modelUrl: string;
  modelStoragePath: string;
  originalFileName: string;

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