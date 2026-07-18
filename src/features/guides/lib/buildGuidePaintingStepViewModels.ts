import {translate} from "@/features/i18n/lib/i18n";
import {getPaintingStageLabel} from "@/features/model-editor/lib/paintingStageLabel";
import {getCachedStepPreview} from "@/features/model-editor/step-previews/cache";
import {getStepPreviewCacheKey} from "@/features/model-editor/step-previews/getStepPreviewCacheKey";
import {hasStepPreviewGenerator} from "@/features/model-editor/step-previews/stepPreviewService";
import type {GuidePaintingStepViewModel} from "../types/GuidePaintingStep";
import type {ModelGuide} from "../types/ModelGuide";

export function buildGuidePaintingStepViewModels(guide:ModelGuide):GuidePaintingStepViewModel[]{
 const locale=guide.locale??"en",parts=guide.workflowParts??guide.parts,partById=new Map(parts.map(part=>[part.id,part])),details=guide.manualDetails??[],detailById=new Map(details.map(detail=>[detail.id,detail]));let order=0;
 return parts.flatMap(part=>(part.paintingWorkflow?.stages??[]).map(stage=>{
  order+=1;const labels:string[]=[],seen=new Set<string>();
  for(const reference of stage.targetReferences??[]){const key=`${reference.type}:${reference.id}`;if(seen.has(key))continue;seen.add(key);if(reference.type==="part"){const target=partById.get(reference.id);if(target)labels.push(target.name)}else{const detail=detailById.get(reference.id);if(detail)labels.push(translate(locale,"guide.steps.targets.manualDetail",{number:detail.number,name:detail.name}))}}
  const general=(stage.targetReferences?.length??0)===0,cacheKey=general?null:getStepPreviewCacheKey(guide.projectId,stage,parts,details,guide.previewPalette??guide.workflowPalette??guide.palette),cached=cacheKey?getCachedStepPreview(cacheKey):null,title=getPaintingStageLabel(stage,key=>translate(locale,key)),alt=translate(locale,"guide.accessibility.stepPreview",{number:order,title,targets:labels.join(", ")});
  return{id:stage.id,partId:part.id,order,title,instruction:stage.notes,stageType:stage.type,targetSummary:general?translate(locale,"guide.steps.targets.entireModel"):labels.length?labels.join(" · "):translate(locale,"guide.steps.targets.unavailable"),targetLabels:labels,cacheKey,preview:general?{status:"unavailable",reason:"general"}:cached?{status:"ready",image:{src:cached.imageUrl,width:cached.width,height:cached.height,kind:"generated"},alt}:hasStepPreviewGenerator(guide.projectId)?{status:"loading"}:{status:"unavailable",reason:labels.length?"generation-failed":"missing-targets"}};
 }));
}
