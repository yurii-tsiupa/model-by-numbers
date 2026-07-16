import {Box3,Mesh,Vector3,type Object3D} from "three";
import type {ModelPart} from "../../types/ModelPart";
import type {PartTransform} from "../../types/PartTransform";
import type {RuntimeExplodedPart} from "../../types/RuntimeExplodedPart";
import {getModelBounds} from "../getModelBounds";
import {EXPLOSION_DISTANCE_MULTIPLIER,EXPLOSION_EPSILON} from "./exploded.constants";
import {getFallbackExplosionDirection} from "./getFallbackExplosionDirection";
import {getMeshSurfaceAnchor} from "./getMeshSurfaceAnchor";
const tuple=(value:Vector3):[number,number,number]=>[value.x,value.y,value.z];
const transform=(mesh:Mesh):PartTransform=>({position:tuple(mesh.position),rotation:[mesh.rotation.x,mesh.rotation.y,mesh.rotation.z],scale:tuple(mesh.scale)});
export function buildExplodedLayout(model:Object3D,parts:readonly ModelPart[]):RuntimeExplodedPart[]{model.updateWorldMatrix(true,true);const bounds=getModelBounds(model);const distance=Math.max(bounds.size.x,bounds.size.y,bounds.size.z)*EXPLOSION_DISTANCE_MULTIPLIER;const meshes=new Map<string,Mesh>();model.traverse(object=>{if(object instanceof Mesh)meshes.set(object.uuid,object);});const layout:RuntimeExplodedPart[]=[];parts.forEach((part,index)=>{const mesh=meshes.get(part.meshUuid);if(!mesh||!mesh.parent)return;try{const original=transform(mesh);const center=new Box3().setFromObject(mesh,true).getCenter(new Vector3());let direction=center.clone().sub(bounds.center);if(!Number.isFinite(direction.lengthSq())||direction.lengthSq()<EXPLOSION_EPSILON)direction=getFallbackExplosionDirection(index);else direction.normalize();const worldEnd=center.clone().addScaledVector(direction,distance);const localStart=mesh.parent.worldToLocal(center.clone());const localEnd=mesh.parent.worldToLocal(worldEnd);const offset=localEnd.sub(localStart);const explodedPosition=new Vector3(...original.position).add(offset);layout.push({partId:part.id,meshUuid:part.meshUuid,mesh,originalTransform:original,explodedTransform:{...original,position:tuple(explodedPosition)},direction:tuple(direction),anchor:getMeshSurfaceAnchor(mesh,direction)});}catch(error){console.warn("Skipping invalid exploded part",part.id,error);}});return layout;}
