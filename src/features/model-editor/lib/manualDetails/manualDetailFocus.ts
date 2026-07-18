import { Box3,MathUtils,Sphere,Vector3 } from "three";
import type { ManualDetail,ManualDetailPin } from "@/features/models/types/ManualDetail";
import type { ModelBounds } from "../getModelBounds";

const DEFAULT_FOCUS_DIRECTION=new Vector3(1,.75,1).normalize();
const MIN_CONTEXT_RATIO=.12;
const MAX_CONTEXT_RATIO=1.1;
const FOCUS_PADDING=1.8;

function vector(value:{x:number;y:number;z:number}|null|undefined){return value&&[value.x,value.y,value.z].every(Number.isFinite)?new Vector3(value.x,value.y,value.z):null}
function direction(value:{x:number;y:number;z:number}|null|undefined){const result=vector(value);return result&&result.lengthSq()>1e-8?result.normalize():null}
export function getValidManualDetailPins(detail:ManualDetail){return detail.pins.filter(pin=>vector(pin.position)!==null)}
function savedDirection(pin:ManualDetailPin){const position=vector(pin.camera.position),target=vector(pin.camera.target);if(!position||!target)return null;const result=position.sub(target);return result.lengthSq()>1e-8?result.normalize():null}
export function getSinglePinFocusDirection(pin:ManualDetailPin,modelBounds:ModelBounds){const outward=vector(pin.position)?.sub(modelBounds.center);return savedDirection(pin)??direction(pin.normal)??(outward&&outward.lengthSq()>1e-8?outward.normalize():null)??DEFAULT_FOCUS_DIRECTION.clone()}
export function getMultiPinFocusDirection(center:Vector3,modelBounds:ModelBounds){const outward=center.clone().sub(modelBounds.center);return outward.length()>modelBounds.radius*.05&&[outward.x,outward.y,outward.z].every(Number.isFinite)?outward.normalize():DEFAULT_FOCUS_DIRECTION.clone()}
export function getManualDetailFocusBounds(detail:ManualDetail,modelBounds:ModelBounds,pinId?:string|null){const pins=getValidManualDetailPins(detail),selected=pinId?pins.filter(pin=>pin.id===pinId):pins;if(!selected.length)return null;const center=selected.reduce((sum,pin)=>sum.add(vector(pin.position)!),new Vector3()).multiplyScalar(1/selected.length);const pinRadius=selected.reduce((radius,pin)=>Math.max(radius,center.distanceTo(vector(pin.position)!)),0);const unpaddedRadius=Math.max(pinRadius,modelBounds.radius*MIN_CONTEXT_RATIO),radius=MathUtils.clamp(unpaddedRadius*FOCUS_PADDING,modelBounds.radius*MIN_CONTEXT_RATIO*FOCUS_PADDING,modelBounds.radius*MAX_CONTEXT_RATIO),size=new Vector3(radius*2,radius*2,radius*2),box=new Box3().setFromCenterAndSize(center,size),sphere=new Sphere(center.clone(),radius);return{pins:selected,bounds:{box,center,size,sphere,radius},direction:selected.length===1?getSinglePinFocusDirection(selected[0],modelBounds):getMultiPinFocusDirection(center,modelBounds)}}
