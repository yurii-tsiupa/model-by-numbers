import type { Object3D } from "three";
import type { ModelFormat, ModelFormatCapabilities } from "./ModelFormat";
export type ImportedModel={format:ModelFormat;scene:Object3D;capabilities:ModelFormatCapabilities;file:{name:string;extension:string;mimeType:string;sizeBytes:number};source:{animationsCount:number;materialsCount?:number;texturesCount?:number;variant?:"ascii"|"binary"}};
