import type {Mesh} from "three";
import type {PartTransform} from "./PartTransform";
export type RuntimeExplodedPart={partId:string;meshUuid:string;mesh:Mesh;originalTransform:PartTransform;explodedTransform:PartTransform;direction:[number,number,number];anchor:[number,number,number]};
