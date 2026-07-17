import type { PaintingWorkflowPreset } from "../types/PaintingWorkflow";
const KEY="model-by-numbers:painting-workflow-presets:v1";
function valid(value:unknown):value is PaintingWorkflowPreset{return Boolean(value&&typeof value==="object"&&typeof (value as PaintingWorkflowPreset).id==="string"&&(value as PaintingWorkflowPreset).source==="user"&&typeof (value as PaintingWorkflowPreset).name==="string"&&Array.isArray((value as PaintingWorkflowPreset).stages));}
function read(){if(typeof window==="undefined")return[];try{const value=JSON.parse(localStorage.getItem(KEY)??"[]");return Array.isArray(value)?value.filter(valid):[];}catch{return[];}}
function write(items:PaintingWorkflowPreset[]){localStorage.setItem(KEY,JSON.stringify(items));}
export const paintingWorkflowPresetRepository={async getUserPaintingWorkflowPresets(){return read();},async saveUserPaintingWorkflowPreset(preset:PaintingWorkflowPreset){write([...read().filter(p=>p.id!==preset.id),preset]);},async updateUserPaintingWorkflowPreset(preset:PaintingWorkflowPreset){write(read().map(p=>p.id===preset.id?preset:p));},async deleteUserPaintingWorkflowPreset(id:string){write(read().filter(p=>p.id!==id));}};
