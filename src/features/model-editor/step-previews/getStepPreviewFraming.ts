import {Box3,MathUtils,Sphere,Vector3} from "three";
import type {ManualDetailPin} from "@/features/models/types/ManualDetail";
import type {StepPreviewFraming} from "./types";

const DEFAULT_DIRECTION=new Vector3(1,.7,1).normalize();
function validDirection(value:Vector3){return[value.x,value.y,value.z].every(Number.isFinite)&&value.lengthSq()>1e-8?value.normalize():null}
export function getStepPreviewFraming(targetBounds:Box3,modelBounds:Box3,singlePin?:ManualDetailPin):StepPreviewFraming{
 const modelCenter=modelBounds.getCenter(new Vector3()),modelSphere=modelBounds.getBoundingSphere(new Sphere()),modelRadius=Math.max(modelSphere.radius,.1),center=targetBounds.isEmpty()?modelCenter.clone():targetBounds.getCenter(new Vector3()),targetSphere=targetBounds.getBoundingSphere(new Sphere()),contentRadius=Math.max(targetSphere.radius,modelRadius*.16),radius=MathUtils.clamp(contentRadius*1.65,modelRadius*.264,modelRadius*1.15);
 let direction:Vector3|null=null;
 if(singlePin){direction=validDirection(new Vector3(singlePin.camera.position.x-singlePin.camera.target.x,singlePin.camera.position.y-singlePin.camera.target.y,singlePin.camera.position.z-singlePin.camera.target.z))??(singlePin.normal?validDirection(new Vector3(singlePin.normal.x,singlePin.normal.y,singlePin.normal.z)):null)}
 direction??=validDirection(center.clone().sub(modelCenter))??DEFAULT_DIRECTION.clone();
 const halfFov=MathUtils.degToRad(42)/2,halfHorizontal=Math.atan(Math.tan(halfFov)*(1200/800)),distanceForFrame=radius/Math.sin(Math.min(halfFov,halfHorizontal)),offset=center.clone().sub(modelCenter),safeRadius=modelRadius*1.08,b=offset.dot(direction),c=offset.lengthSq()-safeRadius*safeRadius,discriminant=b*b-c,exitDistance=discriminant>=0?-b+Math.sqrt(discriminant):0,distance=MathUtils.clamp(Math.max(distanceForFrame,exitDistance+modelRadius*.04),radius*1.1,modelRadius*4),position=center.clone().addScaledVector(direction,distance);
 return{cameraPosition:{x:position.x,y:position.y,z:position.z},target:{x:center.x,y:center.y,z:center.z},up:{x:0,y:1,z:0},targetRadius:radius};
}
