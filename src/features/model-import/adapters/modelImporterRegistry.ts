import type { ModelImporter } from "./ModelImporter";
import { glbModelImporter } from "./glbModelImporter";
import { stlModelImporter } from "./stlModelImporter";
const importers: readonly ModelImporter[] = [glbModelImporter, stlModelImporter];
export function getModelImporter(file: File): ModelImporter | null { return importers.find((importer) => importer.supports(file)) ?? null; }
