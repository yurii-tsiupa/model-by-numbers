import type {ManualDetail} from "@/features/models/types/ManualDetail";
import type {ModelPart} from "../types/ModelPart";
import type {PaintingStage} from "../types/PaintingWorkflow";

function isMarkerDetail(detail:ManualDetail){
  return detail.targetMode!=="region"&&detail.pins.length>0;
}

export function getOrderedSimplePaintingSteps(parts:readonly {paintingWorkflow:{stages:PaintingStage[]}}[],stepOrder:readonly string[]=[]):PaintingStage[]{
  const stages=parts.flatMap(part=>[...part.paintingWorkflow.stages].sort((a,b)=>a.order-b.order));
  const byId=new Map(stages.map(stage=>[stage.id,stage]));
  return[...stepOrder.map(id=>byId.get(id)).filter((stage):stage is PaintingStage=>Boolean(stage)),...stages.filter(stage=>!stepOrder.includes(stage.id))];
}

export function resolveSimpleMarkerNumbers(orderedSteps:readonly PaintingStage[],details:readonly ManualDetail[]):Map<string,number>{
  const detailById=new Map(details.map(detail=>[detail.id,detail]));
  const markerNumbers=new Map<string,number>();
  let next=1;
  for(const step of orderedSteps){
    const markerDetailIds=[...new Set((step.targetReferences??[]).flatMap(reference=>{
      if(reference.type!=="manualDetail"||markerNumbers.has(reference.id))return[];
      const detail=detailById.get(reference.id);
      return detail&&isMarkerDetail(detail)?[detail.id]:[];
    }))];
    if(!markerDetailIds.length)continue;
    for(const detailId of markerDetailIds)markerNumbers.set(detailId,next);
    next+=1;
  }
  return markerNumbers;
}

export function withResolvedSimpleMarkerNumbers(details:readonly ManualDetail[],orderedSteps:readonly PaintingStage[]):ManualDetail[]{
  const numbers=resolveSimpleMarkerNumbers(orderedSteps,details);
  return details.map(detail=>{
    const markerNumber=numbers.get(detail.id);
    if(markerNumber===undefined)return detail;
    return detail.markerNumber===markerNumber?detail:{...detail,markerNumber};
  });
}

export function normalizeSimpleMarkerNumbers(details:readonly ManualDetail[],parts:readonly ModelPart[]){
  const markerNumbers=resolveSimpleMarkerNumbers(getOrderedSimplePaintingSteps(parts),details);

  return details.map(detail=>{
    const markerNumber=markerNumbers.get(detail.id);
    if(markerNumber===undefined)return detail.targetMode==="region"&&detail.markerNumber!==undefined
      ?({...detail,markerNumber:undefined})
      :detail;
    return detail.markerNumber===markerNumber?detail:{...detail,markerNumber};
  });
}

export function getNextSimpleMarkerNumber(details:readonly ManualDetail[]){
  return Math.max(0,...details.flatMap(detail=>Number.isInteger(detail.markerNumber)&&detail.markerNumber!>0?[detail.markerNumber!]:[]))+1;
}
