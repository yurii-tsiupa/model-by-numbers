import type {ManualDetail} from "@/features/models/types/ManualDetail";
import type {ModelPart} from "../types/ModelPart";
import type {PaintingStage,PaintingTargetReference} from "../types/PaintingWorkflow";

export function resolvePaintingTargetReferences(references:readonly PaintingTargetReference[]|undefined,parts:readonly ModelPart[],manualDetails:readonly ManualDetail[]){
 const partById=new Map(parts.map(part=>[part.id,part])),detailById=new Map(manualDetails.map(detail=>[detail.id,detail])),resolvedParts:ModelPart[]=[],resolvedManualDetails:ManualDetail[]=[],missingReferences:PaintingTargetReference[]=[],seen=new Set<string>();
 for(const reference of references??[]){const key=`${reference.type}:${reference.id}`;if(seen.has(key))continue;seen.add(key);if(reference.type==="part"){const part=partById.get(reference.id);if(part)resolvedParts.push(part);else missingReferences.push(reference)}else{const detail=detailById.get(reference.id);if(detail)resolvedManualDetails.push(detail);else missingReferences.push(reference)}}
 return{parts:resolvedParts,manualDetails:resolvedManualDetails,missingReferences};
}
export function getPaintingStepTargetSummary(stage:PaintingStage,parts:readonly ModelPart[],manualDetails:readonly ManualDetail[]){const resolved=resolvePaintingTargetReferences(stage.targetReferences,parts,manualDetails);return{partCount:resolved.parts.length,manualDetailCount:resolved.manualDetails.length,isGeneral:(stage.targetReferences?.length??0)===0,missingCount:resolved.missingReferences.length}}
export function getStepsReferencingManualDetail(parts:readonly ModelPart[],detailId:string):PaintingStage[]{return parts.flatMap(part=>part.paintingWorkflow.stages).filter(stage=>stage.targetReferences?.some(reference=>reference.type==="manualDetail"&&reference.id===detailId))}
