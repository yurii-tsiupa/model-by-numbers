import {translate} from "@/features/i18n/lib/i18n";
import {getPaintingStageLabel} from "@/features/model-editor/lib/paintingStageLabel";
import {getCachedStepPreview} from "@/features/model-editor/step-previews/cache";
import {getStepPreviewCacheKey} from "@/features/model-editor/step-previews/getStepPreviewCacheKey";
import {hasStepPreviewGenerator} from "@/features/model-editor/step-previews/stepPreviewService";
import type {PaintingStepPreviewShot} from "@/features/model-editor/types/PaintingWorkflow";
import type {GuidePaintingStepViewModel,GuideStepPreviewState} from "../types/GuidePaintingStep";
import type {ModelGuide} from "../types/ModelGuide";

export function buildGuidePaintingStepViewModels(guide:ModelGuide):GuidePaintingStepViewModel[]{
 const locale=guide.locale??"en",parts=guide.workflowParts??guide.parts,partById=new Map(parts.map(part=>[part.id,part])),details=guide.manualDetails??[],detailById=new Map(details.map(detail=>[detail.id,detail])),palette=guide.previewPalette??guide.workflowPalette??guide.palette;let order=0;
 return parts.flatMap(part=>(part.paintingWorkflow?.stages??[]).map(stage=>{
  order+=1;const labels:string[]=[],seen=new Set<string>();
  for(const reference of stage.targetReferences??[]){const key=`${reference.type}:${reference.id}`;if(seen.has(key))continue;seen.add(key);if(reference.type==="part"){const target=partById.get(reference.id);if(target)labels.push(target.name)}else{const detail=detailById.get(reference.id);if(detail)labels.push(translate(locale,"guide.steps.targets.manualDetail",{number:detail.number,name:detail.name}))}}
  const general=(stage.targetReferences?.length??0)===0,title=getPaintingStageLabel(stage,key=>translate(locale,key));
  function preview(id:string,label:string,shot?:PaintingStepPreviewShot):GuideStepPreviewState{const detail=shot?detailById.get(shot.manualDetailId):null,pin=detail?.pins.find(item=>item.id===shot?.pinId);if(shot&&!pin)return{id,label,status:"unavailable",reason:"missing-targets"};const cacheKey=general?null:getStepPreviewCacheKey(guide.projectId,stage,parts,details,palette,shot),cached=cacheKey?getCachedStepPreview(cacheKey):null,alt=translate(locale,"guide.accessibility.stepPreview",{number:order,title,targets:shot?label:labels.join(", ")});return general?{id,label,status:"unavailable",reason:"general"}:cached?{id,label,status:"ready",image:{src:cached.imageUrl,width:cached.width,height:cached.height,kind:"generated"},alt}:hasStepPreviewGenerator(guide.projectId)?{id,label,status:"loading"}:{id,label,status:"unavailable",reason:labels.length?"generation-failed":"missing-targets"}}
  const previews=[...(stage.overviewPreviewEnabled!==false?[preview("overview",translate(locale,"editor.steps.previewShots.automaticOverview"))]:[]),...(stage.previewShots??[]).map(shot=>{const detail=detailById.get(shot.manualDetailId),index=detail?.pins.findIndex(pin=>pin.id===shot.pinId)??-1,label=detail&&index>=0?translate(locale,"editor.steps.previewShots.detailLabel",{number:detail.number,name:detail.name,index:index+1}):translate(locale,"editor.steps.previewShots.unavailable");return preview(shot.id,label,shot)})];
  return{id:stage.id,partId:part.id,order,title,instruction:stage.notes,stageType:stage.type,targetSummary:general?translate(locale,"guide.steps.targets.entireModel"):labels.length?labels.join(" · "):translate(locale,"guide.steps.targets.unavailable"),targetLabels:labels,previews};
 }));
}
