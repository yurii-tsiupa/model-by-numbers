import type { Vector3Like } from "./PaintMarker";
export type ManualDetailPin={id:string;position:Vector3Like;normal:Vector3Like|null;camera:{position:Vector3Like;target:Vector3Like;zoom?:number};label?:string;createdAt:number;updatedAt:number};
export type ManualDetail={id:string;number:number;name:string;colorId:string|null;pins:ManualDetailPin[];createdAt:number;updatedAt:number};
export type CreateManualDetailPinInput=Pick<ManualDetailPin,"position"|"normal"|"camera">;
