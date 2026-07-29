import type {Locale} from "@/features/i18n/types/Locale";
import type {PaletteColor} from "@/features/models/types/PaletteColor";
import {DEFAULT_PART_PAINTING_WORKFLOW,type PaintingDifficulty,type PaintingPreviewCamera,type PaintingStage,type PaintingStageType,type PaintingStepPreviewShot,type PaintingTargetReference,type PartPaintingWorkflow} from "../types/PaintingWorkflow";

export const PAINTING_STAGE_TYPES:readonly PaintingStageType[]=["primer","base-coat","secondary-color","wash","dry-brush","highlight","finish","custom"];
const LEGACY_STAGE_TYPES:Record<string,PaintingStageType>={primer:"primer","ґрунтування":"primer","грунтування":"primer","base coat":"base-coat","базовий шар":"base-coat","secondary color":"secondary-color","додатковий колір":"secondary-color",wash:"wash",проливка:"wash",змивка:"wash","dry brush":"dry-brush","суха кисть":"dry-brush",highlight:"highlight",висвітлення:"highlight",finish:"finish","фінішне покриття":"finish",custom:"custom","власний етап":"custom"};
function text(value:unknown){return typeof value==="string"?value.trim():""}
export function normalizePaintingStageType(value:unknown):PaintingStageType|null{const raw=text(value);if(PAINTING_STAGE_TYPES.includes(raw as PaintingStageType))return raw as PaintingStageType;return LEGACY_STAGE_TYPES[raw.toLocaleLowerCase()]??null}
function camera(value:unknown):PaintingPreviewCamera|null{
  if(!value||typeof value!=="object")return null;
  const raw=value as Record<string,unknown>,vector=(input:unknown)=>{if(!input||typeof input!=="object")return null;const row=input as Record<string,unknown>;return ["x","y","z"].every(key=>typeof row[key]==="number"&&Number.isFinite(row[key]))?{x:Number(row.x),y:Number(row.y),z:Number(row.z)}:null};
  const position=vector(raw.position),target=vector(raw.target),up=vector(raw.up);
  return position&&target&&up&&typeof raw.zoom==="number"&&raw.zoom>0&&typeof raw.targetRadius==="number"&&raw.targetRadius>0?{position,target,up,zoom:raw.zoom,targetRadius:raw.targetRadius}:null;
}
function normalizeShots(value:unknown):PaintingStepPreviewShot[]{
  if(!Array.isArray(value))return[];
  return value.flatMap((item):PaintingStepPreviewShot[]=>{
    if(!item||typeof item!=="object")return[];
    const shot=item as Record<string,unknown>;
    if(shot.type==="manualDetailLocation"&&typeof shot.id==="string"&&typeof shot.manualDetailId==="string"&&typeof shot.pinId==="string")return[{id:shot.id,type:"manualDetailLocation",manualDetailId:shot.manualDetailId,pinId:shot.pinId}];
    const previewCamera=camera(shot.camera);
    if(!previewCamera||typeof shot.id!=="string")return[];
    if(shot.type==="manualDetailRegion"&&typeof shot.manualDetailId==="string")return[{id:shot.id,type:"manualDetailRegion",manualDetailId:shot.manualDetailId,camera:previewCamera}];
    if(shot.type==="manualStepCapture"&&(shot.displayMode==="current-step"||shot.displayMode==="through-current-step"))return[{id:shot.id,type:"manualStepCapture",manualDetailId:"",displayMode:shot.displayMode,camera:previewCamera}];
    return[];
  });
}
export function normalizePaintingStage(value:unknown,index:number):PaintingStage|null{
  if(!value||typeof value!=="object")return null;
  const raw=value as Record<string,unknown>,rawType=text(raw.type),legacyName=text(raw.name),providedCustomName=text(raw.customName);
  let type=normalizePaintingStageType(rawType),customName:string|null=null;
  if(type==="custom")customName=(providedCustomName||legacyName).slice(0,100)||null;
  else if(!type){if(!rawType)type=normalizePaintingStageType(legacyName);if(type==="custom")customName=(providedCustomName||legacyName).slice(0,100)||null;else if(!type){type="custom";customName=(providedCustomName||rawType||legacyName).slice(0,100)||null}}
  if(typeof raw.id!=="string"||!raw.id)return null;
  const targetReferences=Array.isArray(raw.targetReferences)?raw.targetReferences.flatMap((item):PaintingTargetReference[]=>{if(!item||typeof item!=="object")return[];const reference=item as {type?:unknown;id?:unknown};if(typeof reference.id!=="string")return[];if(reference.type==="part")return[{type:"part",id:reference.id}];if(reference.type==="manualDetail"||reference.type==="marker")return[{type:"manualDetail",id:reference.id}];return[]}):[];
  return{id:raw.id,order:index+1,type,customName:providedCustomName||customName,paletteColorId:typeof raw.paletteColorId==="string"?raw.paletteColorId:null,recommendedCoats:Number.isInteger(raw.recommendedCoats)&&Number(raw.recommendedCoats)>=1&&Number(raw.recommendedCoats)<=10?Number(raw.recommendedCoats):null,notes:text(raw.notes).slice(0,500),targetReferences,overviewPreviewEnabled:raw.overviewPreviewEnabled!==false,previewShots:normalizeShots(raw.previewShots),createdAt:typeof raw.createdAt==="string"?raw.createdAt:"",updatedAt:typeof raw.updatedAt==="string"?raw.updatedAt:""};
}
export function normalizePaintingWorkflow(value:unknown):PartPaintingWorkflow{
  if(!value||typeof value!=="object")return{...DEFAULT_PART_PAINTING_WORKFLOW,stages:[]};
  const raw=value as Partial<PartPaintingWorkflow>&{stages?:unknown[]},input=Array.isArray(raw.stages)?raw.stages:[];
  const stages=input.map((item,index)=>({item,order:typeof (item as {order?:unknown})?.order==="number"?Number((item as {order:number}).order):index+1})).sort((a,b)=>a.order-b.order).flatMap(({item},index)=>{const stage=normalizePaintingStage(item,index);return stage?[stage]:[]}).map((stage,index)=>({...stage,order:index+1}));
  return{stages,notes:text(raw.notes).slice(0,1500),paintBeforeAssembly:raw.paintBeforeAssembly===true,difficulty:["easy","medium","hard"].includes(String(raw.difficulty))?raw.difficulty as PaintingDifficulty:null,estimatedTimeMinutes:Number.isInteger(raw.estimatedTimeMinutes)&&Number(raw.estimatedTimeMinutes)>=1&&Number(raw.estimatedTimeMinutes)<=1440?Number(raw.estimatedTimeMinutes):null};
}
export type PaintingWorkflowIssueCode="missing-stage-name"|"invalid-stage-order"|"duplicate-stage-id"|"missing-palette-color"|"invalid-coats"|"invalid-estimated-time";
export type PaintingWorkflowIssue={code:PaintingWorkflowIssueCode;severity:"warning"|"error";stageId:string|null};
export function validatePartPaintingWorkflow({workflow,palette}:{workflow:PartPaintingWorkflow;palette:readonly PaletteColor[]}):PaintingWorkflowIssue[]{
  const issues:PaintingWorkflowIssue[]=[],ids=new Set<string>(),colors=new Set(palette.map(color=>color.id));
  workflow.stages.forEach((stage,index)=>{if(stage.type==="custom"&&!stage.customName?.trim())issues.push({code:"missing-stage-name",severity:"error",stageId:stage.id});if(stage.order!==index+1)issues.push({code:"invalid-stage-order",severity:"error",stageId:stage.id});if(ids.has(stage.id))issues.push({code:"duplicate-stage-id",severity:"error",stageId:stage.id});ids.add(stage.id);if(stage.paletteColorId&&!colors.has(stage.paletteColorId))issues.push({code:"missing-palette-color",severity:"warning",stageId:stage.id});if(stage.recommendedCoats!==null&&(!Number.isInteger(stage.recommendedCoats)||stage.recommendedCoats<1||stage.recommendedCoats>10))issues.push({code:"invalid-coats",severity:"error",stageId:stage.id})});
  if(workflow.estimatedTimeMinutes!==null&&(!Number.isInteger(workflow.estimatedTimeMinutes)||workflow.estimatedTimeMinutes<1||workflow.estimatedTimeMinutes>1440))issues.push({code:"invalid-estimated-time",severity:"error",stageId:null});
  return issues;
}
export function formatPaintingTime(minutes:number,locale:Locale){const hours=Math.floor(minutes/60),remainder=minutes%60;if(!hours)return`${remainder} ${locale==="uk"?"хв":"min"}`;return`${hours} ${locale==="uk"?"год":"h"}${remainder?` ${remainder} ${locale==="uk"?"хв":"min"}`:""}`}
