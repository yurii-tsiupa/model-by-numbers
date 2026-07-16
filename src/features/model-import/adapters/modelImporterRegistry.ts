import type {ModelImporter} from "./ModelImporter";import {glbModelImporter} from "./glbModelImporter";
const importers:readonly ModelImporter[]=[glbModelImporter];export function getModelImporter(file:File):ModelImporter|null{return importers.find(importer=>importer.supports(file))??null;}
