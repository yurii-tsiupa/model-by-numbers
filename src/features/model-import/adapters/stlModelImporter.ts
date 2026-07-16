import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import type { ModelImporter } from "./ModelImporter";
import { STL_CAPABILITIES } from "../constants/modelImport.constants";
import { createStlScene } from "../lib/createStlScene";
import { getModelFileExtension } from "../lib/getModelFileExtension";
const abortError = () => new DOMException("Import cancelled.", "AbortError");
const displayName = (fileName: string) => { const value=fileName.replace(/\.stl$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim(); return value ? value.replace(/\b\w/g, (letter) => letter.toUpperCase()).slice(0, 120) : "STL Model"; };
const detectVariant = (buffer: ArrayBuffer): "ascii" | "binary" => { if (buffer.byteLength >= 84) { const triangles=new DataView(buffer).getUint32(80,true); if (84+triangles*50===buffer.byteLength) return "binary"; } return "ascii"; };
export const stlModelImporter: ModelImporter = { format:"stl", supports:(file)=>getModelFileExtension(file.name)==="stl", async parse(file,signal) { if(signal?.aborted)throw abortError(); const buffer=await file.arrayBuffer(); if(signal?.aborted)throw abortError(); let geometry; try{geometry=new STLLoader().parse(buffer);}catch{throw new Error("stl-parse-failed");} if(signal?.aborted){geometry.dispose();throw abortError();} try{const scene=createStlScene(geometry,displayName(file.name));return{format:"stl",scene,capabilities:STL_CAPABILITIES,file:{name:file.name,extension:"stl",mimeType:file.type,sizeBytes:file.size},source:{animationsCount:0,materialsCount:0,texturesCount:0,variant:detectVariant(buffer)}};}catch(error){geometry.dispose();throw error;} } };
