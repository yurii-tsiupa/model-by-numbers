import {Box3,BufferGeometry,Matrix3,Mesh,Vector3} from "three";
import type {DetailRegion} from "@/features/models/types/ManualDetail";

export const REGION_SHARP_EDGE_ANGLE_DEGREES=55;
const SHARP_EDGE_NORMAL_DOT=Math.cos(REGION_SHARP_EDGE_ANGLE_DEGREES*Math.PI/180);

type TriangleData={normal:Vector3;centroid:Vector3};
type GeometryData={triangles:TriangleData[];adjacency:number[][];smoothAdjacency:number[][]};
type QueueEntry={triangle:number;distance:number};

const geometryCache=new WeakMap<BufferGeometry,GeometryData>();
const registeredGeometries=new Map<string,BufferGeometry>();

function pushQueue(queue:QueueEntry[],entry:QueueEntry){
  queue.push(entry);
  let index=queue.length-1;
  while(index>0){
    const parent=Math.floor((index-1)/2);
    if(queue[parent].distance<=entry.distance)break;
    queue[index]=queue[parent];
    index=parent;
  }
  queue[index]=entry;
}

function popQueue(queue:QueueEntry[]){
  const first=queue[0],last=queue.pop();
  if(!first||!last||!queue.length)return first;
  let index=0;
  while(true){
    const left=index*2+1,right=left+1;
    if(left>=queue.length)break;
    const child=right<queue.length&&queue[right].distance<queue[left].distance?right:left;
    if(queue[child].distance>=last.distance)break;
    queue[index]=queue[child];
    index=child;
  }
  queue[index]=last;
  return first;
}

function buildGeometryData(geometry:BufferGeometry):GeometryData{
  const position=geometry.getAttribute("position"),index=geometry.index,triangleCount=Math.floor((index?.count??position.count)/3);
  const bounds=new Box3();
  for(let vertex=0;vertex<position.count;vertex++)bounds.expandByPoint(new Vector3().fromBufferAttribute(position,vertex));
  const tolerance=Math.max(bounds.getSize(new Vector3()).length()*1e-6,1e-7);
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
    const centroid=vertices[0].clone().add(vertices[1]).add(vertices[2]).multiplyScalar(1/3);
    triangles.push({normal,centroid});
    const ids=[0,1,2].map(offset=>weldedId(vertexIndex(triangle,offset)));
    for(const[a,b]of[[ids[0],ids[1]],[ids[1],ids[2]],[ids[2],ids[0]]]){
      const key=a<b?`${a}:${b}`:`${b}:${a}`;
      const attached=edgeTriangles.get(key);
      if(attached)attached.push(triangle);else edgeTriangles.set(key,[triangle]);
    }
  }
  const adjacency=Array.from({length:triangleCount},()=>new Set<number>());
  for(const attached of edgeTriangles.values())for(const triangle of attached)for(const neighbor of attached)if(neighbor!==triangle)adjacency[triangle].add(neighbor);
  const rows=adjacency.map(neighbors=>[...neighbors]);
  const smoothAdjacency=rows.map((neighbors,triangle)=>neighbors.filter(neighbor=>triangles[triangle].normal.dot(triangles[neighbor].normal)>=SHARP_EDGE_NORMAL_DOT));
  return{triangles,adjacency:rows,smoothAdjacency};
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
  const data=getRegionGeometryData(mesh.geometry);
  if(!data.triangles[faceIndex])return[];
  const normalMatrix=new Matrix3().getNormalMatrix(mesh.matrixWorld);
  const worldCentroids=new Map<number,Vector3>();
  const worldNormals=new Map<number,Vector3>();
  const centroid=(triangle:number)=>{
    let value=worldCentroids.get(triangle);
    if(!value){value=data.triangles[triangle].centroid.clone().applyMatrix4(mesh.matrixWorld);worldCentroids.set(triangle,value)}
    return value;
  };
  const normal=(triangle:number)=>{
    let value=worldNormals.get(triangle);
    if(!value){value=data.triangles[triangle].normal.clone().applyMatrix3(normalMatrix).normalize();worldNormals.set(triangle,value)}
    return value;
  };
  const distances=new Map<number,number>([[faceIndex,0]]);
  const queue:QueueEntry[]=[];
  pushQueue(queue,{triangle:faceIndex,distance:0});
  const selected:number[]=[];
  while(queue.length){
    const current=popQueue(queue);
    if(!current||current.distance!==distances.get(current.triangle)||current.distance>worldRadius)continue;
    selected.push(current.triangle);
    for(const neighbor of data.adjacency[current.triangle]){
      if(normal(current.triangle).dot(normal(neighbor))<SHARP_EDGE_NORMAL_DOT)continue;
      const firstDistance=current.triangle===faceIndex?worldPoint.distanceTo(centroid(neighbor)):centroid(current.triangle).distanceTo(centroid(neighbor));
      const nextDistance=current.distance+firstDistance;
      if(nextDistance<=worldRadius&&nextDistance<(distances.get(neighbor)??Number.POSITIVE_INFINITY)){
        distances.set(neighbor,nextDistance);
        pushQueue(queue,{triangle:neighbor,distance:nextDistance});
      }
    }
  }
  return selected.length?selected:[faceIndex];
}

export function getConnectedAreaTriangleIndices(mesh:Mesh,faceIndex:number){
  const data=getRegionGeometryData(mesh.geometry);
  if(!data.triangles[faceIndex])return[];
  const visited=new Set<number>([faceIndex]),pending=[faceIndex];
  while(pending.length){
    const triangle=pending.pop()!;
    for(const neighbor of data.smoothAdjacency[triangle])if(!visited.has(neighbor)){visited.add(neighbor);pending.push(neighbor)}
  }
  return[...visited].sort((a,b)=>a-b);
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
    if(strength==="automatic"){
      if(selected.size>=4&&selectedNeighbors.length===0)next.delete(triangle);
      continue;
    }
    if(selectedNeighbors.length===0){next.delete(triangle);continue}
    if(neighbors.length>=3&&selectedNeighbors.length===1){
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
    const smoothed=smoothMask(new Set(selection.triangleIndices),getRegionGeometryData(geometry).smoothAdjacency,strength);
    return{...selection,triangleIndices:[...smoothed].sort((a,b)=>a-b)};
  }).filter(selection=>selection.triangleIndices.length);
}

export function regionSelectionsEqual(first:DetailRegion["selections"],second:DetailRegion["selections"]){
  if(first.length!==second.length)return false;
  const byMesh=new Map(second.map(selection=>[selection.meshId,selection.triangleIndices]));
  return first.every(selection=>{const other=byMesh.get(selection.meshId);return other?.length===selection.triangleIndices.length&&selection.triangleIndices.every((value,index)=>value===other[index])});
}
