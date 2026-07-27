import type {ManualDetail,ManualDetailTargetMode} from "@/features/models/types/ManualDetail";
import type {SimpleTargetMode} from "@/features/models/types/SimpleTargetMode";
export type {SimpleTargetMode} from "@/features/models/types/SimpleTargetMode";

export function resolveSimpleTargetMode(projectMode:SimpleTargetMode|null|undefined,detailMode?:ManualDetailTargetMode):SimpleTargetMode{
  return projectMode??detailMode??"markers";
}

export function getLegacyTargetModeCounts(details:readonly ManualDetail[]):{markers:number;region:number}{
  return details.reduce((counts,detail)=>{
    const mode=detail.targetMode==="region"||Boolean(detail.region?.selections.length)?"region":"markers";
    if(detail.pins.length||detail.region?.selections.length)counts[mode]+=1;
    return counts;
  },{markers:0,region:0});
}

export function inferSimpleTargetMode(details:readonly ManualDetail[]):SimpleTargetMode|null{
  const counts=getLegacyTargetModeCounts(details);
  if(counts.markers&&counts.region)return null;
  if(counts.region)return"region";
  if(counts.markers)return"markers";
  return null;
}
