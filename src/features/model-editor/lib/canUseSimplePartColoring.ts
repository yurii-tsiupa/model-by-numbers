import type {ModelPart} from "../types/ModelPart";

export function canUseSimplePartColoring(parts:readonly ModelPart[]):boolean{
  return parts.length>=2;
}
