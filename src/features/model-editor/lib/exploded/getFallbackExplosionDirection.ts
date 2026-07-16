import {Vector3} from "three";
const DIRECTIONS:readonly [number,number,number][]=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
export function getFallbackExplosionDirection(index:number){const value=DIRECTIONS[index%DIRECTIONS.length];const ring=Math.floor(index/DIRECTIONS.length);return new Vector3(...value).add(new Vector3(((ring*37)%5-2)*0.08,((ring*17)%5-2)*0.06,((ring*29)%5-2)*0.08)).normalize();}
