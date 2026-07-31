import type {ManualDetail} from "@/features/models/types/ManualDetail";
import type {PaletteColor} from "@/features/models/types/PaletteColor";

import type {ModelPart} from "../types/ModelPart";
import type {PaintingStage,StepPreviewDisplayMode} from "../types/PaintingWorkflow";

export type StepPreviewComposition={
  partColors:Map<string,string>;
  regions:Map<string,{color:string;triangles:number[]}>;
  markerDetails:ManualDetail[];
};

function orderedStages(parts:ModelPart[],stepOrder:readonly string[]=[]):PaintingStage[]{
  const stages=parts.flatMap(part=>part.paintingWorkflow.stages.slice().sort((a,b)=>a.order-b.order));
  if(!stepOrder.length)return stages;
  const byId=new Map(stages.map(stage=>[stage.id,stage]));
  return[...stepOrder.map(id=>byId.get(id)).filter((stage):stage is PaintingStage=>Boolean(stage)),...stages.filter(stage=>!stepOrder.includes(stage.id))];
}

export function resolveSavedPartColors(parts:ModelPart[],palette:readonly Pick<PaletteColor,"id"|"hex">[],throughStepId?:string,excludedStepId?:string,stepOrder:readonly string[]=[]):Map<string,string>{
  const colors=new Map(palette.map(color=>[color.id,color.hex])),result=new Map<string,string>();
  const stages=orderedStages(parts,stepOrder);
  for(const stage of stages){
    if(stage.id===excludedStepId)continue;
    const hex=stage.paletteColorId?colors.get(stage.paletteColorId):undefined;
    if(hex)for(const reference of stage.targetReferences??[])if(reference.type==="part")result.set(reference.id,hex);
    if(throughStepId&&stage.id===throughStepId)break;
  }
  return result;
}

export function resolveSavedPartColorAssignments(parts:ModelPart[],throughStepId?:string,excludedStepId?:string,stepOrder:readonly string[]=[]):Map<string,string>{
  const result=new Map<string,string>();
  for(const stage of orderedStages(parts,stepOrder)){
    if(stage.id===excludedStepId)continue;
    if(stage.paletteColorId)for(const reference of stage.targetReferences??[])if(reference.type==="part")result.set(reference.id,stage.paletteColorId);
    if(throughStepId&&stage.id===throughStepId)break;
  }
  return result;
}

export function resolveStepPreviewComposition({step,parts,manualDetails,palette,baseColor,displayMode,stepOrder=[]}:{step:PaintingStage;parts:ModelPart[];manualDetails:ManualDetail[];palette:readonly Pick<PaletteColor,"id"|"hex">[];baseColor:string;displayMode:StepPreviewDisplayMode;stepOrder?:readonly string[]}):StepPreviewComposition{
  const ordered=orderedStages(parts,stepOrder).map(candidate=>candidate.id===step.id?step:candidate);
  const currentIndex=ordered.findIndex(candidate=>candidate.id===step.id);
  const noColorPartStep=step.paletteColorId===null&&step.targetReferences?.some(reference=>reference.type==="part");
  const included=(displayMode==="through-current-step"||noColorPartStep)&&currentIndex>=0?ordered.slice(0,currentIndex+1):[step];
  const colors=new Map(palette.map(color=>[color.id,color.hex]));
  const details=new Map(manualDetails.map(detail=>[detail.id,detail]));
  const partColors=new Map<string,string>();
  const regions=new Map<string,{color:string;triangles:number[]}>();
  for(const stage of included){
    const color=stage.paletteColorId?colors.get(stage.paletteColorId)??baseColor:baseColor;
    const references=stage.type==="primer"&&!(stage.targetReferences?.length)?parts.map(part=>({type:"part" as const,id:part.id})):stage.targetReferences??[];
    for(const reference of references){
      if(reference.type==="part"){if(stage.paletteColorId!==null||stage.type==="primer")partColors.set(reference.id,color);continue}
      const detail=details.get(reference.id);
      if(detail?.targetMode!=="region")continue;
      const regionColor=detail.colorId?colors.get(detail.colorId)??color:color;
      for(const selection of detail.region?.selections??[]){
        const meshUuid=parts.find(part=>part.id===selection.meshId)?.meshUuid??selection.meshId;
        regions.set(meshUuid,{color:regionColor,triangles:selection.triangleIndices});
      }
    }
  }
  const currentDetailIds=new Set(step.targetReferences?.filter(reference=>reference.type==="manualDetail").map(reference=>reference.id));
  return{partColors,regions,markerDetails:manualDetails.filter(detail=>currentDetailIds.has(detail.id)&&(detail.targetMode??"markers")==="markers")};
}
