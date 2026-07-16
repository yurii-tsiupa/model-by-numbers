import type { DetectedModelPart } from "./DetectedModelPart";
export type ReviewedDetectedModelPart=DetectedModelPart&{includeInProject:boolean;editedName:string};
export type ModelImportPartsFilter="all"|"included"|"excluded"|"unnamed"|"high-poly"|"hidden"|"nested";
