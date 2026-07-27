import type { Vector3Like } from "./PaintMarker";
export type ManualDetailPin={id:string;position:Vector3Like;normal:Vector3Like|null;camera:{position:Vector3Like;target:Vector3Like;zoom?:number};label?:string;createdAt:number;updatedAt:number};
export type ManualRegionSelection={meshId:string;triangleIndices:number[]};
export type DetailRegion={selections:ManualRegionSelection[]};
export type ManualDetailTargetMode="markers"|"region";
export type ManualDetail={id:string;number:number;name:string;colorId:string|null;pins:ManualDetailPin[];targetMode?:ManualDetailTargetMode;region?:DetailRegion;createdAt:number;updatedAt:number};
export type CreateManualDetailPinInput=Pick<ManualDetailPin,"position"|"normal"|"camera">;
