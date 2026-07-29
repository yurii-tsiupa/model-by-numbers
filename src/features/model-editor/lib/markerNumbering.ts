import type {ManualDetail} from "@/features/models/types/ManualDetail";
import type {ModelPart} from "../types/ModelPart";

function isMarkerDetail(detail:ManualDetail){
  return detail.targetMode!=="region"&&detail.pins.length>0;
}

export function normalizeSimpleMarkerNumbers(details:readonly ManualDetail[],parts:readonly ModelPart[]){
  const detailById=new Map(details.map(detail=>[detail.id,detail]));
  const markerNumbers=new Map<string,number>();
  let next=1;

  for(const part of parts){
    for(const stage of [...part.paintingWorkflow.stages].sort((a,b)=>a.order-b.order)){
      const reference=stage.targetReferences?.find(target=>target.type==="manualDetail");
      if(!reference||markerNumbers.has(reference.id))continue;
      const detail=detailById.get(reference.id);
      if(!detail||!isMarkerDetail(detail))continue;
      markerNumbers.set(detail.id,next++);
    }
  }

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
