import type { StepPreviewResult } from "./types";
const cache=new Map<string,StepPreviewResult>();
const MAX_CACHE_ENTRIES=100;
export function getCachedStepPreview(key:string){return cache.get(key)??null}
export function setCachedStepPreview(key:string,result:StepPreviewResult){const old=cache.get(key);if(old&&old.imageUrl!==result.imageUrl)URL.revokeObjectURL(old.imageUrl);cache.delete(key);cache.set(key,result);while(cache.size>MAX_CACHE_ENTRIES){const oldest=cache.entries().next().value as [string,StepPreviewResult]|undefined;if(!oldest)break;URL.revokeObjectURL(oldest[1].imageUrl);cache.delete(oldest[0])}}
export function invalidateStepPreview(key:string){const result=cache.get(key);if(result)URL.revokeObjectURL(result.imageUrl);cache.delete(key)}
export function clearStepPreviewCache(){for(const result of cache.values())URL.revokeObjectURL(result.imageUrl);cache.clear()}
export function invalidateStepPreviewsForStep(projectId:string,stepId:string){const keys:string[]=[];for(const[key,result]of cache){let sameProject=false;try{sameProject=(JSON.parse(key) as {projectId?:unknown}).projectId===projectId}catch{sameProject=false}if(result.stepId===stepId&&sameProject){URL.revokeObjectURL(result.imageUrl);cache.delete(key);keys.push(key)}}return keys}
