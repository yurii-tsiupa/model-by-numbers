import type {ManualDetail} from "@/features/models/types/ManualDetail";
import type {PaletteColor} from "@/features/models/types/PaletteColor";

import type {ModelPart} from "../types/ModelPart";
import type {PaintingStage,StepPreviewDisplayMode} from "../types/PaintingWorkflow";

export type StepPreviewComposition={
  partColors:Map<string,string>;
  regions:Map<string,{color:string;triangles:number[]}>;
  markerDetails:ManualDetail[];
};

export function resolveStepPreviewComposition({step,parts,manualDetails,palette,baseColor,displayMode}:{step:PaintingStage;parts:ModelPart[];manualDetails:ManualDetail[];palette:readonly Pick<PaletteColor,"id"|"hex">[];baseColor:string;displayMode:StepPreviewDisplayMode}):StepPreviewComposition{
  const owner=parts.find(part=>part.paintingWorkflow.stages.some(candidate=>candidate.id===step.id));
  const ordered=owner?.paintingWorkflow.stages??[step];
  const currentIndex=ordered.findIndex(candidate=>candidate.id===step.id);
  const included=displayMode==="through-current-step"&&currentIndex>=0?ordered.slice(0,currentIndex+1):[step];
  const colors=new Map(palette.map(color=>[color.id,color.hex]));
  const details=new Map(manualDetails.map(detail=>[detail.id,detail]));
  const partColors=new Map<string,string>();
  const regions=new Map<string,{color:string;triangles:number[]}>();
  for(const stage of included){
    const color=stage.paletteColorId?colors.get(stage.paletteColorId)??baseColor:baseColor;
    const references=stage.type==="primer"&&!(stage.targetReferences?.length)?parts.map(part=>({type:"part" as const,id:part.id})):stage.targetReferences??[];
    for(const reference of references){
      if(reference.type==="part"){partColors.set(reference.id,color);continue}
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
