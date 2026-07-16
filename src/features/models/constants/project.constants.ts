import type {
  PrinterType,
  ProjectMaterial,
} from "../types/Project";

export const PROJECT_PLACEHOLDER_THUMBNAIL =
  "/images/model-placeholder.webp";

export const DEFAULT_PROJECT_COLOR = "#d4d4d8";


export const PRINTER_TYPE_OPTIONS: Array<{
  value: PrinterType;
  label: string;
}> = [
  {
    value: "fdm",
    label: "FDM",
  },
  {
    value: "resin",
    label: "Resin",
  },
  {
    value: "other",
    label: "Other",
  },
];

export const MATERIAL_OPTIONS: Array<{
  value: ProjectMaterial;
  label: string;
}> = [
  {
    value: "pla",
    label: "PLA",
  },
  {
    value: "petg",
    label: "PETG",
  },
  {
    value: "abs",
    label: "ABS",
  },
  {
    value: "tpu",
    label: "TPU",
  },
  {
    value: "resin",
    label: "Resin",
  },
  {
    value: "other",
    label: "Other",
  },
];

export const projectQueryKeys = {
  all: ["projects"] as const,

  list: (userId: string) =>
    [...projectQueryKeys.all, "list", userId] as const,
};
