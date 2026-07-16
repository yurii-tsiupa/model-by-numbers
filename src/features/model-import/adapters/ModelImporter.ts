import type {ImportedModel} from "../types/ImportedModel";import type {ModelFormat} from "../types/ModelFormat";
export interface ModelImporter{readonly format:ModelFormat;supports(file:File):boolean;parse(file:File,signal?:AbortSignal):Promise<ImportedModel>}
