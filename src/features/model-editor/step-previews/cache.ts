import type { StepPreviewResult } from "./types";
const cache=new Map<string,StepPreviewResult>();
export function getCachedStepPreview(key:string){return cache.get(key)??null}
export function setCachedStepPreview(key:string,result:StepPreviewResult){const old=cache.get(key);if(old&&old.imageUrl!==result.imageUrl)URL.revokeObjectURL(old.imageUrl);cache.set(key,result)}
export function invalidateStepPreview(key:string){const result=cache.get(key);if(result)URL.revokeObjectURL(result.imageUrl);cache.delete(key)}
export function clearStepPreviewCache(){for(const result of cache.values())URL.revokeObjectURL(result.imageUrl);cache.clear()}
