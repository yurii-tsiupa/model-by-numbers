import type { Locale } from "@/features/i18n/types/Locale";
import type { PaletteColor } from "@/features/models/types/PaletteColor";
import { DEFAULT_PART_PAINTING_WORKFLOW, type PartPaintingWorkflow, type PaintingStage, type PaintingStageType } from "../types/PaintingWorkflow";

const TYPES: PaintingStageType[] = ["primer","base-coat","secondary-color","wash","dry-brush","highlight","finish","custom"];
export function normalizePaintingWorkflow(value: unknown): PartPaintingWorkflow {
  if (!value || typeof value !== "object") return { ...DEFAULT_PART_PAINTING_WORKFLOW, stages: [] };
  const raw = value as Partial<PartPaintingWorkflow>;
  const stages = (Array.isArray(raw.stages) ? raw.stages : []).flatMap((item): PaintingStage[] => {
    if (!item || typeof item !== "object") return [];
    const stage = item as Partial<PaintingStage>;
    if (typeof stage.id !== "string" || !stage.id || !TYPES.includes(stage.type as PaintingStageType) || typeof stage.name !== "string") return [];
    return [{ id: stage.id, order: 0, type: stage.type as PaintingStageType, name: stage.name.slice(0,100), paletteColorId: typeof stage.paletteColorId === "string" ? stage.paletteColorId : null, recommendedCoats: Number.isInteger(stage.recommendedCoats) && Number(stage.recommendedCoats)>=1 && Number(stage.recommendedCoats)<=10 ? Number(stage.recommendedCoats) : null, notes: typeof stage.notes === "string" ? stage.notes.slice(0,500) : "", createdAt: typeof stage.createdAt === "string" ? stage.createdAt : "", updatedAt: typeof stage.updatedAt === "string" ? stage.updatedAt : "" }];
  }).sort((a,b) => Number((raw.stages as PaintingStage[]).find(s=>s.id===a.id)?.order ?? 0)-Number((raw.stages as PaintingStage[]).find(s=>s.id===b.id)?.order ?? 0)).map((stage,index)=>({...stage,order:index+1}));
  return { stages, notes: typeof raw.notes === "string" ? raw.notes.slice(0,1500) : "", paintBeforeAssembly: raw.paintBeforeAssembly === true, difficulty: ["easy","medium","hard"].includes(String(raw.difficulty)) ? raw.difficulty! : null, estimatedTimeMinutes: Number.isInteger(raw.estimatedTimeMinutes) && Number(raw.estimatedTimeMinutes)>=1 && Number(raw.estimatedTimeMinutes)<=1440 ? Number(raw.estimatedTimeMinutes) : null };
}
export type PaintingWorkflowIssueCode = "missing-stage-name"|"invalid-stage-order"|"duplicate-stage-id"|"missing-palette-color"|"invalid-coats"|"invalid-estimated-time";
export type PaintingWorkflowIssue = { code: PaintingWorkflowIssueCode; severity: "warning"|"error"; stageId: string|null };
export function validatePartPaintingWorkflow({workflow,palette}:{workflow:PartPaintingWorkflow;palette:readonly PaletteColor[]}):PaintingWorkflowIssue[]{ const issues:PaintingWorkflowIssue[]=[];const ids=new Set<string>();const colors=new Set(palette.map(c=>c.id));workflow.stages.forEach((s,i)=>{if(!s.name.trim())issues.push({code:"missing-stage-name",severity:"error",stageId:s.id});if(s.order!==i+1)issues.push({code:"invalid-stage-order",severity:"error",stageId:s.id});if(ids.has(s.id))issues.push({code:"duplicate-stage-id",severity:"error",stageId:s.id});ids.add(s.id);if(s.paletteColorId&&!colors.has(s.paletteColorId))issues.push({code:"missing-palette-color",severity:"warning",stageId:s.id});if(s.recommendedCoats!==null&&(!Number.isInteger(s.recommendedCoats)||s.recommendedCoats<1||s.recommendedCoats>10))issues.push({code:"invalid-coats",severity:"error",stageId:s.id});});if(workflow.estimatedTimeMinutes!==null&&(!Number.isInteger(workflow.estimatedTimeMinutes)||workflow.estimatedTimeMinutes<1||workflow.estimatedTimeMinutes>1440))issues.push({code:"invalid-estimated-time",severity:"error",stageId:null});return issues; }
export function formatPaintingTime(minutes:number,locale:Locale){const h=Math.floor(minutes/60),m=minutes%60;if(!h)return `${m} ${locale==="uk"?"хв":"min"}`;return `${h} ${locale==="uk"?"год":"h"}${m?` ${m} ${locale==="uk"?"хв":"min"}`:""}`;}
