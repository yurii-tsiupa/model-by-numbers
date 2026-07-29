import {Box3,BufferGeometry,Matrix3,Mesh,Triangle,Vector3} from "three";
import type {DetailRegion} from "@/features/models/types/ManualDetail";

type TriangleData={vertices:[Vector3,Vector3,Vector3];normal:Vector3};
type GeometryData={triangles:TriangleData[];adjacency:number[][]};

const geometryCache=new WeakMap<BufferGeometry,GeometryData>();
const registeredGeometries=new Map<string,BufferGeometry>();

function buildGeometryData(geometry:BufferGeometry):GeometryData{
  const position=geometry.getAttribute("position"),index=geometry.index,triangleCount=Math.floor((index?.count??position.count)/3);
  const bounds=new Box3();
  for(let vertex=0;vertex<position.count;vertex++)bounds.expandByPoint(new Vector3().fromBufferAttribute(position,vertex));
  const diagonal=bounds.getSize(new Vector3()).length();
  const tolerance=Math.max(diagonal*1e-6,1e-7);
  const weldedIds=new Map<string,number>(),edgeTriangles=new Map<string,number[]>(),triangles:TriangleData[]=[];
  let nextWeldedId=0;
  const vertexIndex=(triangle:number,offset:number)=>index?index.getX(triangle*3+offset):triangle*3+offset;
  const weldedId=(vertex:number)=>{
    const point=new Vector3().fromBufferAttribute(position,vertex);
    const key=`${Math.round(point.x/tolerance)}:${Math.round(point.y/tolerance)}:${Math.round(point.z/tolerance)}`;
    const existing=weldedIds.get(key);
    if(existing!==undefined)return existing;
    const id=nextWeldedId++;
    weldedIds.set(key,id);
    return id;
  };
  for(let triangle=0;triangle<triangleCount;triangle++){
    const vertices=[0,1,2].map(offset=>new Vector3().fromBufferAttribute(position,vertexIndex(triangle,offset))) as [Vector3,Vector3,Vector3];
    const normal=vertices[1].clone().sub(vertices[0]).cross(vertices[2].clone().sub(vertices[0])).normalize();
    triangles.push({vertices,normal});
    const ids=[0,1,2].map(offset=>weldedId(vertexIndex(triangle,offset)));
    for(const[a,b]of[[ids[0],ids[1]],[ids[1],ids[2]],[ids[2],ids[0]]]){
      const key=a<b?`${a}:${b}`:`${b}:${a}`;
      const attached=edgeTriangles.get(key);
      if(attached)attached.push(triangle);else edgeTriangles.set(key,[triangle]);
    }
  }
  const adjacency=Array.from({length:triangleCount},()=>new Set<number>());
  for(const attached of edgeTriangles.values())for(const triangle of attached)for(const neighbor of attached)if(neighbor!==triangle)adjacency[triangle].add(neighbor);
  return{triangles,adjacency:adjacency.map(neighbors=>[...neighbors])};
}

export function getRegionGeometryData(geometry:BufferGeometry){
  const cached=geometryCache.get(geometry);
  if(cached)return cached;
  const data=buildGeometryData(geometry);
  geometryCache.set(geometry,data);
  return data;
}

export function registerRegionGeometry(meshId:string,geometry:BufferGeometry){
  registeredGeometries.set(meshId,geometry);
  return()=>{if(registeredGeometries.get(meshId)===geometry)registeredGeometries.delete(meshId)};
}

export function getBrushTriangleIndices(mesh:Mesh,faceIndex:number,worldPoint:Vector3,worldRadius:number){
  const data=getRegionGeometryData(mesh.geometry),origin=data.triangles[faceIndex];
  if(!origin)return[];
  const normalMatrix=new Matrix3().getNormalMatrix(mesh.matrixWorld),originNormal=origin.normal.clone().applyMatrix3(normalMatrix).normalize();
  const radiusSquared=worldRadius*worldRadius,result:number[]=[],triangle=new Triangle(),closest=new Vector3();
  for(let index=0;index<data.triangles.length;index++){
    const candidate=data.triangles[index];
    if(originNormal.dot(candidate.normal.clone().applyMatrix3(normalMatrix).normalize())<=.2)continue;
    triangle.set(candidate.vertices[0].clone().applyMatrix4(mesh.matrixWorld),candidate.vertices[1].clone().applyMatrix4(mesh.matrixWorld),candidate.vertices[2].clone().applyMatrix4(mesh.matrixWorld));
    triangle.closestPointToPoint(worldPoint,closest);
    if(closest.distanceToSquared(worldPoint)<=radiusSquared)result.push(index);
  }
  return result.length?result:[faceIndex];
}

function smoothMask(selected:Set<number>,adjacency:number[][],strength:"automatic"|"manual"){
  const next=new Set(selected);
  for(let triangle=0;triangle<adjacency.length;triangle++){
    const neighbors=adjacency[triangle];
    if(neighbors.length<2)continue;
    const selectedNeighbors=neighbors.filter(neighbor=>selected.has(neighbor));
    if(!selected.has(triangle)){
      const threshold=strength==="automatic"?.8:2/3;
      if(selectedNeighbors.length/neighbors.length>=threshold)next.add(triangle);
      continue;
    }
    if(strength==="automatic")continue;
    if(selectedNeighbors.length===0){next.delete(triangle);continue}
    if(strength==="manual"&&neighbors.length>=3&&selectedNeighbors.length===1){
      const baseNeighbors=adjacency[selectedNeighbors[0]]??[];
      if(baseNeighbors.filter(neighbor=>selected.has(neighbor)).length>=2)next.delete(triangle);
    }
  }
  return next;
}

export function smoothRegionSelections(selections:DetailRegion["selections"],strength:"automatic"|"manual",meshIds?:ReadonlySet<string>){
  return selections.map(selection=>{
    if(meshIds&&!meshIds.has(selection.meshId))return selection;
    const geometry=registeredGeometries.get(selection.meshId);
    if(!geometry)return selection;
    const smoothed=smoothMask(new Set(selection.triangleIndices),getRegionGeometryData(geometry).adjacency,strength);
    return{...selection,triangleIndices:[...smoothed].sort((a,b)=>a-b)};
  }).filter(selection=>selection.triangleIndices.length);
}

export function regionSelectionsEqual(first:DetailRegion["selections"],second:DetailRegion["selections"]){
  if(first.length!==second.length)return false;
  const byMesh=new Map(second.map(selection=>[selection.meshId,selection.triangleIndices]));
  return first.every(selection=>{const other=byMesh.get(selection.meshId);return other?.length===selection.triangleIndices.length&&selection.triangleIndices.every((value,index)=>value===other[index])});
}
