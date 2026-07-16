import {MathUtils} from "three";
import type {PartTransform} from "../../types/PartTransform";
export function interpolatePartTransform(original:PartTransform,exploded:PartTransform,factor:number):PartTransform{return{position:[MathUtils.lerp(original.position[0],exploded.position[0],factor),MathUtils.lerp(original.position[1],exploded.position[1],factor),MathUtils.lerp(original.position[2],exploded.position[2],factor)],rotation:[...original.rotation],scale:[...original.scale]};}
