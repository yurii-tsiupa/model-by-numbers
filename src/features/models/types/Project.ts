import type { ProjectStatus } from "./ProjectStatus";
import type { ProjectPart } from "./ProjectPart";
import { PaletteColor } from "./PaletteColor";
import type { AssemblyStep } from "./AssemblyStep";
import type { ModelFormat } from "@/features/model-import/types/ModelFormat";
import type { ModelDimensions, ModelUnits } from "@/features/model-import/types/ModelUnits";

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
  modelFormat: ModelFormat;
  modelUnits: ModelUnits | null;
  originalDimensions: ModelDimensions | null;

  thumbnailUrl: string | null;

  status: ProjectStatus;

  printerType: PrinterType;
  material: ProjectMaterial;
  baseColor: string;

  parts: ProjectPart[];
  palette: PaletteColor[];
  assemblySteps: AssemblyStep[];
  importSchemaVersion?: 1;

  createdAt: Date;
  updatedAt: Date;
};

export type CreateProjectInput = {
  userId: string;

  name: string;
  description: string;

  file: File;
  modelFormat: ModelFormat;
  modelUnits: ModelUnits;
  originalDimensions: ModelDimensions;

  printerType: PrinterType;
  material: ProjectMaterial;
  baseColor: string;
  parts?: ProjectPart[];
  importSchemaVersion?: 1;
};
